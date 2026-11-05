const fs=require('node:fs');const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const sw=read('sw.js'),bridge=read('llm/webllm_bridge.js'),html=read('index.html');
assert.match(sw,/aegis-5\.2-fieldcraft/);
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
assert.match(bridge,/digest!==shard.sha256/);
assert.match(bridge,/recovered existing cached model without downloading/);

assert.match(html,/MODEL FLAG — NOT CONFIRMED/);
assert.doesNotMatch(html,/CHECK NOW:.*the language model thinks someone may be in immediate danger/);
assert.ok(fs.existsSync('QUALITY_GATES.md'));

assert.match(bridge,/inference_verified:smokeTestPassed/);
assert.match(bridge,/model loaded but failed the inference smoke test/);
assert.match(bridge,/stage\('SMOKE_TEST'/);

assert.match(html,/class="wild-actions"/);
assert.match(html,/I NEED HELP NOW/);
assert.match(html,/class="wild-quick"/);
assert.match(html,/WILDLANDS/);
assert.match(html,/data-tab="fieldmanual"/);
assert.match(html,/data-tab="emergency"/);
assert.match(html,/id="msg"/);
assert.match(html,/id="answer"/);
assert.match(html,/id="modelstatus"/);
assert.match(sw,/model-store-v1|aegis-/);

const wild=read('wildlands-knowledge.js');
assert.match(html,/id="wild-knowledge"/);
assert.match(html,/src="wildlands-knowledge.js"/);
assert.match(sw,/wildlands-knowledge\.js/);
assert.match(wild,/Emergency water storage/);
assert.match(wild,/Suspected carbon monoxide exposure/);

const fieldcraft=read('wildlands-fieldcraft.js');
assert.match(html,/id="wild-fieldcraft"/);
assert.match(html,/src="wildlands-fieldcraft.js"/);
assert.match(sw,/wildlands-fieldcraft\.js/);
assert.match(fieldcraft,/Reverse-wrap two-ply cord/);
assert.match(fieldcraft,/Portable handwashing station/);
