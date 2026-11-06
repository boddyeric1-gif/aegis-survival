/* AEGIS service worker: cache-first, whole app precached at install. Cache id is manually versioned; update when app shell assets change. */
const CACHE='aegis-15-admin-inbox-1';
const ASSETS=["./","./index.html","./wildlands-knowledge.js","./wildlands-fieldcraft.js","./wildlands-manual.js","./manual-projects.js","./manual-library-v7.js","./field-reader-v11.js","./practical-skills-v11.js","./pioneer-handbook-v11.js","./phase3-procedure-router.js","./field-manual-unified.js","./field-guide-expansion-v13.js","./community-updates-v14.js","./broadcast-admin-v15.js","./updates.json","./announcements.json","./deep-shelter-earthworks.js","./manual-offline-check.js","./ux-v9.js","./quick-start.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./llm/webllm_bridge.js","./llm/wllama.js","./llm/wllama.wasm","./llm/compat/wllama.wasm","./llm/compat/wllama.js","./llm/interpret.gbnf","./llm/licenses.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(a=>new Request(new URL(a,self.location).href,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('aegis-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>{
    if(/\/(?:announcements|updates)\.json$/.test(url.pathname))return fetch(req).then(fresh=>{if(fresh.ok)c.put(new URL(url.pathname,self.location.origin).href,fresh.clone());return fresh}).catch(()=>hit||new Response('{"announcements":[],"releases":[]}',{headers:{'Content-Type':'application/json'}}));
    if(req.mode==='navigate')return fetch(req).then(fresh=>{if(fresh.ok)c.put(new URL('./index.html',self.location).href,fresh.clone());return fresh}).catch(()=>hit||c.match(new URL('./index.html',self.location).href));
    if(hit)return hit;
    return fetch(req);})));});
self.addEventListener('message',e=>{if(e.data==='version'&&e.source)e.source.postMessage({cache:CACHE});});
