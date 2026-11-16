import webpush from 'npm:web-push@3.6.7';
import './language-filter.js';
const ORIGIN='https://boddyeric1-gif.github.io';
const PUBLIC_KEY='BCFT54MO8240pW9JIXg3bG257Hur0St23vzsL4cb2eqICD2dWGKGSyd9FWZcTLNhboWtFwFAGW4X7dtV3q55YKs';
const enc=new TextEncoder();
const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type,apikey,authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Expose-Headers':'Retry-After','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...cors,...extra}});
const base=()=>Deno.env.get('SUPABASE_URL');
const secret=()=>Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const serviceHeaders=()=>({apikey:secret(),Authorization:'Bearer '+secret(),'Content-Type':'application/json'});
async function db(path,method='GET',body){const response=await fetch(base()+'/rest/v1/'+path,{method,headers:{...serviceHeaders(),Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)})});if(!response.ok)throw Error('Community database request failed ('+response.status+')');return response.status===204?null:response.json()}
const hex=b=>[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function hash(label,value){const key=await crypto.subtle.importKey('raw',enc.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(label+':'+value)))}
function clientKey(value){if(typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value))throw Error('Invalid device key');return value}
function fields(input){const signature=String(input.signature||'').trim(),body=String(input.body||'').trim();if(!signature||signature.length>32||!body||body.length>1200||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(signature+body))throw Error('Enter a name (1–32 characters) and message (1–1200 characters).');return{signature,body}}
const unb64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),ch=>ch.charCodeAt(0));
async function adminAuthorized(token){try{const parts=String(token||'').split('.');if(parts.length!==2)return false;const key=await crypto.subtle.importKey('raw',enc.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['verify']);if(!await crypto.subtle.verify('HMAC',key,unb64(parts[1]),enc.encode(parts[0])))return false;const claims=JSON.parse(new TextDecoder().decode(unb64(parts[0])));return claims.scope==='aegis-broadcast'&&claims.exp>Date.now()&&claims.exp<Date.now()+3600000}catch{return false}}
function validSubscription(sub){try{const u=new URL(sub.endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&u.href.length<=2048&&/(^|\.)(push\.apple\.com|push\.services\.mozilla\.com|fcm\.googleapis\.com|notify\.windows\.com)$/.test(u.hostname)&&typeof sub.keys?.auth==='string'&&/^[A-Za-z0-9_-]{20,64}$/.test(sub.keys.auth)&&typeof sub.keys?.p256dh==='string'&&/^[A-Za-z0-9_-]{80,140}$/.test(sub.keys.p256dh)}catch{return false}}
async function pushCommunity(message,authorHash){
 const subscribers=await db('aegis_community_subscriptions?select=endpoint,subscription&client_hash=neq.'+authorHash+'&limit=1000');if(!subscribers?.length)return;
 const config=await db('rpc/aegis_push_signing_config','POST',{});if(!config?.private_key)throw Error('Community push signing unavailable');
 webpush.setVapidDetails('mailto:emb.creations.llc@gmail.com',PUBLIC_KEY,config.private_key);
 const payload=JSON.stringify({title:'AEGIS · Community Chat',body:message.signature+': '+message.body.slice(0,140),tag:'aegis-community-chat',section:'community',url:ORIGIN+'/aegis-survival/?section=community'});
 for(let i=0;i<subscribers.length;i+=20)await Promise.all(subscribers.slice(i,i+20).map(async sub=>{try{await webpush.sendNotification(sub.subscription,payload,{TTL:600})}catch(e){if(e?.statusCode===404||e?.statusCode===410)await db('aegis_community_subscriptions?endpoint=eq.'+encodeURIComponent(sub.endpoint),'DELETE');else console.warn('Community push delivery failed',e?.statusCode||'network')}}));
}
async function readInput(req){const reader=req.body?.getReader();if(!reader)return{};let count=0;const chunks=[];for(;;){const result=await reader.read();if(result.done)break;count+=result.value.byteLength;if(count>16384){await reader.cancel();throw Error('Request too large')}chunks.push(result.value)}const buffer=new Uint8Array(count);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength}return JSON.parse(new TextDecoder().decode(buffer))}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.headers.get('origin')!==ORIGIN)return reply({error:'Origin not allowed'},403);
 const action=new URL(req.url).pathname.split('/').filter(Boolean).at(-1);
 try{
  if(req.method==='GET'&&action==='messages')return reply({messages:await db('aegis_community_messages?select=id,signature,body,created_at&hidden=eq.false&order=created_at.desc,id.desc&limit=100'),server_time:new Date().toISOString()});
  if(req.method!=='POST')return reply({error:'Method not allowed'},405);
  let input;try{input=await readInput(req)}catch{return reply({error:'Invalid or oversized request'},400)}
  if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid request'},400);
  if(action==='moderate'||action==='moderation'){
   if(!await adminAuthorized((req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')))return reply({error:'Admin session expired or unauthorized'},401);
   if(action==='moderation')return reply({messages:await db('aegis_community_messages?select=id,signature,body,created_at,hidden&order=created_at.desc,id.desc&limit=50')});
   if(!/^[a-f0-9-]{36}$/i.test(String(input.id||'')))return reply({error:'Invalid message'},400);
   const rows=await db('aegis_community_messages?id=eq.'+input.id,'PATCH',{hidden:true});return rows?.length?reply({ok:true}):reply({error:'Message not found'},404);
  }
  if(!['send','subscribe','unsubscribe','status'].includes(action))return reply({error:'Unknown endpoint'},404);
  let clientHash;try{clientHash=await hash('community-client',clientKey(input.client_key))}catch{return reply({error:'Device key is missing or invalid'},400)}
  if(action==='status'){
   const rows=await db('aegis_community_moderation?select=muted_until&client_hash=eq.'+clientHash+'&limit=1');
   const until=Date.parse(rows?.[0]?.muted_until||'');const remaining=Number.isFinite(until)?Math.max(0,Math.ceil((until-Date.now())/1000)):0;
   const attempts=await db('aegis_community_restricted_attempts?select=request_id&client_hash=eq.'+clientHash+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-3600000).toISOString())+'&limit=3');
   return reply({muted:remaining>0,muted_until:remaining?new Date(until).toISOString():null,retry_after:remaining,remaining_attempts:remaining?0:Math.max(0,3-attempts.length)});
  }
  if(action==='subscribe'){
   if(!validSubscription(input.subscription))return reply({error:'Invalid push subscription'},400);
   const row={endpoint:input.subscription.endpoint,client_hash:clientHash,subscription:input.subscription,updated_at:new Date().toISOString()};
   const response=await fetch(base()+'/rest/v1/aegis_community_subscriptions?on_conflict=endpoint',{method:'POST',headers:{...serviceHeaders(),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});
   return response.ok?reply({ok:true}):reply({error:'Could not enable community notifications'},502);
  }
  if(action==='unsubscribe'){
   if(typeof input.endpoint!=='string'||input.endpoint.length>2048)return reply({error:'Invalid subscription'},400);
   await db('aegis_community_subscriptions?client_hash=eq.'+clientHash+'&endpoint=eq.'+encodeURIComponent(input.endpoint),'DELETE');return reply({ok:true});
  }
  let content;try{content=fields(input)}catch(e){return reply({error:e.message},400)}
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(String(input.request_id||'')))return reply({error:'Invalid request ID'},400);
  const network=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||req.headers.get('cf-connecting-ip')||'unknown';
  const result=await db('rpc/aegis_community_attempt','POST',{p_client_hash:clientHash,p_network_hash:await hash('community-network',network),p_request_id:input.request_id,p_signature:content.signature,p_body:content.body,p_restricted:globalThis.AEGIS_COMMUNITY_FILTER.hasFoulLanguage(content.signature)||globalThis.AEGIS_COMMUNITY_FILTER.hasFoulLanguage(content.body)});
  if(result.muted)return reply({error:'Messages are disabled for one hour after three restricted attempts. You can still read chat.',...result},423,{'Retry-After':String(result.retry_after)});
  if(result.restricted)return reply({error:'Please remove foul language from your name or message. Damn, hell and crap are allowed.',...result},422);
  if(!result.ok)return reply({error:'Please wait before sending another message.',retry_after:result.retry_after},429,{'Retry-After':String(result.retry_after)});
  if(!result.duplicate)EdgeRuntime.waitUntil(pushCommunity(result.message,clientHash).catch(()=>console.warn('Community notification dispatch did not complete')));
  return reply(result);
 }catch(e){console.warn('Community API failure',e instanceof Error?e.message:'unknown');return reply({error:'Community chat is temporarily unavailable. Your draft is kept; retry shortly.'},503)}
});
