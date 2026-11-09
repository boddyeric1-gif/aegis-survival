/* AEGIS service worker: cache-first, whole app precached at install. Cache id is manually versioned; update when app shell assets change. */
const CACHE='aegis-46-field-ready-1';
const ASSETS=["./","./index.html","./field-ready-v46.js","./temperature-units-v46.js","./compare-speed-v46.js","./content-audit-v46.js","./content-audit-v46.json","./wildlands-knowledge.js","./wildlands-fieldcraft.js","./wildlands-manual.js","./manual-projects.js","./manual-library-v7.js","./field-reader-v11.js","./practical-skills-v11.js","./pioneer-handbook-v11.js","./phase3-procedure-router.js","./phase4-field-intelligence.js","./offline-ai-chat-v42.js","./fm-search-v42.js","./fm-manual-v42.js","./manuals/fm-3-05-70.json","./surface-benchmark-v23.js","./visitor-analytics-v24.js","./bushcraft-visuals-v41.js","./bushcraft-v41.js","./field-manual-unified-v40.js","./field-guide-expansion-v13.js","./community-updates-v14.js","./broadcast-admin-v15.js","./broadcast-live-v16.js","./updates.json","./announcements.json","./deep-shelter-earthworks.js","./manual-offline-check.js","./ux-v42.js","./quick-start.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./llm/webllm_bridge.js","./llm/wllama.js","./llm/wllama.wasm","./llm/compat/wllama.wasm","./llm/compat/wllama.js","./llm/interpret.gbnf","./llm/licenses.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(a=>new Request(new URL(a,self.location).href,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>/^aegis-\d+-/.test(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>{
    if(/\/(?:announcements|updates)\.json$/.test(url.pathname))return fetch(req).then(fresh=>{if(fresh.ok)c.put(new URL(url.pathname,self.location.origin).href,fresh.clone());return fresh}).catch(()=>hit||new Response('{"announcements":[],"releases":[]}',{headers:{'Content-Type':'application/json'}}));
    if(req.mode==='navigate')return hit||c.match(new URL('./index.html',self.location).href).then(saved=>saved||fetch(req));
    if(hit)return hit;
    return fetch(req);})));});
self.addEventListener('message',e=>{if(e.data==='version'&&e.source)e.source.postMessage({cache:CACHE});});

self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{data={body:event.data?.text()||''}}
 const title=String(data.title||'AEGIS Wildlands alert');
 const options={body:String(data.body||'New AEGIS message received'),icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:String(data.tag||'aegis-broadcast'),data:{url:String(data.url||'./')},renotify:true};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=new URL(event.notification.data?.url||'./',self.location.href);
 if(url.origin!==self.location.origin)return;
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  for(const client of clients){if(new URL(client.url).origin===url.origin){await client.focus();client.postMessage({type:'aegis-open-messages'});return}}
  await self.clients.openWindow(url.href);
 }));
});

self.addEventListener('message',event=>{if(event.data?.type!=='aegis-readiness')return;event.waitUntil((async()=>{const cache=await caches.open(CACHE),missing=[];for(const asset of ASSETS){const r=await cache.match(new URL(asset,self.location).href);if(!r||!r.ok)missing.push(asset)}event.ports[0]?.postMessage({cache:CACHE,assets:ASSETS,missing})})())});
