"""Optional private services: AI proxy, anonymous presence, WhatsApp notification queue.
No service calls a paid provider until its owner explicitly enables and configures it.
"""
import hashlib
import json
from pathlib import Path
import re
import secrets
import sqlite3
import threading
import time
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError

PRIVATE_DIR = None
PRESENCE = {}
LOCK = threading.RLock()
WORKER_STARTED = False

class ServiceError(Exception):
    def __init__(self, message, status=400): self.status=status;super().__init__(message)

def today(): return datetime.now(timezone(timedelta(hours=6))).strftime('%Y-%m-%d')
def connect():
    db=sqlite3.connect(str(PRIVATE_DIR/'state.sqlite3'),timeout=20);db.row_factory=sqlite3.Row;return db

def initialize(directory):
    global PRIVATE_DIR
    PRIVATE_DIR=Path(directory)
    with connect() as db:
        db.execute('CREATE TABLE IF NOT EXISTS browser_visits (day TEXT, browser TEXT, PRIMARY KEY(day,browser))')
        db.execute('CREATE TABLE IF NOT EXISTS ai_usage (day TEXT, bucket TEXT, count INTEGER NOT NULL, PRIMARY KEY(day,bucket))')
        db.execute('CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, created REAL, summary TEXT, state TEXT, attempts INTEGER DEFAULT 0, next_retry REAL DEFAULT 0, provider_id TEXT)')
        db.execute('CREATE TABLE IF NOT EXISTS service_state (key TEXT PRIMARY KEY, value TEXT)')

def read_config(name):
    try:return json.loads((PRIVATE_DIR/(name+'.json')).read_text())
    except (OSError,ValueError):return {}

def write_config(name,config):
    target=PRIVATE_DIR/(name+'.json');temp=target.with_name(target.name+'.'+secrets.token_hex(4)+'.tmp')
    with open(temp,'x',encoding='utf-8') as f:
        import os
        os.chmod(temp,0o600);json.dump(config,f);f.flush();os.fsync(f.fileno())
    temp.replace(target)

def presence(data):
    browser=str(data.get('browserId',''));route=str(data.get('route','home'))
    if not re.fullmatch(r'[a-zA-Z0-9_-]{16,80}',browser):raise ServiceError('Invalid anonymous browser ID.')
    if route not in {'home','tools/routine','tools/cv','tools/cgpa','tools/ai','faculty','progress','notices','feedback','help','admin'}:route='other'
    key=hashlib.sha256((today()+':'+browser).encode()).hexdigest()
    with LOCK:
        cutoff=time.time()-90
        for old in [k for k,v in PRESENCE.items() if v['seen']<cutoff]:PRESENCE.pop(old,None)
        if len(PRESENCE)>=10000 and key not in PRESENCE:raise ServiceError('Presence capacity reached.',429)
        new=key not in PRESENCE
        PRESENCE[key]={'seen':time.time(),'route':route}
    if new:
        with connect() as db:db.execute('INSERT OR IGNORE INTO browser_visits VALUES (?,?)',(today(),key))
    return {'success':True}

def analytics():
    with LOCK:
        active=[value for value in PRESENCE.values() if value['seen']>=time.time()-90]
        routes={}
        for entry in active:routes[entry['route']]=routes.get(entry['route'],0)+1
    with connect() as db:
        visits=db.execute('SELECT count(*) FROM browser_visits WHERE day=?',(today(),)).fetchone()[0]
        calls=db.execute('SELECT count FROM ai_usage WHERE day=? AND bucket=?',(today(),'all')).fetchone()
        notifications={r['state']:r['n'] for r in db.execute('SELECT state,count(*) n FROM notifications GROUP BY state')}
    return {'success':True,'activeBrowsers':len(active),'activeWindowSeconds':90,'todayBrowsers':visits,'routes':routes,'aiRequestsToday':calls[0] if calls else 0,'notifications':notifications,'timezone':'Asia/Dhaka','measuredAt':time.time()}

def ai_status():
    config=read_config('ai');provider=config.get('provider','gemini')
    return {'enabled':config.get('enabled') is True,'provider':provider,'model':config.get('model',''),'configured':bool(config.get('keys',{}).get(provider)),'dailyLimit':config.get('dailyLimit',100),'maxOutputTokens':config.get('maxOutputTokens',1500)}

def save_ai_config(data):
    provider=data.get('provider','gemini');model=str(data.get('model','')).strip()
    if provider not in {'gemini','openai'} or not re.fullmatch(r'[a-zA-Z0-9._:-]{1,100}',model):raise ServiceError('Select a provider and a valid model ID from that provider.')
    old=read_config('ai');keys=old.get('keys',{})
    for name in ['gemini','openai']:
        if data.get('clear'+name.title()) is True:keys.pop(name,None)
        key=data.get(name+'Key')
        if key:
            if not isinstance(key,str) or len(key)>500 or any(c.isspace() for c in key):raise ServiceError('Invalid API key.')
            keys[name]=key
    daily=int(data.get('dailyLimit',100));tokens=int(data.get('maxOutputTokens',1500))
    if not 1<=daily<=1000 or not 256<=tokens<=4096:raise ServiceError('Use a daily request limit of 1–1000 and output limit of 256–4096 tokens.')
    if data.get('enabled') is True and not keys.get(provider):raise ServiceError('Configure the selected provider key before enabling online AI.')
    write_config('ai',{'enabled':data.get('enabled') is True,'provider':provider,'model':model,'keys':keys,'dailyLimit':daily,'maxOutputTokens':tokens})
    return {'success':True,**ai_status()}

def _request_json(url,body,headers,timeout=45):
    request=Request(url,data=json.dumps(body).encode(),headers={'Content-Type':'application/json',**headers},method='POST')
    try:
        with urlopen(request,timeout=timeout) as response:return json.load(response)
    except HTTPError as error:raise ServiceError('Provider rejected the request (HTTP '+str(error.code)+'). Check the configured model, key and quota.',502)
    except ServiceError:raise
    except Exception:raise ServiceError('Provider connection timed out or failed. No answer has been fabricated.',502)

def reserve_ai_usage(ip,config):
    minute=str(int(time.time()//60));bucket='ip:'+hashlib.sha256((today()+ip+minute).encode()).hexdigest()
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        total=db.execute('SELECT count FROM ai_usage WHERE day=? AND bucket=?',(today(),'all')).fetchone()
        if total and total[0]>=config.get('dailyLimit',100):raise ServiceError('The owner’s daily AI request limit has been reached. Use the official Gemini or ChatGPT app.',429)
        used=db.execute('SELECT count FROM ai_usage WHERE day=? AND bucket=?',(today(),bucket)).fetchone()
        if used and used[0]>=3:raise ServiceError('Please wait a minute before asking more questions.',429)
        for name in ['all',bucket]:db.execute('INSERT INTO ai_usage VALUES (?,?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1',(today(),name))

def ai_chat(data,ip,registry):
    config=read_config('ai');provider=config.get('provider','gemini');key=config.get('keys',{}).get(provider)
    if config.get('enabled') is not True or not key:raise ServiceError('Online AI is not connected. Open the official Gemini/ChatGPT app or use a personal API key.',503)
    question=str(data.get('question','')).strip()
    if not question or len(question)>8000:raise ServiceError('Enter a question of up to 8000 characters.')
    history=data.get('history',[])
    if not isinstance(history,list) or len(history)>8:raise ServiceError('Invalid conversation context.')
    messages=[]
    for item in history:
        if not isinstance(item,dict) or item.get('role') not in {'user','assistant'} or not isinstance(item.get('text'),str) or len(item['text'])>8000:raise ServiceError('Invalid conversation turn.')
        messages.append({'role':item['role'],'content':item['text']})
    messages.append({'role':'user','content':question})
    semester=str(data.get('semester','general'));courses=registry.get(semester,[]) if isinstance(registry,dict) else []
    instruction=r'You are Classroom Hub study assistant. Answer the actual question accurately and ask for missing values. Explain assumptions and units; do not invent facts, sources, grades or official rules. Use clear Bangla when the question is Bangla, otherwise clear English. Use \( ... \) for inline math and \[ ... \] for display math, with valid LaTeX. Do not wrap equations in code fences or HTML. You cannot read private Drive documents; use only text supplied in this conversation. Course context is owner-maintained and is not an official factual source: '+json.dumps(courses,ensure_ascii=False)
    reserve_ai_usage(ip,config)
    if provider=='gemini':
        body={'systemInstruction':{'parts':[{'text':instruction}]},'contents':[{'role':'model' if row['role']=='assistant' else 'user','parts':[{'text':row['content']}]} for row in messages],'generationConfig':{'maxOutputTokens':config.get('maxOutputTokens',1500)}}
        result=_request_json('https://generativelanguage.googleapis.com/v1beta/models/'+config['model']+':generateContent',body,{'x-goog-api-key':key})
        answer='\n'.join(part.get('text','') for candidate in result.get('candidates',[])[:1] for part in candidate.get('content',{}).get('parts',[]) if not part.get('thought'))
    else:
        body={'model':config['model'],'instructions':instruction,'input':messages,'max_output_tokens':config.get('maxOutputTokens',1500),'store':False}
        result=_request_json('https://api.openai.com/v1/responses',body,{'Authorization':'Bearer '+key})
        answer='\n'.join(part.get('text','') for item in result.get('output',[]) if item.get('type')=='message' for part in item.get('content',[]) if part.get('type')=='output_text')
    if not answer.strip():raise ServiceError('The provider returned no answer. Try a clearer question or check provider availability.',502)
    return {'success':True,'answer':answer[:100000],'provider':provider,'model':config['model']}

def notification_status():
    config=read_config('whatsapp')
    return {'enabled':config.get('enabled') is True,'configured':all(config.get(k) for k in ['token','phoneId','recipient','template','version']),'recipient':config.get('recipient','8801850162261'),'phoneId':config.get('phoneId',''),'template':config.get('template',''),'language':config.get('language','en_US'),'version':config.get('version',''),'mode':config.get('mode','instant'),'digestTime':config.get('digestTime','20:00')}

def save_notification_config(data):
    config=read_config('whatsapp');config.update({k:str(data.get(k,config.get(k,''))).strip() for k in ['phoneId','recipient','template','language','version','mode','digestTime']})
    if data.get('token'):config['token']=str(data['token']).strip()
    if data.get('clearToken') is True:config.pop('token',None)
    config['enabled']=data.get('enabled') is True
    if config['mode'] not in {'instant','daily'}:raise ServiceError('Choose instant or daily notification mode.')
    if config['digestTime'] and not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',config['digestTime']):raise ServiceError('Use HH:mm for the daily Dhaka time.')
    if config['enabled']:
        if not re.fullmatch(r'\d{8,16}',config['recipient']) or not re.fullmatch(r'\d+',config['phoneId']) or not re.fullmatch(r'v\d+\.0',config['version']) or not re.fullmatch(r'[a-z0-9_]{1,512}',config['template']) or not config.get('token'):raise ServiceError('Configure the business token, phone ID, recipient, API version and approved template first.')
    write_config('whatsapp',config)
    return {'success':True,**notification_status()}

def queue_notification(receipt,payload):
    config=read_config('whatsapp')
    if config.get('enabled') is not True:return 'disabled'
    # The approved template takes one body parameter. It contains only an inbox summary.
    summary='Classroom Hub: '+str(payload.get('type','Feedback'))[:100]+' from '+str(payload.get('studentName','Student'))[:100]+'. Receipt '+receipt+'. Open the private owner inbox to read and reply.'
    with connect() as db:db.execute('INSERT OR IGNORE INTO notifications(id,created,summary,state) VALUES (?,?,?,?)',(receipt,time.time(),summary,'pending'))
    return 'queued'

def process_notifications():
    config=read_config('whatsapp')
    if config.get('enabled') is not True:return
    with connect() as db:
        rows=db.execute("SELECT * FROM notifications WHERE state='pending' AND next_retry<=? ORDER BY created LIMIT 10000",(time.time(),)).fetchall()
        if not rows:return
        if config.get('mode')=='daily':
            now=datetime.now(timezone(timedelta(hours=6)))
            if now.strftime('%H:%M')<config.get('digestTime','20:00'):return
            last=db.execute("SELECT value FROM service_state WHERE key='last_digest'").fetchone()
            if last and last[0]==today():return
    groups=[rows] if config.get('mode')=='daily' else [[row] for row in rows[:30]]
    for group in groups:
        summary=(str(len(group))+' new Classroom Hub feedback item(s). Receipts: '+', '.join(row['id'] for row in group[:8])+'. Open your private owner inbox.') if len(group)>1 or config.get('mode')=='daily' else group[0]['summary']
        body={'messaging_product':'whatsapp','to':config['recipient'],'type':'template','template':{'name':config['template'],'language':{'code':config.get('language','en_US')},'components':[{'type':'body','parameters':[{'type':'text','text':summary[:1000]}]}]}}
        try:
            result=_request_json('https://graph.facebook.com/'+config['version']+'/'+config['phoneId']+'/messages',body,{'Authorization':'Bearer '+config['token']})
            provider_id=result.get('messages',[{}])[0].get('id')
            if not provider_id:raise ServiceError('No WhatsApp acceptance ID returned.',502)
            with connect() as db:
                for row in group:db.execute("UPDATE notifications SET state='accepted',provider_id=? WHERE id=?",(provider_id,row['id']))
                if config.get('mode')=='daily':db.execute("INSERT INTO service_state VALUES ('last_digest',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",(today(),))
        except Exception:
            with connect() as db:
                for row in group:
                    attempts=row['attempts']+1;db.execute('UPDATE notifications SET state=?,attempts=?,next_retry=? WHERE id=?',('failed' if attempts>=4 else 'pending',attempts,time.time()+min(3600,60*2**attempts),row['id']))

def start_worker():
    global WORKER_STARTED
    if WORKER_STARTED:return
    WORKER_STARTED=True
    def run():
        while True:
            try:process_notifications()
            except Exception:pass
            time.sleep(20)
    threading.Thread(target=run,daemon=True,name='ClassroomNotifications').start()

def notification_states():
    with connect() as db:return {row['id']:row['state'] for row in db.execute('SELECT id,state FROM notifications ORDER BY created DESC LIMIT 1000')}

def retry_failed_notifications():
    with connect() as db:
        cursor=db.execute("UPDATE notifications SET state='pending',attempts=0,next_retry=0 WHERE state='failed'")
        return {'success':True,'retried':cursor.rowcount}
