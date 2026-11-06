/* AEGIS Broadcast v16: Supabase Auth + RLS. Publishable key is public; NEVER embed secret/service keys. */
(()=>{'use strict';
const BASE='https://zsyfzgefyjydkvdgbyth.supabase.co';
const KEY='sb_publishable_6xebiARfz9Lhx1eoT4bbCQ_7pIvrprQ';
const headers={'apikey':KEY,'Content-Type':'application/json'};
const $=id=>document.getElementById(id);
const saved='aegis-live-broadcast-v16',seen='aegis-alert-seen-v14';
let messages=[],session=null,checked='';
function el(tag,value){const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);return e}
function local(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function persist(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
function formatSeverity(s){return ({general:'GENERAL',notice:'NOTICE',warning:'WARNING',emergency:'EMERGENCY'})[s]||'GENERAL'}
function render(){
 const root=$('aegis-alert-list'),badge=$('aegis-alert-badge'),status=$('aegis-alert-status');if(!root)return;
 const viewed=local(seen,[]);const unseen=messages.filter(m=>!viewed.includes(m.id)).length;
 if(badge)badge.textContent=unseen?' ('+unseen+' new)':'';
 if(status)status.textContent=checked?'Last check: '+checked:'Saved messages · online sync pending';
 root.replaceChildren();
 if(!messages.length)root.append(el('p','No broadcast messages received yet.'));
 for(const m of messages){const card=el('article');card.className='panel';const heading=el('h3',m.title);const severity=el('strong',formatSeverity(m.severity));if(m.severity==='emergency')severity.style.color='#f87171';if(m.severity==='warning')severity.style.color='#fbbf24';const body=el('p',m.body);body.style.whiteSpace='pre-wrap';const date=el('p',m.created_at?new Date(m.created_at).toLocaleString():'');date.className='muted';card.append(severity,heading,body,date);root.append(card)}
}
async function load(){
 if(!navigator.onLine){render();return}
 try{const res=await fetch(BASE+'/rest/v1/aegis_messages?select=id,title,body,severity,created_at&published=eq.true&order=created_at.desc&limit=100',{headers:{apikey:KEY},cache:'no-store'});if(!res.ok)throw Error('Feed '+res.status);const rows=await res.json();if(!Array.isArray(rows))throw Error('Unexpected feed');messages=rows.filter(m=>m&&typeof m.id==='string'&&typeof m.title==='string'&&typeof m.body==='string');persist(saved,messages);checked=new Date().toLocaleString()}catch(e){const s=$('aegis-alert-status');if(s)s.textContent='Could not check messages: '+e.message}render();
}
async function request(path,body,access){const res=await fetch(BASE+path,{method:'POST',headers:{...headers,...(access?{Authorization:'Bearer '+access}:{})},body:JSON.stringify(body),cache:'no-store'});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.msg||data.error_description||data.message||'Request rejected: '+res.status);return data}
function admin(){
 const root=$('aegis-admin-root');if(!root)return;
 const form=el('form'),u=el('label','Administrator username'),username=el('input'),e=el('label','Supabase account email'),email=el('input'),p=el('label','Account password'),password=el('input'),submit=el('button','Sign in securely'),status=el('p');
 username.value='ADMIN-EMB';username.required=true;email.type='email';email.required=true;email.autocomplete='email';password.type='password';password.required=true;password.autocomplete='current-password';submit.type='submit';status.setAttribute('role','status');u.append(username);e.append(email);p.append(password);form.append(u,e,p,submit,status);
 const composer=el('section');composer.hidden=true;const title=el('h3','Publish broadcast');const level=el('select');for(const [v,t] of [['general','General alert'],['notice','Community notice'],['warning','Important warning'],['emergency','Emergency alert']]){const option=el('option',t);option.value=v;level.append(option)}
 const subject=el('input');subject.placeholder='Subject';subject.maxLength=180;const body=el('textarea');body.placeholder='Write a broadcast message…';body.maxLength=2500;const send=el('button','Send to all inboxes'),logout=el('button','Lock admin');send.type='button';logout.type='button';composer.append(title,level,subject,body,send,logout);root.replaceChildren(form,composer);
 form.addEventListener('submit',async ev=>{ev.preventDefault();if(username.value.trim()!=='ADMIN-EMB'){status.textContent='Invalid administrator username';return}submit.disabled=true;status.textContent='Verifying account…';try{const login=await request('/auth/v1/token?grant_type=password',{email:email.value.trim(),password:password.value});password.value='';const token=login.access_token;if(!token)throw Error('No session returned');const check=await fetch(BASE+'/rest/v1/aegis_messages?select=id&limit=0',{headers:{apikey:KEY,Authorization:'Bearer '+token}});if(!check.ok)throw Error('Unable to verify account');session=token;form.hidden=true;composer.hidden=false;status.textContent='';}catch(err){session=null;status.textContent=err.message}finally{submit.disabled=false}});
 send.addEventListener('click',async()=>{if(!session)return;if(!subject.value.trim()||!body.value.trim()){alert('Subject and message required');return}if(!confirm('Publish '+level.value+' alert to all AEGIS users?'))return;send.disabled=true;try{const result=await fetch(BASE+'/rest/v1/aegis_messages',{method:'POST',headers:{...headers,Authorization:'Bearer '+session,Prefer:'return=representation'},body:JSON.stringify({title:subject.value.trim(),body:body.value.trim(),severity:level.value,author_id:parseJwt(session).sub,published:true})});if(!result.ok){const error=await result.json().catch(()=>({}));throw Error(error.message||'Not authorized to publish ('+result.status+')')}subject.value='';body.value='';alert('Published successfully.');await load()}catch(err){alert('Message not sent: '+err.message)}finally{send.disabled=false}});
 logout.addEventListener('click',()=>{session=null;composer.hidden=true;form.hidden=false;password.value=''});
 window.addEventListener('pagehide',()=>{session=null;composer.hidden=true;form.hidden=false});
}
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return {}}}
function init(){messages=local(saved,[]);render();admin();$('aegis-alert-refresh')?.addEventListener('click',load);$('aegis-alert-mark-read')?.addEventListener('click',()=>{persist(seen,messages.map(m=>m.id));render()});window.addEventListener('online',load);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});load();setInterval(()=>{if(!document.hidden)load()},15*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();