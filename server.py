"""Classroom Hub backend. Python 3.10+, no third-party dependencies.
Default: loopback only. Put behind HTTPS for public hosting; keep private state on durable disk.
Initialize a NEW owner password with: python server.py --set-password
"""
from __future__ import annotations
import argparse
import base64
import getpass
from datetime import datetime, timezone
import hashlib
import hmac
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import sqlite3
import threading
import hub_services as services
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

APP_DIR = Path(__file__).resolve().parent
PRIVATE_DIR = Path(os.environ.get('CLASSROOM_PRIVATE_DIR', str(Path.home() / '.local/share/classroom-hub'))).resolve()
ACADEMIC_DIR = Path(os.environ['CLASSROOM_ACADEMIC_DIR']).resolve() if os.environ.get('CLASSROOM_ACADEMIC_DIR') else None
DEFAULT_OWNER_EMAILS = ['fahimniloy2314@gmail.com', 'fahim.cuet.me20@gmail.com']
OWNER_EMAILS = DEFAULT_OWNER_EMAILS.copy()  # Fixed owner identity; no public registration or environment override.
OWNER_EMAIL = OWNER_EMAILS[0]  # Compatibility for local integrations.

def owner_emails():
    try:
        configured = json.loads((PRIVATE_DIR / 'owner.json').read_text()).get('emails')
        return validate_owner_emails(configured) if configured is not None else OWNER_EMAILS
    except (OSError,ValueError,TypeError):
        return OWNER_EMAILS

def validate_owner_emails(emails):
    if not isinstance(emails,list) or len(emails) != 2:
        raise ValueError('Owner access is restricted to the two configured owner addresses.')
    normalized = list(dict.fromkeys(str(email).strip().lower() for email in emails))
    if any(not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) for email in normalized):
        raise ValueError('Enter valid owner email addresses.')
    if set(normalized) != set(DEFAULT_OWNER_EMAILS):
        raise ValueError('Owner access is restricted to the two configured owner addresses.')
    return DEFAULT_OWNER_EMAILS.copy()
ALLOWED_ORIGINS = set(filter(None, os.environ.get('CLASSROOM_ALLOWED_ORIGINS', 'https://fahim-niloy2314.github.io').split(',')))
PUBLIC_FILES = {'index.html','styles.css','app.js','hub-core.js','hub-fixes.js','hub-features.js','data.js','classroom_index.json','portal_sync.json','backend-config.json','manifest.json','sw.js','jszip.min.js','icon.svg','icon-192.png','icon-512.png','cuet_routine_template_blank.docx','cuet_routine_template_sample.docx'}
PUBLIC_KEYS = {'version','lastUpdated','publishedBy','portalSettings','courseRegistry','notices','faculty','routines','customResources','videos','timeline','faqs','cvTemplates','hiddenItems','featuredItems','contacts'}
SESSIONS = {}
ATTEMPTS = {}
LOCK = threading.RLock()
MAX_BODY = 3 * 1024 * 1024


def private_setup():
    if PRIVATE_DIR == APP_DIR or APP_DIR in PRIVATE_DIR.parents:
        raise RuntimeError('CLASSROOM_PRIVATE_DIR must be outside the public application directory.')
    PRIVATE_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    with connect() as db:
        db.execute('CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, created TEXT NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS snapshots (id INTEGER PRIMARY KEY, created TEXT NOT NULL, payload TEXT NOT NULL)')
    services.initialize(PRIVATE_DIR)


def connect():
    db = sqlite3.connect(str(PRIVATE_DIR / 'state.sqlite3'), timeout=20)
    db.row_factory = sqlite3.Row
    return db


def atomic_json(path, data):
    temp = path.with_name(path.name + '.' + secrets.token_hex(6) + '.tmp')
    try:
        with open(temp, 'x', encoding='utf-8') as f:
            os.chmod(temp, 0o600)
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def make_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return {'salt': salt, 'hash': digest}


def verify_password(password):
    try:
        stored = json.loads((PRIVATE_DIR / 'owner.json').read_text())
        actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(stored['salt']), n=16384, r=8, p=1).hex()
        return hmac.compare_digest(actual, stored['hash'])
    except (OSError, ValueError, KeyError):
        return False


def clean_public(data):
    if not isinstance(data, dict) or not isinstance(data.get('portalSettings'), dict):
        raise ValueError('A complete public portal payload is required.')
    if set(data) - PUBLIC_KEYS:
        raise ValueError('Private or unknown top-level data cannot be published.')
    for key in ['notices','faculty','customResources','videos','timeline','faqs','cvTemplates','hiddenItems','featuredItems']:
        if key in data and not isinstance(data[key], list):
            raise ValueError(key + ' must be a list.')
    for key in ['routines','courseRegistry','contacts']:
        if key in data and not isinstance(data[key], dict):
            raise ValueError(key + ' must be an object.')
    def validate(value, depth=0):
        if depth > 25:
            raise ValueError('Nested content is too deep.')
        if isinstance(value, dict):
            for key, child in value.items():
                if re.search(r'password|pwdhash|token|apikey|secret|webhook', key, re.I) or key in ['__proto__','constructor','prototype']:
                    raise ValueError('Credentials and webhooks must not appear in public content.')
                validate(child, depth+1)
        elif isinstance(value, list):
            for child in value:
                validate(child, depth+1)
    validate(data)
    return data


def public_state():
    return json.loads((APP_DIR / 'portal_sync.json').read_text(encoding='utf-8'))


def resolve_file_path(relative):
    if not ACADEMIC_DIR or not relative or '\\' in relative or '\x00' in relative:
        return None
    rel = Path(relative)
    if rel.is_absolute() or '..' in rel.parts or any(p.startswith('.') for p in rel.parts):
        return None
    candidate = (ACADEMIC_DIR / rel).resolve()
    # resolve() follows symlinks; relative_to enforces a directory boundary.
    if not candidate.is_relative_to(ACADEMIC_DIR) or not candidate.is_file():
        return None
    if candidate.suffix.lower() not in {'.pdf','.doc','.docx','.ppt','.pptx','.xls','.xlsx','.png','.jpg','.jpeg','.zip','.txt'}:
        return None
    if candidate.name.lower() in {'secrets.json','submissions.json','.env','owner.json'} or candidate.is_relative_to(PRIVATE_DIR):
        return None
    return candidate


def utcnow():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def github_publish(payload):
    token = os.environ.get('GITHUB_TOKEN', '')
    if not token:
        return {'success': False, 'deployed': False, 'error': 'GITHUB_TOKEN is not configured on the backend. Draft is retained in your browser.'}, 503
    api = 'https://api.github.com/repos/Fahim-Niloy2314/classroom-hub/contents/portal_sync.json'
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'ClassroomHub', 'Content-Type': 'application/json'}
    try:
        with urlopen(Request(api + '?ref=main', headers=headers), timeout=20) as r:
            existing = json.load(r)
        encoded = base64.b64encode((json.dumps(payload, ensure_ascii=False, indent=2) + '\n').encode()).decode()
        body = {'message': 'Update Classroom Hub public content', 'content': encoded, 'sha': existing['sha'], 'branch': 'main'}
        with urlopen(Request(api, data=json.dumps(body).encode(), headers=headers, method='PUT'), timeout=30) as r:
            result = json.load(r)
        return {'success': True, 'deployed': False, 'state': 'committed', 'commit': result['commit']['sha'], 'revision': payload['lastUpdated'], 'message': 'Committed to GitHub. Waiting for the public site to update.'}, 202
    except HTTPError as e:
        return {'success': False, 'deployed': False, 'error': 'GitHub rejected publish (' + str(e.code) + '). Your draft is retained.'}, 502
    except Exception:
        return {'success': False, 'deployed': False, 'error': 'GitHub could not be reached. Your draft is retained.'}, 502


class ClassroomHubHandler(SimpleHTTPRequestHandler):
    server_version = 'ClassroomHub'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def log_message(self, fmt, *args):
        # Avoid logging query strings, tokens or private payloads.
        pass

    def origin_allowed(self):
        origin = self.headers.get('Origin')
        if not origin:
            return True
        same_origin = urlparse(origin).netloc == self.headers.get('Host')
        return same_origin or origin in ALLOWED_ORIGINS

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('X-Frame-Options', 'DENY')
        if self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-store')
            origin = self.headers.get('Origin')
            if origin and self.origin_allowed():
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
        super().end_headers()

    def reply(self, status, body):
        encoded = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(encoded)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(encoded)

    def authenticated(self):
        token = self.headers.get('Authorization', '').removeprefix('Bearer ')
        with LOCK:
            expiry = SESSIONS.get(token, 0)
            if expiry <= time.time():
                SESSIONS.pop(token, None)
                return False
            return True

    def require_admin(self):
        if self.authenticated():
            return True
        self.reply(401, {'error': 'Sign in to the backend as the owner.'})
        return False

    def read_json(self):
        length = int(self.headers.get('Content-Length', '0'))
        if not 0 < length <= MAX_BODY:
            raise ValueError('Request body is empty or too large (maximum 3 MB).')
        if 'application/json' not in self.headers.get('Content-Type', ''):
            raise ValueError('Content-Type must be application/json.')
        result = json.loads(self.rfile.read(length))
        if not isinstance(result, dict):
            raise ValueError('Request must be a JSON object.')
        return result

    def do_OPTIONS(self):
        if not self.origin_allowed():
            return self.reply(403, {'error': 'Origin is not allowed.'})
        self.send_response(204)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        if not self.origin_allowed():
            return self.reply(403, {'error': 'Origin is not allowed.'})
        parsed = urlparse(self.path)
        if parsed.path == '/api/status':
            return self.reply(200, {'status': 'online', 'version': '4.3.0', 'aiAvailable': services.ai_status()['enabled'] and services.ai_status()['configured'], 'authenticated': self.authenticated(), 'configured': (PRIVATE_DIR / 'owner.json').exists(), 'publishingConfigured': bool(os.environ.get('GITHUB_TOKEN')), 'timestamp': utcnow()})
        if parsed.path in {'/api/analytics','/api/ai/config','/api/notifications/config'}:
            if not self.require_admin(): return
            result = services.analytics() if parsed.path=='/api/analytics' else services.ai_status() if parsed.path=='/api/ai/config' else services.notification_status()
            return self.reply(200, result)
        if parsed.path == '/api/owner':
            if not self.require_admin(): return
            return self.reply(200, {'success':True, 'emails':owner_emails()})
        if parsed.path == '/api/submissions':
            if not self.require_admin(): return
            with connect() as db:
                rows = db.execute('SELECT * FROM submissions ORDER BY created DESC LIMIT 1000').fetchall()
            notification_states = services.notification_states()
            return self.reply(200, {'success': True, 'submissions': [dict(json.loads(r['payload']), notificationState=notification_states.get(r['id'],'disabled'), id=r['id'], receiptId=r['id'], createdAt=r['created'], status=r['status']) for r in rows]})
        if parsed.path == '/api/backup':
            if not self.require_admin(): return
            with connect() as db:
                rows = [dict(r) for r in db.execute('SELECT * FROM submissions')]
            return self.reply(200, {'success': True, 'backup': {'app': 'ClassroomHubBackend','version': 1,'createdAt': utcnow(), 'portalSync': public_state(), 'submissions': rows}})
        if parsed.path == '/api/file':
            params = parse_qs(parsed.query)
            path = resolve_file_path(params.get('path', [''])[0])
            if not path: return self.reply(404, {'error': 'Academic file not found.'})
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(path)[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(path.stat().st_size))
            disposition = 'attachment' if params.get('download') == ['1'] else 'inline'
            self.send_header('Content-Disposition', disposition + "; filename*=UTF-8''" + quote(path.name))
            self.end_headers()
            if self.command != 'HEAD':
                with path.open('rb') as f:
                    import shutil
                    shutil.copyfileobj(f, self.wfile)
            return
        if parsed.path.startswith('/api/'):
            return self.reply(404, {'error': 'Unknown API endpoint.'})
        name = parsed.path.lstrip('/') or 'index.html'
        if name not in PUBLIC_FILES or '/' in name or '%' in name or not (APP_DIR / name).is_file() or (APP_DIR / name).is_symlink():
            return self.reply(404, {'error': 'Not found.'})
        self.path = '/' + name
        return super().do_HEAD() if self.command == 'HEAD' else super().do_GET()

    def do_POST(self):
        if not self.origin_allowed():
            return self.reply(403, {'error': 'Origin is not allowed.'})
        route = urlparse(self.path).path
        if route not in {'/api/login','/api/logout','/api/submissions','/api/submissions/status','/api/publish','/api/restore','/api/owner','/api/presence','/api/ai/chat','/api/ai/config','/api/notifications/config','/api/notifications/retry'}:
            return self.reply(404, {'error': 'Unknown API endpoint.'})
        if route not in {'/api/login','/api/submissions','/api/presence','/api/ai/chat'} and not self.require_admin(): return
        try:
            data = self.read_json()
            if route == '/api/presence': return self.reply(200, services.presence(data))
            if route == '/api/ai/chat': return self.reply(200, services.ai_chat(data,self.client_address[0],public_state().get('courseRegistry',{})))
            if route == '/api/ai/config': return self.reply(200, services.save_ai_config(data))
            if route == '/api/notifications/retry': return self.reply(200, services.retry_failed_notifications())
            if route == '/api/notifications/config': return self.reply(200, services.save_notification_config(data))
            if route == '/api/login':
                if not (PRIVATE_DIR / 'owner.json').exists():
                    return self.reply(503, {'error': 'The private owner service has not been configured by the site owner.'})
                ip = self.client_address[0]
                with LOCK:
                    attempts = [t for t in ATTEMPTS.get(ip, []) if time.time()-t < 300]
                    ATTEMPTS[ip] = attempts
                    if len(attempts) >= 5: return self.reply(429, {'error': 'Too many attempts. Try again in 5 minutes.'})
                    if str(data.get('email','')).strip().lower() not in owner_emails() or not verify_password(str(data.get('password',''))):
                        attempts.append(time.time())
                        return self.reply(401, {'error': 'Incorrect email or password.'})
                    ATTEMPTS.pop(ip, None)
                    # Purge expired sessions and issue an unpredictable, short-lived bearer token.
                    for token, expiry in list(SESSIONS.items()):
                        if expiry <= time.time(): SESSIONS.pop(token, None)
                    token = secrets.token_urlsafe(32)
                    SESSIONS[token] = time.time() + 7200
                return self.reply(200, {'success': True, 'token': token,'expiresAt': SESSIONS[token], 'user': {'name':'Fahim Niloy','email':str(data.get('email','')).strip().lower(),'role':'admin'}})
            if route == '/api/owner':
                if not verify_password(str(data.get('currentPassword',''))):
                    return self.reply(401, {'error':'The current owner password is required.'})
                emails = validate_owner_emails(data.get('emails'))
                new_password = data.get('newPassword','')
                if not isinstance(new_password,str) or (new_password and len(new_password) < 12):
                    raise ValueError('A new password must contain at least 12 characters.')
                with LOCK:
                    stored = make_password(new_password) if new_password else json.loads((PRIVATE_DIR/'owner.json').read_text())
                    stored['emails'] = emails
                    atomic_json(PRIVATE_DIR/'owner.json', stored)
                    SESSIONS.clear()
                return self.reply(200, {'success':True,'reauthenticate':True,'message':'Owner access updated. Sign in again.'})
            if route == '/api/logout':
                with LOCK: SESSIONS.pop(self.headers.get('Authorization','').removeprefix('Bearer '), None)
                return self.reply(200, {'success':True})
            if route == '/api/submissions':
                message = str(data.get('description','')).strip()
                request_id = str(data.get('requestId',''))
                if not 1 <= len(message) <= 10000 or not re.fullmatch(r'[a-zA-Z0-9_-]{16,100}', request_id):
                    raise ValueError('A valid requestId and message (up to 10000 characters) are required.')
                safe = {k:str(data.get(k,''))[:10000 if k=='description' else 300] for k in ['type','title','description','studentName','studentEmail','studentPhone','roll','rating']}
                resource = data.get('resource')
                if resource is not None:
                    if not isinstance(resource,dict) or urlparse(str(resource.get('url',''))).scheme not in {'https','http'}:
                        raise ValueError('Invalid resource URL.')
                    safe['resource'] = {key:str(resource.get(key,''))[:1000] for key in ['name','term_code','course','category','url','author']}
                with connect() as db:
                    db.execute('BEGIN IMMEDIATE')
                    old = db.execute('SELECT id FROM submissions WHERE request_id=?',(request_id,)).fetchone()
                    if old: return self.reply(200, {'success':True,'receiptId':old['id'],'state':'received'})
                    ip_key = 'submit:' + self.client_address[0]
                    with LOCK:
                        attempts = [t for t in ATTEMPTS.get(ip_key,[]) if time.time()-t < 60]
                        if len(attempts) >= 5: return self.reply(429, {'error':'Please wait a minute before sending more messages.'})
                        ATTEMPTS[ip_key] = attempts + [time.time()]
                    receipt = 'SUB-' + secrets.token_hex(8).upper()
                    db.execute('INSERT INTO submissions VALUES (?,?,?,?,?)',(receipt,request_id,utcnow(),'new',json.dumps(safe,ensure_ascii=False)))
                    db.commit()  # Receipt means the durable transaction has completed.
                try: notification_state = services.queue_notification(receipt, safe)
                except Exception: notification_state = 'unavailable'
                return self.reply(201, {'success':True,'receiptId':receipt,'state':'received','notificationState':notification_state})
            if route == '/api/submissions/status':
                status = data.get('status')
                if status not in {'new','reviewed','resolved','archived'}: raise ValueError('Invalid status.')
                with connect() as db:
                    result = db.execute('UPDATE submissions SET status=? WHERE id=?',(status,data.get('id')))
                    if result.rowcount == 0: return self.reply(404, {'error':'Submission not found.'})
                return self.reply(200, {'success':True})
            if route == '/api/publish':
                payload = clean_public(data.get('payload'))
                payload['lastUpdated'] = datetime.now(timezone.utc).isoformat(timespec='microseconds').replace('+00:00','Z')
                # Keep rollback snapshots private; do not modify public data until GitHub accepts it.
                with LOCK:
                    with connect() as db:
                        db.execute('INSERT INTO snapshots(created,payload) VALUES (?,?)',(utcnow(),json.dumps(public_state(),ensure_ascii=False)))
                    result, code = github_publish(payload)
                    if result.get('success'): atomic_json(APP_DIR / 'portal_sync.json', payload)
                return self.reply(code, result)
            if route == '/api/restore':
                backup = data.get('backup',{})
                if backup.get('app') != 'ClassroomHubBackend' or backup.get('version') != 1 or not isinstance(backup.get('submissions'),list):
                    raise ValueError('Invalid backend backup.')
                clean_public(backup.get('portalSync'))
                rows = backup['submissions']
                if len(rows)>10000: raise ValueError('Backup is too large.')
                with LOCK:
                    with connect() as db:
                        old = {'portalSync':public_state(),'submissions':[dict(r) for r in db.execute('SELECT * FROM submissions')]}
                        db.execute('INSERT INTO snapshots(created,payload) VALUES (?,?)',(utcnow(),json.dumps(old,ensure_ascii=False)))
                        for r in rows:
                            if r.get('status') not in {'new','reviewed','resolved','archived'} or not isinstance(json.loads(r['payload']),dict): raise ValueError('Invalid inbox row.')
                            db.execute('INSERT OR REPLACE INTO submissions VALUES (?,?,?,?,?)',tuple(r[k] for k in ['id','request_id','created','status','payload']))
                    # Restoring is deliberately a draft; publishing remains an explicit action.
                return self.reply(200, {'success':True,'portalDraft':backup['portalSync'],'message':'Inbox restored; portal content is an unpublished draft.'})
        except services.ServiceError as e:
            return self.reply(e.status, {'error':str(e)})
        except (ValueError,KeyError,TypeError,UnicodeError) as e:
            return self.reply(400, {'error':str(e)})
        except Exception:
            return self.reply(500, {'error':'The backend could not complete this operation. No success receipt was issued.'})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--set-password', action='store_true')
    parser.add_argument('--setup-if-needed', action='store_true')
    parser.add_argument('--open-browser', action='store_true')
    parser.add_argument('--owner-email', action='append', help='Owner email; repeat for multiple owners when setting a password.')
    args = parser.parse_args()
    private_setup()
    initializing = args.set_password or (args.setup_if_needed and not (PRIVATE_DIR/'owner.json').exists())
    if initializing:
        password = getpass.getpass('New owner password (12+ characters): ')
        if len(password) < 12: raise SystemExit('Use at least 12 characters.')
        if password != getpass.getpass('Repeat new password: '): raise SystemExit('Passwords do not match.')
        stored = make_password(password)
        stored['emails'] = validate_owner_emails(args.owner_email or owner_emails())
        atomic_json(PRIVATE_DIR / 'owner.json', stored)
        print('Owner password configured. Existing sessions end when the backend restarts.')
        if args.set_password: return
    host = os.environ.get('CLASSROOM_BIND','127.0.0.1')
    port = int(os.environ.get('PORT','8080'))
    print(f'Classroom Hub: http://{host}:{port} (HTTPS reverse proxy required for public hosting)')
    if args.open_browser:
        import webbrowser
        threading.Timer(0.5,lambda:webbrowser.open(f'http://127.0.0.1:{port}')).start()
    services.start_worker()
    ThreadingHTTPServer((host,port),ClassroomHubHandler).serve_forever()

if __name__ == '__main__':
    main()
