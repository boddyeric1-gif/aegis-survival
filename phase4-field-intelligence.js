/* AEGIS Phase 4: deterministic, offline-first field intelligence. No remote calls. */
(()=>{'use strict';
const KEY='aegis-phase4-v1';
const $=id=>document.getElementById(id);
const create=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);return e};
const defaults={people:4,days:3,inventory:[{name:'Potable water',qty:24,unit:'L',category:'water'},{name:'Shelf-stable food',qty:30000,unit:'kcal',category:'food'},{name:'Flashlight batteries',qty:8,unit:'cells',category:'power'}],missions:[],notes:''};
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&typeof x==='object')return {...structuredClone(defaults),...x,inventory:Array.isArray(x.inventory)?x.inventory:structuredClone(defaults.inventory),missions:Array.isArray(x.missions)?x.missions:[]}}catch{}return structuredClone(defaults)}
let state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{setStatus('Local storage unavailable. Export your data to avoid losing changes.')}}
function setStatus(s){const e=$('p4-status');if(e)e.textContent=s}
const escNum=(n,lo,hi)=>Math.max(lo,Math.min(hi,Number(n)||lo));
function analyze(text){
 const t=String(text||'').toLowerCase(), equipment={
 tarp:/\btarps?\b|\brain ?fly\b/.test(t),knife:/\bknives\b|\bknife\b|\bmultitool\b/.test(t),
 sleeping_bag:/\bsleeping bags?\b/.test(t),blanket:/\bblankets?\b/.test(t),
 water:/\bwater\b|\bfilled bottles?\b/.test(t),flashlight:/\bflashlights?\b|\btorches\b/.test(t),
 radio:/\bradios?\b/.test(t),first_aid:/\bfirst.aid\b|\bmedical kit\b/.test(t)};
 const hazards=[];
 for(const [name,re] of [['Cold or exposure',/\bcold\b|\bfreezing\b|\bsnow\b|\bhypothermia\b/],['Heat',/\bheat\b|\bhot weather\b|\bheatwave\b/],['Flooding',/\bflood\b|\bflooding\b|\brising water\b/],['Power outage',/\bpower out\b|\bblackout\b|\bgrid down\b/],['Injury',/\binjur(?:y|ed)\b|\bbleeding\b|\bbroken bone\b/],['Lost outdoors',/\blost\b|\bstranded\b|\bdisoriented\b/],['Unsafe water',/\bdirty water\b|\buntreated water\b|\bno clean water\b/]])if(re.test(t))hazards.push(name);
 const people=t.match(/\b(\d{1,2})\s*(?:people|adults|persons|family members)\b/);
 const noWater=/\b(?:no|without|lack of)\s+(?:clean |drinking )?water\b/.test(t);
 return {equipment,hazards,people:people?Number(people[1]):null,noWater,unknowns:['Location and forecast','Immediate danger and injuries','Available safe water','Communication and return plan'].filter((_,i)=>i===0||i===1||i===2&&(!equipment.water||noWater)||i===3)};
}
function catalog(){try{return window.AEGIS_PHASE3?.catalog?.()||[]}catch{return []}}
function matchGuide(term){const list=catalog();const words=String(term).toLowerCase().split(/\s+/).filter(w=>w.length>3);return list.map(g=>({g,score:words.reduce((n,w)=>n+(String(g.title||'')+' '+String(g.tags||'')+' '+String(g.category||'')).toLowerCase().includes(w)*3,0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.g)}
function planSituation(text){
 const facts=analyze(text),lines=[];
 lines.push('ASSESSMENT — extracted from your description (not a diagnosis)');
 lines.push('Equipment: '+(Object.entries(facts.equipment).filter(([,v])=>v).map(([k])=>k.replace(/_/g,' ')).join(', ')||'none recognized'));
 lines.push('Hazards: '+(facts.hazards.join(', ')||'none explicitly recognized'));
 if(facts.people)lines.push('Reported group: '+facts.people+' people (confirm count)');
 lines.push('\nFIRST PRIORITIES');
 lines.push('1. Check for immediate danger, injuries, unsafe structures and the need for emergency services.');
 if(facts.hazards.includes('Flooding'))lines.push('2. Move away from floodwater and do not enter flooded structures or cross moving water.');
 else if(facts.hazards.includes('Cold or exposure'))lines.push('2. Get out of wind and moisture; prioritize dry layers and insulated shelter.');
 else if(facts.hazards.includes('Heat'))lines.push('2. Seek shade, reduce exertion and check access to safe drinking water.');
 else lines.push('2. Establish a safe location, drinking water and reliable communications.');
 lines.push('3. Confirm who is present, what supplies are usable and when to reassess.');
 if(facts.equipment.tarp)lines.push('Tarp: inspect tie-outs and choose a safe sheltered location before pitching.');
 if(facts.equipment.sleeping_bag)lines.push('Sleeping bag: keep dry; insulate underneath, not only on top.');
 if(facts.equipment.blanket)lines.push('Blanket: reserve dry insulation and avoid contact with wet ground.');
 if(facts.equipment.knife)lines.push('Knife: keep sheathed; use only when needed for controlled tasks.');
 lines.push('\nVERIFY BEFORE ACTING');
 facts.unknowns.forEach(x=>lines.push('• '+x));
 lines.push('\nRelevant offline procedures:');
 const query=facts.hazards.includes('Cold or exposure')?'shelter dry sleeping':facts.hazards.includes('Unsafe water')?'water purification':facts.hazards.includes('Lost outdoors')?'lost outdoors signal':'shelter water emergency';
 const guides=matchGuide(query);lines.push(guides.length?guides.map(g=>'• '+g.title).join('\n'):'• No indexed matching procedure found; browse Field Guide and verify sources.');
 lines.push('\nThis is a rules-based planning aid. Do not use it as an emergency authority or for medical diagnosis.');
 return lines.join('\n');
}
function inventoryReport(){
 const n=escNum(state.people,1,30),water=state.inventory.filter(x=>x.category==='water'&&x.unit==='L').reduce((s,x)=>s+Number(x.qty||0),0);
 const food=state.inventory.filter(x=>x.category==='food'&&x.unit==='kcal').reduce((s,x)=>s+Number(x.qty||0),0);
 const wd=water/(n*3),fd=food/(n*2000);
 return ['Planning estimates only — adjust for climate, exertion, age and medical needs.',
 'People: '+n,
 'Water: '+water.toFixed(1)+' L | ~'+wd.toFixed(1)+' days at 3 L/person/day (drinking and basic cooking only; excludes hygiene)',
 'Food: '+Math.round(food)+' kcal | ~'+fd.toFixed(1)+' days at 2,000 kcal/person/day',
 'Planning horizon: '+escNum(state.days,1,365)+' days',
 wd<state.days?'Water is below the selected planning horizon.':'Water meets the selected rough planning horizon.',
 fd<state.days?'Food is below the selected planning horizon.':'Food meets the selected rough planning horizon.',
 'Fuel, batteries, medications, infant/pet needs and spoilage require separate manual review.'].join('\n');
}
const templates={
 'Water collection':{purpose:'Locate and transport safe water',steps:['Confirm safe access and route','Identify source; avoid floodwater and chemical contamination','Use appropriate treatment and verify method limitations','Carry containers and record amount obtained','Return before agreed check-in'],risks:['Unsafe source','Slips or weather','Overexertion']},
 'Home power outage':{purpose:'Stabilize household during a power outage',steps:['Check for immediate hazards and official guidance','Account for household members and medical needs','Preserve refrigerator/freezer temperatures','Use battery lighting; never run combustion equipment indoors','Review water, heat and communications every few hours'],risks:['Carbon monoxide','Food spoilage','Cold exposure']},
 'Shelter inspection':{purpose:'Assess shelter safety',steps:['Check weather and avoid unstable trees or structures','Check drainage and dry ground','Check wind and safe exits','Confirm dry insulation and ventilation','Log defects and return'],risks:['Falling objects','Exposure','Poor ventilation']},
 'Supply check':{purpose:'Audit supplies',steps:['Count people and special needs','Inspect potable water and food dates','Check medicines, lights and batteries','Record deficits and priority replacements','Export a backup of the inventory'],risks:['Expired supplies','Missing essential medication']}
};
function renderInventory(){
 const list=$('p4-inventory');if(!list)return;list.replaceChildren();
 state.inventory.forEach((item,i)=>{const row=create('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0';row.append(create('span',item.name+' — '+item.qty+' '+item.unit+' ['+item.category+']'));const b=create('button','Remove');b.type='button';b.addEventListener('click',()=>{state.inventory.splice(i,1);save();renderInventory();renderReport()});row.append(b);list.append(row)});
}
function renderReport(){const e=$('p4-report');if(e)e.textContent=inventoryReport()}
function renderMissions(){
 const root=$('p4-missions');if(!root)return;root.replaceChildren();
 state.missions.forEach((m,i)=>{const section=create('article');section.className='panel';section.append(create('h3',m.name),create('p','Purpose: '+m.purpose+' | Return/check-in: '+(m.returnBy||'not specified')));
 const ul=create('ul');m.steps.forEach((step,j)=>{const li=create('li');const box=create('input');box.type='checkbox';box.checked=!!m.done[j];box.addEventListener('change',()=>{m.done[j]=box.checked;save()});const label=create('span',' '+step);li.append(box,label);ul.append(li)});section.append(ul,create('p','Risks: '+m.risks.join('; ')));const del=create('button','Delete mission');del.addEventListener('click',()=>{state.missions.splice(i,1);save();renderMissions()});section.append(del);root.append(section)});
}
function exportData(){const blob=new Blob([JSON.stringify({format:'AEGIS-PHASE4',version:1,exported:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=create('a');a.href=url;a.download='aegis-phase4-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function importData(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));if(parsed.format!=='AEGIS-PHASE4'||!parsed.state||!Array.isArray(parsed.state.inventory)||!Array.isArray(parsed.state.missions))throw Error('Unsupported backup');if(parsed.state.inventory.length>300||parsed.state.missions.length>100)throw Error('Backup exceeds limits');state={...structuredClone(defaults),...parsed.state};save();sync();setStatus('Backup restored locally.')}catch(e){setStatus('Import rejected: '+e.message)}};reader.readAsText(file)}
function sync(){if($('p4-people'))$('p4-people').value=state.people;if($('p4-days'))$('p4-days').value=state.days;renderInventory();renderReport();renderMissions()}
function init(){
 if(!$('p4-root'))return;sync();
 $('p4-analyze')?.addEventListener('click',()=>{$('p4-analysis').textContent=planSituation($('p4-situation').value)});
 $('p4-guide-search')?.addEventListener('input',e=>{const root=$('p4-guide-results');root.replaceChildren();const q=e.target.value.trim();if(q.length<3)return;const guides=matchGuide(q);if(!guides.length){root.append(create('p','No matches in the registered offline procedures.'));return}guides.forEach(g=>{const card=create('p');card.append(create('strong',g.title+' — '),create('span',String(g.category||'Offline procedure')));root.append(card)})});
 $('p4-people')?.addEventListener('change',e=>{state.people=escNum(e.target.value,1,30);save();renderReport()});
 $('p4-days')?.addEventListener('change',e=>{state.days=escNum(e.target.value,1,365);save();renderReport()});
 $('p4-add')?.addEventListener('click',()=>{const name=$('p4-item').value.trim().slice(0,80),qty=Number($('p4-qty').value),category=$('p4-category').value,unit=category==='water'?'L':category==='food'?'kcal':$('p4-unit').value.trim().slice(0,20)||'units';if(!name||!Number.isFinite(qty)||qty<0||qty>10000000||state.inventory.length>=300){setStatus('Enter a valid item and nonnegative quantity (max 300 entries).');return}state.inventory.push({name,qty,unit,category});$('p4-item').value='';save();renderInventory();renderReport();setStatus('Saved on this device.')});
 $('p4-mission-add')?.addEventListener('click',()=>{const name=$('p4-mission-type').value,t=templates[name],returnBy=$('p4-return').value;if(state.missions.length>=100)return setStatus('Mission limit reached');state.missions.unshift({name,purpose:t.purpose,steps:t.steps,risks:t.risks,done:t.steps.map(()=>false),returnBy,created:new Date().toISOString()});save();renderMissions()});
 $('p4-export')?.addEventListener('click',exportData);
 $('p4-import')?.addEventListener('change',e=>importData(e.target.files?.[0]));
 $('p4-reset')?.addEventListener('click',()=>{if(confirm('Erase Phase 4 inventory and mission data from this device?')){state=structuredClone(defaults);save();sync();setStatus('Local Phase 4 data reset.')}});
}
window.AEGIS_PHASE4={analyze,planSituation,inventoryReport,matchGuide,getState:()=>structuredClone(state)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();