const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const source=fs.readFileSync('llm/webllm_bridge.js','utf8').replace(/^import .*;$/m,'').replace("init().then(","window.testInit=init();window.testInit.then(");
const bytes=Buffer.from('small verified model fixture'),hash=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
async function run({bad=false,interrupted=false,cached=false,quota=false,idbOnly=false}={}){
 const saved=new Map(),idbSaved=new Map(),local=new Map();let requests=0,options;
 const shard={file:'part001',url:'https://huggingface.co/test/model',offset:0,bytes:bytes.length,sha256:hash};
 if(cached)(idbOnly?idbSaved:saved).set('https://example.test/llm/mobile/part001',idbOnly?new Blob([bytes]):new Response(bytes));
 const indexedDB={open(){const request={};const db={createObjectStore(){},transaction(){const tx={objectStore(){const op=(kind,key,value)=>{const req={};setImmediate(()=>{if(kind==='put')idbSaved.set(key,value);if(kind==='delete')idbSaved.delete(key);req.result=idbSaved.get(key);req.onsuccess?.();tx.oncomplete?.()});return req};return{get:key=>op('get',key),put:(value,key)=>op('put',key,value),delete:key=>op('delete',key)}}};return tx}};setImmediate(()=>{request.result=db;request.onupgradeneeded?.();request.onsuccess?.()});return request}};
 const cache={match:async key=>saved.get(key)?.clone(),delete:async key=>saved.delete(key),put:async(key,value)=>{if(quota){const e=new Error('Quota exceeded');e.name='QuotaExceededError';throw e}saved.set(key,value)}};
 const window={AEGIS_WEBLLM:{id:'mobile',base:'llm/mobile/',shards:[shard],wasm:'llm/wllama.wasm',name:'fixture'},dispatchEvent(){}};
 const c={window,self:{crypto:webcrypto,WebAssembly,caches:{},indexedDB},indexedDB,crypto:webcrypto,WebAssembly,Blob,Response,URL,AbortController,Event,console,performance,setTimeout,clearTimeout,location:{href:'https://example.test/'},navigator:{userAgent:'iPhone',storage:{estimate:async()=>({quota:cached?1:1000,usage:0}),persist:async()=>true}},localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value),removeItem:key=>local.delete(key)},caches:{open:async()=>cache},fetch:async(url,opts)=>{requests++;options=opts;if(interrupted)throw Error('connection lost');return new Response(bad?Buffer.alloc(bytes.length):bytes,{status:206,headers:{'content-range':`bytes 0-${bytes.length-1}/${bytes.length}`}})},Wllama:class{async loadModel(){}async createCompletion(){return{choices:[{text:'OK'}]}}}};
 vm.runInNewContext(source,c);await window.testInit;if(cached){assert.equal((await window.AEGISNative.status()).ready,true,JSON.stringify(await window.AEGISNative.status()));assert.equal(requests,0)}await window.AEGISNative.install();return {status:await window.AEGISNative.status(),saved,idbSaved,requests,options};
}
(async()=>{
 const good=await run();assert.equal(good.status.ready,true);assert.equal(good.options.headers.Range,`bytes=0-${bytes.length-1}`);assert.equal(good.options.credentials,'omit');assert.equal(good.options.cache,undefined,'External ranges should not force cache-control preflight');
 const bad=await run({bad:true});assert.equal(bad.status.ready,false);assert.match(bad.status.reason,/SHA-256/);assert.equal(bad.saved.size,0);
 const failed=await run({interrupted:true});assert.match(failed.status.reason,/interrupted/);assert.equal(failed.status.last_stage.stage,'FAILED');
 const resumed=await run({cached:true});assert.equal(resumed.requests,0);assert.equal(resumed.status.ready,true,'Resume needs no new space for already cached pieces');
 const fallback=await run({quota:true});assert.equal(fallback.status.ready,true);assert.equal(fallback.idbSaved.size,1);assert.equal(fallback.status.cached_shards,1);
 const idbBoot=await run({cached:true,idbOnly:true});assert.equal(idbBoot.requests,0);assert.equal(idbBoot.status.ready,true);
 const html=fs.readFileSync('index.html','utf8'),policy=html.match(/connect-src ([^;]+)/)[1];assert(!policy.includes('huggingface.co'),'Packaged Mobile model needs no external connection policy');assert(!policy.split(' ').includes('https:'));assert(html.includes("script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"));
 console.log('PASS: external byte ranges, verified cache resume, corruption rejection, interruption diagnostics and scoped model-host policy.');
})().catch(e=>{console.error(e);process.exitCode=1});
