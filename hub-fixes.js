/* Owner sessions, truthful delivery/publishing and local data recovery. */
'use strict';
const Hub = (() => {
  const H = HubCore.html;
  let apiBase = '', ready = false, verified = false, sessionExpiry = 0, retrying = false, onlineAiAvailable = false, ownerConfigured = false, ownerPortalUrl = '';
  const SESSION = 'classroom_admin_token', QUEUE = 'classroom_feedback_outbox_v1';
  const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value === null ? fallback : value; } catch { return fallback; } };
  function download(name, data, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([typeof data === 'string' ? data : JSON.stringify(data,null,2)], {type}));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function request(path, options = {}) {
    if (!ready) throw new Error('The owner service is not connected. Only the site owner can configure it privately.');
    const token = sessionStorage.getItem(SESSION);
    const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),30000);
    try {
      const response = await fetch(apiBase + '/api/' + path, {...options, cache:'no-store', signal:controller.signal, headers:{'Content-Type':'application/json', ...(token ? {'Authorization':'Bearer '+token} : {}), ...options.headers}});
      let body; try { body = await response.json(); } catch { throw new Error('The backend did not return a valid response.'); }
      if (response.status === 401 && path !== 'login') invalidateSession();
      if (!response.ok) throw new Error(body.error || 'Request failed ('+response.status+').');
      return body;
    } catch (e) { if (e.name === 'AbortError') throw new Error('The backend timed out. Your local draft is retained.'); throw e; }
    finally { clearTimeout(timer); }
  }
  function invalidateSession() { verified = false; sessionExpiry = 0; sessionStorage.removeItem(SESSION); currentUser = null; updateAuthUI(); }
  async function initialize() {
    // Retire insecure credentials from earlier releases, preserving all student work.
    for (const key of ['classroom_admin_token','classroom_admin_github_token','classroom_admin_pwd_hash','classroom_user']) localStorage.removeItem(key);
    try {
      const response = await fetch('backend-config.json?v=4.4.0', {cache:'no-store'});
      const config = await response.json();
      if(config.ownerPortalUrl){const portal=new URL(config.ownerPortalUrl);if(portal.protocol==='https:'&&!portal.username&&!portal.password&&!portal.search&&!portal.hash)ownerPortalUrl=portal.href;}
      const url = config.apiBase ? new URL(config.apiBase) : new URL(location.origin);
      if (url.protocol !== 'https:' && !(['localhost','127.0.0.1','[::1]'].includes(url.hostname) && url.protocol === 'http:')) throw new Error('The backend requires HTTPS.');
      if (url.username || url.password || url.search || url.hash) throw new Error('Invalid backend URL.');
      // GitHub Pages has no API runtime. Avoid knowingly requesting its /api/404 pages.
      if (!config.apiBase && location.hostname.endsWith('github.io')) { updateConnectionText(); return; }
      apiBase = url.href.replace(/\/$/,''); ready = true;
      const status = await request('status');
      ready = status.status === 'online'; ownerConfigured=status.configured!==false; onlineAiAvailable = status.aiAvailable === true;
      if (status.authenticated) { verified = true; currentUser = {name:'Fahim Niloy',role:'admin'}; sessionExpiry = Number(sessionStorage.getItem('classroom_session_expiry')) || 0; }
      else sessionStorage.removeItem(SESSION);
    } catch { ready = false; invalidateSession(); }
    updateConnectionText();
  }
  function updateConnectionText() {
    const publicPages = location.hostname.endsWith('github.io');
    const bangla = typeof currentLang !== 'undefined' && currentLang === 'bn';
    const text = ready ? 'Backend connected: ' + apiBase : 'Online admin and inbox are not connected yet. Public tools work normally.';
    const publishStatus = document.getElementById('backendPublishStatus'); if (publishStatus) publishStatus.textContent = text;
    const authStatus = document.getElementById('authBackendStatus');
    if (authStatus) authStatus.textContent = ready ? !ownerConfigured ? (bangla ? 'Owner sign-in-এর ব্যক্তিগত কনফিগারেশন এখনো সম্পন্ন হয়নি।' : 'Owner sign-in is awaiting private configuration.') : (bangla ? 'Classroom Hub-এর owner email ও password দিয়ে একবারেই প্রবেশ করুন।' : 'Sign in once with your Classroom Hub owner email and password.') : publicPages ? (ownerPortalUrl ? (bangla ? 'সম্পাদনার জন্য live Classroom Hub খুলুন।' : 'Open the live Classroom Hub to edit your site.') : (bangla ? 'এই সংস্করণে owner sign-in সংযুক্ত নেই। শিক্ষার্থীদের টুলগুলো ব্যবহার করা যাবে।' : 'Owner sign-in is not connected on this copy. Student tools remain available.')) : (bangla ? 'Owner service-এর সাথে সংযোগ করা যাচ্ছে না। পেজটি আবার লোড করুন।' : 'The owner service is unavailable. Reload this page to try again.');
    const canLogin=ready&&ownerConfigured;
    const fields = document.getElementById('ownerLoginFields'); if (fields) { fields.hidden = !canLogin; fields.disabled = !canLogin; }
    const button = document.getElementById('ownerLoginSubmit'); if (button) button.disabled = !canLogin;
    const portalLink=document.getElementById('privateOwnerPortalLink');if(portalLink){portalLink.hidden=ready||!publicPages||!ownerPortalUrl;if(ownerPortalUrl)portalLink.href=ownerPortalUrl;else portalLink.removeAttribute('href');portalLink.textContent=bangla?'Live Classroom Hub খুলুন':'Open live Classroom Hub';}
  }
  function portalPayload() {
    const baseline = read('classroom_public_baseline',{});
    return HubCore.publicValue({
      version:'4.4.0', lastUpdated:new Date().toISOString(), publishedBy:currentUser?.name || 'Owner',
      portalSettings, courseRegistry:window.CUET_COURSE_REGISTRY || read('classroom_course_registry',baseline.courseRegistry || {}),
      notices:Array.isArray(adminNotices) ? adminNotices : [], faculty:getFacultyMembers(), routines:getStoredRoutine(),
      customResources:communityResources, videos:adminVideos, timeline:adminTimeline, faqs:adminFaqs,
      hiddenItems:adminHiddenItems, featuredItems:adminFeaturedItems,
      contacts:read(STORAGE_KEYS.CONTACT,baseline.contacts || {}), cvTemplates:read('classroom_cv_templates',baseline.cvTemplates || [])
    });
  }
  function applySupplementalData(data) {
    for (const [field,key] of [['cvTemplates','classroom_cv_templates'],['hiddenItems',STORAGE_KEYS.ADMIN_HIDDEN],['featuredItems',STORAGE_KEYS.ADMIN_FEATURED],['contacts',STORAGE_KEYS.CONTACT]]) {
      if (data[field] !== undefined) localStorage.setItem(key,JSON.stringify(data[field]));
    }
    if (Array.isArray(data.hiddenItems)) adminHiddenItems = data.hiddenItems;
    if (Array.isArray(data.featuredItems)) adminFeaturedItems = data.featuredItems;
  }
  async function publish() {
    if (!isAdmin(currentUser)) return openAuthModal();
    const button = document.getElementById('publishLiveBtn'), label = document.getElementById('publishLiveBtnText'), status = document.getElementById('publishStatusText');
    const banner = document.getElementById('publishStatusBanner'); if (banner) banner.classList.remove('hidden');
    if (button) button.disabled = true;
    const say = value => { if (status) status.textContent = value; showToast(value); };
    const payload = portalPayload(); localStorage.setItem('classroom_owner_draft_v1',JSON.stringify(payload));
    try {
      if (label) label.textContent = 'Submitting…';
      const result = await request('publish',{method:'POST',body:JSON.stringify({payload})});
      if (!result.success || !result.revision || (!result.commit && result.publication!=='database')) throw new Error(result.error || 'The backend did not confirm publication.');
      if(result.publication==='database' && !result.publicFrontendConnected){say('Saved to the private owner service. The public website is not connected yet; your draft is retained.');return;}
      const publicUrl=result.publication==='database'?new URL('/api/portal',apiBase).href:'https://fahim-niloy2314.github.io/classroom-hub/portal_sync.json';
      say('Saved. Waiting for the public revision to update…'); if (label) label.textContent = 'Deployment pending';
      let live = false;
      for (let i=0;i<15;i++) {
        await new Promise(resolve=>setTimeout(resolve,3000));
        try {
          const response = await fetch(publicUrl+'?revision='+encodeURIComponent(result.revision),{cache:'no-store'});
          const publicData = await response.json();
          if (publicData.lastUpdated === result.revision) {
            localStorage.setItem('classroom_public_baseline',JSON.stringify(publicData));
            localStorage.removeItem('classroom_owner_draft_v1'); live=true; break;
          }
        } catch {}
      }
      if (live) say('Published live: the public revision has been verified.');
      else say('GitHub commit accepted. Deployment is still pending; your local draft is retained.');
    } catch (e) { say('Publish failed: '+e.message); }
    finally { if(button)button.disabled=false; if(label)label.textContent='Publish Live'; }
  }
  async function submitFeedback(event) {
    event?.preventDefault();
    const value = id => document.getElementById(id)?.value.trim() || '';
    const message = value('fbMessage'); if (!message || message.length>10000) return showToast('Enter a message of up to 10,000 characters.');
    const contact = value('fbContact'), name = value('fbName') || 'Anonymous Student';
    const payload = {requestId:crypto.randomUUID(),type:value('fbCategory') || 'General Feedback',title:'Student feedback',description:message,studentName:name,studentEmail:contact.includes('@') ? contact : '',studentPhone:contact.includes('@') ? '' : contact,roll:value('fbRoll'),rating:document.querySelector('input[name="fbRating"]:checked')?.value || '5'};
    const queue = read(QUEUE,[]); queue.push({payload,state:'pending',createdAt:new Date().toISOString()});
    try { localStorage.setItem(QUEUE,JSON.stringify(queue)); } catch { return showToast('Device storage is full. Your message remains in the form; copy it before leaving.'); }
    const button = event?.submitter; if(button) button.disabled=true;
    let result;
    try { result = await deliver(payload); }
    catch(e) { result = {state:'pending',error:e.message}; }
    finally { if(button)button.disabled=false; }
    const received = result.state === 'received';
    const id = result.receiptId || payload.requestId;
    const set = (selector,text) => { const el = document.getElementById(selector); if(el)el.textContent=text; };
    set('receiptSummaryId',received ? 'Received by server: #'+id : 'Saved on this device — not delivered');
    set('receiptDeliveryExplanation',received ? (currentLang==='bn' ? 'আপনার বার্তা সার্ভারের ইনবক্সে সংরক্ষিত হয়েছে। চাইলে নিচের বাটন দিয়ে আলাদাভাবে WhatsApp বা Gmail-এ পাঠাতে পারেন।' : 'Your message is saved in the server inbox. You may also forward it separately using WhatsApp or Gmail below.') : (currentLang==='bn' ? 'বার্তাটি এখনো পৌঁছায়নি; এই ডিভাইসে পুনরায় পাঠানোর জন্য রাখা আছে। সরাসরি যোগাযোগ করতে নিচের WhatsApp বা Gmail বাটনে ক্লিক করে নিজে পাঠিয়ে দিন।' : 'Your message has not been delivered. It is saved on this device for retry. To contact the owner directly, open WhatsApp or Gmail below and send it yourself.'));
    set('receiptSummaryCategory',payload.type); set('receiptSummaryName',name); set('receiptSummarySnippet',message);
    const full = `Classroom Hub feedback\nCategory: ${payload.type}\nFrom: ${name}\nRoll: ${payload.roll}\nContact: ${contact}\n\n${message}`;
    const wa=document.getElementById('receiptWhatsappLink'); if(wa)wa.href='https://wa.me/8801850162261?text='+encodeURIComponent(full);
    const mail=document.getElementById('receiptEmailLink'); if(mail)mail.href='https://mail.google.com/mail/?view=cm&fs=1&to=fahimniloy2314%40gmail.com&su='+encodeURIComponent('Classroom Hub feedback')+'&body='+encodeURIComponent(full);
    document.getElementById('feedbackReceiptDialog')?.showModal();
    showToast(received ? 'Your message was received by the server.' : 'Not delivered. Saved locally for retry; you can also forward it manually.');
    event?.target?.reset?.(); renderOutbox();
  }
  async function submitResource(event) {
    event?.preventDefault();
    const value=id=>document.getElementById(id)?.value.trim() || '';
    const resource={name:value('contribTitle'),term_code:value('contribTerm'),course:value('contribCourse'),category:value('contribCategory'),url:HubCore.safeUrl(value('contribUrl')),author:value('contribAuthor')};
    if(!resource.name||!resource.url)return showToast('A title and valid HTTP/HTTPS resource link are required.');
    const payload={requestId:crypto.randomUUID(),type:'Resource Contribution',title:resource.name,studentName:resource.author||'Anonymous Student',description:[resource.name,resource.term_code,resource.course,resource.url].join('\n'),resource};
    const queue=read(QUEUE,[]);queue.push({payload,state:'pending',createdAt:new Date().toISOString()});
    try{localStorage.setItem(QUEUE,JSON.stringify(queue));}catch{return showToast('Device storage is full. Keep a copy of your resource link.');}
    try{await deliver(payload);showToast('Resource received by the central inbox for owner review.');}
    catch(e){showToast('Not delivered. Resource saved on this device for retry.');}
    closeSubmitResourceModal();renderOutbox();
  }
  async function queueResource(id) {
    try {
      const result=await request('submissions');const entry=result.submissions.find(f=>f.id===id);
      if(!entry?.resource)throw new Error('Resource not found.');
      if(!pendingResources.some(f=>f.id===id))pendingResources.push({...entry.resource,id,size_str:'Cloud Resource',ext:'.pdf',submitted_at:entry.createdAt});
      localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES,JSON.stringify(pendingResources));
      await request('submissions/status',{method:'POST',body:JSON.stringify({id,status:'reviewed'})});renderAdminQueue();showToast('Added to the review queue. Approve it there, then publish to make it public.');await inbox();
    }catch(e){showToast(e.message);}
  }
  async function deliver(payload) {
    const result = await request('submissions',{method:'POST',body:JSON.stringify(payload)});
    if (!result.success || result.state !== 'received' || !/^SUB-[A-Z0-9-]+$/.test(result.receiptId || '')) throw new Error('The server did not acknowledge receipt.');
    const queue=read(QUEUE,[]); const item=queue.find(x=>x.payload.requestId===payload.requestId);
    if(item) { item.state='received';item.receiptId=result.receiptId;item.receivedAt=new Date().toISOString(); }
    localStorage.setItem(QUEUE,JSON.stringify(queue)); return result;
  }
  async function retryOutbox() {
    if(retrying) return; retrying=true;
    try { for(const item of read(QUEUE,[]).filter(x=>x.state==='pending')) { try { await deliver(item.payload); } catch(e) { showToast('Retry stopped: '+e.message);break; } } }
    finally { retrying=false;renderOutbox(); }
  }
  function renderOutbox() {
    const receiptTitle=document.querySelector('#feedbackReceiptDialog h3'); if(receiptTitle)receiptTitle.textContent='Message delivery';
    let el=document.getElementById('feedbackOutbox');
    if(!el) { const parent=document.getElementById('view-feedback');if(!parent)return;el=document.createElement('div');el.id='feedbackOutbox';el.className='hub-outbox';parent.prepend(el); }
    const queue=read(QUEUE,[]),pending=queue.filter(x=>x.state==='pending').length;
    el.innerHTML=`<strong>My message delivery</strong><p>${pending} pending on this device · ${queue.filter(x=>x.state==='received').length} received by server</p>${pending?'<button type="button" class="hub-button" onclick="Hub.retryOutbox()">Retry pending messages</button>':''}`;
  }
  async function inbox() {
    const list=document.getElementById('adminFeedbackList');if(!list)return;
    if(!isAdmin(currentUser)) {list.textContent='Owner sign in is required for the central inbox.';return;}
    list.textContent='Loading the central inbox…';
    try {
      const result=await request('submissions');
      for(const id of ['adminFeedbackCount','adminFeedbackBadge']) {const counter=document.getElementById(id);if(counter)counter.textContent=result.submissions.length;}
      list.innerHTML='<button type="button" class="hub-button" onclick="renderAdminFeedbacks()">Refresh inbox</button>'+(result.submissions.length? result.submissions.map(f=>`<article class="hub-inbox-card"><div><strong>${H(f.studentName)}</strong> · ${H(f.type)} · ${H(f.createdAt)}</div><p class="hub-message">${H(f.description)}</p><small>${H(f.studentEmail || f.studentPhone || 'No contact provided')} · ${H(f.receiptId)} · WhatsApp: ${H(f.notificationState || 'disabled')}</small>${f.resource?`<button type="button" class="hub-button" onclick="Hub.queueResource('${H(f.id)}')">Add resource to review queue</button>`:''}<label>Status<select onchange="Hub.submissionStatus('${H(f.id)}',this.value)">${['new','reviewed','resolved','archived'].map(s=>`<option ${s===f.status?'selected':''}>${s}</option>`).join('')}</select></label></article>`).join(''):'<p>No messages received by the backend.</p>');
    }catch(e){list.textContent='Inbox unavailable: '+e.message;}
  }
  async function submissionStatus(id,status) {try{await request('submissions/status',{method:'POST',body:JSON.stringify({id,status})});showToast('Status saved.');}catch(e){showToast(e.message);await inbox();}}
  function termDates() {
    const routine=getMyPersonalRoutine(), today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});
    const start=routine.termStart || ( /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : new Date().toISOString().slice(0,10));
    const end=routine.termEnd || new Date(Date.parse(start+'T00:00:00Z')+111*864e5).toISOString().slice(0,10);
    return {start,end};
  }
  function syncTermDates() {const {start,end}=termDates();const a=document.getElementById('routineTermStart'),b=document.getElementById('routineTermEnd');if(a)a.value=start;if(b)b.value=end;}
  function saveTermDates() { const routine=getMyPersonalRoutine();routine.termStart=document.getElementById('routineTermStart').value;routine.termEnd=document.getElementById('routineTermEnd').value;localStorage.setItem(STORAGE_KEYS.MY_ROUTINE,JSON.stringify(routine)); }
  function exportCalendar() {try{saveTermDates();const {start,end}=termDates();download('My_Routine.ics',HubCore.calendar(getMyPersonalRoutine(),start,end),'text/calendar;charset=utf-8');showToast('Calendar exported for '+start+' to '+end+'.');}catch(e){showToast(e.message);}}
  async function importCv(event) {
    const file=event.target.files?.[0];if(!file)return;
    try {
      if(file.size>3*1024*1024)throw new Error('Choose a backup smaller than 3 MB.');
      const source=JSON.parse(await file.text()), cv=source.cv || source;
      if(!cv || typeof cv!=='object' || Array.isArray(cv) || typeof cv.fullName!=='string')throw new Error('Invalid CV backup.');
      const blank=JSON.parse(JSON.stringify(DEFAULT_BLANK_CV_DATA));
      for(const key of Object.keys(blank)) {
        if(typeof blank[key]==='string' && typeof cv[key]==='string')blank[key]=cv[key].slice(0,key==='photoUrl'?2800000:20000);
        if(typeof blank[key]==='boolean')blank[key]=!!cv[key];
        if(Array.isArray(blank[key]) && Array.isArray(cv[key]))blank[key]=cv[key].slice(0,100).filter(x=>x && typeof x==='object' && !Array.isArray(x)).map(x=>Object.fromEntries(Object.entries(x).filter(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,20000)])));
      }
      if(cv.sectionLayouts&&typeof cv.sectionLayouts==='object'){blank.sectionLayouts={};for(const [key,value]of Object.entries(cv.sectionLayouts))if(['template_job','template_eng','template_academic'].includes(key)&&Array.isArray(value))blank.sectionLayouts[key]=value.filter(k=>['summary','education','experience','projects','research','skills','certifications','references'].includes(k));}
      blank.template=['template_job','template_eng','template_academic'].includes(cv.template)?cv.template:'template_job';
      const name=prompt('Import as a new draft named:', 'Imported CV '+new Date().toISOString().slice(0,10));if(!name?.trim())return;
      const drafts=getStoredCvDrafts();if(['__proto__','constructor','prototype'].includes(name.trim()))throw new Error('Choose a different draft name.');
      if(Object.hasOwn(drafts,name.trim())&&!confirm('Replace the existing draft?'))return;
      drafts[name.trim()]=blank;saveStoredCvDrafts(drafts);cvCurrentDraftName=name.trim();initCvBuilder();showToast('CV imported on this device.');
    }catch(e){showToast('Import failed: '+e.message);}finally{event.target.value='';}
  }
  async function exportBackup() {
    if(!isAdmin(currentUser))return openAuthModal();
    const backup={app:'ClassroomHub',version:4,exportedAt:new Date().toISOString(),portalSync:portalPayload(),ownerLocal:{}};
    for(const key of [STORAGE_KEYS.ADMIN_TRASH,STORAGE_KEYS.ADMIN_REVISIONS,STORAGE_KEYS.ADMIN_LOGS,STORAGE_KEYS.PENDING_RESOURCES,STORAGE_KEYS.ADMIN_SEO])backup.ownerLocal[key]=read(key,[]);
    try {const result=await request('backup');backup.backend=result.backup;}catch(e){showToast('Public content and local history exported. Central inbox backup unavailable: '+e.message);}
    download('classroomhub-owner-backup.json',backup);
  }
  async function importBackup(event) {
    const file=event.target.files?.[0];if(!file)return;
    try {
      if(!isAdmin(currentUser))throw new Error('Owner sign in is required.');
      if(file.size>3*1024*1024)throw new Error('Backup is too large (maximum 3 MB).');
      const data=JSON.parse(await file.text());
      if(data.app!=='ClassroomHub'||data.version!==4||!data.portalSync?.portalSettings)throw new Error('Use a version 4 owner backup. Legacy backups can be migrated separately.');
      const draft=HubCore.publicValue(data.portalSync);
      if(!Array.isArray(draft.faculty)||!Array.isArray(draft.notices)||!draft.routines)throw new Error('The public-content backup is incomplete.');
      if(!confirm('Restore this owner backup as an unpublished draft? The current state will be saved first.'))return;
      localStorage.setItem('classroom_pre_restore_backup',JSON.stringify({portalSync:portalPayload(),ownerLocal:Object.fromEntries(Object.keys(data.ownerLocal || {}).filter(k=>[STORAGE_KEYS.ADMIN_TRASH,STORAGE_KEYS.ADMIN_REVISIONS,STORAGE_KEYS.ADMIN_LOGS,STORAGE_KEYS.PENDING_RESOURCES,STORAGE_KEYS.ADMIN_SEO].includes(k)).map(k=>[k,read(k,[])]))}));
      if(data.backend)await request('restore',{method:'POST',body:JSON.stringify({backup:data.backend})});
      localStorage.setItem('classroom_owner_draft_v1',JSON.stringify(draft));
      for(const key of [STORAGE_KEYS.ADMIN_TRASH,STORAGE_KEYS.ADMIN_REVISIONS,STORAGE_KEYS.ADMIN_LOGS,STORAGE_KEYS.PENDING_RESOURCES,STORAGE_KEYS.ADMIN_SEO])if(data.ownerLocal?.[key]!==undefined)localStorage.setItem(key,JSON.stringify(data.ownerLocal[key]));
      adminTrash=read(STORAGE_KEYS.ADMIN_TRASH,[]);adminRevisions=read(STORAGE_KEYS.ADMIN_REVISIONS,[]);adminLogs=read(STORAGE_KEYS.ADMIN_LOGS,[]);pendingResources=read(STORAGE_KEYS.PENDING_RESOURCES,[]);adminSeoSettings=read(STORAGE_KEYS.ADMIN_SEO,{});
      await loadPortalSyncData();applyPortalSettings();renderAdminWorkspace();renderExplorer();renderHome();showToast('Restored as a draft. Review it, then publish.');
    }catch(e){showToast('Restore failed: '+e.message);}finally{event.target.value='';}
  }
  function showRoutineWarnings(routine) {
    const unmapped=(routine.entries||[]).filter(entry=>!(routine.days||[]).includes(entry.day)||!(routine.timeSlots||[]).some(slot=>{
      const [start,end]=slot.split(/\s*[-–]\s*/).map(HubCore.minutes);return Number.isFinite(start)&&Number.isFinite(end)&&HubCore.minutes(entry.startTime)<end&&HubCore.minutes(entry.endTime)>start;
    }));
    let warning=document.getElementById('routineUnmappedWarning');
    if(!warning){const parent=document.getElementById('routineTermStart')?.closest('.hub-date-controls');if(!parent)return;warning=document.createElement('div');warning.id='routineUnmappedWarning';warning.className='hub-outbox';parent.after(warning);}
    warning.replaceChildren();warning.hidden=!unmapped.length;
    if(unmapped.length){const text=document.createElement('p');text.textContent=unmapped.length+' class(es) fall outside the selected grid days or time slots. Edit the classes or update Days & Times so no class is overlooked.';warning.append(text);for(const entry of unmapped){const button=document.createElement('button');button.type='button';button.className='hub-button';button.textContent='Edit '+(entry.courseCode||entry.courseName||'class');button.addEventListener('click',()=>openEditRoutineSlotModal(entry.id));warning.append(button);}}
  }
  function cvOrder(template) {
    if(template==='template_job')return ['Professional Summary','Experience & Internships','Technical Skills & Tools','Education','Engineering & Design Projects','Research & Publications','Certifications & Honors','References'];
    if(template==='template_academic')return ['Professional Summary','Education','Research & Publications','Engineering & Design Projects','Experience & Internships','Technical Skills & Tools','Certifications & Honors','References'];
    return ['Professional Summary','Education','Engineering & Design Projects','Technical Skills & Tools','Experience & Internships','Research & Publications','Certifications & Honors','References'];
  }
  function orderCvSections(paper,template) {
    const order=typeof HubFeatures!=='undefined'?HubFeatures.sectionHeadings(template):cvOrder(template), sections=[...paper.querySelectorAll(':scope > .cv-section-block')];
    sections.sort((a,b)=>{const x=order.indexOf(a.querySelector('h2')?.textContent.trim()),y=order.indexOf(b.querySelector('h2')?.textContent.trim());return (x<0?99:x)-(y<0?99:y);});
    sections.forEach(section=>{const title=section.querySelector('h2')?.textContent.trim();if(order.includes(title))paper.append(section);else section.remove();});
  }
  function orderCvWord(paragraphs,template) {
    const order=typeof HubFeatures!=='undefined'?HubFeatures.sectionHeadings(template):cvOrder(template), allHeadings=['Professional Summary','Education','Experience & Internships','Engineering & Design Projects','Research & Publications','Technical Skills & Tools','Certifications & Honors','References'], groups=[{title:'',parts:[]}];
    for(const part of paragraphs) {
      const heading=allHeadings.find(title=>part.includes('<w:t>'+title.replace(/&/g,'&amp;')+'</w:t>'));
      if(heading)groups.push({title:heading,parts:[]});
      groups[groups.length-1].parts.push(part);
    }
    const header=groups.shift();groups.sort((a,b)=>order.indexOf(a.title)-order.indexOf(b.title));
    return header.parts.join('')+groups.filter(g=>order.includes(g.title)).map(g=>g.parts.join('')).join('');
  }
  let draftTimer;
  function saveOwnerDraft(event) {
    if(!isAdmin(currentUser)||(currentTab!=='admin'&&!event.target.closest?.('#view-admin'))||event.target.type==='password')return;
    clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{localStorage.setItem('classroom_owner_draft_v1',JSON.stringify(portalPayload()));}catch{showToast('Could not save owner draft. Export a backup before leaving.');}},250);
  }
  document.addEventListener('input',saveOwnerDraft);document.addEventListener('change',saveOwnerDraft);document.addEventListener('click',saveOwnerDraft);
  window.addEventListener('online',retryOutbox);
  window.addEventListener('hashchange',()=>{syncTermDates();renderOutbox();});
  document.addEventListener('DOMContentLoaded',()=>{syncTermDates();renderOutbox();});
  setInterval(()=>{if(verified&&sessionExpiry&&Date.now()/1000>=sessionExpiry){invalidateSession();showToast('Owner session expired. Sign in again.');}},30000);
  return {showRoutineWarnings,orderCvSections,orderCvWord,initialize,updateConnectionText,download,request,portalPayload,applySupplementalData,publish,submitFeedback,submitResource,queueResource,retryOutbox,inbox,submissionStatus,saveTermDates,exportCalendar,importCv,exportBackup,importBackup,get connected(){return ready;},get publicDataUrl(){return ready ? apiBase+'/api/portal' : null;},get aiAvailable(){return onlineAiAvailable;},get authenticated(){return verified&&(!sessionExpiry||Date.now()/1000<sessionExpiry);},setSession(data){verified=true;sessionExpiry=data.expiresAt;sessionStorage.setItem(SESSION,data.token);sessionStorage.setItem('classroom_session_expiry',String(data.expiresAt));},invalidateSession};
})();

function isAdmin(user) { return !!user && user.role==='admin' && Hub.authenticated; }
function updateAuthUI() {
  const admin=isAdmin(currentUser), container=document.getElementById('authHeaderContainer');
  if(container)container.innerHTML=admin?'<button type="button" class="hub-button" onclick="navigateTo(\'admin\')">Admin dashboard</button><button type="button" class="hub-button" onclick="handleLogout()">Sign out</button>':'<button type="button" class="hub-button" onclick="openAuthModal()">Sign In / Admin</button>';
  for(const id of ['nav-tab-admin','mobileNavAdminBtn','mobileNav-admin','editContactBtn','adminHomeEditBanner'])document.getElementById(id)?.classList.toggle('hidden',!admin);
}
function openAuthModal() {const dialog=document.getElementById('authDialog');document.getElementById('authError').textContent='';Hub.updateConnectionText();if(!dialog.open)dialog.showModal();}
function closeAuthModal(){document.getElementById('authPasswordInput').value='';document.getElementById('authDialog')?.close();}
async function handleStandardAuthSubmit(event) {
  event?.preventDefault();if(!Hub.connected){Hub.updateConnectionText();return;}const button=document.getElementById('ownerLoginSubmit');button.disabled=true;
  try{
    const result=await Hub.request('login',{method:'POST',body:JSON.stringify({email:document.getElementById('authEmailInput').value.trim(),password:document.getElementById('authPasswordInput').value})});
    if(!result.success||!result.token||!result.expiresAt||result.user?.role!=='admin')throw new Error('The backend did not grant an owner session.');
    Hub.setSession(result);currentUser=result.user;closeAuthModal();updateAuthUI();await loadPortalSyncData();applyPortalSettings();navigateTo('admin');renderAdminWorkspace();showToast('Owner session verified by the backend.');
  }catch(e){document.getElementById('authError').textContent=e.message;}finally{Hub.updateConnectionText();}
}
async function handleLogout(){try{await Hub.request('logout',{method:'POST',body:'{}'});}catch{}finally{Hub.invalidateSession();if(currentTab==='admin')navigateTo('home');showToast('Signed out.');}}
function handleGoogleSignInPrompt(){openAuthModal();}
function handleGoogleCustomAccount(event){event?.preventDefault();openAuthModal();}
function closeGoogleSignInModal(){closeAuthModal();}
