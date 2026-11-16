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
const LS=k=>(CFG.id==='mobile'?'aegis.llm.mobile.':'aegis.llm.')+k;
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const diag=[];const stage=(name,detail)=>{const entry={time:new Date().toISOString(),stage:name,detail};diag.push(entry);if(diag.length>40)diag.shift();try{localStorage.setItem(LS('lastStage'),JSON.stringify(entry))}catch(e){}window.dispatchEvent(new Event('aegis-llm-state'))};
const THREADS=IOS?1:(localStorage.getItem(LS('threads'))==='1'?1:2);
let backend='none',wllama=null,loadStarted=0,state='PREPARING',reason='checking saved offline model files',progress=0,integrity=false,loadSecs=-1,smokeTestPassed=false;
const log=[];const note=m=>{log.push(new Date().toISOString().slice(11,19)+' '+m);if(log.length>60)log.shift()};
const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const shardUrl=s=>new URL(CFG.base+s.file,location.href).href;
let gbnfText=null;
async function gbnf(){if(gbnfText===null)gbnfText=await (await fetch(new URL(CFG.gbnf,location.href).href)).text();return gbnfText}

// CacheStorage can reject large model writes even while IndexedDB remains available.
// Both stores use stable same-origin shard URLs, and both survive app-shell updates.
let fileDB=null,preferIDB=false;
function openFileDB(){if(fileDB)return fileDB;fileDB=new Promise((resolve,reject)=>{if(!self.indexedDB){reject(new Error('IndexedDB model storage unavailable'));return}const request=indexedDB.open('aegis-model-files-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();fileDB=null};db.onclose=()=>{fileDB=null};resolve(db)};request.onerror=()=>{fileDB=null;reject(request.error)}});return fileDB}
async function fileOperation(mode,key,value){const db=await openFileDB();return new Promise((resolve,reject)=>{let tx;try{tx=db.transaction('files',mode)}catch(e){fileDB=null;reject(e);return}const store=tx.objectStore('files'),request=mode==='readonly'?store.get(key):value===undefined?store.delete(key):store.put(value,key);let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>{fileDB=null;reject(tx.error||request.error)};tx.onabort=()=>{fileDB=null;reject(tx.error||new Error('Model file transaction interrupted'))}})}
function storageDeadline(work,ms=8000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{const e=new Error('Saved storage read timed out; files were retained');e.name='StorageReadError';reject(e)},ms);Promise.resolve(work).then(value=>{clearTimeout(timer);resolve(value)},error=>{clearTimeout(timer);reject(error)})})}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function readShard(shard,materialize=false){const url=shardUrl(shard);let lastError;
 for(let attempt=0;attempt<3;attempt++){let error=null,blob=null;
  try{blob=await storageDeadline((async()=>{const hit=await(await caches.open(STORE)).match(url);if(!hit)return null;const found=await hit.blob();return materialize?new Blob([await found.arrayBuffer()]):found})());if(blob)return blob}catch(e){error=e}
  if(self.indexedDB)try{blob=await storageDeadline((async()=>{const found=await fileOperation('readonly',url);return found&&materialize?new Blob([await found.arrayBuffer()]):found})());if(blob)return blob}catch(e){error=e}
  if(!error)return null;lastError=error;if(attempt<2)await pause(150*(attempt+1));
 }
 const error=new Error('Saved model storage could not be read after recovery attempts. Files were not removed. Retry saved AI; no download was attempted. '+(lastError?.message||''));error.name='StorageReadError';throw error;
}
async function removeShard(shard){const url=shardUrl(shard);try{await(await caches.open(STORE)).delete(url)}catch{}if(self.indexedDB)try{await fileOperation('readwrite',url)}catch{}}
async function saveShard(shard,blob){inspectionValue=null;const url=shardUrl(shard);if(!preferIDB){try{await(await caches.open(STORE)).put(url,new Response(blob,{headers:{'content-type':'application/octet-stream'}}));return}catch(e){if(e.name!=='QuotaExceededError')throw e;preferIDB=true;stage('STORAGE_FALLBACK','Cache storage refused model file; trying persistent IndexedDB')}}try{await fileOperation('readwrite',url,blob)}catch(e){throw new Error('Browser could not save '+shard.file+'. Verified pieces are retained. Available browser storage may be full or restricted; do not clear AEGIS data. '+e.message)}}

async function cachedBlobs(){
  if(!('caches' in self))return null;
  const out=[];
  let ver={};try{ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}')}catch(e){}
  let changed=false;
  for(const shard of CFG.shards){
    const blob=await readShard(shard,true);
    if(!blob)return null;
    if(blob.size!==shard.bytes)return null;
    if(ver[shard.file]!==shard.sha256){
      stage('VERIFYING','recovering cached shard '+shard.file);
      const digest=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
      if(digest!==shard.sha256){stage('CORRUPT','cached shard hash mismatch '+shard.file);return null}
      ver[shard.file]=shard.sha256;changed=true;
    }
    out.push(blob);
  }
  if(changed){localStorage.setItem(LS('verified'),JSON.stringify(ver));stage('VERIFIED','recovered existing cached model without downloading')}
  return [new Blob(out)];
}

async function initImpl(){state='PREPARING';reason='opening saved model files; no download is requested';                   // called on app start: never downloads; loads only if already installed and verified
  try{
    if(!('WebAssembly' in self)||!('caches' in self)||!self.crypto||!crypto.subtle){state='UNSUPPORTED';reason='this browser lacks WebAssembly, Cache storage or secure-context crypto (use https or localhost)';return}
    const have=await cachedBlobs();
    if(!have){const partial=Object.keys(JSON.parse(localStorage.getItem(LS('verified'))||'{}')).length;state='NOT_INSTALLED';reason=partial?'model download incomplete: tap Download to finish':'the offline language model has not been downloaded yet';return}
    integrity=true;
    if(localStorage.getItem(LS('loading'))){localStorage.setItem(LS('backend'),'cpu');state='DISABLED';reason='Previous model initialization was interrupted. The browser may have closed the app or exhausted memory. Model files remain installed; tap Retry once to use the conservative CPU configuration.';stage('INTERRUPTED',reason);return}
    integrity=true;await load(have);
  }catch(e){state=e?.name==='StorageReadError'?'RECOVERY_NEEDED':'FAILED';reason=(e&&e.message||String(e))+' (manuals remain available)';stage('RECOVERY_NEEDED',reason)}}

let ioLoadRecovery=false;
async function load(blobs){
  smokeTestPassed=false;state='LOADING';reason='initializing local model runtime';progress=100;loadStarted=Date.now();stage('LOADING','starting model initialization');
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
    await wllama.loadModel(blobs,{n_ctx:IOS?(CFG.id==='mobile'?1024:512):(CFG.nctx||2048),n_threads:THREADS,n_batch:IOS?32:128,n_gpu_layers:useGpu?999:0});
    backend=useGpu?'webgpu-requested':'cpu-wasm';loadSecs=(performance.now()-t0)/1000;state='VERIFYING';reason='checking whether the model can actually generate text';stage('SMOKE_TEST','testing one-token local inference');const check=await wllama.createCompletion({prompt:'<|im_start|>user\nReply with OK.<|im_end|>\n<|im_start|>assistant\n',max_tokens:4,temperature:0});if(!check||!check.choices||!check.choices[0]||typeof check.choices[0].text!=='string'||!check.choices[0].text.trim())throw new Error('model loaded but failed the inference smoke test');localStorage.removeItem(LS('loading'));smokeTestPassed=true;state='READY';reason='';stage('READY','model initialized and produced local text');note('model loaded in '+loadSecs.toFixed(1)+' s, backend '+backend);
  }catch(e){localStorage.removeItem(LS('loading'));smokeTestPassed=false;state='FAILED';reason=(e&&e.message||String(e))+' (rules-only mode)';stage('FAILED',reason);if(!ioLoadRecovery&&/NotReadableError|I\/O read|storage.*read/i.test(String(e?.name)+' '+reason)){ioLoadRecovery=true;try{stage('RECOVERING','reopening saved model once after a temporary read failure; no download');await pause(500);const saved=await cachedBlobs();if(saved)return await load(saved)}finally{ioLoadRecovery=false}}throw e}}

// One-time download of all shards with per-shard SHA-256 verification into persistent Cache storage.
async function install(onProgress){
  if(state==='DOWNLOADING'||state==='VERIFYING'||state==='LOADING')return;
  try{
    state='DOWNLOADING';progress=0;integrity=false;
    if(navigator.storage&&navigator.storage.persist){try{note('persistent storage granted: '+await navigator.storage.persist())}catch(e){}}
    const total=CFG.shards.reduce((a,s)=>a+s.bytes,0);
    stage('DOWNLOADING','checking saved pieces before requesting missing files');
    if(navigator.storage&&navigator.storage.estimate){const q=await navigator.storage.estimate();let remaining=0;for(const shard of CFG.shards){const hit=await readShard(shard);if(!hit||hit.size!==shard.bytes)remaining+=shard.bytes}if(q.quota&&q.usage!==undefined&&q.quota-q.usage<remaining*1.15)throw new Error('not enough free browser storage: need about '+Math.ceil(remaining*1.15/1048576)+' MB free to finish, have about '+Math.floor((q.quota-q.usage)/1048576)+' MB')}
    const ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}');let done=0;
    for(const s of CFG.shards){
      const url=shardUrl(s);const hit=await readShard(s);
      if(hit){const b=hit;if(b.size===s.bytes){if(ver[s.file]!==s.sha256){const digest=hex(await crypto.subtle.digest('SHA-256',await b.arrayBuffer()));if(digest===s.sha256){ver[s.file]=s.sha256;localStorage.setItem(LS('verified'),JSON.stringify(ver))}}if(ver[s.file]===s.sha256){done+=s.bytes;progress=Math.floor(done*100/total);continue}}}
      await removeShard(s);delete ver[s.file];localStorage.setItem(LS('verified'),JSON.stringify(ver));
      reason='Downloading '+CFG.name+': '+progress+'% (verified pieces are retained)';
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),90000);let resp;try{resp=await fetch(s.url||url,{...(s.url?{credentials:'omit'}:{cache:'no-store'}),signal:controller.signal,...(s.url?{headers:{Range:'bytes='+s.offset+'-'+(s.offset+s.bytes-1)}}:{})})}catch(e){clearTimeout(timeout);throw new Error('Download interrupted; verified pieces are saved. Keep AEGIS open and tap Download again. '+e.message)}if(!resp.ok){clearTimeout(timeout);throw new Error('download failed ('+resp.status+') for '+s.file)}if(s.url&&(resp.status!==206||resp.headers.get('content-range')!=='bytes '+s.offset+'-'+(s.offset+s.bytes-1)+'/'+total)){clearTimeout(timeout);controller.abort();throw new Error('Model host did not provide the expected download piece. Verified pieces remain saved.')}
      stage('DOWNLOADING','receiving '+s.file);
      const reader=resp.body.getReader();const parts=[];let got=0;
      try{
      for(;;){const {done:d,value}=await reader.read();if(d)break;parts.push(value);got+=value.length;if(got>s.bytes){controller.abort();clearTimeout(timeout);throw new Error('Model host returned an oversized piece')} progress=Math.floor((done+got)*100/total);reason='Downloading '+CFG.name+': '+progress+'% (verified pieces are retained)';if(onProgress)onProgress(progress)}
      }finally{clearTimeout(timeout);reader.releaseLock()}
      if(got>s.bytes)throw new Error('Unexpected model file size');
      if(got!==s.bytes)throw new Error('incomplete download of '+s.file+' ('+got+' of '+s.bytes+' bytes); check your connection and tap Download again');
      state='VERIFYING';reason='verifying '+s.file;stage('VERIFYING',reason);
      const blob=new Blob(parts);const h=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
      if(h!==s.sha256)throw new Error('integrity check FAILED for '+s.file+' (SHA-256 mismatch). The file was discarded.');
      await saveShard(s,blob);
      ver[s.file]=s.sha256;localStorage.setItem(LS('verified'),JSON.stringify(ver));done+=s.bytes;state='DOWNLOADING';
    }
    const blobs=await cachedBlobs();if(!blobs)throw new Error('model files missing after download');
    integrity=true;localStorage.removeItem(LS('loading'));await load(blobs);
  }catch(e){if(state!=='FAILED'){state='FAILED';reason=(e&&e.message||String(e));stage('FAILED',reason)}}}

async function verify(){                     // full re-hash of everything cached
  for(const s of CFG.shards){const blob=await readShard(s);if(!blob)throw new Error('missing '+s.file);const h=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));if(h!==s.sha256){integrity=false;const ver=JSON.parse(localStorage.getItem(LS('verified'))||'{}');delete ver[s.file];localStorage.setItem(LS('verified'),JSON.stringify(ver));throw new Error('SHA-256 mismatch in '+s.file)}}
  return 'all '+CFG.shards.length+' model files match their SHA-256';}

let completionBusy=false;
async function complete(q){
  if(completionBusy)throw new Error('Another local inference is running. Wait for it to finish.');
  completionBusy=true;try{
  if(state!=='READY'||!wllama)throw new Error('model not ready: '+reason);
  const g=(q.schema!=null)?await gbnf():'';
  const prompt='<|im_start|>system\n'+q.system+'<|im_end|>\n<|im_start|>user\n'+q.user+'<|im_end|>\n<|im_start|>assistant\n';
  const p={prompt,max_tokens:Math.max(8,Math.min(400,q.max_tokens||120)),temperature:0};if(g)p.grammar=g;
  const r=await wllama.createCompletion(p);return r.choices[0].text;}finally{completionBusy=false}}

let inspection=null,inspectionAt=0,inspectionValue=null;
async function inspectModelFiles(){if(inspection)return inspection;if(inspectionValue!==null&&Date.now()-inspectionAt<2000)return inspectionValue;inspection=(async()=>{let count=0;for(const shard of CFG.shards){const blob=await readShard(shard);if(blob&&blob.size===shard.bytes)count++}inspectionAt=Date.now();inspectionValue=count;return count})();try{return await inspection}finally{inspection=null}}
async function status(){
  let est=null;try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();est={usage_mb:Math.round((e.usage||0)/1048576),quota_mb:Math.round((e.quota||0)/1048576)}}}catch(e){}
  let cached=state==='READY'&&integrity?CFG.shards.length:null,inspectionError=null;if(cached===null){try{cached=await storageDeadline(inspectModelFiles(),10000)}catch(e){inspectionError=e.message}}
  return {runtime_task:modelTaskName,model_file_evidence:state==='READY'&&integrity?'verified for the currently loaded AI session':'saved-file inspection',storage_inspection_error:inspectionError,cached_shards:cached,total_shards:CFG.shards.length,file_store:preferIDB?'IndexedDB fallback':'CacheStorage / saved IndexedDB',ready:state==='READY',integrity_ok:integrity&&state==='READY',inference_verified:smokeTestPassed,model:CFG.name,reason:state==='READY'?'':reason,state,progress,load_seconds:loadSecs,loading_seconds:state==='LOADING'?Math.round((Date.now()-loadStarted)/1000):null,platform:IOS?'ios':'other',diagnostics:diag.slice(-12),last_stage:(()=>{try{return JSON.parse(localStorage.getItem(LS('lastStage'))||'null')}catch(e){return null}})(),backend,threads:THREADS,add_hazards:CFG.addHazards!==false,needs_download:state==='NOT_INSTALLED',storage:est,size_mb:Math.round(CFG.shards.reduce((a,s)=>a+s.bytes,0)/1048576)};}

let recoveryPromise=null;
async function retry(){if(recoveryPromise)return recoveryPromise;if(/^(PREPARING|LOADING|VERIFYING|DOWNLOADING)$/.test(state))return 'already working';recoveryPromise=(async()=>{state='PREPARING';reason='retrying saved files without downloading';stage('RETRY',reason);try{localStorage.removeItem(LS('loading'));inspectionValue=null;const have=await cachedBlobs();if(!have){state='NOT_INSTALLED';reason='Some saved model files are missing or invalid. Download resumes only the required pieces.';return state}integrity=true;await load(have)}catch(e){state=e?.name==='StorageReadError'?'RECOVERY_NEEDED':'FAILED';reason=e.message;stage('RECOVERY_NEEDED',reason)}return state})();try{return await recoveryPromise}finally{recoveryPromise=null}}

async function selftest(prompts){            // run on the REAL device to measure it; reports honestly
  const out=[];const P=window.AEGIS.interpretPrompt;
  for(const t of prompts){const t0=performance.now();let txt=null,err=null;try{txt=await complete({system:P.system,user:t,schema:P.schema,max_tokens:80})}catch(e){err=String(e)}out.push({prompt:t,seconds:+((performance.now()-t0)/1000).toFixed(2),output:txt,error:err})}
  return out;}

let modelTaskName='',modelTask=null;
function modelExclusive(name,work){if(modelTask){if(name===modelTaskName&&['startup','recovery','download','verification'].includes(name))return modelTask;return Promise.reject(new Error('Local AI is busy with '+modelTaskName+'. Wait for it to finish; manuals remain available.'))}modelTaskName=name;modelTask=Promise.resolve().then(work).finally(()=>{modelTask=null;modelTaskName=''});return modelTask}
function init(){return modelExclusive('startup',initImpl)}
const guarded={init,install:onProgress=>modelExclusive('download',()=>install(onProgress)),status,complete:q=>modelExclusive('answering',()=>complete(q)),retry:()=>modelExclusive('recovery',retry),verify:()=>modelExclusive('verification',verify),selftest:prompts=>modelExclusive('benchmark',()=>selftest(prompts))};
window.AEGISWebLLM={raw:(p)=>wllama.createCompletion(p),backend:()=>backend,tokenize:(t)=>wllama.tokenize(t),ctxinfo:()=>wllama.getLoadedContextInfo(),...guarded,log:()=>log.slice(),cfg:CFG};
window.AEGISNative=guarded;
window.dispatchEvent(new Event('aegis-llm-ready'));
init().then(()=>window.dispatchEvent(new Event('aegis-llm-state')));
