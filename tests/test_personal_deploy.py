import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / 'backend-worker/tools/deploy_personal.py'
SPEC = importlib.util.spec_from_file_location('personal_deploy', SOURCE)
DEPLOY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DEPLOY)


class PersonalDeploymentTests(unittest.TestCase):
    def test_missing_secrets_stop_before_any_account_operation(self):
        with self.assertRaisesRegex(ValueError, 'No deployment'):
            DEPLOY.requirements({'CLASSROOM_CONFIRM_FREE_PLAN': 'true'})

    def test_bootstrap_credential_has_fresh_salt_and_no_plaintext(self):
        password = 'synthetic-bootstrap-only'
        first, second = DEPLOY.credential(password), DEPLOY.credential(password)
        self.assertNotEqual(first['salt'], second['salt'])
        self.assertNotIn(password, json.dumps(first))
        self.assertEqual(first['hash'], hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(first['salt']), 100000).hex())

    def test_existing_database_is_reused_without_creating_another(self):
        uid = '11111111-1111-4111-8111-111111111111'
        with patch.object(DEPLOY, 'cloudflare', return_value={'result': [{'name': 'classroom-hub-owner', 'uuid': uid}]}) as call:
            self.assertEqual(DEPLOY.database_id(), uid)
            self.assertEqual(call.call_count, 1)

    def test_ambiguous_database_never_silently_picks_one(self):
        with patch.object(DEPLOY, 'cloudflare', return_value={'result': [{'name': 'classroom-hub-owner'}, {'name': 'classroom-hub-owner'}]}):
            with self.assertRaisesRegex(ValueError, 'More than one'):
                DEPLOY.database_id()

    def test_failed_owner_verification_keeps_public_site_disconnected(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            backend = project / 'backend-worker'
            backend.mkdir()
            (backend / 'wrangler.jsonc').write_text(json.dumps({'name': 'classroom-hub-owner-service', 'd1_databases': [{}], 'vars': {}}))
            config = project / 'backend-config.json'
            config.write_text('{"apiBase":""}')
            env = {'CLASSROOM_CONFIRM_FREE_PLAN': 'true', 'CLOUDFLARE_API_TOKEN': 'synthetic-token', 'CLOUDFLARE_ACCOUNT_ID': 'a' * 32, 'CLASSROOM_OWNER_PASSWORD': 'synthetic-password-only'}
            with patch.object(DEPLOY, 'ROOT', backend), patch.dict(DEPLOY.os.environ, env), patch.object(DEPLOY, 'database_id', return_value='11111111-1111-4111-8111-111111111111'), patch.object(DEPLOY, 'wrangler', return_value='https://classroom-hub-owner-service.fixture.workers.dev'), patch.object(DEPLOY, 'confirm_login', side_effect=ValueError('Owner verification failed')):
                with self.assertRaisesRegex(ValueError, 'Owner verification failed'):
                    DEPLOY.deploy()
            self.assertEqual(config.read_text(), '{"apiBase":""}')
            self.assertFalse((backend / 'credential.json').exists())

    def test_both_owner_sessions_are_revoked_after_verification(self):
        def request(url, data=None, headers=None):
            if url.endswith('/status'):
                return {'status': 'online', 'configured': True}
            if url.endswith('/login'):
                return {'success': True, 'token': 'synthetic-session', 'user': {'role': 'admin'}}
            if url.endswith('/owner'):
                if not headers:
                    raise ValueError('Remote request returned HTTP 401.')
                return {'emails': DEPLOY.OWNERS}
            return {'success': True}
        with patch.object(DEPLOY, 'request_json', side_effect=request) as calls:
            DEPLOY.confirm_login('https://fixture.workers.dev', 'synthetic-password')
            self.assertEqual(sum(call.args[0].endswith('/logout') for call in calls.call_args_list), 2)


if __name__ == '__main__':
    unittest.main()
