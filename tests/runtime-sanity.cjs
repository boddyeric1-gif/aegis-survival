const fs=require('node:fs');const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const sw=read('sw.js'),bridge=read('llm/webllm_bridge.js'),html=read('index.html');
assert.match(sw,/aegis-10\.5-obsidian/);
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

const manual=read('wildlands-manual.js');
assert.match(html,/id="wild-manual"/);
assert.match(html,/id="manual-chapters"/);
assert.match(html,/src="wildlands-manual.js"/);
assert.match(sw,/wildlands-manual\.js/);
assert.match(manual,/Primitive Tools & Materials/);
assert.match(manual,/Emergency Response & Long-Term Planning/);
assert.match(sw,/startsWith\('aegis-'\)/);
assert.doesNotMatch(sw,/caches\.delete\('model-store-v1'\)/);

const projects=read('manual-projects.js');
assert.match(html,/id="manualhub"/);
assert.match(html,/data-tab="manualhub"/);
assert.match(html,/id="manual-projects"/);
assert.match(html,/src="manual-projects.js"/);
assert.match(sw,/manual-projects\.js/);
assert.match(projects,/Wooden digging stick/);
assert.match(projects,/Boiler outage checklist/);

const libv7=read('manual-library-v7.js');
assert.match(html,/id="library-v7"/);
assert.match(html,/src="manual-library-v7.js"/);
assert.match(sw,/manual-library-v7\.js/);
assert.match(libv7,/Non-operational deadfall model/);
assert.match(libv7,/Wooden scraper and spatula/);

const deep=read('deep-shelter-earthworks.js'),offlineCheck=read('manual-offline-check.js');
assert.match(html,/id="deep-manuals"/);
assert.match(html,/id="manual-verify-offline"/);
assert.match(html,/src="deep-shelter-earthworks.js"/);
assert.match(html,/src="manual-offline-check.js"/);
assert.match(sw,/deep-shelter-earthworks\.js/);
assert.match(sw,/manual-offline-check\.js/);
assert.match(sw,/caches\.open\(CACHE\)\.then\(c=>c\.match/);
assert.match(deep,/Trench planning and excavation safety/);
assert.match(deep,/Indoor warm-room conversion/);
assert.match(offlineCheck,/airplane mode/);

const ux=read('ux-v9.js');
assert.match(html,/id="v9-search"/);
assert.match(html,/id="radiohub"/);
assert.match(html,/data-tab="radiohub"/);
assert.match(html,/data-v9-jump="emergency"/);
assert.match(html,/src="ux-v9.js"/);
assert.match(sw,/ux-v9\.js/);
assert.match(ux,/NOAA Weather Radio frequencies/);
assert.match(ux,/Search all field manuals|manual-chapters/);
assert.match(read('manual-offline-check.js'),/ux-v9\.js/);

assert.match(html,/AEGIS v10/);
assert.match(html,/backdrop-filter:blur/);
assert.match(html,/prefers-reduced-motion/);
assert.match(html,/data-v9-jump="emergency"/);
assert.match(html,/id="manualhub"/);

assert.match(html,/EMB AEGIS Wildlands v10\.0 · Glass Edition/);
assert.doesNotMatch(html,/<footer>ESI AEGIS v4/);

const uxAudit=read('ux-v9.js');
assert.match(uxAudit,/\['fc-list','fieldmanual','Fieldcraft'\]/);
assert.doesNotMatch(uxAudit,/wild-fieldcraft-list/);
assert.match(read('manual-offline-check.js'),/aegis-10\.2-audit-/);
assert.match(read('README.md'),/Glass Edition \(v10\.0\)/);
assert.match(read('manifest.webmanifest'),/EMB AEGIS Wildlands/);

assert.match(html,/id="aegis-help"/);
assert.match(html,/id="aegis-help-open"/);
assert.match(html,/id="aegis-help-start"/);
assert.match(html,/src="quick-start.js"/);
assert.match(sw,/quick-start\.js/);
assert.match(read('quick-start.js'),/Escape/);
assert.match(read('manual-offline-check.js'),/quick-start\.js/);

assert.match(html,/EMB Signature Edition v2/);
assert.match(html,/#08090b/);
assert.match(html,/\.v9-command \.v9-primary\{background:linear-gradient\(110deg,#e25c59,#b82d3d\)/);
assert.match(read('manifest.webmanifest'),/#08090b/);

assert.match(html,/#v9-more\.v9-more\{display:block;width:100%;background:#171819/);
assert.match(html,/\.v9-urgent\{background:#171416/);
assert.match(html,/\.v9-find\{background:#141517/);
