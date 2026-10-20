"""Integration tests use only synthetic data and a temporary private database."""
import concurrent.futures
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer

spec=importlib.util.spec_from_file_location('hub_server',Path(__file__).resolve().parents[1]/'server.py')
hub=importlib.util.module_from_spec(spec);spec.loader.exec_module(hub)

class BackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory();root=Path(cls.temp.name)
        hub.PRIVATE_DIR=root/'private';hub.ACADEMIC_DIR=root/'academic';hub.ACADEMIC_DIR.mkdir()
        hub.private_setup();hub.atomic_json(hub.PRIVATE_DIR/'owner.json',hub.make_password('synthetic-test-password'))
        (hub.ACADEMIC_DIR/'notes.pdf').write_bytes(b'%PDF-synthetic')
        outside=root/'outside.pdf';outside.write_bytes(b'private fixture');(hub.ACADEMIC_DIR/'escape.pdf').symlink_to(outside)
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),hub.ClassroomHubHandler);cls.url='http://127.0.0.1:'+str(cls.server.server_port)
        threading.Thread(target=cls.server.serve_forever,daemon=True).start()
    @classmethod
    def tearDownClass(cls): cls.server.shutdown();cls.server.server_close();cls.temp.cleanup()
    def call(self,path,body=None,token=None,method=None,origin=None):
        headers={'Content-Type':'application/json'}
        if token:headers['Authorization']='Bearer '+token
        if origin:headers['Origin']=origin
        req=Request(self.url+path,headers=headers,data=json.dumps(body).encode() if body is not None else None,method=method)
        try:r=urlopen(req,timeout=5)
        except HTTPError as e:r=e
        raw=r.read();result=json.loads(raw) if raw and r.headers.get('Content-Type','').startswith('application/json') else raw
        return r.status,result,r.headers
    def login(self):
        return self.call('/api/login',{'email':hub.OWNER_EMAIL,'password':'synthetic-test-password'})[1]['token']
    def test_authority_requires_server_session(self):
        for path in ['/api/submissions','/api/backup']:
            self.assertEqual(self.call(path)[0],401)
        for path in ['/api/publish','/api/restore']:
            self.assertEqual(self.call(path,{'role':'admin','passwordHash':'fixture'})[0],401)
    def test_login_logout_expiry_and_pass_hash_rejected(self):
        self.assertEqual(self.call('/api/login',{'email':hub.OWNER_EMAIL,'passwordHash':'fixture'})[0],401)
        token=self.login();self.assertTrue(self.call('/api/status',token=token)[1]['authenticated'])
        self.assertEqual(self.call('/api/logout',{},token)[0],200);self.assertEqual(self.call('/api/backup',token=token)[0],401)
        token=self.login();hub.SESSIONS[token]=0;self.assertEqual(self.call('/api/backup',token=token)[0],401)
    def test_static_and_file_api_deny_private_files_for_get_and_head(self):
        for method in ['GET','HEAD']:
            for path in ['/server.py','/secrets.json','/.env','/.git/config','/api/file?path=submissions.json','/api/file?path=../outside.pdf','/api/file?path=escape.pdf','/api/open-local?path=notes.pdf']:
                with self.subTest(method=method,path=path):self.assertEqual(self.call(path,method=method)[0],404)
        self.assertEqual(self.call('/api/file?path=notes.pdf')[0],200)
    def test_origin_and_no_store(self):
        self.assertEqual(self.call('/api/status',origin='https://attacker.invalid')[0],403)
        status,_,headers=self.call('/api/status',origin='https://fahim-niloy2314.github.io')
        self.assertEqual(status,200);self.assertEqual(headers.get('Access-Control-Allow-Origin'),'https://fahim-niloy2314.github.io');self.assertEqual(headers.get('Cache-Control'),'no-store')
    def test_submissions_durable_idempotent_and_central(self):
        data={'requestId':'synthetic-request-001','description':'Synthetic student message','studentName':'Test Student','studentEmail':'','studentPhone':'fixture'}
        status,received,_=self.call('/api/submissions',data);self.assertEqual(status,201)
        self.assertEqual(self.call('/api/submissions',data)[1]['receiptId'],received['receiptId'])
        rows=self.call('/api/submissions',token=self.login())[1]['submissions'];match=[x for x in rows if x['id']==received['receiptId']]
        self.assertEqual(len(match),1);self.assertEqual(match[0]['studentEmail'],'');self.assertEqual(match[0]['studentPhone'],'fixture')
        with hub.connect() as db:self.assertIsNotNone(db.execute('SELECT id FROM submissions WHERE id=?',(received['receiptId'],)).fetchone())
    def test_simultaneous_retries_create_one_record(self):
        data={'requestId':'synthetic-concurrent-002','description':'Synthetic concurrent message'}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(lambda _:self.call('/api/submissions',data),range(4)))
        self.assertTrue(all(r[0] in [200,201] for r in results));self.assertEqual(len(set(r[1]['receiptId'] for r in results)),1)
    def test_status_changes_need_owner(self):
        self.assertEqual(self.call('/api/submissions/status',{'id':'fixture','status':'resolved'})[0],401)
        self.assertEqual(self.call('/api/submissions/status',{'id':'fixture','status':'invalid'},self.login())[0],400)
    def test_publish_without_credential_is_failure_and_keeps_public_file(self):
        before=(hub.APP_DIR/'portal_sync.json').read_bytes();old=os.environ.pop('GITHUB_TOKEN',None)
        try:
            status,result,_=self.call('/api/publish',{'payload':{'portalSettings':{},'faculty':[]}},self.login())
            self.assertEqual(status,503);self.assertFalse(result['success']);self.assertFalse(result['deployed']);self.assertEqual((hub.APP_DIR/'portal_sync.json').read_bytes(),before)
        finally:
            if old:os.environ['GITHUB_TOKEN']=old
    def test_public_payload_validation_and_backup(self):
        token=self.login()
        for payload in [{'portalSettings':{'geminiApiKey':'fixture'}},{'portalSettings':{},'submissions':[]}]:
            self.assertEqual(self.call('/api/publish',{'payload':payload},token)[0],400)
        backup=self.call('/api/backup',token=token)[1]['backup'];self.assertNotIn('owner',backup);self.assertEqual(backup['app'],'ClassroomHubBackend')
    def test_restore_validation_is_atomic(self):
        token=self.login();backup=self.call('/api/backup',token=token)[1]['backup'];backup['submissions']=[{'id':'bad','status':'invalid'}]
        self.assertEqual(self.call('/api/restore',{'backup':backup},token)[0],400)
        self.assertEqual(self.call('/api/restore',{'backup':{'app':'invalid'}},token)[0],400)
    def test_rate_limit(self):
        hub.ATTEMPTS.pop('127.0.0.1',None)
        for _ in range(5):self.assertEqual(self.call('/api/login',{'email':hub.OWNER_EMAIL,'password':'wrong'})[0],401)
        self.assertEqual(self.call('/api/login',{'email':hub.OWNER_EMAIL,'password':'wrong'})[0],429)
        hub.ATTEMPTS.pop('127.0.0.1',None)

if __name__=='__main__':unittest.main()
