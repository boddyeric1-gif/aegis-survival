/* AEGIS unified Field Manual: one searchable catalog, original sources retained under advanced. */
(()=>{'use strict';
function init(){
 const root=document.getElementById('manualhub'),engine=window.AEGIS_PHASE3;
 if(!root||!engine)return;
 const original=['aegis-reader','aegis-practical','aegis-pioneer-handbook','wild-manual','deep-manuals','library-v7','manual-projects'];
 const sources=original.map(id=>document.getElementById(id)).filter(Boolean);
 const panel=document.createElement('section');panel.className='panel';panel.id='unified-field-manual';
 panel.innerHTML='<h2>Field Manual · One Library</h2><p class="muted">Search once across practical skills, shelters, tools, food, pioneer recipes and other bundled procedures. Similar entries are grouped so the same topic is not listed repeatedly.</p><label for="field-unified-search">Find a skill, recipe, or project</label><input id="field-unified-search" type="search" placeholder="Try: shelter, bannock, cordage, water, repair..." autocomplete="off"><label for="field-unified-category">Browse by purpose</label><select id="field-unified-category"><option value="all">All skills</option><option value="shelter">Shelter & warmth</option><option value="water">Water & sanitation</option><option value="food">Food & pioneer kitchen</option><option value="tools">Tools & repairs</option><option value="navigation">Navigation & signals</option><option value="other">Other field skills</option></select><p id="field-unified-count" class="muted" role="status"></p><div id="field-unified-results"></div><details id="field-original-sources"><summary>Advanced: browse original collections and guided lessons</summary><p class="muted">These source collections remain available for the full chapter reader, three interactive lessons and detailed workshop views. Some subjects overlap; the unified catalog above groups similar titles.</p><div id="field-original-container"></div></details>';
 root.insertBefore(panel,root.firstChild);
 const dest=panel.querySelector('#field-original-container');
 for(const el of sources)dest.appendChild(el);
 const input=panel.querySelector('#field-unified-search'),filter=panel.querySelector('#field-unified-category'),out=panel.querySelector('#field-unified-results'),count=panel.querySelector('#field-unified-count');
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const classify=e=>{const t=(e.title+' '+e.group).toLowerCase();if(/shelter|tarp|insulat|winter|heat|earthwork|trench|roof/.test(t))return 'shelter';if(/water|sanit|wash|latrine|hygiene|filter/.test(t))return 'water';if(/food|cook|recipe|bread|bannock|hardtack|preserv|fish|hunting|forag|pioneer|meal|jerky|cough|comfort/.test(t))return 'food';if(/tool|wood|cord|knot|repair|knife|basket|weav|craft|build|mallet|carv/.test(t))return 'tools';if(/navigat|signal|radio|orient|map|compass|lost/.test(t))return 'navigation';return 'other'};
 const normalize=s=>String(s).toLowerCase().replace(/\b(?:how to|a|an|the|making|make|build|building|basic|practical|guide|field|procedure|survival|expanded)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const all=engine.catalog();const groups=new Map();
 for(const e of all){const key=normalize(e.title);if(!key)continue;const list=groups.get(key)||[];list.push(e);groups.set(key,list);}
 const rows=[...groups.values()].map(items=>({primary:items.sort((a,b)=>String(b.steps).length-String(a.steps).length)[0],alternatives:items}));
 function render(){
  const q=input.value.trim().toLowerCase(),cat=filter.value;
  const matches=rows.filter(r=>(cat==='all'||classify(r.primary)===cat)&&(!q||r.alternatives.some(e=>(e.title+' '+e.group+' '+e.materials+' '+String(e.steps)).toLowerCase().includes(q)))).slice(0,120);
  count.textContent=matches.length+' matching topics · '+rows.length+' distinct topic groups · '+all.length+' source procedures';
  out.replaceChildren();
  for(const r of matches){const e=r.primary,d=document.createElement('details');d.className='wild-guide';const sum=document.createElement('summary');sum.textContent=e.title;d.append(sum);const body=document.createElement('div');body.className='wild-guide-body';
   const heading=(label,value)=>{if(!value)return;const h=document.createElement('h4');h.textContent=label;body.append(h);const p=document.createElement('p');p.textContent=String(value);body.append(p)};
   heading('Materials',e.materials);
   if(Array.isArray(e.steps)){const h=document.createElement('h4');h.textContent='Steps';body.append(h);const ol=document.createElement('ol');for(const st of e.steps){const li=document.createElement('li');li.textContent=Array.isArray(st)?st.join(' — '):String(st);ol.append(li)}body.append(ol)}else heading('Method',e.steps);
   heading('Safety and limitations',e.caution);heading('Field context',e.context);
   if(r.alternatives.length>1)heading('Related source entries',r.alternatives.filter(x=>x!==e).map(x=>x.title+' ('+x.kind+')').join('; '));
   const p=document.createElement('p');p.className='muted';p.textContent='Offline educational draft; not independently field validated.';body.append(p);d.append(body);out.append(d);
  }
  if(!matches.length){const p=document.createElement('p');p.textContent='No matching topics. Try a broader search.';out.append(p)}
 }
 input.addEventListener('input',render);filter.addEventListener('change',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();