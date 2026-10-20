const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {JSDOM}=require(process.env.CLASSROOM_JSDOM || 'jsdom');
const root=path.resolve(__dirname,'..');
const tick=()=>new Promise(r=>setTimeout(r,40));
async function setup(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://fahim-niloy2314.github.io/classroom-hub/',runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;
 await tick();
 const errors=[];w.addEventListener('error',e=>errors.push(e.error?.stack||e.message));w.console.warn=()=>{};w.console.log=()=>{};w.console.error=(...args)=>errors.push(args.join(' '));
 w.lucide={createIcons(){}};w.alert=()=>{};w.confirm=()=>true;w.prompt=()=>null;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.AbortController=AbortController;w.structuredClone=structuredClone;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLAnchorElement.prototype.click=function(){w.__download=this.download;};w.URL.createObjectURL=blob=>{w.__blob=blob;return 'blob:synthetic';};w.URL.revokeObjectURL=()=>{};
 w.fetch=async url=>{if(String(url).startsWith('https://api.counter'))return {ok:false};const name=String(url).split('?')[0];const p=path.join(root,name);if(fs.existsSync(p))return {ok:true,json:async()=>JSON.parse(fs.readFileSync(p,'utf8')),arrayBuffer:async()=>fs.readFileSync(p)};return {ok:false,status:404,json:async()=>({})};};
 for(const file of ['data.js','hub-core.js','app.js','hub-fixes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),dom.getInternalVMContext(),{filename:file});
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await tick();await tick();
 return {dom,w,errors,run:code=>vm.runInContext(code,dom.getInternalVMContext())};
}
test('application starts, all four destinations and secondary tools route without errors',async()=>{const {dom,w,errors,run}=await setup();try{
 assert.equal(w.document.querySelectorAll('#homeSemestersGrid button').length,8);
 for(const [tab,tool] of [['home'],['tools','routine'],['tools','cv'],['tools','cgpa'],['tools','ai'],['faculty'],['progress'],['notices'],['feedback'],['help']]){run(`navigateTo(${JSON.stringify(tab)},${JSON.stringify(tool)})`);await tick();assert.equal(run('currentTab'),tab);}
 assert.deepEqual(errors,[]);
 const ids=[...w.document.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size,'all DOM ids must be unique');
}finally{dom.window.close();}});
test('Sign In opens a real dialog; forged local identity never grants admin',async()=>{const {dom,w,run,errors}=await setup();try{
 w.localStorage.setItem('classroom_user',JSON.stringify({email:'fahimcuet63@gmail.com',role:'admin'}));assert.equal(run('isAdmin({role:"admin"})'),false);
 w.document.querySelector('#authHeaderContainer button').click();assert.equal(w.document.getElementById('authDialog').open,true);assert.equal(w.document.getElementById('ownerLoginSubmit').disabled,true);
 assert.match(w.document.getElementById('authBackendStatus').textContent,/not connected/);assert.deepEqual(errors,[]);
}finally{dom.window.close();}});
test('CV Save As preserves content; draft reload restores template; HTML data cannot create elements',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','cv')");w.document.getElementById('cvInput-fullName').value='Synthetic Student';run("switchCvTemplate('template_academic')");w.prompt=()=>'<Imported "Draft">';run('saveCvDraftPrompt()');
 assert.equal(run('getActiveCvData().fullName'),'Synthetic Student');assert.equal(run('getActiveCvData().template'),'template_academic');
 run("cvCurrentTemplate='template_job';initCvBuilder()");assert.equal(run('cvCurrentTemplate'),'template_academic');
 run(`{const cv=getActiveCvData();cv.education=[{degree:'\"><img id="xss-fixture" src=x onerror=alert(1)>',institution:'A & B'}];saveActiveCvData(cv);renderCvFormArrays();}`);
 assert.equal(w.document.getElementById('xss-fixture'),null);assert.match(w.document.querySelector('#cvEducationListContainer input').value,/img/);
 const original=run('getActiveCvData().fullName');w.prompt=()=>'<Imported "Draft">';w.confirm=()=>false;run('createNewBlankCvPrompt()');assert.equal(run('getActiveCvData().fullName'),original);
}finally{dom.window.close();}});
test('offline feedback remains pending with no confirmed receipt',async()=>{const {dom,w,run}=await setup();try{
 w.document.getElementById('fbName').value='Synthetic Student';w.document.getElementById('fbMessage').value='Synthetic pending message';
 await run('handleFeedbackSubmit({preventDefault(){},target:{reset(){}}})');
 assert.match(w.document.getElementById('receiptSummaryId').textContent,/not delivered/);const queue=JSON.parse(w.localStorage.getItem('classroom_feedback_outbox_v1'));assert.equal(queue.length,1);assert.equal(queue[0].state,'pending');assert.equal(queue[0].receiptId,undefined);
}finally{dom.window.close();}});
test('faculty Gmail links target independent addresses and correct Lab Assistant remains',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('faculty')");const links=[...w.document.querySelectorAll('a[href*="mail.google.com"]')];assert.ok(links.length>50);
 for(const a of links){const u=new URL(a.href);assert.ok(u.searchParams.get('to'));assert.ok(!/[;,\s]/.test(u.searchParams.get('to')));assert.equal(u.searchParams.get('cc'),null);}
 assert.ok(run("getFacultyMembers().some(f=>/Fahmida/i.test(f.name)&&f.designation==='Lab Assistant'&&f.category==='STAFF')"));
}finally{dom.window.close();}});
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
}finally{dom.window.close();}});
test('CV templates present different meaningful section orders',async()=>{const {dom,w,run}=await setup();try{
 run("navigateTo('tools','cv');{const cv=getActiveCvData();cv.education=[{degree:'Degree'}];cv.experience=[{role:'Role'}];cv.projects=[{title:'Project'}];cv.skills=[{category:'Tools',items:'CAD'}];saveActiveCvData(cv);initCvBuilder();}");
 const headings=()=>[...w.document.querySelectorAll('#cvLivePreviewPaper h2')].map(el=>el.textContent.trim());
 run("switchCvTemplate('template_job')");assert.equal(headings()[0],'Experience & Internships');
 run("switchCvTemplate('template_eng')");assert.equal(headings()[0],'Education');assert.equal(headings()[1],'Engineering & Design Projects');
}finally{dom.window.close();}});
