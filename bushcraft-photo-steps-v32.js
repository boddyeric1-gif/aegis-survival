/* AEGIS v32 — lesson and step photographic reference system.
   Wikimedia Commons images are search results, not verified procedural photographs.
   No photo is represented as step-accurate unless separately reviewed.
*/
(()=>{'use strict';
const root=document.getElementById('bushcraft');if(!root)return;
const DB='aegis-photo-index-v32',CACHE='aegis-photo-binary-v32';
const state={busy:false,active:'',renderToken:0,records:{},errors:[]};
try{state.records=JSON.parse(localStorage.getItem(DB)||'{}')||{}}catch{}
const escape=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const strip=s=>{let d=document.createElement('div');d.innerHTML=String(s||'');return(d.textContent||'').trim()};
const sleep=t=>new Promise(r=>setTimeout(r,t));
const lesson=()=>document.querySelector('#bc-detail h2')?.textContent?.trim()||'';
const steps=()=>Array.from(document.querySelectorAll('#bc-detail .bc-step p')).map(x=>x.textContent.replace(/^\s*\d+\.\s*/,'').trim());
const key=(name,step)=>name+'::'+step;
const saveIndex=()=>{try{localStorage.setItem(DB,JSON.stringify(state.records))}catch(e){state.errors.push('Metadata storage: '+e.message)}};
const goodURL=url=>{try{let u=new URL(url);return u.protocol==='https:'&&['upload.wikimedia.org','commons.wikimedia.org'].includes(u.hostname)}catch{return false}};
const licensed=meta=>{const license=strip(meta.LicenseShortName?.value||meta.License?.value||'');const usage=strip(meta.UsageTerms?.value||'');return /^(CC(?:[ -]|$)|Creative Commons|Public domain|PD(?:[ -]|$)|GNU|GFDL)/i.test(license+' '+usage)};
function normalize(p){let info=p.imageinfo?.[0],meta=info?.extmetadata||{};if(!info||!licensed(meta))return null;let url=info.thumburl||info.url;if(!goodURL(url))return null;return{title:p.title,url,source:info.descriptionurl||'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title.replaceAll(' ','_')),artist:strip(meta.Artist?.value||'Unknown author').slice(0,160),license:strip(meta.LicenseShortName?.value||meta.License?.value||'Check source').slice(0,90)}}
async function search(query){
 const p=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrsearch:query,gsrlimit:'24',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'700'});
 const res=await fetch('https://commons.wikimedia.org/w/api.php?'+p,{mode:'cors',cache:'no-store'});
 if(!res.ok)throw Error('Commons HTTP '+res.status);
 const json=await res.json();if(json.error)throw Error(json.error.info||json.error.code);
 return Object.values(json.query?.pages||{}).map(normalize).filter(Boolean);
}
async function lookup(name,step){
 const k=key(name,step),stored=state.records[k];
 if(stored?.image)return stored;
 if(!navigator.onLine)return stored||{error:'Offline: no image saved for this step'};
 const short=step.replace(/^(Choose|Select|Check|Record|Prepare|Keep|Observe|Identify|Use|Store|Avoid|Find|Note|Plan|Test|Lay|Build|Cover|Leave|Make|Run|Tie|Stake|Center|Drape|Photograph|Inspect|Separate|Wash|Rinse|Dry|Clean|Fill|Label|Angle|Compare|Mark|Cut|Smooth|Wrap|Return|Form|Pass|Dress|Tighten|Hold|Align|Secure|Measure|Move|Follow|Confirm)\\b/i,'').trim();
 const queries=[name+' '+short, name, short].filter(Boolean);
 let found=[],error='';
 for(const q of queries){
  try{found=await search(q);if(found.length)break}catch(e){error=e.message}
 }
 const result=found.length?{image:found[0],alternatives:found.slice(1,4),query:queries[0],time:Date.now()}:{error:error||'No licensed image found',query:queries[0],time:Date.now()};
 state.records[k]=result;saveIndex();return result;
}
async function cacheImage(image){
 if(!('caches'in window))throw Error('CacheStorage unsupported');
 const cache=await caches.open(CACHE),req=new Request(image.url,{mode:'cors'});
 if(await cache.match(req))return true;
 const res=await fetch(req);if(!res.ok||res.type==='opaque')throw Error('Image cannot be stored offline');
 await cache.put(req,res);return true;
}
async function imageSource(image){
 if(!('caches'in window))return navigator.onLine?image.url:'';
 const cache=await caches.open(CACHE),res=await cache.match(image.url);
 if(res){const blob=await res.blob();return URL.createObjectURL(blob)}
 return navigator.onLine?image.url:'';
}
function renderCard(container,result,index,token){
 if(token!==state.renderToken||!container.isConnected)return;
 const card=container.querySelector('[data-photo-step="'+index+'"]');if(!card)return;
 if(!result.image){card.innerHTML='<p class="bc-media-empty">'+escape(result.error||'No photograph found')+'</p>';return}
 const image=result.image;
 card.innerHTML='<div class="bc-media-frame"><span class="bc-media-loading">Loading photograph…</span></div><div class="bc-media-credit"><span>'+escape(image.title.replace(/^File:/,''))+'</span><small>'+escape(image.artist)+' · '+escape(image.license)+'</small><a href="'+escape(image.source)+'" target="_blank" rel="noopener noreferrer">Source / attribution</a><button type="button" class="bc-media-save">Save photo offline</button></div>';
 const frame=card.querySelector('.bc-media-frame');
 imageSource(image).then(src=>{if(token!==state.renderToken||!frame.isConnected)return;if(!src){frame.textContent='Photo not cached for offline use';return}const img=new Image();img.loading='lazy';img.alt='Unreviewed Commons visual reference for step '+(index+1);img.src=src;img.onload=()=>{if(src.startsWith('blob:'))setTimeout(()=>URL.revokeObjectURL(src),1000)};img.onerror=()=>{frame.textContent='Photograph unavailable — open source link'};frame.replaceChildren(img)}).catch(()=>frame.textContent='Image unavailable');
 card.querySelector('.bc-media-save').onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Saving…';try{await cacheImage(image);b.textContent='Saved offline ✓'}catch(err){b.textContent='Retry save';setStatus('Unable to cache photo: '+err.message)}finally{b.disabled=false}};
}
function setStatus(msg){const e=document.querySelector('#bc-media-status');if(e)e.textContent=msg}
async function loadCurrent(name,stepList,token){
 let done=0;
 for(let i=0;i<stepList.length;i++){
  if(token!==state.renderToken)return;
  let result=await lookup(name,stepList[i]);
  renderCard(document.getElementById('bc-media-v32'),result,i,token);
  done++;setStatus('Step photos: '+done+' / '+stepList.length+' checked. Results are unreviewed reference images.');
 }
}
async function prepareAll(btn){
 if(state.busy)return;
 if(!navigator.onLine){setStatus('Connect to prepare photos for offline use.');return}
 if(!('caches'in window)){setStatus('This browser does not support offline photo storage.');return}
 state.busy=true;btn.disabled=true;let total=0,downloaded=0,missing=0,failed=0;
 const selected=lesson();
 const categories=Array.from(root.querySelectorAll('[data-cat]')).filter(b=>b.dataset.cat!=='Favorites');
 const originalCategory=root.querySelector('[data-cat][aria-pressed="true"]')?.dataset.cat;
 try{
  for(const cat of categories){
   cat.click();
   const items=Array.from(root.querySelectorAll('[data-lesson]'));
   for(let i=0;i<items.length;i++){
    const current=Array.from(root.querySelectorAll('[data-lesson]'))[i];if(!current)continue;
    current.click();
    const n=lesson(),ss=steps();
    for(const step of ss){
     total++;let r;
     try{r=await lookup(n,step);if(r.image){await cacheImage(r.image);downloaded++}else missing++}catch(e){failed++;state.errors.push(n+': '+e.message)}
     btn.textContent='Preparing '+total+' steps · '+downloaded+' saved';
     setStatus('Offline photo preparation: '+total+' steps checked, '+downloaded+' cached, '+missing+' without matches, '+failed+' failures. Keep this page open.');
    }
   }
  }
  setStatus('Finished: '+total+' steps, '+downloaded+' photographs cached, '+missing+' without matches, '+failed+' download/search failures. Test in airplane mode; storage may be evicted.');
 }catch(e){setStatus('Preparation interrupted: '+e.message)}
 finally{
  state.busy=false;btn.disabled=false;btn.textContent='Prepare all step photos offline';
  if(originalCategory){const cat=root.querySelector('[data-cat="'+CSS.escape(originalCategory)+'"]');cat?.click()}
  const item=Array.from(root.querySelectorAll('[data-lesson]')).find(b=>b.textContent.includes(selected));item?.click();
 }
}
function mount(){
 if(state.busy)return;
 const n=lesson(),ss=steps(),detail=document.getElementById('bc-detail');
 if(!n||!ss.length||!detail)return;
 if(state.active===n&&detail.querySelector('#bc-media-v32'))return;
 state.active=n;const token=++state.renderToken;
 // Hide legacy photo gallery: it was not a curated, offline step-reference system.
 const old=detail.querySelector('#bc-photo-library');if(old)old.remove();
 const panel=document.createElement('section');panel.id='bc-media-v32';
 panel.innerHTML='<h3>Field photography · '+ss.length+' steps</h3><p class="bc-subtle">Real Wikimedia Commons reference photos, where available. Automatically selected images may not depict the exact procedure. Confirm the written step and safety notes; photos are not verified instructions.</p><div class="bc-actions"><button type="button" id="bc-media-all">Prepare all step photos offline</button><button type="button" id="bc-media-retry">Refresh this lesson</button></div><p id="bc-media-status" role="status">Loading references…</p><div class="bc-media-grid">'+ss.map((s,i)=>'<div class="bc-media-card" data-photo-step="'+i+'"><strong>Step '+(i+1)+'</strong><p>'+escape(s)+'</p><div class="bc-media-empty">Finding photograph…</div></div>').join('')+'</div>';
 const header=Array.from(detail.querySelectorAll('h3')).find(h=>h.textContent==='Step-by-step field guide');
 if(header)header.after(panel);else detail.append(panel);
 panel.querySelector('#bc-media-all').onclick=e=>prepareAll(e.currentTarget);
 panel.querySelector('#bc-media-retry').onclick=()=>{for(const step of ss)delete state.records[key(n,step)];saveIndex();loadCurrent(n,ss,token)};
 loadCurrent(n,ss,token);
}
const css=document.createElement('style');css.textContent='#bushcraft .bc-media-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:12px}#bushcraft .bc-media-card{background:#1c211d;border:1px solid #6b5938;border-radius:12px;padding:12px;min-width:0}#bushcraft .bc-media-card strong{color:#efcf8e}#bushcraft .bc-media-card>p{font-size:.86rem;min-height:45px}#bushcraft .bc-media-frame{height:155px;display:grid;place-items:center;overflow:hidden;border-radius:8px;background:#111}#bushcraft .bc-media-frame img{width:100%;height:100%;object-fit:cover}#bushcraft .bc-media-credit{display:grid;gap:5px;font-size:.78rem;overflow-wrap:anywhere;margin-top:8px}#bushcraft .bc-media-credit small{color:#bbb}#bushcraft .bc-media-credit a{color:#efcf8e}#bushcraft .bc-media-credit button{background:#39301e;color:#f5d8a0;border:1px solid #846537;border-radius:6px;padding:7px}#bushcraft #bc-media-v32{margin:20px 0}#bushcraft .bc-media-empty{font-size:.78rem;color:#aaa;padding:12px}';document.head.append(css);
const observer=new MutationObserver(()=>{if(state.busy)return;queueMicrotask(mount)});
observer.observe(root,{childList:true,subtree:true});
mount();
})();