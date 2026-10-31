// AEGIS in-browser language model bridge (PWA edition). ES module loaded only by the PWA-LLM build.
// Implements the same contract as the Android window.AEGISNative: status(), complete(q) + install(), retry(), verify(), selftest().
// Engine: wllama v3 (llama.cpp compiled to WebAssembly, MIT). Chrome/Android use the default build; Safari/iOS automatically use the bundled 'compat' build
// (no JSPI / Memory64). If WebGPU exists (Safari 26+) the GPU may be used (backend 'auto'); a crash while loading switches the next attempt to CPU.
// Honesty notes: (1) the model is DOWNLOADED ONCE from the same host as the app and cached on the device, so this edition is
// "provisioned", not bundled. (2) The model counts as ready only after every shard matched its SHA-256 and the engine loaded it.
// (3) If a load crashes the tab (iOS kills tabs that use too much memory), a crash flag disables auto-load next time.
import {Wllama} from './wllama.js';

const CFG=window.AEGIS_WEBLLM;                       // {name, license, nctx, shards:[{file,bytes,sha256}], base, wasm, gbnf}
const STORE='model-store-v1';                        // NOTE: must not start with "aegis-" (the service worker deletes those on update)
const LS=k=>'aegis.llm.'+k;
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const diag=[];const stage=(name,detail)=>{const entry={time:new Date().toISOString(),stage:name,detail};diag.push(entry);if(diag.length>40)diag.shift();try{localStorage.setItem(LS('lastStage'),JSON.stringify(entry))}catch(e){}window.dispatchEvent(new Event('aegis-llm-state'))};
let backend='none',wllama=null,loadStarted=0,state='NOT_INSTALLED',reason='the offline language model has not been downloaded yet',progress=0,integrity=false,loadSecs=-1;
const log=[];const note=m=>{log.push(new Date().toISOString().slice(11,19)+' '+m);if(log.length>60)log.shift()};
const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const shardUrl=s=>new URL(CFG.base+s.file,location.href).href;
let gbnfText=null;
async function gbnf(){if(gbnfText===null)gbnfText=await (await fetch(new URL(CFG.gbnf,location.href).href)).text();return gbnfText}

async function cachedBlobs(){            // returns Blob[] if every shard is present with the right size and was verified, else null
  if(!('caches' in self))return null;const c=await caches.open(STORE);const out=[];
  const ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}');
  for(const s of CFG.shards){const r=await c.match(shardUrl(s));if(!r)return null;const b=await r.blob();if(b.size!==s.bytes||ver[s.file]!==s.sha256)return null;out.push(b)}
  return [new Blob(out)];}   // chunks are concatenated in manifest order into ONE blob (the engine loads a single GGUF)

async function init(){                   // called on app start: never downloads; loads only if already installed and verified
  try{
    if(!('WebAssembly' in self)||!('caches' in self)||!self.crypto||!crypto.subtle){state='UNSUPPORTED';reason='this browser lacks WebAssembly, Cache storage or secure-context crypto (use https or localhost)';return}
    const have=await cachedBlobs();
    if(!have){const partial=Object.keys(JSON.parse(localStorage.getItem(LS('verified'))||'{}')).length;state='NOT_INSTALLED';reason=partial?'model download incomplete: tap Download to finish':'the offline language model has not been downloaded yet';return}
    if(localStorage.getItem(LS('loading'))){localStorage.setItem(LS('backend'),'cpu');state='DISABLED';reason='Previous model initialization was interrupted. The browser may have closed the app or exhausted memory. Model files remain installed; tap Retry once to use the conservative CPU configuration.';stage('INTERRUPTED',reason);return}
    integrity=true;await load(have);
  }catch(e){state='FAILED';reason=(e&&e.message||String(e))+' (rules-only mode)'}}

async function load(blobs){
  state='LOADING';reason='initializing local model runtime';progress=100;loadStarted=Date.now();stage('LOADING','starting model initialization');
  localStorage.setItem(LS('loading'),String(Date.now()));   // cleared only after success
  const t0=performance.now();
  const pref=localStorage.getItem(LS('backend'))||'auto';   // 'auto' | 'cpu'
  const useGpu=!IOS&&pref==='auto'&&!!navigator.gpu;
  if(IOS)localStorage.setItem(LS('backend'),'cpu');
  try{
    if(wllama){try{await wllama.exit()}catch(e){}}
    wllama=new Wllama({default:new URL(CFG.wasm,location.href).href},{suppressNativeLog:true,allowOffline:true});
    if(CFG.compat_wasm){const compat={wasm:new URL(CFG.compat_wasm,location.href).href};if(CFG.compat_worker)compat.worker=new URL(CFG.compat_worker,location.href).href;wllama.setCompat(compat)}
    stage('LOADING','runtime configured; loading GGUF on '+(IOS?'iOS CPU':'desktop/browser'));
    await wllama.loadModel(blobs,{n_ctx:IOS?512:(CFG.nctx||2048),n_threads:1,n_batch:IOS?32:256,n_gpu_layers:useGpu?999:0});
    backend=useGpu?'webgpu-requested':'cpu-wasm';loadSecs=(performance.now()-t0)/1000;localStorage.removeItem(LS('loading'));state='READY';reason='';stage('READY','model initialized (generation not yet verified)');note('model loaded in '+loadSecs.toFixed(1)+' s, backend '+backend);
  }catch(e){localStorage.removeItem(LS('loading'));state='FAILED';reason=(e&&e.message||String(e))+' (rules-only mode)';stage('FAILED',reason);throw e}}

// One-time download of all shards with per-shard SHA-256 verification into persistent Cache storage.
async function install(onProgress){
  if(state==='DOWNLOADING'||state==='VERIFYING'||state==='LOADING')return;
  try{
    state='DOWNLOADING';progress=0;integrity=false;
    if(navigator.storage&&navigator.storage.persist){try{note('persistent storage granted: '+await navigator.storage.persist())}catch(e){}}
    const total=CFG.shards.reduce((a,s)=>a+s.bytes,0);
    if(navigator.storage&&navigator.storage.estimate){const q=await navigator.storage.estimate();if(q.quota&&q.usage!==undefined&&q.quota-q.usage<total*1.15)throw new Error('not enough free browser storage: need about '+Math.ceil(total*1.15/1048576)+' MB free, have about '+Math.floor((q.quota-q.usage)/1048576)+' MB')}
    const c=await caches.open(STORE);const ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}');let done=0;
    for(const s of CFG.shards){
      const url=shardUrl(s);const hit=await c.match(url);
      if(hit&&ver[s.file]===s.sha256){const b=await hit.blob();if(b.size===s.bytes){done+=s.bytes;progress=Math.floor(done*100/total);continue}}
      await c.delete(url);delete ver[s.file];localStorage.setItem(LS('verified'),JSON.stringify(ver));
      reason='downloading offline language model: '+progress+'%';
      const resp=await fetch(url,{cache:'no-store'});if(!resp.ok)throw new Error('download failed ('+resp.status+') for '+s.file);
      const reader=resp.body.getReader();const parts=[];let got=0;
      for(;;){const {done:d,value}=await reader.read();if(d)break;parts.push(value);got+=value.length;progress=Math.floor((done+got)*100/total);reason='downloading offline language model: '+progress+'%';if(onProgress)onProgress(progress)}
      if(got!==s.bytes)throw new Error('incomplete download of '+s.file+' ('+got+' of '+s.bytes+' bytes); check your connection and tap Download again');
      state='VERIFYING';reason='verifying '+s.file;
      const blob=new Blob(parts);const h=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
      if(h!==s.sha256)throw new Error('integrity check FAILED for '+s.file+' (SHA-256 mismatch). The file was discarded.');
      await c.put(url,new Response(blob,{headers:{'content-type':'application/octet-stream'}}));
      ver[s.file]=s.sha256;localStorage.setItem(LS('verified'),JSON.stringify(ver));done+=s.bytes;state='DOWNLOADING';
    }
    const blobs=await cachedBlobs();if(!blobs)throw new Error('model files missing after download');
    integrity=true;localStorage.removeItem(LS('loading'));await load(blobs);
  }catch(e){if(state!=='FAILED'){state='FAILED';reason=(e&&e.message||String(e))}}}

async function verify(){                     // full re-hash of everything cached
  const c=await caches.open(STORE);
  for(const s of CFG.shards){const r=await c.match(shardUrl(s));if(!r)throw new Error('missing '+s.file);const h=hex(await crypto.subtle.digest('SHA-256',await (await r.blob()).arrayBuffer()));if(h!==s.sha256){integrity=false;const ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}');delete ver[s.file];localStorage.setItem(LS('verified'),JSON.stringify(ver));throw new Error('SHA-256 mismatch in '+s.file)}}
  return 'all '+CFG.shards.length+' model files match their SHA-256';}

async function complete(q){
  if(state!=='READY'||!wllama)throw new Error('model not ready: '+reason);
  const g=(q.schema!=null)?await gbnf():'';
  const prompt='<|im_start|>system\n'+q.system+'<|im_end|>\n<|im_start|>user\n'+q.user+'<|im_end|>\n<|im_start|>assistant\n';
  const p={prompt,max_tokens:Math.max(8,Math.min(400,q.max_tokens||120)),temperature:0};if(g)p.grammar=g;
  const r=await wllama.createCompletion(p);return r.choices[0].text;}

async function status(){
  let est=null;try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();est={usage_mb:Math.round((e.usage||0)/1048576),quota_mb:Math.round((e.quota||0)/1048576)}}}catch(e){}
  return {ready:state==='READY',integrity_ok:integrity&&state==='READY',model:CFG.name,reason:state==='READY'?'':reason,state,progress,load_seconds:loadSecs,loading_seconds:state==='LOADING'?Math.round((Date.now()-loadStarted)/1000):null,platform:IOS?'ios':'other',diagnostics:diag.slice(-12),last_stage:(()=>{try{return JSON.parse(localStorage.getItem(LS('lastStage'))||'null')}catch(e){return null}})(),backend,add_hazards:CFG.addHazards!==false,needs_download:state==='NOT_INSTALLED'||(state==='FAILED'&&!integrity),storage:est,size_mb:Math.round(CFG.shards.reduce((a,s)=>a+s.bytes,0)/1048576)};}

async function retry(){if(state==='LOADING')return 'already loading';stage('RETRY','manual retry requested');localStorage.removeItem(LS('loading'));const have=await cachedBlobs();if(!have){state='NOT_INSTALLED';return 'not installed'}integrity=true;try{await load(have)}catch(e){}return state}

async function selftest(prompts){            // run on the REAL device to measure it; reports honestly
  const out=[];const P=window.AEGIS.interpretPrompt;
  for(const t of prompts){const t0=performance.now();let txt=null,err=null;try{txt=await complete({system:P.system,user:t,schema:P.schema,max_tokens:80})}catch(e){err=String(e)}out.push({prompt:t,seconds:+((performance.now()-t0)/1000).toFixed(2),output:txt,error:err})}
  return out;}

window.AEGISWebLLM={raw:(p)=>wllama.createCompletion(p),backend:()=>backend,tokenize:(t)=>wllama.tokenize(t),ctxinfo:()=>wllama.getLoadedContextInfo(),init,install,status,complete,retry,verify,selftest,log:()=>log.slice(),cfg:CFG};
// expose the same names the app expects on window.AEGISNative
window.AEGISNative={status,complete,retry,install,verify,selftest};
window.dispatchEvent(new Event('aegis-llm-ready'));
init().then(()=>window.dispatchEvent(new Event('aegis-llm-state')));
