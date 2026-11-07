/* AEGIS v24: privacy-conscious daily visitors. No chats, location, IP or inventory sent. */
(()=>{'use strict';
const API='https://zsyfzgefyjydkvdgbyth.supabase.co/functions/v1/aegis-visitors';
const KEY='aegis.visitor.id.v24';
function id(){try{let x=localStorage.getItem(KEY);if(!x){x=crypto.randomUUID();localStorage.setItem(KEY,x)}return x}catch{return null}}
function source(){const p=new URLSearchParams(location.search),s=(p.get('utm_source')||'').toLowerCase();return ['reddit','hackernews','producthunt','devto'].includes(s)?s:(document.referrer.includes('reddit.com')?'reddit':'direct')}
async function visit(){if(!navigator.onLine)return;const session=id();if(!session)return;try{await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,source:source()}),signal:AbortSignal.timeout(5000)})}catch{/* analytics must never block offline use */}}
async function stats(){const r=await fetch(API,{signal:AbortSignal.timeout(5000),cache:'no-store'});if(!r.ok)throw Error('Unavailable');return r.json()}
function init(){
 const root=document.getElementById('aegis-visitor-panel');if(!root)return;
 const status=document.createElement('p');status.textContent='Visitor statistics load when connected.';root.append(status);
 const button=document.createElement('button');button.textContent='Refresh visitor stats';button.type='button';root.append(button);
 const render=async()=>{if(!navigator.onLine){status.textContent='Offline: visitor stats unavailable. AEGIS still works locally.';return}status.textContent='Loading visitor statistics…';try{const x=await stats();status.textContent=x.visits+' visits in 14 days · '+x.today+' today · Reddit: '+(x.sources?.reddit||0)+'. Counts are pseudonymous browser IDs per day, not downloads or distinct people.'+(x.capped?' Results capped.':'')}catch{status.textContent='Visitor statistics unavailable; AEGIS remains usable.'}};
 button.addEventListener('click',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
visit();
window.AEGIS_VISITORS={source};
})();