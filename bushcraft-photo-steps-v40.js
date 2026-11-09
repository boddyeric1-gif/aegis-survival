/* AEGIS v40: automatic image search retired. No search result is a step photograph. */
(()=>{'use strict';
// Retire only the incorrect photo metadata and photo cache; preserve user records and model files.
for(const key of ['aegis-photo-index-v39','aegis-photo-index-v32']){
 try{localStorage.removeItem(key)}catch{}
}
if('caches' in window)caches.delete('aegis-photo-binary-v32').catch(()=>{});
const root=document.getElementById('bushcraft');if(!root)return;
function mount(){
 const detail=root.querySelector('#bc-detail');if(!detail||detail.querySelector('.bc-photo-status'))return;
 detail.querySelectorAll('#bc-media-v32,#bc-photo-library,.bc-photo').forEach(el=>el.remove());
 const note=document.createElement('p');note.className='bc-subtle bc-photo-status';
 note.textContent='Step photographs: not yet available. The bundled illustrations below are conceptual references. Unrelated automatic image-search results have been removed.';
 const heading=Array.from(detail.querySelectorAll('h3')).find(el=>el.textContent==='Step-by-step field guide');
 if(heading)heading.before(note);
}
new MutationObserver(mount).observe(root,{childList:true,subtree:true});mount();
})();
