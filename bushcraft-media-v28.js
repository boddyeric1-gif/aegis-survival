/* AEGIS Bushcraft Commons Media Library v28.
 * Live image discovery for every lesson, source/author/license disclosure.
 * Search results are unreviewed visual references, never procedural verification.
 */
(()=>{'use strict';
const searches={
'Tarp lean-to':'tarp lean to shelter camping','A-frame tarp shelter':'A frame tarp tent shelter','Ground insulation bed':'camping sleeping pad ground insulation','Shelter site selection':'wilderness campsite shelter forest','Rainwater diversion':'rainwater runoff drainage camping',
'Tinder preparation':'fire tinder feather stick bushcraft','Fire lay planning':'campfire fire lay kindling','Firewood moisture sorting':'firewood stacked seasoned wood',
'Emergency water storage':'emergency water storage container','Water source risk check':'stream water pollution','Rain collection setup':'rainwater collection tarp',
'Foraging observation journal':'botanical field notebook plant identification','Food storage rotation':'food storage containers pantry','Wildlife sign observation':'animal tracks snow mud',
'Humane live-capture planning':'humane live animal cage trap','Animal track recording':'animal footprints tracks field',
'Simple wooden mallet':'wooden mallet woodworking','Camp utensil care':'camp cooking utensils washing',
'Bowline knot':'bowline knot rope','Taut-line hitch':'taut line hitch knot','Square lashing practice':'square lashing poles rope',
'Landmark route notes':'topographic map hiking navigation','Compass orientation':'compass map navigation',
'Leave-no-trace camp routine':'leave no trace camping','Rainproof supply storage':'waterproof storage camping container','Household repair inventory':'hand tools repair toolbox'
};
const api='https://commons.wikimedia.org/w/api.php', cachePrefix='aegis-commons-gallery-v1:', imagesPrefix='aegis-commons-images-v1';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>{const e=document.createElement('div');e.innerHTML=String(s||'');return e.textContent||''};
const allowed=u=>{try{const x=new URL(u);return x.protocol==='https:'&&(x.hostname==='upload.wikimedia.org'||x.hostname==='commons.wikimedia.org')}catch{return false}};
const name=()=>document.querySelector('#bc-detail h2')?.textContent?.trim();
let current='',epoch=0;
function loadStored(n){try{return JSON.parse(localStorage.getItem(cachePrefix+n)||'null')}catch{return null}}
function store(n,v){try{localStorage.setItem(cachePrefix+n,JSON.stringify(v))}catch{}}
function normalize(p){const i=p.imageinfo?.[0]||{},m=i.extmetadata||{},url=i.thumburl||i.url||'';if(!allowed(url))return null;const lic=plain(m.LicenseShortName?.value||m.License?.value||'License not supplied');return {title:p.title,thumb:url,original:i.descriptionurl||'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title.replaceAll(' ','_')),artist:plain(m.Artist?.value||'Creator not supplied').slice(0,220),license:lic,credit:plain(m.Credit?.value||'').slice(0,180),description:plain(m.ImageDescription?.value||'').slice(0,200)}}
async function find(n){
 const terms=[searches[n],n,searches[n].split(' ').slice(0,2).join(' ')].filter(Boolean);
 let entries=[],errors=[];
 for(const term of [...new Set(terms)]){
  try{
   const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:term,gsrnamespace:'6',gsrlimit:'40',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'600'});
   const res=await fetch(api+'?'+params,{mode:'cors',cache:'no-store'});
   if(!res.ok)throw Error('Commons HTTP '+res.status);
   const data=await res.json();
   if(data.error)throw Error(data.error.info||data.error.code);
   const found=Object.values(data.query?.pages||{}).map(normalize).filter(Boolean).filter(x=>/CC|public domain|PD|GNU|GFDL/i.test(x.license));
   for(const item of found){if(!entries.some(x=>x.title===item.title))entries.push(item)}
   if(entries.length>=6)break;
  }catch(e){errors.push(e.message)}
 }
 if(!entries.length&&errors.length)throw Error(errors.join('; '));
 const result={items:entries.slice(0,18),checked:Date.now(),terms};
 store(n,result);return result
}
function status(t){const e=document.querySelector('#bc-photo-status');if(e)e.textContent=t}
async function saveImage(item,btn){if(!('caches'in window)){status('Image caching unavailable in this browser.');return}try{btn.disabled=true;btn.textContent='Saving…';const cache=await caches.open(imagesPrefix);const req=new Request(item.thumb,{mode:'cors'});const response=await fetch(req);if(!response.ok)throw Error('Image download failed');await cache.put(req,response);btn.textContent='✓ Cached on device';status('Image cached in this browser. Offline availability depends on retained browser storage.')}catch(e){btn.textContent='Save image offline';status('Could not cache image: '+e.message)}finally{btn.disabled=false}}
async function saveLesson(n,btn){const data=loadStored(n);if(!data?.items?.length){status('Search for photos first.');return}const original=btn.textContent;btn.disabled=true;let ok=0;try{if(!('caches'in window))throw Error('Cache storage unavailable');const cache=await caches.open(imagesPrefix);for(const item of data.items){try{const req=new Request(item.thumb,{mode:'cors'});const res=await fetch(req);if(res.ok){await cache.put(req,res);ok++}}catch{}btn.textContent='Saving '+ok+' / '+data.items.length}status('Saved '+ok+' of '+data.items.length+' images for '+n+'. Offline images remain dependent on browser storage.')}catch(e){status(e.message)}finally{btn.textContent=original;btn.disabled=false}}
async function saveEntireLibrary(btn){
 if(!navigator.onLine){status('Connect to the internet to prepare the photo library.');return}
 if(!('caches'in window)){status('Offline photo storage unavailable.');return}
 btn.disabled=true;const label=btn.textContent;let lessonsDone=0,saved=0,failed=0,empty=0;
 try{
  const cache=await caches.open(imagesPrefix);
  for(const n of Object.keys(searches)){
   btn.textContent='Preparing '+(++lessonsDone)+' / '+Object.keys(searches).length;
   let data=loadStored(n);
   if(!data?.items?.length){try{data=await find(n)}catch{failed++;continue}}if(!data?.items?.length){empty++;continue}
   for(const item of data.items.slice(0,3)){
    try{
     const req=new Request(item.thumb,{mode:'cors'});
     if(await cache.match(req)){saved++;continue}
     const res=await fetch(req);if(!res.ok)throw Error('HTTP '+res.status);
     await cache.put(req,res);saved++;
    }catch{failed++}
   }
   status('Offline library: '+lessonsDone+' / 26 lessons checked; '+saved+' images available; '+failed+' failed; '+empty+' lessons had no results. Keep this page open.');
  }
  status('Finished: '+saved+' images cached across '+lessonsDone+' lessons; '+failed+' failures; '+empty+' lessons had no image results. This is a reference-image collection, not expert-verified build photography. Verify with airplane mode.');
 }catch(e){status('Library preparation interrupted: '+e.message)}
 finally{btn.disabled=false;btn.textContent=label}
}

function paint(n,data){if(n!==current)return;const holder=document.querySelector('#bc-photo-grid');if(!holder)return;holder.replaceChildren();if(!data.items.length){status('No suitably licensed results found for this search. Try the Commons source link.');return}
status(data.items.length+' sourced image results. These are unreviewed search matches, not confirmed illustrations of this lesson. Open each source to verify relevance and license.');
for(const item of data.items){const figure=document.createElement('figure');figure.className='bc-source-card';const img=document.createElement('img');img.loading='lazy';img.alt=item.description||item.title;img.src=item.thumb;if(!navigator.onLine&&'caches'in window){caches.open(imagesPrefix).then(cache=>cache.match(item.thumb)).then(resp=>resp&&resp.blob()).then(blob=>{if(blob){const u=URL.createObjectURL(blob);img.src=u;img.addEventListener('load',()=>URL.revokeObjectURL(u),{once:true})}}).catch(()=>{})}const cap=document.createElement('figcaption');const title=document.createElement('strong');title.textContent=item.title.replace(/^File:/,'').replace(/\.[^.]+$/,'').replaceAll('_',' ');cap.append(title);const credit=document.createElement('small');credit.textContent=(item.artist||'Creator not supplied')+' · '+item.license;cap.append(credit);const link=document.createElement('a');link.href=item.original;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Verify source and license';cap.append(link);const save=document.createElement('button');save.type='button';save.textContent='Save image offline';save.onclick=()=>saveImage(item,save);cap.append(save);figure.append(img,cap);holder.append(figure)}
}
async function refresh(n,force=false){const id=++epoch;current=n;const old=loadStored(n);if(old&&!force)paint(n,old);else status('Searching Wikimedia Commons for '+n+'…');if(!navigator.onLine){if(!old)status('Offline. Connect once to search and save photographs for this lesson.');return}try{const d=await find(n);if(id===epoch)paint(n,d)}catch(e){if(id===epoch)status((old?'Showing previously indexed images. ':'')+'Search unavailable: '+e.message)}}
function mount(){const detail=document.querySelector('#bc-detail');const n=name();if(!detail||!searches[n]||detail.querySelector('#bc-photo-library'))return;const section=document.createElement('section');section.id='bc-photo-library';section.innerHTML='<h3>📷 Real-world image library</h3><p class="bc-subtle">Searches Wikimedia Commons for this specific skill. Results are not curated or verified instructions. Each card links to its source, creator, and license; save individual photos for offline use.</p><div class="bc-actions"><button id="bc-photo-refresh">Find / refresh photographs</button><button id="bc-photo-saveall">Save all lesson photos offline</button><button id="bc-photo-full">Prepare entire 26-lesson photo library offline</button><a id="bc-photo-commons" target="_blank" rel="noopener noreferrer">Browse original Commons results</a></div><p id="bc-photo-status" role="status"></p><div id="bc-photo-grid" class="bc-source-grid"></div>';const material=Array.from(detail.querySelectorAll('h3')).find(x=>x.textContent==='Materials');if(material)detail.insertBefore(section,material);else detail.append(section);const commons=new URL('https://commons.wikimedia.org/w/index.php');commons.searchParams.set('search',searches[n]);commons.searchParams.set('title','Special:MediaSearch');commons.searchParams.set('type','image');section.querySelector('#bc-photo-commons').href=commons.href;section.querySelector('#bc-photo-refresh').onclick=()=>refresh(n,true);section.querySelector('#bc-photo-saveall').onclick=e=>saveLesson(n,e.currentTarget);section.querySelector('#bc-photo-full').onclick=e=>saveEntireLibrary(e.currentTarget);refresh(n)}
const css=document.createElement('style');css.textContent='#bushcraft .bc-source-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px}#bushcraft .bc-source-card{margin:0;border:1px solid #5a4b34;border-radius:10px;overflow:hidden;background:#1c201c}#bushcraft .bc-source-card img{width:100%;height:155px;object-fit:cover;background:#283026}#bushcraft .bc-source-card figcaption{padding:10px;display:grid;gap:7px}#bushcraft .bc-source-card strong{font-size:.87rem;overflow-wrap:anywhere}#bushcraft .bc-source-card small{font-size:.75rem;color:#b8b8ac;overflow-wrap:anywhere}#bushcraft .bc-source-card a{color:#e3b65e;font-size:.8rem}#bushcraft .bc-source-card button{background:#342c1f;color:#f2d39b;border:1px solid #96703b;border-radius:7px;padding:7px}#bc-photo-library{margin:20px 0;padding:14px;border:1px solid #5b4b32;border-radius:12px}';document.head.append(css);
const root=document.getElementById('bushcraft');if(!root)return;new MutationObserver(()=>{const n=name();if(n&&n!==current){current=n;mount()}}).observe(root,{childList:true,subtree:true});mount();
})();