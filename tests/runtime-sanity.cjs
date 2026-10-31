const fs=require('node:fs');const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const sw=read('sw.js'),bridge=read('llm/webllm_bridge.js'),html=read('index.html');
assert.match(sw,/aegis-4\.4\.2-recovery/);
const assets=JSON.parse(sw.match(/const ASSETS=(\[[^;]+\]);/)[1]);
for(const a of assets){if(a==='./')continue;assert.ok(fs.existsSync(a.replace(/^\.\//,'')), 'missing offline asset '+a)}
assert.match(bridge,/n_ctx:IOS\?512/);
assert.match(bridge,/n_batch:IOS\?32/);
assert.match(bridge,/!IOS&&pref/);
assert.match(bridge,/localStorage\.setItem\(LS\('lastStage'\)/);
const cfg=JSON.parse(html.match(/window\.AEGIS_WEBLLM=(\{[^;]+\});/)[1]);
for(const key of ['wasm','compat_wasm','compat_worker','gbnf'])assert.ok(fs.existsSync(cfg[key]),'missing model runtime asset '+cfg[key]);
assert.ok(cfg.shards.length>0);
console.log('PASS: syntax checked separately; offline assets, runtime config, model manifest and iOS conservative settings verified');

assert.match(bridge,/recovering cached shard/);
assert.match(bridge,/digest===shard.sha256/);
assert.match(bridge,/recovered existing cached model without downloading/);
