const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const src=fs.readFileSync('sw.js','utf8'),hashes=JSON.parse(src.match(/const ASSET_HASHES=([^;]+);/)[1]);
for(const [asset,hash]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset==='./'?'index.html':asset)).digest('hex'),hash,'Stale shell hash: '+asset);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
async function scenario({changed=false,offline=false,corrupt=false}={}){
 const old=new Map([['https://example.test/unchanged.js',new Response('same')],['https://example.test/index.html',new Response(changed?'old':'current')]]),model=new Map([['model',new Response('model')]]),stores=new Map([['aegis-50-field-coach-1',old],['model-store-v1',model]]),events={};let fetched=0,activated=false;
 const cache={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return{match:async key=>m.get(key)?.clone(),put:async(key,value)=>m.set(key,value)}}};
 const source=src.replace(/const ASSETS=[^;]+;/,'const ASSETS=["./unchanged.js","./index.html"];').replace(/const ASSET_HASHES=[^;]+;/,'const ASSET_HASHES='+JSON.stringify({'./unchanged.js':sha('same'),'./index.html':sha('current')})+';');
 const self={location:'https://example.test/sw.js',addEventListener:(name,cb)=>events[name]=cb,skipWaiting:async()=>{activated=true},clients:{claim:async()=>{}}};
 vm.runInNewContext(source,{self,caches:cache,crypto:crypto.webcrypto,Response,Request,URL,fetch:async req=>{fetched++;if(offline)throw Error('offline');return new Response(corrupt?'broken':'current')}});
 let pending;events.install({waitUntil:p=>pending=p});try{await pending}catch(e){return{error:e,activated,fetched,stores}}
 events.activate({waitUntil:p=>pending=p});await pending;return{fetched,stores,activated};
}
(async()=>{const cold=await scenario({offline:true});assert.equal(cold.fetched,0);assert.equal(cold.activated,true);assert(cold.stores.has('model-store-v1'));assert(!cold.stores.has('aegis-50-field-coach-1'));
const updated=await scenario({changed:true});assert.equal(updated.fetched,1,'Only changed shell bytes need network');assert(updated.stores.has('model-store-v1'));
const failed=await scenario({changed:true,corrupt:true});assert.match(failed.error.message,/integrity/);assert.equal(failed.activated,false);assert(failed.stores.has('aegis-50-field-coach-1'),'Failed install must retain the working old shell');
console.log('PASS: release hashes, no-network reuse of unchanged assets, changed-only download, failed-update rollback and untouched model storage.');})().catch(e=>{console.error(e);process.exitCode=1});
