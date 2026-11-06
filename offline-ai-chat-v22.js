/* AEGIS v22: real local-model chat. Never sends conversation to a server. */
(()=>{'use strict';
const KEY='aegis.chat.v22',LIMIT=24,MAX_CHARS=2500;
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);return n};
let history=[],busy=false;
try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(a))history=a.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.text==='string').slice(-LIMIT)}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(history.slice(-LIMIT)))}catch{setStatus('Local chat storage unavailable. Export your conversation if needed.')}};
const setStatus=s=>{const n=$('aegis-chat-status');if(n)n.textContent=s};
function draw(){
 const root=$('aegis-chat-thread');if(!root)return;root.replaceChildren();
 if(!history.length){const hint=el('p','Ask a question or describe a survival situation. AEGIS will use the locally installed language model when it is ready.');hint.className='muted';root.append(hint)}
 history.forEach(m=>{const wrap=el('article');wrap.className='panel';wrap.style.cssText='margin:8px 0;max-width:94%;'+(m.role==='user'?'margin-left:auto;border-color:#b89150;background:#29241b':'margin-right:auto');const title=el('strong',m.role==='user'?'You':'AEGIS · Offline AI');const body=el('div',m.text);body.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;margin-top:7px';wrap.append(title,body);root.append(wrap)});
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
 const last=messages[messages.length-1],previous=messages.slice(-7,-1);
 const prior=previous.map(m=>(m.role==='user'?'User':'Assistant')+': '+m.text.slice(0,320)).join('\n');
 const source=references(last.text);
 return {system:'You are AEGIS, a compact offline survival field assistant. Converse naturally and answer the actual user question. You are a small local model, not a professional or emergency service. Never invent certainty, measurements, or sources. For dangerous medical emergencies tell the user to seek emergency services when available. Avoid suggesting unsafe wild plant consumption or unverified treatments. Use supplied offline guide snippets as context only; if they do not answer the question, say so. Keep responses practical, concise and clear.',user:(prior?'Conversation context:\n'+prior+'\n\n':'')+(source?'Potentially relevant local Field Guide snippets (not independently verified):\n'+source+'\n\n':'')+'User: '+last.text,max_tokens:Math.max(64,Math.min(300,Number($('aegis-chat-length')?.value)||200))};
}
async function refresh(){
 const model=window.AEGISNative||window.AEGISWebLLM;if(!model?.status){setStatus('Model interface loading. Please wait or reload AEGIS.');return false}
 try{const s=await model.status();if(s.ready&&s.integrity_ok){setStatus('Local AI ready · '+s.model+' · '+(navigator.onLine?'online available':'OFFLINE')+' · No cloud requests');return true}setStatus('Local AI not ready: '+(s.reason||s.state||'unknown')+'. Download or retry the model from Home.');return false}catch(e){setStatus('Model status error: '+e.message);return false}
}
async function send(){
 if(busy)return;const input=$('aegis-chat-input');const text=input?.value.trim();if(!text)return;
 const model=window.AEGISNative||window.AEGISWebLLM;if(!await refresh())return;
 busy=true;const btn=$('aegis-chat-send');if(btn)btn.disabled=true;
 history.push({role:'user',text:text.slice(0,MAX_CHARS)});history=history.slice(-LIMIT);input.value='';persist();draw();setStatus('Thinking locally on this device… This can take a while on a CPU.');
 try{const output=await model.complete(promptFor(history));const clean=String(output||'').replace(/<\|im_end\|>[\s\S]*$/,'').trim();history.push({role:'assistant',text:clean||'The local model returned an empty response. Try a shorter question.'});history=history.slice(-LIMIT);persist();draw()}catch(e){history.push({role:'assistant',text:'Local inference error: '+(e?.message||String(e))+'. Your question is saved; try again after checking the model on Home.'});persist();draw()}
 finally{busy=false;if(btn)btn.disabled=false;await refresh();input?.focus()}
}
function download(){const a=el('a');const blob=new Blob([JSON.stringify({format:'AEGIS-CHAT',version:1,exported:new Date().toISOString(),messages:history},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);a.href=url;a.download='aegis-offline-chat.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000)}
function init(){if(!$('aegis-chat-root'))return;draw();refresh();
 $('aegis-chat-send')?.addEventListener('click',send);
 $('aegis-chat-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
 $('aegis-chat-check')?.addEventListener('click',refresh);
 $('aegis-chat-export')?.addEventListener('click',download);
 $('aegis-chat-clear')?.addEventListener('click',()=>{if(confirm('Erase locally saved AEGIS AI conversation?')){history=[];persist();draw();setStatus('Local conversation cleared.')}});
 window.addEventListener('aegis-llm-state',()=>{if(!busy)refresh()});
 window.addEventListener('aegis-llm-ready',()=>{if(!busy)refresh()});
}
window.AEGIS_CHAT={references,promptFor,getHistory:()=>history.map(x=>({...x}))};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();