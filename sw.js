/* AEGIS service worker: cache-first, whole app precached at install. Cache id is a content hash (see build.js). */
const CACHE='aegis-4.4.2-recovery-6b6cba3';
const ASSETS=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./llm/webllm_bridge.js","./llm/wllama.js","./llm/wllama.wasm","./llm/compat/wllama.wasm","./llm/compat/wllama.js","./llm/interpret.gbnf","./llm/licenses.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(a=>new Request(new URL(a,self.location).href,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('aegis-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    if(hit)return hit;
    if(req.mode==='navigate')return caches.match(new URL('./index.html',self.location).href);
    return fetch(req);}));});
self.addEventListener('message',e=>{if(e.data==='version'&&e.source)e.source.postMessage({cache:CACHE});});
