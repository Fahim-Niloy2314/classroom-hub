"""Set a private credential in the Cloudflare account authenticated on the owner's computer."""
import getpass
import hashlib
import json
from pathlib import Path
import secrets
import subprocess


def main():
    password = getpass.getpass('New Classroom Hub owner password (hidden): ')
    if len(password) < 12:
        raise SystemExit('Use at least 12 characters.')
    if password != getpass.getpass('Repeat the password (hidden): '):
        raise SystemExit('Passwords do not match; nothing changed.')
    salt = secrets.token_hex(16)
    credential = {'algorithm': 'PBKDF2-SHA256', 'iterations': 100000, 'salt': salt,
                  'hash': hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 100000).hex()}
    root = Path(__file__).resolve().parents[1]
    wrangler = root / 'node_modules/wrangler/bin/wrangler.js'
    if not wrangler.exists():
        raise SystemExit('Install the backend dependencies on your own computer first.')
    try:
        result = subprocess.run(['node', str(wrangler), 'secret', 'put', 'CLASSROOM_OWNER_CREDENTIAL'],
                                cwd=root, input=json.dumps(credential), text=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    except OSError:
        raise SystemExit('Node.js is not available. Nothing was saved.')
    if result.returncode:
        raise SystemExit('Cloudflare did not confirm the secret. Check your personal Cloudflare login and Worker configuration; no password was printed.')
    print('Owner credential stored in your Cloudflare account. No password was saved in the repository.')
    print('For an existing password already changed in the database, use the authenticated dashboard to change it again.')


if __name__ == '__main__':
    main()
