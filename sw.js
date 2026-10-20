/* Cache only this release's public app shell. Never cache authenticated APIs. */
const CACHE_NAME = 'classroomhub-pwa-v4.3.1';
const VERSION = '4.3.1';
const SHELL = ['./','./index.html',`./styles.css?v=${VERSION}`,`./hub-core.js?v=${VERSION}`,`./app.js?v=${VERSION}`,`./hub-fixes.js?v=${VERSION}`,`./hub-features.js?v=${VERSION}`,`./data.js?v=${VERSION}`,'./jszip.min.js','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./cuet_routine_template_blank.docx','./cuet_routine_template_sample.docx'];
const PUBLIC_NAMES = new Set(['','index.html','styles.css','hub-core.js','app.js','hub-fixes.js','hub-features.js','data.js','jszip.min.js','manifest.json','icon.svg','icon-192.png','icon-512.png','cuet_routine_template_blank.docx','cuet_routine_template_sample.docx','portal_sync.json','classroom_index.json']);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('classroomhub-pwa-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||request.headers.has('Authorization'))return;
 const name=url.pathname.slice(scope.pathname.length);
 if(!PUBLIC_NAMES.has(name))return;
 const networkFirst=request.mode==='navigate'||name==='portal_sync.json'||name==='classroom_index.json';
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  if(!networkFirst){const cached=await cache.match(request);if(cached)return cached;}
  try{const response=await fetch(request);if(response.ok&&response.type!=='opaque')await cache.put(request,response.clone());return response;}
  catch(error){const cached=await cache.match(request);if(cached)return cached;if(request.mode==='navigate'){const shell=await cache.match('./index.html');if(shell)return shell;}return new Response('Offline: this resource is not cached.',{status:503,headers:{'Content-Type':'text/plain'}});}
 })());
});
