/* AEGIS Broadcast v16: Supabase Auth + RLS. Publishable key is public; NEVER embed secret/service keys. */
(()=>{'use strict';
const BASE='https://zsyfzgefyjydkvdgbyth.supabase.co';
const ADMIN_EMAIL='emb.creations.llc@gmail.com';
const KEY='sb_publishable_6xebiARfz9Lhx1eoT4bbCQ_7pIvrprQ';
const headers={'apikey':KEY,'Content-Type':'application/json'};
const $=id=>document.getElementById(id);
const saved='aegis-live-broadcast-v16',seen='aegis-alert-seen-v14';
let messages=[],session=null,checked='',initialSync=true;
const notifiedKey='aegis-notified-ids-v19';
const PUSH_API=BASE+'/functions/v1/aegis-push';
const PUSH_KEY='BN_zl6dLiSIDtCgcCw-r5fOGOIxuTlAIGQmqA2Rak4G7VtuJDAqiSCuGxM9jhQs4lX7kfaIfKlXFgIM-jCdMq3Y';
function pushBytes(s){const p=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(p+'='.repeat((4-p.length%4)%4)),ch=>ch.charCodeAt(0))}
async function enablePush(){
 if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Background push is not supported here. On iPhone, open AEGIS from its Home Screen icon (iOS 16.4+).');
 const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Notification permission is '+permission+'. Enable it in your device settings.');
 const registration=await navigator.serviceWorker.ready;
 let subscription=await registration.pushManager.getSubscription();
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushBytes(PUSH_KEY)});
 const response=await fetch(PUSH_API+'/subscribe',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY},body:JSON.stringify({subscription:subscription.toJSON()}),cache:'no-store'});
 if(!response.ok)throw Error('Push registration failed ('+response.status+'). Please try again.');
 return true;
}

function el(tag,value){const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);return e}
function local(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function persist(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
function formatSeverity(s){return ({general:'GENERAL',notice:'NOTICE',warning:'WARNING',emergency:'EMERGENCY'})[s]||'GENERAL'}
function render(){
 const root=$('aegis-alert-list'),badge=$('aegis-alert-badge'),status=$('aegis-alert-status');if(!root)return;
 const viewed=local(seen,[]);const unseen=messages.filter(m=>!viewed.includes(m.id)).length;
 const urgent=messages.find(m=>!viewed.includes(m.id)&&(m.severity==='emergency'||m.severity==='warning'));
 const banner=$('aegis-urgent-banner');if(banner){banner.hidden=!urgent;if(urgent){banner.replaceChildren();const title=el('strong',(urgent.severity==='emergency'?'EMERGENCY':'IMPORTANT')+' · '+urgent.title);const body=el('span',' — '+urgent.body.slice(0,220));const go=el('button','Open Messages');go.type='button';go.addEventListener('click',()=>{document.querySelector('[data-tab="messages"]')?.click()});banner.append(title,body,go)}}
 if(badge)badge.textContent=unseen?' ('+unseen+' new)':'';
 const label=$('aegis-unread-counter');if(label)label.textContent=unseen?unseen+' unread messages':'All messages read';
 if(status)status.textContent=checked?'Last check: '+checked:'Saved messages · online sync pending';
 root.replaceChildren();
 if(!messages.length)root.append(el('p','No broadcast messages received yet.'));
 for(const m of messages){const card=el('article');card.className='panel';const heading=el('h3',m.title);const severity=el('strong',formatSeverity(m.severity));if(m.severity==='emergency')severity.style.color='#f87171';if(m.severity==='warning')severity.style.color='#fbbf24';const body=el('p',m.body);body.style.whiteSpace='pre-wrap';const date=el('p',m.created_at?new Date(m.created_at).toLocaleString():'');date.className='muted';card.append(severity,heading,body,date);root.append(card)}
}
async function load(){
 if(!navigator.onLine){render();return}
 try{const res=await fetch(BASE+'/rest/v1/aegis_messages?select=id,title,body,severity,created_at&published=eq.true&order=created_at.desc&limit=100',{headers:{apikey:KEY},cache:'no-store'});if(!res.ok)throw Error('Feed '+res.status);const rows=await res.json();if(!Array.isArray(rows))throw Error('Unexpected feed');messages=rows.filter(m=>m&&typeof m.id==='string'&&typeof m.title==='string'&&typeof m.body==='string');notifyNew(messages);persist(saved,messages);checked=new Date().toLocaleString()}catch(e){const s=$('aegis-alert-status');if(s)s.textContent='Could not check messages: '+e.message}render();
}
function notifyNew(rows){const previous=local(notifiedKey,[]);if(initialSync){initialSync=false;persist(notifiedKey,rows.map(m=>m.id).slice(0,150));return}const fresh=rows.filter(m=>!previous.includes(m.id));persist(notifiedKey,[...new Set([...rows.map(m=>m.id),...previous])].slice(0,200));if(!fresh.length)return;const urgent=fresh.find(m=>m.severity==='emergency')||fresh.find(m=>m.severity==='warning')||fresh[0];if('Notification' in window&&Notification.permission==='granted'&&document.visibilityState==='visible'){try{new Notification('AEGIS · '+formatSeverity(urgent.severity),{body:urgent.title+' — '+urgent.body.slice(0,120),tag:'aegis-'+urgent.id})}catch{}}}
async function request(path,body,access){const res=await fetch(BASE+path,{method:'POST',headers:{...headers,...(access?{Authorization:'Bearer '+access}:{})},body:JSON.stringify(body),cache:'no-store'});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.msg||data.error_description||data.message||'Request rejected: '+res.status);return data}
function admin(){
 const root=$('aegis-admin-root');if(!root)return;
 const api=BASE+'/functions/v1/aegis-admin';
 const form=el('form'),u=el('label','Administrator username'),username=el('input'),p=el('label','Password'),password=el('input'),submit=el('button','Unlock admin panel'),status=el('p');
 username.autocomplete='username';username.placeholder='Username';username.required=true;
 password.type='password';password.autocomplete='current-password';password.placeholder='Password';password.required=true;
 submit.type='submit';status.setAttribute('role','status');u.append(username);p.append(password);form.append(u,p,submit,status);
 const composer=el('section');composer.hidden=true;const title=el('h3','Publish broadcast'),level=el('select');
 for(const [v,t] of [['general','General alert'],['notice','Community notice'],['warning','Important warning'],['emergency','Emergency alert']]){const o=el('option',t);o.value=v;level.append(o)}
 const subject=el('input');subject.placeholder='Subject';subject.maxLength=180;
 const body=el('textarea');body.placeholder='Write a broadcast message…';body.maxLength=2500;
 const send=el('button','Send to all inboxes'),logout=el('button','Lock admin');send.type='button';logout.type='button';composer.append(title,level,subject,body,send,logout);root.replaceChildren(form,composer);
 async function request(action,data,token){const res=await fetch(api+'/'+action,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data),cache:'no-store'});const json=await res.json().catch(()=>({}));if(!res.ok)throw Error(json.error||'Server rejected request ('+res.status+')');return json}
 let adminToken='';
 form.addEventListener('submit',async ev=>{ev.preventDefault();submit.disabled=true;status.textContent='Authenticating…';try{const result=await request('login',{username:username.value.trim(),password:password.value});if(!result.token)throw Error('No session returned');adminToken=result.token;password.value='';form.hidden=true;composer.hidden=false;status.textContent=''}catch(e){status.textContent=e.message}finally{submit.disabled=false}});
 send.addEventListener('click',async()=>{if(!adminToken)return;if(!subject.value.trim()||!body.value.trim()){alert('Subject and message required');return}if(!confirm('Publish '+level.value+' alert to all AEGIS users?'))return;send.disabled=true;try{await request('publish',{title:subject.value.trim(),body:body.value.trim(),severity:level.value},adminToken);
 let delivery='';try{
  const res=await fetch(PUSH_API+'/dispatch',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY},body:JSON.stringify({token:adminToken,title:'AEGIS · '+formatSeverity(level.value),body:subject.value.trim()+' — '+body.value.trim().slice(0,140),tag:'aegis-'+Date.now()})});
  const result=await res.json().catch(()=>({}));
  delivery=res.ok?' Background push sent to '+(result.sent||0)+' subscribed devices.': ' Background push failed ('+res.status+').';
 }catch(e){delivery=' Background push failed: '+e.message}
 subject.value='';body.value='';alert('Message published.'+delivery);await load()}catch(e){alert('Message not sent: '+e.message)}finally{send.disabled=false}});
 logout.addEventListener('click',()=>{adminToken='';composer.hidden=true;form.hidden=false;password.value='';status.textContent='Admin panel locked.'});
 window.addEventListener('pagehide',()=>{adminToken='';composer.hidden=true;form.hidden=false});
}
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return {}}}
function init(){messages=local(saved,[]);render();admin();$('aegis-notify-optin')?.addEventListener('click',async()=>{const status=$('aegis-notify-status');if(status)status.textContent='Enabling background push…';try{await enablePush();if(status)status.textContent='Background push enabled! AEGIS can alert you even when closed, while your device is online.'}catch(e){if(status)status.textContent=e.message}});$('aegis-alert-refresh')?.addEventListener('click',load);$('aegis-alert-mark-read')?.addEventListener('click',()=>{persist(seen,messages.map(m=>m.id));render()});navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='aegis-open-messages'){document.querySelector('[data-tab="messages"]')?.click();load()}});window.addEventListener('online',load);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});load();setInterval(()=>{if(!document.hidden)load()},15*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();