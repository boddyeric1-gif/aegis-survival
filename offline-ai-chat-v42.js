/* AEGIS v42: local chat with bounded offline-manual retrieval and direct excerpt mode. */
(()=>{'use strict';
const KEY='aegis.chat.v22',LIMIT=24,MAX_CHARS=2500;
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);return n};
let history=[],busy=false;
const resolve=messages=>window.AEGIS_INTELLIGENCE?.query(messages)||messages.at(-1)?.text||'';
try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(a))history=a.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.text==='string').slice(-LIMIT)}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(history.slice(-LIMIT)))}catch{setStatus('Local chat storage unavailable. Export your conversation if needed.')}};
const setStatus=s=>{const n=$('aegis-chat-status');if(n)n.textContent=s};
function draw(){
 const root=$('aegis-chat-thread');if(!root)return;root.replaceChildren();
 if(!history.length){const hint=el('p','Talk naturally: ask a general question, describe a situation, or follow up on an earlier answer. Local AI uses recent conversation; guide lookup provides source text when the model is unavailable.');hint.className='muted';root.append(hint)}
 history.forEach(m=>{const wrap=el('article');wrap.className='aegis-chat-message '+(m.role==='user'?'aegis-chat-user':'aegis-chat-assistant');const title=el('strong',m.role==='user'?'You':m.mode==='manual'?'AEGIS · Manual Search':['guided','planned'].includes(m.mode)?'AEGIS · Field Assistant':'AEGIS · Offline AI');title.className='aegis-chat-speaker';const body=el('div',m.text);body.className='aegis-chat-message-body';wrap.append(title,body);if(m.incomplete){const note=el('p','This answer reached the response limit. Continue to finish it.');note.className='muted';wrap.append(note);if(m===history.at(-1)){const b=el('button','Continue answer');b.type='button';b.disabled=busy;b.onclick=()=>send(true);wrap.append(b)}}if(Array.isArray(m.sources)&&m.sources.length){const refs=el('div');refs.style.cssText='margin-top:10px;display:flex;gap:6px;flex-wrap:wrap';refs.append(el('small','Retrieved manual references: '));for(const source of m.sources){if(!Number.isInteger(source.page)||source.page<1||source.page>676)continue;const b=el('button','FM · PDF page '+source.page+(source.label?' / '+source.label:''));b.type='button';b.onclick=()=>window.AEGIS_FM?.openPage(source.page);refs.append(b)}wrap.append(refs)}root.append(wrap)});
 root.scrollTop=root.scrollHeight;
}
function references(query){
 const guides=window.AEGIS_PHASE3?.catalog?.()||[];
 const terms=String(query).toLowerCase().match(/[a-z]{4,}/g)||[];
 const ignore=new Set(['what','where','when','would','could','should','have','with','from','that','this','about','there','their','please','tell','help','make','some','your','need','want','know','does']);
 const keys=[...new Set(terms.filter(x=>!ignore.has(x)))].slice(0,12);
 return guides.map(g=>{const t=(String(g.title||'')+' '+String(g.tags||'')+' '+String(g.category||'')).toLowerCase();return {g,n:keys.reduce((s,k)=>s+(t.includes(k)?1:0),0)}}).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,3).map(({g})=>{const steps=Array.isArray(g.steps)?g.steps.slice(0,4).map(s=>typeof s==='string'?s:JSON.stringify(s)).join('; '):'';return (g.title||'Procedure')+': '+steps.slice(0,500)}).join('\n');
}
function promptFor(messages){
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const I=window.AEGIS_INTELLIGENCE,c=I?.conversation(messages)||{last:messages.at(-1)?.text||'',previous:''};
 const query=I?.retrievalQuery(messages)||resolve(messages);
 const catalog=window.AEGIS_PHASE3?.catalog?.()||[];
 const grounded=I?.context(messages,catalog,ios?650:1200);
 // Give actual procedure steps room; the old 250-character guide budget often
 // stopped inside the materials list, before a single instruction reached the AI.
 const source=grounded?.text||window.AEGIS_FM?.promptContext(query,ios?650:1200)||references(query);
 const sources=grounded?.text?[]:manualSources(query);
 const system='You are AEGIS, an offline assistant. Answer general questions and the CURRENT question directly. For a follow-up, continue the same task. Latest user corrections replace earlier amounts or equipment. For building questions, give three short practical steps. Compare the user’s supplies with the reference requirements; do not assume missing materials. Ask one specific question if size or length prevents confirming the design. Local references are historical or unreviewed. Do not invent supplies or citations. Do not identify edible plants or give outdated medical advice. In immediate danger, advise emergency help. Keep flames outside shelters. Be concise.';
 const previous=c.previous? 'Earlier user situation: '+c.previous.slice(0,ios?600:1000)+'\n':'';
 const user=previous+(source?'Reference steps:\n'+source+'\n\n':'')+'CURRENT question: '+c.last.slice(0,ios?1200:2000);
 const chat=[{role:'system',content:system+(source?'\nReference steps:\n'+source:'')}];
 if(c.previous){chat.push({role:'user',content:'Earlier situation: '+c.previous.slice(0,ios?600:1000)});
  const priorAnswer=messages.slice(0,-1).filter(m=>m.role==='assistant'&&m.mode!=='manual').at(-1)?.text||'';
  if(priorAnswer&&I?.conversation([{role:'user',text:priorAnswer}]).topic===c.topic&&!/my name|I am an offline|historical events|100% accurate/i.test(priorAnswer))chat.push({role:'assistant',content:priorAnswer.slice(0,ios?400:800)});
 }
 // Unknown topics still get real conversation turns for an explicit follow-up.
 // Do not carry unrelated previous replies into a fresh question.
 if(!c.previous&&/^(?:actually|instead|what about|what if|why|how (?:does|would|can) (?:it|that)|can (?:i|we|you) (?:do|use|make) (?:it|that)|continue|finish|go on)\b/i.test(c.last.trim())){
  const recent=messages.slice(0,-1).filter(m=>['user','assistant'].includes(m.role)&&m.mode!=='manual').slice(-4);
  for(const m of recent)chat.push({role:m.role,content:m.text.slice(0,ios?300:600)});
 }
 const task=window.AEGIS_ASSISTANT_PLANNING?.context(messages);if(task)chat[0].content+='\n'+task;
 chat.push({role:'user',content:c.last.slice(0,ios?1200:2000)});
 return {system,user,messages:chat,sources,max_tokens:Math.max(80,Math.min(ios?180:320,Number($('aegis-chat-length')?.value)||160))};
}
function manualSources(query){return(window.AEGIS_FM?.search?.(query,2)||[]).map(r=>({page:r.page,label:r.label||''}))}
async function lookupManual(){
 if(busy)return;const input=$('aegis-chat-input'),query=input?.value.trim();if(!query)return;busy=true;const button=$('aegis-chat-manual');if(button)button.disabled=true;
 try{await window.AEGIS_FM?.ready;const t=performance.now(),hits=window.AEGIS_FM?.search(query,3)||[];if(!hits.length){setStatus('No matching manual passage. Try a more specific topic.');return;}
 history.push({role:'user',text:query.slice(0,MAX_CHARS)});history.push({role:'assistant',mode:'manual',text:'Source excerpts from FM 3-05.70 (May 2002), not an AI-generated answer. Historical guidance may be outdated.\n\n'+hits.map(r=>'PDF page '+r.page+(r.label?' · printed '+r.label:'')+'\n'+r.text).join('\n\n'),sources:hits.map(r=>({page:r.page,label:r.label}))});history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Manual lookup: '+Math.round(performance.now()-t)+' ms · no model inference and no cloud request.');
 }catch(e){setStatus('Manual lookup unavailable: '+e.message)}finally{busy=false;if(button)button.disabled=false;}
}

async function lookupGuides(){
 if(busy)return;const input=$('aegis-chat-input'),text=input?.value.trim();if(!text)return;busy=true;
 try{const messages=[...history,{role:'user',text}],query=resolve(messages);const guides=window.AEGIS_INTELLIGENCE?.rank(query,window.AEGIS_PHASE3?.catalog()||[],3)||[];
 await window.AEGIS_FM?.ready;const hits=window.AEGIS_FM?.search?.(query,2)||[];
 const stock=window.AEGIS_INTELLIGENCE?.facts(messages)||[];
 const sections=guides.map(g=>g.title+'\nMaterials: '+g.materials+'\n'+(Array.isArray(g.steps)?g.steps.map((s,i)=>(i+1)+'. '+(Array.isArray(s)?s.join(': '):String(s))).join('\n'):String(g.steps))+'\nLimits: '+g.caution);
 if(!sections.length)sections.push(...hits.map(r=>'FM PDF page '+r.page+'\n'+r.text));
 const answer=(sections.length?'Bundled guide lookup · original reference text, not an AI answer. No suitability assessment or substitutions have been generated.\n\n':'No matching bundled guide found. Name a specific skill, material or project.\n\n')+(stock.length?'Your reported equipment: '+stock.map(x=>x.item+' ('+x.status+')').join(', ')+'. Availability and condition are unverified.\n\n':'')+sections.join('\n\n— — —\n\n');
 history.push({role:'user',text:text.slice(0,MAX_CHARS)},{role:'assistant',mode:'manual',text:answer,sources:sections.length&&!guides.length?hits.map(r=>({page:r.page,label:r.label})):[]});history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Guide lookup complete · no model inference or cloud request.');
 }catch(e){setStatus('Guide lookup failed: '+e.message)}finally{busy=false}
}

async function refresh(){
 const model=window.AEGISNative||window.AEGISWebLLM;if(!model?.status){setStatus('Model interface loading. Please wait or reload AEGIS.');return false}
 try{const s=await model.status();if(s.ready&&s.integrity_ok){setStatus('Local AI ready · '+s.model+' · '+(navigator.onLine?'online available':'OFFLINE')+' · No cloud requests');return true}setStatus('Local AI not ready: '+(s.reason||s.state||'unknown')+'. Open Device at the top to download or retry the model.');return false}catch(e){setStatus('Model status error: '+e.message);return false}
}
async function send(continuation=false){
 // Event handlers pass a MouseEvent, not a continuation flag.
 continuation=continuation===true;
 if(busy)return;const input=$('aegis-chat-input');const text=continuation?'Continue exactly where the previous answer stopped. Finish the remaining steps without restarting.':input?.value.trim();if(!text)return;
 const model=window.AEGISNative||window.AEGISWebLLM;const mode=$('aegis-response-mode')?.value||'auto';
 if(mode==='guide'&&!continuation){await lookupGuides();return}
 if(!continuation&&mode!=='guide'){const plan=window.AEGIS_ASSISTANT_PLANNING?.answer([...history,{role:'user',text}]);if(plan){history.push({role:'user',text:text.slice(0,MAX_CHARS)},plan);history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Pantry plan complete · uses your reported ingredients and latest corrections · no download or model wait');return}const answer=window.AEGIS_FIELD_ANSWERS?.answer([...history,{role:'user',text}],window.AEGIS_PHASE3?.catalog?.()||[]);if(answer){history.push({role:'user',text:text.slice(0,MAX_CHARS)},answer);history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Guide-backed answer · '+answer.guide+' · no model wait or network request');return}}
 if(!await refresh()){if(mode==='auto')await lookupGuides();return;}
 busy=true;const btn=$('aegis-chat-send');if(btn)btn.disabled=true;
 history.push({role:'user',text:text.slice(0,MAX_CHARS)});history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Thinking locally on this device… This can take a while on a CPU.');
 try{await window.AEGIS_FM?.ready;const request=promptFor(history);let sources=request.sources;const started=performance.now();if(continuation){
 const previous=history.slice(0,-1);const prior=[...previous.filter(m=>m.role==='user'&&!m.text.startsWith('Continue exactly where')).slice(-2),...previous.filter(m=>m.role==='assistant').slice(-1)];sources=[];
 request.messages=[{role:'system',content:'You are AEGIS. Continue the unfinished assistant answer. Do not restart or repeat it. Finish the steps concisely. Latest user constraints still apply.'},...prior.map(m=>({role:m.role,content:m.text.slice(-1200)})),{role:'user',content:text}];
 }
 const result=model.completeDetailed?await model.completeDetailed(request):{text:await model.complete(request),finish_reason:'unknown'};
 const output=result.text;try{localStorage.setItem('aegis.chat.timing.v46',JSON.stringify({seconds:(performance.now()-started)/1000,model:'local',time:new Date().toISOString()}))}catch{};const clean=(window.AEGIS_TEMPERATURE?.normalize(String(output||''))||String(output||'')).replace(/<\|im_end\|>[\s\S]*$/,'').trim();if(!clean)throw new Error('The local model returned an empty response');const incomplete=result.finish_reason==='length'||clean.length>100&&!/[.!?…:][\s\"'’”)*_]*$/.test(clean);history.push({role:'assistant',incomplete,finish_reason:result.finish_reason,text:clean||'The local model returned an empty response. Try a shorter question.',sources});history=history.slice(-LIMIT);persist();draw();setStatus((incomplete?'Response limit reached · use Continue answer':'Local answer finished')+' · '+((performance.now()-started)/1000).toFixed(1)+' seconds · references are retrieved context, not verified citations.')}catch(e){history.push({role:'assistant',text:'Local inference error: '+(e?.message||String(e))+'. Your question is saved; try again after checking the model in Device setup.'});persist();draw()}
 finally{busy=false;if(btn)btn.disabled=false;draw();input?.focus()}
}
function download(){const a=el('a');const blob=new Blob([JSON.stringify({format:'AEGIS-CHAT',version:1,exported:new Date().toISOString(),messages:history},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);a.href=url;a.download='aegis-offline-chat.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000)}
function init(){if(!$('aegis-chat-root'))return;draw();refresh();
 const tools=el('div');tools.className='panel';tools.id='aegis-coach';
 const label=el('label','Response mode');label.htmlFor='aegis-response-mode';const mode=el('select');mode.id='aegis-response-mode';
 for(const [value,name]of [['auto','Auto · guide-backed practical answers + local AI'],['guide','Guide lookup · instant, no model'],['ai','Local AI + guide-backed practical answers']]){const o=el('option',name);o.value=value;mode.append(o)}
 tools.append(el('h3','Field assistant'),el('p','Follow-up questions use recent conversation context. Guide lookup returns bundled source text; it does not generate an answer.'),label,mode);
 $('aegis-chat-thread').before(tools);
 const presets=el('div');presets.className='bc-actions';for(const title of ['Teach me a bowline knot','How do I build a tarp shelter?','How do I prepare tinder?']){const b=el('button',title);b.type='button';b.onclick=()=>{$('aegis-chat-input').value=title;$('aegis-chat-input').focus()};presets.append(b)}tools.append(presets);

 const sendButton=$('aegis-chat-send');if(sendButton){const label=()=>sendButton.textContent=mode.value==='ai'?'Send to local AI':'Ask AEGIS';mode.addEventListener('change',label);label();sendButton.addEventListener('click',send);}$('aegis-chat-manual')?.addEventListener('click',lookupManual);
 $('aegis-chat-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
 $('aegis-chat-check')?.addEventListener('click',refresh);
 $('aegis-chat-export')?.addEventListener('click',download);
 $('aegis-chat-clear')?.addEventListener('click',()=>{if(!busy&&confirm('Erase locally saved AEGIS AI conversation?')){history=[];persist();draw();setStatus('Local conversation cleared.')}});
 window.addEventListener('aegis-llm-state',()=>{if(!busy)refresh()});
 window.addEventListener('aegis-llm-ready',()=>{if(!busy)refresh()});
}
window.AEGIS_CHAT={references,promptFor,getHistory:()=>history.map(x=>({...x}))};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
