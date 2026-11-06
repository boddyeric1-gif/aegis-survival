const fs=require('node:fs');const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const sw=read('sw.js'),bridge=read('llm/webllm_bridge.js'),html=read('index.html');
assert.match(sw,/aegis-(?:11-reader|12-intent)/);
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

assert.match(html,/EMB AEGIS Wildlands v11 · Field Manual Expansion/);
assert.doesNotMatch(html,/<footer>ESI AEGIS v4/);

const uxAudit=read('ux-v9.js');
assert.match(uxAudit,/\['fc-list','fieldmanual','Fieldcraft'\]/);
assert.doesNotMatch(uxAudit,/wild-fieldcraft-list/);
assert.match(read('manual-offline-check.js'),/aegis-11-reader-/);
assert.match(read('README.md'),/Field Reader Pilot \(v11\)/);
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

// Reader pilot must be precached and available without network.
assert.match(html,/src="field-reader-v11\.js"/);
assert.match(sw,/field-reader-v11\.js/);
const reader=read('field-reader-v11.js');
assert.match(reader,/Boiling water for microbial safety/);
assert.match(reader,/Low-profile lean-to rain tarp/);
assert.match(reader,/72-hour no-cook food kit/);
assert.match(reader,/aria-live/);

assert.match(html,/src="practical-skills-v11\.js"/);
assert.match(sw,/practical-skills-v11\.js/);
assert.match(read('practical-skills-v11.js'),/Simple fishing: bank line and baited hook/);

assert.match(read('manual-library-v7.js'),/Completion check/);

assert.match(html,/SHELTER FIRST/);
assert.match(html,/function survivalIntent/);
assert.match(html,/v11 · Field Manual Expansion/);

for(const name of ['wildlands-fieldcraft.js','manual-projects.js','deep-shelter-earthworks.js']){
  assert.match(read(name),/Field verification/);
  assert.match(read(name),/Stop conditions/);
  assert.match(read(name),/no independent field validation claimed/);
}

const v7source=read('manual-library-v7.js');
const v7start=v7source.indexOf('const data=')+11;
const v7end=v7source.indexOf(';const root=',v7start);
const v7entries=JSON.parse(v7source.slice(v7start,v7end));
assert.strictEqual(v7entries.length,48);
for(const guide of v7entries){
 assert.ok(guide.steps.length>=8,'Short manual: '+guide.title);
 assert.ok(guide.steps.every(step=>step.length>=35),'Vague step in '+guide.title);
}

const practical=read('practical-skills-v11.js');
for(const title of ['Make two-ply reverse-wrap cordage','Assemble and fish a simple handline from shore','Track small game and plan a lawful food harvest','Forage safely without guessing edible species','Make and test a low-load wooden mallet'])assert.match(practical,new RegExp(title));

assert.match(read('practical-skills-v11.js'),/Traditional self-bow: material selection, tillering and safe first testing/);
assert.match(read('practical-skills-v11.js'),/Small-game capture: legal trap selection, placement and humane monitoring/);
assert.match(read('wildlands-manual.js'),/Action checklist/);
assert.match(read('wildlands-knowledge.js'),/Field checklist/);
const chsrc=read('wildlands-manual.js'), chstart=chsrc.indexOf('const chapters=')+15, chend=chsrc.indexOf(';const root=',chstart);
const chapters=JSON.parse(chsrc.slice(chstart,chend));
assert.strictEqual(chapters.reduce((n,c)=>n+c.sections.length,0),27);
assert.ok(chapters.every(c=>c.sections.every(s=>s.actions.length===4)));
const ksrc=read('wildlands-knowledge.js'), kstart=ksrc.indexOf('const entries=')+14,kend=ksrc.indexOf('];',kstart)+1;
const knowledge=JSON.parse(ksrc.slice(kstart,kend));
assert.strictEqual(knowledge.length,28);
assert.ok(knowledge.every(x=>x.actions.length===2));

assert.match(html,/pioneer-handbook-v11\.js/);
assert.match(read('sw.js'),/pioneer-handbook-v11\.js/);
const pioneer=read('pioneer-handbook-v11.js');
assert.match(pioneer,/Pioneer Handbook/);
assert.match(pioneer,/Honey-lemon warm drink/);
assert.match(pioneer,/Basic oral rehydration solution/);
assert.match(pioneer,/Wagon-era medical myths/);
assert.match(pioneer,/Never give honey to children under 12 months/);

const phase3=read('phase3-procedure-router.js');
assert.match(html,/src="phase3-procedure-router.js"/);
assert.match(sw,/phase3-procedure-router\.js/);
assert.match(phase3,/AEGIS_PHASE3/);
assert.match(phase3,/OFFLINE FIELD PROCEDURE/);
assert.match(read('practical-skills-v11.js'),/AEGIS_PHASE3\.register/);
assert.match(read('pioneer-handbook-v11.js'),/AEGIS_PHASE3\.register/);
assert.match(html,/AEGIS_PHASE3&&window\.AEGIS_PHASE3\.match/);

const vm=require('node:vm');
const sandbox={window:{}};vm.runInNewContext(phase3,sandbox,{timeout:1000});
const router=sandbox.window.AEGIS_PHASE3;
router.register('pioneer',[
 {title:'Skillet bannock',group:'Trail kitchen',ingredients:'Flour and water',method:'Mix and cook in a skillet.',caution:'Cook through.'},
 {title:'Honey-lemon warm drink for cough comfort',group:'Comfort remedies',ingredients:'Honey, lemon, water',method:'Mix in warm water.',caution:'No honey for infants.'}
]);
assert.match(router.match('How do I make bannock with flour?').text,/Mix and cook in a skillet/);
assert.match(router.match('Show me a cough comfort recipe').text,/No honey for infants/);
assert.equal(router.match('hello'),null);
assert.equal(router.match('My child has blue lips and is not breathing'),null);
assert.equal(router.stats().procedures,2);

assert.equal(router.match('How do I treat someone coughing blood?'),null);
assert.match(router.match('How do I make bannock? I only have flour').text,/Supply check/);
assert.match(read('wildlands-fieldcraft.js'),/AEGIS_PHASE3\.register/);
assert.match(read('manual-projects.js'),/AEGIS_PHASE3\.register/);
assert.match(read('deep-shelter-earthworks.js'),/AEGIS_PHASE3\.register/);
