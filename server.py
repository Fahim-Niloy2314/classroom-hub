import os
import sys
import json
import time
import uuid
import hashlib
import mimetypes
import subprocess
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import urllib.parse

# Set UTF-8 encoding for Windows stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
CLASSROOM_DIR = r"G:\My Drive\Classroom"
BASE_DIR = CLASSROOM_DIR if os.path.exists(CLASSROOM_DIR) else os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Security: Expected SHA-256 hash of Niloy2314###
DEFAULT_ADMIN_PWD_HASH = "1c5ee9de39ca7ca5b25e25c7c994cf7b33d131c1ab99437ca2912a2cc4b6f21e"

# In-memory active session tokens
ACTIVE_SESSIONS = set()

def verify_token(headers):
    auth_header = headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token in ACTIVE_SESSIONS:
            return True
    return False

def resolve_file_path(file_rel):
    if not file_rel:
        return None
    candidates = [
        os.path.join(BASE_DIR, file_rel),
        os.path.join(APP_DIR, file_rel),
        os.path.join(BASE_DIR, file_rel.replace("_", " ")),
        os.path.join(BASE_DIR, file_rel.replace(" ", "_")),
        os.path.join(APP_DIR, file_rel.replace("_", " ")),
        os.path.join(APP_DIR, file_rel.replace(" ", "_")),
    ]
    for cand in candidates:
        abs_p = os.path.abspath(cand)
        if os.path.isfile(abs_p):
            return abs_p
    return None

class ClassroomHubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def send_cors_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if parsed.path == "/api/file":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.isfile(full_path):
                self.send_error(404, "File not found")
                return
            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = "application/octet-stream"
            file_size = os.path.getsize(full_path)
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            return
        return super().do_HEAD()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        # Health & Backend Status Check
        if parsed.path == "/api/status":
            sync_exists = os.path.exists(os.path.join(APP_DIR, "portal_sync.json"))
            last_sync = os.path.getmtime(os.path.join(APP_DIR, "portal_sync.json")) if sync_exists else 0
            self.send_cors_json(200, {
                "status": "online",
                "version": "3.3.0",
                "authenticated": verify_token(self.headers),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "lastSyncTime": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(last_sync)) if last_sync else None,
                "academicDirActive": os.path.exists(CLASSROOM_DIR)
            })
            return

        # Central Submissions Inbox (Admin Only)
        if parsed.path == "/api/submissions":
            if not verify_token(self.headers):
                self.send_cors_json(401, {"error": "Unauthorized: Admin session required"})
                return
            sub_file = os.path.join(APP_DIR, "submissions.json")
            submissions = []
            if os.path.exists(sub_file):
                try:
                    with open(sub_file, "r", encoding="utf-8") as f:
                        submissions = json.load(f)
                except Exception:
                    submissions = []
            self.send_cors_json(200, {"success": True, "submissions": submissions})
            return

        # System Snapshot Backup (Admin Only)
        if parsed.path == "/api/backup":
            if not verify_token(self.headers):
                self.send_cors_json(401, {"error": "Unauthorized: Admin session required"})
                return
            sync_file = os.path.join(APP_DIR, "portal_sync.json")
            sub_file = os.path.join(APP_DIR, "submissions.json")
            backup_data = {
                "version": "3.3.0",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "portalSync": None,
                "submissions": []
            }
            if os.path.exists(sync_file):
                with open(sync_file, "r", encoding="utf-8") as f:
                    backup_data["portalSync"] = json.load(f)
            if os.path.exists(sub_file):
                with open(sub_file, "r", encoding="utf-8") as f:
                    backup_data["submissions"] = json.load(f)
            self.send_cors_json(200, {"success": True, "backup": backup_data})
            return

        # API: Open file directly in Windows native app
        if parsed.path == "/api/open-local":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            if not file_rel:
                self.send_cors_json(400, {"error": "Missing path parameter"})
                return
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.exists(full_path):
                self.send_cors_json(404, {"error": "File not found or access denied"})
                return
            try:
                if sys.platform == "win32":
                    os.startfile(full_path)
                elif sys.platform == "darwin":
                    subprocess.run(["open", full_path])
                else:
                    subprocess.run(["xdg-open", full_path])
                self.send_cors_json(200, {"success": True, "message": f"Opened {os.path.basename(full_path)}"})
            except Exception as e:
                self.send_cors_json(500, {"error": f"Error launching file: {str(e)}"})
            return

        # API: Stream or Download file
        if parsed.path == "/api/file":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            download = params.get("download", ["0"])[0] == "1"
            if not file_rel:
                self.send_cors_json(400, {"error": "Missing path parameter"})
                return
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.isfile(full_path):
                self.send_cors_json(404, {"error": "File not found"})
                return

            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = "application/octet-stream"

            file_size = os.path.getsize(full_path)
            filename = os.path.basename(full_path)

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Access-Control-Allow-Origin", "*")
            if download:
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            else:
                self.send_header("Content-Disposition", f'inline; filename="{filename}"')
            self.end_headers()

            with open(full_path, "rb") as f:
                while chunk := f.read(64 * 1024):
                    self.wfile.write(chunk)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body_str = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            body_json = json.loads(body_str) if body_str else {}
        except Exception:
            body_json = {}

        # 1. Admin Login & Session Generation
        if parsed.path == "/api/login":
            pwd = body_json.get("password", "")
            pwd_hash = hashlib.sha256(pwd.encode("utf-8")).hexdigest()
            provided_hash = body_json.get("passwordHash", "")
            
            if pwd_hash == DEFAULT_ADMIN_PWD_HASH or provided_hash == DEFAULT_ADMIN_PWD_HASH:
                token = f"ch_sess_{uuid.uuid4().hex}"
                ACTIVE_SESSIONS.add(token)
                self.send_cors_json(200, {
                    "success": True,
                    "token": token,
                    "role": "owner",
                    "user": {"name": "Mohammad Fahim Ahmed (Niloy)", "email": "fahimcuet63@gmail.com", "role": "owner"}
                })
            else:
                self.send_cors_json(401, {"success": False, "error": "Invalid administrative password"})
            return

        # 2. Student Submissions & Feedback (Public with Confirmed Server Receipt)
        if parsed.path == "/api/submissions":
            sub_id = f"SUB-{int(time.time())}-{uuid.uuid4().hex[:4].upper()}"
            submission_entry = {
                "id": sub_id,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "type": body_json.get("type", "feedback"), # 'feedback', 'broken_link', 'resource_request', 'new_resource'
                "title": body_json.get("title", ""),
                "description": body_json.get("description", ""),
                "link": body_json.get("link", ""),
                "studentName": body_json.get("studentName", "Anonymous Student"),
                "studentEmail": body_json.get("studentEmail", ""),
                "studentPhone": body_json.get("studentPhone", ""),
                "status": "pending" # 'pending', 'approved', 'resolved', 'rejected'
            }

            sub_file = os.path.join(APP_DIR, "submissions.json")
            submissions = []
            if os.path.exists(sub_file):
                try:
                    with open(sub_file, "r", encoding="utf-8") as f:
                        submissions = json.load(f)
                except Exception:
                    submissions = []
            
            submissions.insert(0, submission_entry)
            with open(sub_file, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2, ensure_ascii=False)

            self.send_cors_json(200, {
                "success": True,
                "receiptId": sub_id,
                "message": f"Received and confirmed by ClassroomHub server. Reference: {sub_id}"
            })
            return

        # 3. Update Submission Status (Admin Only)
        if parsed.path == "/api/submissions/status":
            if not verify_token(self.headers):
                self.send_cors_json(401, {"error": "Unauthorized: Admin session required"})
                return
            sub_id = body_json.get("id")
            new_status = body_json.get("status")
            sub_file = os.path.join(APP_DIR, "submissions.json")
            if not os.path.exists(sub_file):
                self.send_cors_json(404, {"error": "No submissions found"})
                return
            with open(sub_file, "r", encoding="utf-8") as f:
                subs = json.load(f)
            found = False
            for s in subs:
                if s.get("id") == sub_id:
                    s["status"] = new_status
                    s["resolvedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    found = True
                    break
            if found:
                with open(sub_file, "w", encoding="utf-8") as f:
                    json.dump(subs, f, indent=2, ensure_ascii=False)
                self.send_cors_json(200, {"success": True, "message": f"Updated status of {sub_id} to {new_status}"})
            else:
                self.send_cors_json(404, {"error": "Submission not found"})
            return

        # 4. Authenticated Publish Live Endpoint
        if parsed.path == "/api/publish":
            if not verify_token(self.headers):
                # Also allow local loopback requests if configured
                is_local = self.client_address[0] in ("127.0.0.1", "localhost", "::1")
                if not is_local:
                    self.send_cors_json(401, {"error": "Unauthorized: Admin session required to publish"})
                    return

            try:
                payload = body_json.get("payload", body_json)
                sync_path = os.path.join(APP_DIR, "portal_sync.json")
                with open(sync_path, "w", encoding="utf-8") as f:
                    json.dump(payload, f, indent=2, ensure_ascii=False)

                deployed = False
                deploy_msg = "Saved to portal_sync.json"
                if body_json.get("triggerDeploy", True):
                    deploy_script = os.path.join(APP_DIR, "deploy_to_github.py")
                    if os.path.exists(deploy_script):
                        res = subprocess.run([sys.executable, deploy_script], capture_output=True, text=True)
                        deployed = (res.returncode == 0)
                        deploy_msg = res.stdout if deployed else res.stderr

                self.send_cors_json(200, {
                    "success": True,
                    "message": "Published live via authenticated ClassroomHub server backend!",
                    "deployed": deployed,
                    "deployMsg": deploy_msg
                })
            except Exception as e:
                self.send_cors_json(500, {"error": f"Server publish error: {str(e)}"})
            return

        # 5. Restore System Backup (Admin Only)
        if parsed.path == "/api/restore":
            if not verify_token(self.headers):
                self.send_cors_json(401, {"error": "Unauthorized: Admin session required"})
                return
            backup = body_json.get("backup", {})
            if "portalSync" in backup and isinstance(backup["portalSync"], dict):
                sync_path = os.path.join(APP_DIR, "portal_sync.json")
                with open(sync_path, "w", encoding="utf-8") as f:
                    json.dump(backup["portalSync"], f, indent=2, ensure_ascii=False)
            if "submissions" in backup and isinstance(backup["submissions"], list):
                sub_path = os.path.join(APP_DIR, "submissions.json")
                with open(sub_path, "w", encoding="utf-8") as f:
                    json.dump(backup["submissions"], f, indent=2, ensure_ascii=False)
            self.send_cors_json(200, {"success": True, "message": "Portal backup successfully restored!"})
            return

        self.send_cors_json(404, {"error": "Endpoint not found"})

def run_server(port=PORT):
    server_address = ("", port)
    try:
        httpd = ThreadingHTTPServer(server_address, ClassroomHubHandler)
        print(f"======================================================")
        print(f"🚀 Fahim Niloy's Classroom Hub Backend Running!")
        print(f"📍 Local URL: http://localhost:{port}")
        print(f"📂 Serving Resources from: {BASE_DIR}")
        print(f"🔒 Authenticated Admin Publishing & Submissions Active")
        print(f"======================================================")
        httpd.serve_forever()
    except OSError as e:
        if port < 8090:
            print(f"Port {port} busy, trying {port + 1}...")
            run_server(port + 1)
        else:
            raise e

if __name__ == "__main__":
    run_server()
