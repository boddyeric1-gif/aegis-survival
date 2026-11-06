/* Offline-first updates and announcements. Static publisher: edit announcements.json on main. */
(()=>{'use strict';
const key='aegis-community-alerts-v14',updatesKey='aegis-updates-v14',seenKey='aegis-alert-seen-v14';
const $=id=>document.getElementById(id);
const fallback={schema:1,announcements:[]};
const releaseFallback={schema:1,releases:[]};
function read(key,otherwise){try{return JSON.parse(localStorage.getItem(key))||otherwise}catch{return otherwise}}
function store(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
function valid(feed){return feed&&Array.isArray(feed.announcements)&&feed.announcements.length<=100&&feed.announcements.every(a=>typeof a.id==='string'&&typeof a.title==='string'&&typeof a.body==='string'&&a.title.length<=180&&a.body.length<=2500)}
function validUpdates(feed){return feed&&Array.isArray(feed.releases)&&feed.releases.length<=100}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=String(value||'');if(cls)el.className=cls;return el}
let alerts=read(key,fallback),releases=read(updatesKey,releaseFallback),lastCheck=null;
function render(){
 const history=$('aegis-update-list');if(!history)return;
 history.replaceChildren();
 for(const r of releases.releases){const d=document.createElement('details');const summary=text('summary',(r.version||'Release')+' · '+(r.title||'Update')+' · '+(r.date||''));d.append(summary);const ul=document.createElement('ul');for(const change of (Array.isArray(r.changes)?r.changes:[]).slice(0,30)){ul.append(text('li',change))}d.append(ul);history.append(d)}
}
async function refresh(){
 if(!navigator.onLine){render();return}
 try{
  const u=await fetch('updates.json?check='+Date.now(),{cache:'no-store'});
  if(u.ok){const feed=await u.json();if(validUpdates(feed)){releases=feed;store(updatesKey,feed)}}
  lastCheck=new Date().toLocaleString();
 }catch{}render();
}
function init(){
 if(!$('aegis-update-list'))return;
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 window.addEventListener('online',refresh);
 render();refresh();setInterval(()=>{if(!document.hidden)refresh()},15*60*1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();