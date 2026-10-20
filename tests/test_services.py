import json
from pathlib import Path
import tempfile
import unittest
import time
import hub_services as services

class ServicesTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();services.initialize(Path(self.temp.name));services.PRESENCE.clear();self.original_request=services._request_json
    def tearDown(self):services._request_json=self.original_request;self.temp.cleanup()
    def test_presence_counts_real_browsers_once_and_expires(self):
        services.presence({'browserId':'synthetic-browser-one','route':'home'});services.presence({'browserId':'synthetic-browser-one','route':'tools/cv'})
        stats=services.analytics();self.assertEqual(stats['activeBrowsers'],1);self.assertEqual(stats['todayBrowsers'],1);self.assertEqual(stats['routes'],{'tools/cv':1})
        for item in services.PRESENCE.values():item['seen']=time.time()-91
        self.assertEqual(services.analytics()['activeBrowsers'],0)
    def test_ai_disabled_never_calls_provider(self):
        calls=[];services._request_json=lambda *args:calls.append(args)
        with self.assertRaises(services.ServiceError):services.ai_chat({'question':'Fixture question'},'fixture-ip',{})
        self.assertEqual(calls,[])
    def enable_ai(self,provider='gemini',limit=100):
        return services.save_ai_config({'enabled':True,'provider':provider,'model':'fixture-model','geminiKey':'synthetic-fixture-key','openaiKey':'synthetic-fixture-key','dailyLimit':limit,'maxOutputTokens':1500})
    def test_gemini_request_context_and_latex_response(self):
        self.enable_ai();requests=[]
        def response(url,body,headers):requests.append((url,body,headers));return {'candidates':[{'content':{'parts':[{'text':r'Energy: \[E=mc^2\]'}]}}]}
        services._request_json=response;answer=services.ai_chat({'question':'Explain energy','semester':'L1-T1','history':[]},'fixture-ip',{'L1-T1':[{'code':'ME-111','name':'Mechanics'}]})
        self.assertEqual(answer['answer'],r'Energy: \[E=mc^2\]');self.assertNotIn('synthetic-fixture-key',requests[0][0]);self.assertIn('ME-111',requests[0][1]['systemInstruction']['parts'][0]['text']);self.assertIn('x-goog-api-key',requests[0][2])
    def test_openai_responses_payload_and_key_redaction(self):
        status=self.enable_ai('openai');self.assertNotIn('keys',status);requests=[]
        def response(url,body,headers):requests.append((url,body,headers));return {'output':[{'type':'message','content':[{'type':'output_text','text':'Synthetic provider answer'}]}]}
        services._request_json=response;answer=services.ai_chat({'question':'Fixture question'},'fixture-ip',{})
        self.assertEqual(answer['answer'],'Synthetic provider answer');self.assertEqual(requests[0][0],'https://api.openai.com/v1/responses');self.assertFalse(requests[0][1]['store']);self.assertNotIn('synthetic-fixture-key',json.dumps(services.ai_status()))
    def test_ai_cap_stops_extra_provider_requests(self):
        self.enable_ai(limit=1);calls=[]
        def response(*args):calls.append(args);return {'candidates':[{'content':{'parts':[{'text':'Fixture'}]}}]}
        services._request_json=response;services.ai_chat({'question':'One'},'fixture-ip',{})
        with self.assertRaises(services.ServiceError) as caught:services.ai_chat({'question':'Two'},'fixture-ip',{})
        self.assertEqual(caught.exception.status,429);self.assertEqual(len(calls),1)
    def test_invalid_ai_turns_and_model_are_rejected(self):
        with self.assertRaises(services.ServiceError):services.save_ai_config({'provider':'openai','model':'https://evil.invalid','enabled':False})
        self.enable_ai()
        with self.assertRaises(services.ServiceError):services.ai_chat({'question':'Fixture','history':[{'role':'system','text':'Fixture'}]},'fixture-ip',{})
    def enable_notifications(self,mode='instant'):
        return services.save_notification_config({'enabled':True,'token':'synthetic-fixture-token','phoneId':'123456789','recipient':'8801850162261','template':'fixture_template','version':'v26.0','language':'en_US','mode':mode,'digestTime':'00:00'})
    def test_whatsapp_disabled_is_not_reported_as_sent(self):
        self.assertEqual(services.queue_notification('fixture-receipt',{'type':'Feedback'}),'disabled')
        self.assertEqual(services.analytics()['notifications'],{})
    def test_whatsapp_queue_deduplicates_and_only_claims_provider_acceptance(self):
        self.enable_notifications();calls=[]
        def response(*args):calls.append(args);return {'messages':[{'id':'synthetic-message-id'}]}
        services._request_json=response
        for _ in range(2):services.queue_notification('fixture-one',{'type':'Feedback','studentName':'Test'})
        services.process_notifications();services.process_notifications();self.assertEqual(len(calls),1);self.assertEqual(services.analytics()['notifications'],{'accepted':1});self.assertNotIn('synthetic-fixture-token',json.dumps(services.notification_status()))
    def test_daily_digest_sends_one_summary_and_keeps_later_items_for_next_day(self):
        self.enable_notifications('daily');calls=[]
        def response(*args):calls.append(args);return {'messages':[{'id':'fixture-digest'}]}
        services._request_json=response
        for i in range(3):services.queue_notification('fixture-'+str(i),{'type':'Feedback'})
        services.process_notifications();services.queue_notification('fixture-later',{'type':'Feedback'});services.process_notifications()
        self.assertEqual(len(calls),1);self.assertIn('3 new Classroom Hub',calls[0][1]['template']['components'][0]['parameters'][0]['text']);self.assertEqual(services.analytics()['notifications'],{'accepted':3,'pending':1})
    def test_whatsapp_failures_are_visible_and_retried_with_a_bound(self):
        self.enable_notifications();services.queue_notification('fixture-fail',{'type':'Feedback'})
        def fail(*args):raise services.ServiceError('Synthetic provider error',502)
        services._request_json=fail
        for _ in range(4):
            with services.connect() as db:db.execute('UPDATE notifications SET next_retry=0')
            services.process_notifications()
        self.assertEqual(services.analytics()['notifications'],{'failed':1})

if __name__=='__main__':unittest.main()
