const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {JSDOM}=require(process.env.CLASSROOM_JSDOM || 'jsdom');
const root=path.resolve(__dirname,'..');
const tick=()=>new Promise(r=>setTimeout(r,40));
async function setup(options={}){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://fahim-niloy2314.github.io/classroom-hub/',runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;
 await tick();
 const errors=[];w.addEventListener('error',e=>errors.push(e.error?.stack||e.message));w.console.warn=()=>{};w.console.log=()=>{};w.console.error=(...args)=>errors.push(args.join(' '));
 w.lucide={createIcons(){}};w.alert=()=>{};w.confirm=()=>true;w.prompt=()=>null;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.AbortController=AbortController;w.structuredClone=structuredClone;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLAnchorElement.prototype.click=function(){w.__download=this.download;};w.URL.createObjectURL=blob=>{w.__blob=blob;return 'blob:synthetic';};w.URL.revokeObjectURL=()=>{};
 w.fetch=async url=>{if(options.owner && String(url).split('?')[0]==='backend-config.json')return {ok:true,json:async()=>({apiBase:'https://backend.fixture'})};if(options.owner&&String(url).startsWith('https://backend.fixture/api/')){const route=String(url).split('/api/')[1];return {ok:true,json:async()=>route==='status'?{status:'online',authenticated:true}:route==='owner'?{emails:['fahimniloy2314@gmail.com','fahim.cuet.me20@gmail.com']}:route==='submissions'?{submissions:[]}:route==='analytics'?{activeBrowsers:2,todayBrowsers:3,routes:{home:2},aiRequestsToday:0}:route==='ai/config'?{enabled:false,provider:'gemini',model:'gemini-3.8-flash',dailyLimit:100}:route==='notifications/config'?{enabled:false,mode:'instant',recipient:'8801850162261'}:{success:true}};}if(String(url).startsWith('https://api.counter'))return {ok:false};const name=String(url).split('?')[0];const p=path.join(root,name);if(fs.existsSync(p))return {ok:true,json:async()=>JSON.parse(fs.readFileSync(p,'utf8')),arrayBuffer:async()=>fs.readFileSync(p)};return {ok:false,status:404,json:async()=>({})};};
 for(const file of ['data.js','hub-core.js','app.js','hub-fixes.js','hub-features.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),dom.getInternalVMContext(),{filename:file});
 if(options.owner)w.sessionStorage.setItem('classroom_admin_token','synthetic-session');
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await tick();await tick();
 return {dom,w,errors,run:code=>vm.runInContext(code,dom.getInternalVMContext())};
}
test('application starts, all four destinations and secondary tools route without errors',async()=>{const {dom,w,errors,run}=await setup();try{
 assert.equal(w.document.querySelectorAll('#homeSemestersGrid button').length,8);
 run("navigateTo('tools','routine')");assert.equal(w.document.querySelector('#myRoutineSemesterSelect').value, '');assert.ok(!w.document.querySelector('#routineStudioTitleDisplay')?.textContent.includes('Sec A'));
 for(const [tab,tool] of [['home'],['tools','routine'],['tools','cv'],['tools','cgpa'],['tools','ai'],['faculty'],['progress'],['notices'],['feedback'],['help']]){run(`navigateTo(${JSON.stringify(tab)},${JSON.stringify(tool)})`);await tick();assert.equal(run('currentTab'),tab);}
 assert.deepEqual(errors,[]);
 const ids=[...w.document.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size,'all DOM ids must be unique');
}finally{await tick();dom.window.close();}});
test('Sign In opens a real dialog; forged local identity never grants admin',async()=>{const {dom,w,run,errors}=await setup();try{
 w.localStorage.setItem('classroom_user',JSON.stringify({email:'fahimcuet63@gmail.com',role:'admin'}));assert.equal(run('isAdmin({role:"admin"})'),false);
 w.document.querySelector('#authHeaderContainer button').click();assert.equal(w.document.getElementById('authDialog').open,true);assert.equal(w.document.getElementById('ownerLoginSubmit').disabled,true);
 assert.match(w.document.getElementById('authBackendStatus').textContent,/not connected/);assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
test('CV Save As preserves content; draft reload restores template; HTML data cannot create elements',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','cv')");w.document.getElementById('cvInput-fullName').value='Synthetic Student';run("switchCvTemplate('template_academic')");w.prompt=()=>'<Imported "Draft">';run('saveCvDraftPrompt()');
 assert.equal(run('getActiveCvData().fullName'),'Synthetic Student');assert.equal(run('getActiveCvData().template'),'template_academic');
 run("cvCurrentTemplate='template_job';initCvBuilder()");assert.equal(run('cvCurrentTemplate'),'template_academic');
 run(`{const cv=getActiveCvData();cv.education=[{degree:'\"><img id="xss-fixture" src=x onerror=alert(1)>',institution:'A & B'}];saveActiveCvData(cv);renderCvFormArrays();}`);
 assert.equal(w.document.getElementById('xss-fixture'),null);assert.match(w.document.querySelector('#cvEducationListContainer input').value,/img/);
 const original=run('getActiveCvData().fullName');w.prompt=()=>'<Imported "Draft">';w.confirm=()=>false;run('createNewBlankCvPrompt()');assert.equal(run('getActiveCvData().fullName'),original);
}finally{await tick();dom.window.close();}});
test('offline feedback remains pending with no confirmed receipt',async()=>{const {dom,w,run}=await setup();try{
 w.document.getElementById('fbName').value='Synthetic Student';w.document.getElementById('fbMessage').value='Synthetic pending message';
 await run('handleFeedbackSubmit({preventDefault(){},target:{reset(){}}})');
 assert.match(w.document.getElementById('receiptSummaryId').textContent,/not delivered/);const queue=JSON.parse(w.localStorage.getItem('classroom_feedback_outbox_v1'));assert.equal(queue.length,1);assert.equal(queue[0].state,'pending');assert.equal(queue[0].receiptId,undefined);
}finally{await tick();dom.window.close();}});
test('faculty Gmail links target independent addresses and correct Lab Assistant remains',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('faculty')");const links=[...w.document.querySelectorAll('a[href*="mail.google.com"]')];assert.ok(links.length>50);
 for(const a of links){const u=new URL(a.href);assert.ok(u.searchParams.get('to'));assert.ok(!/[;,\s]/.test(u.searchParams.get('to')));assert.equal(u.searchParams.get('cc'),null);}
 assert.ok(run("getFacultyMembers().some(f=>/Fahmida/i.test(f.name)&&f.designation==='Lab Assistant'&&f.category==='STAFF')"));
}finally{await tick();dom.window.close();}});
test('routine and CV exports are real editable OpenXML with correct page dimensions and user data',async()=>{const {dom,w,run}=await setup();try{
 w.JSZip=require('../jszip.min.js');
 w.fetch=async url=>{const p=path.join(root,String(url).split('?')[0]);const data=fs.readFileSync(p);const buffer=data;return {ok:true,arrayBuffer:async()=>buffer,json:async()=>JSON.parse(data)};};
 const readBlob=blob=>blob.arrayBuffer ? blob.arrayBuffer().then(b=>Buffer.from(b)) : new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(Buffer.from(reader.result));reader.onerror=reject;reader.readAsArrayBuffer(blob);});
 const Zip=require('../jszip.min.js');
 run(`{const r=getMyPersonalRoutine();r.title='Synthetic editable routine';r.days=['Thursday'];r.timeSlots=Array.from({length:16},(_,i)=>String(7+Math.floor(i/2)).padStart(2,'0')+':'+(i%2?'30':'00')+' - '+String(7+Math.floor((i+1)/2)).padStart(2,'0')+':'+((i+1)%2?'30':'00'));r.entries=[{id:'synthetic-slot',day:'Thursday',courseCode:'ME-TEST',courseName:'Synthetic Lab',startTime:'13:30',endTime:'14:30',teacher:'Teacher & One',room:'R1',notes:'Test'}];saveMyPersonalRoutine(r);}`);
 await run('exportMyRoutineDocx()');assert.ok(w.__blob,'routine blob generated');
 let zip=await Zip.loadAsync(await readBlob(w.__blob)),xml=await zip.file('word/document.xml').async('string');
 assert.match(xml,/ME-TEST/);assert.match(xml,/Teacher &amp; One/);assert.match(xml,/w:orient="landscape"/);
 const columns=[...xml.matchAll(/<w:gridCol w:w="(\d+)"/g)].map(x=>Number(x[1]));assert.ok(columns.length>12);assert.ok(columns.reduce((a,b)=>a+b,0)<=15198);
 run("navigateTo('tools','cv')");w.document.getElementById('cvInput-fullName').value='Synthetic & Student';run('updateCvLivePreview()');await run('exportMyCvDocx()');
 zip=await Zip.loadAsync(await readBlob(w.__blob));xml=await zip.file('word/document.xml').async('string');assert.match(xml,/Synthetic &amp; Student/);assert.match(xml,/w:pgSz w:w="11906" w:h="16838"/);
}finally{await tick();dom.window.close();}});
test('CV templates present different meaningful section orders',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','cv');{const cv=getActiveCvData();cv.education=[{degree:'Degree'}];cv.experience=[{role:'Role'}];cv.projects=[{title:'Project'}];cv.skills=[{category:'Tools',items:'CAD'}];saveActiveCvData(cv);initCvBuilder();}");
 const headings=()=>[...w.document.querySelectorAll('#cvLivePreviewPaper h2')].map(el=>el.textContent.trim());
 run("switchCvTemplate('template_job')");assert.equal(headings()[0],'Experience & Internships');
 run("switchCvTemplate('template_eng')");assert.equal(headings()[0],'Education');assert.equal(headings()[1],'Engineering & Design Projects');
}finally{await tick();dom.window.close();}});
test('owner dashboard panels and real faculty editor work with a server-verified session',async()=>{const {dom,w,run,errors}=await setup({owner:true});try{
 assert.equal(run('isAdmin(currentUser)'),true);run("navigateTo('admin')");
 for(const tab of run('ADMIN_SUBTABS')){run(`switchAdminSubTab(${JSON.stringify(tab)})`);await tick();}
 assert.ok(w.document.getElementById('ownerDataStudio').textContent.includes('Owner Control Center'));
 run("openEditFacultyModal('fac_7')");assert.equal(w.document.getElementById('editFacultyModal').open,true);assert.match(w.document.getElementById('facultyAdministrativeRoleInput').value,/Dean/);
 const tnt=w.document.getElementById('facultyTntInput').value;run('handleSaveFaculty({preventDefault(){}})');assert.equal(run("getFacultyMembers().find(f=>f.id==='fac_7').tnt"),tnt);
 assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
test('owner curriculum changes validate and undo without replacing other semesters',async()=>{const {dom,w,run}=await setup({owner:true});try{
 run("navigateTo('admin');switchAdminSubTab('layout')");
 const before=run("window.CUET_COURSE_REGISTRY['L1-T2'].length");run("HubFeatures.commitModule('courseRegistry',{...window.CUET_COURSE_REGISTRY,'L1-T1':[{code:'TEST-101',name:'Synthetic Course',credits:3,type:'theory'}]})");
 assert.equal(run("window.CUET_COURSE_REGISTRY['L1-T1'][0].code"),'TEST-101');assert.equal(run("window.CUET_COURSE_REGISTRY['L1-T2'].length"),before);
 assert.throws(()=>run("HubFeatures.validateModule('courseRegistry',{'L1-T1':[{code:'A',name:'B',credits:-1}]})"));
 const undo=[...w.document.querySelectorAll('#ownerDataStudio button')].find(b=>b.textContent==='Undo latest data edit');undo.click();assert.notEqual(run("window.CUET_COURSE_REGISTRY['L1-T1'][0].code"),'TEST-101');
}finally{await tick();dom.window.close();}});
test('CV section choices hide output without deleting saved data',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','cv');{const cv=getActiveCvData();cv.education=[{degree:'Synthetic Degree'}];saveActiveCvData(cv);initCvBuilder();}");
 const label=[...w.document.querySelectorAll('#cvSectionControls label')].find(el=>el.textContent==='Education');const checkbox=label.querySelector('input');checkbox.checked=false;checkbox.dispatchEvent(new w.Event('change'));
 assert.equal(w.document.querySelector('#cvLivePreviewPaper').textContent.includes('Synthetic Degree'),false);assert.equal(run('getActiveCvData().education[0].degree'),'Synthetic Degree');
}finally{await tick();dom.window.close();}});
test('AI offline status does not fabricate an answer; settings and clear target the actual stream',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','ai');openAiSettingsModal()");assert.equal(w.document.getElementById('geminiApiKeyDialog').open,true);run('closeGeminiApiKeyModal()');
 w.document.getElementById('aiConnectionMode').value='backend';w.document.getElementById('aiInputPrompt').value='Why is my synthetic answer incorrect?';await run('handleAiQuestionSubmit({preventDefault(){}})');assert.match(w.document.getElementById('aiChatStreamContainer').textContent,/Online answer unavailable/);assert.equal(w.document.getElementById('aiInputPrompt').value,'Why is my synthetic answer incorrect?');
 run('clearAiChat()');assert.equal(w.document.getElementById('aiChatStreamContainer').textContent.includes('synthetic answer'),false);
 const box=w.document.createElement('div');run('window.testEquationBox=document.createElement("div")');run(String.raw`HubAi.renderText(window.testEquationBox,'Display: \\[ E = mc^2 \\\\ \\eta = \\frac{W}{Q} \\] and <img src=x onerror=alert(1)>')`);assert.equal(w.testEquationBox.querySelector('img'),null);assert.equal(w.testEquationBox.querySelector('br'),null);
}finally{await tick();dom.window.close();}});
test('install button invokes the actual captured browser prompt',async()=>{const {dom,w,run}=await setup();try{
 let prompted=0;const event=new w.Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{prompted++;};event.userChoice=Promise.resolve({outcome:'accepted'});w.dispatchEvent(event);await run('triggerPwaInstall()');assert.equal(prompted,1);
}finally{await tick();dom.window.close();}});
test('owner notice, video, milestone and resource forms save real draft records',async()=>{const {dom,w,run,errors}=await setup({owner:true});try{
 run("navigateTo('admin');openNoticeModal()");assert.equal(w.document.getElementById('adminNoticeDialog').open,true);
 w.document.getElementById('noticeTitleInput').value='Synthetic notice';w.document.getElementById('noticeMessageInput').value='Synthetic message';run('saveNoticeItem({preventDefault(){}})');assert.equal(run('adminNotices[0].title'),'Synthetic notice');
 run('openVideoModal()');w.document.getElementById('videoTitleInput').value='Synthetic video';w.document.getElementById('videoUrlInput').value='https://www.youtube.com/watch?v=fixture';run('saveVideoItem({preventDefault(){}})');assert.equal(run('adminVideos[0].title'),'Synthetic video');
 run('openTimelineModal()');w.document.getElementById('timelineTitleInput').value='Synthetic milestone';w.document.getElementById('timelineDateInput').value='2026-10-21';run('saveTimelineItem({preventDefault(){}})');assert.equal(run('adminTimeline[0].title'),'Synthetic milestone');
 run("communityResources.push({id:'fixture_resource',name:'Synthetic resource',term_code:'L1-T1',url:'https://example.com/notes'});openAdminEditResourceModal('fixture_resource')");w.document.getElementById('editResTitle').value='Edited resource';run('saveEditedResource({preventDefault(){}})');assert.equal(run("communityResources.find(r=>r.id==='fixture_resource').name"),'Edited resource');assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
test('empty faculty stays empty, revisions cover curriculum, and owner emails cannot be edited',async()=>{const {dom,w,run,errors}=await setup({owner:true});try{
 run("navigateTo('admin');switchAdminSubTab('security')");await tick();const emails=w.document.querySelector('#ownerAccessSettings textarea');assert.equal(emails.readOnly,true);assert.equal(emails.value.split('\n').length,2);
 run("createRevisionSnapshot('Synthetic complete snapshot');HubFeatures.commitModule('faculty',[])");assert.equal(run('getFacultyMembers().length'),0);
 const revision=run('adminRevisions[0].id');run("HubFeatures.commitModule('courseRegistry',{...window.CUET_COURSE_REGISTRY,'L1-T1':[]})");run(`rollbackToRevision(${JSON.stringify(revision)})`);assert.ok(run("window.CUET_COURSE_REGISTRY['L1-T1'].length")>0);assert.ok(run('getFacultyMembers().length')>0);assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
test('language changes translate navigation and AI controls without losing the entered question',async()=>{const {dom,w,run,errors}=await setup();try{
 run("navigateTo('tools','ai')");w.document.getElementById('aiInputPrompt').value='Synthetic unsent question';w.document.getElementById('aiConnectionMode').value='backend';run('toggleLanguage()');assert.equal(w.document.documentElement.lang,'bn');assert.match(w.document.getElementById('nav-tab-tools').textContent,/শিক্ষার্থী/);assert.match(w.document.getElementById('aiConnectionMode').selectedOptions[0].textContent,/সাইটের/);assert.equal(w.document.getElementById('aiInputPrompt').value,'Synthetic unsent question');assert.equal(w.document.getElementById('aiConnectionMode').value,'backend');run('toggleLanguage()');assert.match(w.document.getElementById('nav-tab-tools').textContent,/Student Tools/);assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
test('public owner setup guide is absent and bulletin dialog opens',async()=>{const {dom,w,run}=await setup();try{
 assert.equal(w.document.querySelectorAll('a[href*="OWNER_MANUAL"]').length,0);assert.equal(fs.existsSync(path.join(root,'OWNER_MANUAL.md')),false);run('openBulletinModal()');assert.equal(w.document.getElementById('bulletinDialog').open,true);
}finally{await tick();dom.window.close();}});
test('actual tool-tab buttons select isolated workspaces and preserve the correct hash',async()=>{const {dom,w,run,errors}=await setup();try{
 run("navigateTo('tools')");for(const tool of ['cv','cgpa','ai','routine']){w.document.getElementById('toolSubtab-'+tool).click();await tick();assert.equal(w.location.hash,'#/tools/'+tool);for(const other of ['routine','cv','cgpa','ai'])assert.equal(w.document.getElementById('toolWorkspace-'+other).classList.contains('hidden'),other!==tool);}
 assert.deepEqual(errors,[]);
}finally{await tick();dom.window.close();}});
