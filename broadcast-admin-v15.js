/* AEGIS Broadcast admin. Authentication and publishing must be verified by a separate backend.
   Never place credentials, password hashes, service keys or admin tokens in this file. */
(()=>{'use strict';
const endpoint=String(window.AEGIS_BROADCAST_API||'').replace(/\/+$/,'');
let token='';
function element(tag,value){const el=document.createElement(tag);if(value!==undefined)el.textContent=value;return el}
function init(){
 const root=document.getElementById('aegis-admin-root');if(!root)return;
 const form=element('form');const u=element('label','Admin username');const username=document.createElement('input');username.autocomplete='username';username.required=true;username.maxLength=100;u.append(username);
 const p=element('label','Password');const password=document.createElement('input');password.type='password';password.autocomplete='current-password';password.required=true;p.append(password);
 const login=element('button','Unlock admin console');login.type='submit';
 const status=element('p');status.setAttribute('role','status');form.append(u,p,login,status);
 const composer=element('section');composer.hidden=true;const title=element('h3','Compose broadcast');const level=element('select');
 for(const [value,label] of [['general','General announcement'],['notice','Community notice'],['warning','Important warning'],['emergency','Emergency alert']]){const o=element('option',label);o.value=value;level.append(o)}
 const subject=document.createElement('input');subject.placeholder='Message subject';subject.maxLength=180;subject.required=true;
 const body=document.createElement('textarea');body.placeholder='Write the announcement sent to all online AEGIS users…';body.maxLength=2500;body.required=true;
 const send=element('button','Publish to all users');send.type='button';const logout=element('button','Lock console');logout.type='button';composer.append(title,element('label','Severity'),level,element('label','Subject'),subject,element('label','Message'),body,send,logout);
 root.replaceChildren(form,composer);
 if(!endpoint){status.textContent='Publishing backend not configured. The login is intentionally locked until secure server authentication is connected.';login.disabled=true;return}
 async function request(path,data,access){const res=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json',...(access?{Authorization:'Bearer '+access}:{})},body:JSON.stringify(data),cache:'no-store'});const result=await res.json().catch(()=>({}));if(!res.ok)throw Error(result.error||'Server rejected request ('+res.status+')');return result}
 form.addEventListener('submit',async e=>{e.preventDefault();login.disabled=true;status.textContent='Verifying with server…';try{const result=await request('/login',{username:username.value,password:password.value});if(!result.token)throw Error('Missing server session');token=result.token;password.value='';form.hidden=true;composer.hidden=false;status.textContent=''}catch(err){status.textContent=err.message}finally{login.disabled=false}});
 send.addEventListener('click',async()=>{if(!token)return;if(!subject.value.trim()||!body.value.trim()){status.textContent='Subject and message are required.';return}if(!confirm('Publish this '+level.value+' message to every AEGIS inbox?'))return;send.disabled=true;try{await request('/publish',{severity:level.value,title:subject.value.trim(),body:body.value.trim()},token);subject.value='';body.value='';alert('Broadcast accepted by server. Users will see it after their next online check.');}catch(err){alert('Not published: '+err.message)}finally{send.disabled=false}});
 logout.addEventListener('click',()=>{token='';composer.hidden=true;form.hidden=false;password.value='';status.textContent='Admin console locked.'});
 window.addEventListener('pagehide',()=>{token='';composer.hidden=true;form.hidden=false});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();