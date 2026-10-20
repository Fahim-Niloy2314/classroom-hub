"""Explicit personal-account deployment; credentials are supplied privately by the owner."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = 'https://fahim-niloy2314.github.io/classroom-hub/'
OWNERS = ['fahimniloy2314@gmail.com', 'fahim.cuet.me20@gmail.com']


def requirements(environ=os.environ):
    if environ.get('CLASSROOM_CONFIRM_FREE_PLAN') != 'true':
        raise ValueError('Confirm Workers Free in your own Cloudflare account before activation. No paid plan will be selected by this script.')
    names = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLASSROOM_OWNER_PASSWORD']
    missing = [name for name in names if not environ.get(name)]
    if missing:
        raise ValueError('Missing private repository secrets: ' + ', '.join(missing) + '. No deployment or public connection has been attempted.')
    if not re.fullmatch(r'[a-fA-F0-9]{32}', environ['CLOUDFLARE_ACCOUNT_ID']):
        raise ValueError('Invalid Cloudflare account ID.')
    if len(environ['CLASSROOM_OWNER_PASSWORD']) < 12:
        raise ValueError('Set a new owner password of at least 12 characters in the private repository secret.')


def credential(password):
    salt = secrets.token_hex(16)
    return {'algorithm': 'PBKDF2-SHA256', 'iterations': 100000, 'salt': salt,
            'hash': hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 100000).hex()}


def request_json(url, data=None, headers=None, method=None):
    body = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json', 'Cache-Control': 'no-cache', **(headers or {})}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise ValueError('Remote request returned HTTP ' + str(error.code) + '. No response body or credential has been printed.') from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        raise ValueError('Remote service was unavailable or returned invalid JSON.') from None


def cloudflare(path, data=None):
    answer = request_json('https://api.cloudflare.com/client/v4/accounts/' + os.environ['CLOUDFLARE_ACCOUNT_ID'] + path, data,
                          {'Authorization': 'Bearer ' + os.environ['CLOUDFLARE_API_TOKEN']})
    if answer.get('success') is not True:
        raise ValueError('Cloudflare did not confirm the account operation. Check the token permissions for Workers and D1.')
    return answer


def database_id():
    page = 1
    matches = []
    while True:
        result = cloudflare('/d1/database?' + urllib.parse.urlencode({'name': 'classroom-hub-owner', 'per_page': 100, 'page': page}))
        rows = result.get('result', [])
        matches.extend(row for row in rows if row.get('name') == 'classroom-hub-owner')
        if page >= result.get('result_info', {}).get('total_pages', 1):
            break
        page += 1
    if len(matches) > 1:
        raise ValueError('More than one matching owner database exists. Select the intended database before deploying.')
    row = matches[0] if matches else cloudflare('/d1/database', {'name': 'classroom-hub-owner'})['result']
    value = row.get('uuid')
    if not re.fullmatch(r'[a-fA-F0-9-]{36}', value or ''):
        raise ValueError('Cloudflare did not return a valid database identifier.')
    return value


def wrangler(args):
    executable = ROOT / 'node_modules/wrangler/bin/wrangler.js'
    if not executable.exists():
        raise ValueError('Install the pinned backend dependencies before deploying.')
    result = subprocess.run(['node', str(executable), *args], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
    if result.returncode:
        raise ValueError('Wrangler did not confirm ' + args[0] + '. Provider output was withheld to avoid exposing private account values.')
    return result.stdout


def confirm_login(base, password):
    status = request_json(base + '/api/status')
    if status.get('status') != 'online' or not status.get('configured') or status.get('authenticated'):
        raise ValueError('The personal backend is not ready. Public configuration was not changed.')
    try:
        request_json(base + '/api/owner')
    except ValueError as error:
        if 'HTTP 401' not in str(error):
            raise
    else:
        raise ValueError('Private owner data is accessible anonymously. Public configuration was not changed.')
    for email in OWNERS:
        login = request_json(base + '/api/login', {'email': email, 'password': password})
        token = login.get('token')
        if not login.get('success') or not token or login.get('user', {}).get('role') != 'admin':
            raise ValueError('Owner login was not verified. Public configuration was not changed.')
        headers = {'Authorization': 'Bearer ' + token}
        try:
            owner = request_json(base + '/api/owner', headers=headers)
            if sorted(owner.get('emails', [])) != sorted(OWNERS):
                raise ValueError('Owner identity verification failed.')
        finally:
            request_json(base + '/api/logout', {}, headers)


def verify_public():
    expected = json.loads((ROOT.parent / 'backend-config.json').read_text())['apiBase']
    for attempt in range(24):
        try:
            if request_json(PUBLIC + 'backend-config.json?check=' + str(time.time_ns())).get('apiBase') == expected:
                print('Verified: the public site now points to the personally controlled backend.')
                return
        except ValueError:
            pass
        if attempt < 23:
            time.sleep(5)
    raise ValueError('Backend deployment succeeded, but the public connection has not been verified. Check the Pages build; do not claim live publishing is ready.')


def deploy():
    requirements()
    config = json.loads((ROOT / 'wrangler.jsonc').read_text())
    config['d1_databases'][0]['database_id'] = database_id()
    config['d1_databases'][0]['migrations_dir'] = str(ROOT / 'migrations')
    config['main'] = str(ROOT / 'worker.ts')
    # The Worker independently checks the public site's actual connection on publish.
    config['vars']['CLASSROOM_PUBLIC_FRONTEND_CONNECTED'] = 'false'
    with tempfile.TemporaryDirectory(prefix='classroom-owner-') as temporary:
        directory = Path(temporary)
        config_path = directory / 'wrangler.json'
        secret_path = directory / 'credential.json'
        config_path.write_text(json.dumps(config))
        secret_path.write_text(json.dumps({'CLASSROOM_OWNER_CREDENTIAL': json.dumps(credential(os.environ['CLASSROOM_OWNER_PASSWORD']))}))
        secret_path.chmod(0o600)
        wrangler(['d1', 'migrations', 'apply', 'DB', '--remote', '--config', str(config_path)])
        output = wrangler(['deploy', '--config', str(config_path), '--secrets-file', str(secret_path)])
    matches = set(re.findall(r'https://' + re.escape(config['name']) + r'\.[a-z0-9-]+\.workers\.dev', output))
    if len(matches) != 1:
        raise ValueError('Deployment returned no unique production URL. Public configuration was not changed.')
    base = matches.pop()
    confirm_login(base, os.environ['CLASSROOM_OWNER_PASSWORD'])
    (ROOT.parent / 'backend-config.json').write_text(json.dumps({'apiBase': base}, indent=2) + '\n')
    print('Personal backend and both owner identities verified. Public connection is prepared for the Pages build.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preflight', action='store_true')
    parser.add_argument('--verify-public', action='store_true')
    args = parser.parse_args()
    try:
        if args.preflight:
            requirements()
            print('Required personal-account secrets are present. No deployment attempted.')
        elif args.verify_public:
            verify_public()
        else:
            deploy()
    except ValueError as error:
        raise SystemExit(str(error)) from None


if __name__ == '__main__':
    main()
