const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('experience-v54.js','utf8'),html=fs.readFileSync('index.html','utf8');
const context={window:{},document:{readyState:'loading',addEventListener(){}}};vm.createContext(context);vm.runInContext(source,context);const experience=context.window.AEGIS_EXPERIENCE;
// Readiness must never confuse an interrupted/not-ready model with a working one.
for(const text of ['Language model NOT ready: files missing','Previous model initialization was interrupted','Loading downloaded files','language model: checking...'])assert.notEqual(experience.modelSummary(text).tone,'ready',text);
assert.equal(experience.modelSummary('Language model READY offline: Mobile (files verified)').tone,'ready');
assert.equal(experience.modelSummary('Language model NOT ready: cached files are present').label,'Needs setup');
// Every public section in the existing app remains reachable in the new directory.
const ids=[...html.matchAll(/role="tab" data-tab="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(experience.sections.map(r=>r[0])).size,experience.sections.length);
for(const id of ids)assert(experience.sections.some(r=>r[0]===id),'Missing section '+id);
assert.deepEqual(Array.from(experience.sections.filter(r=>experience.matchesSection(r,'supplies')),r=>r[0]),['household']);
assert(experience.sections.filter(r=>experience.matchesSection(r,'chat')).some(r=>r[0]==='community'));
assert.equal(experience.sections.filter(r=>experience.matchesSection(r,'xyz-unmatched')).length,0);
assert(experience.sections.every(r=>experience.matchesSection(r,'  ')));
assert(!/localStorage\.(clear|removeItem)|caches\.delete|indexedDB\.deleteDatabase/.test(source),'Presentation upgrade must not clear saved data or downloads');
assert(html.indexOf('experience-v54.js')>html.indexOf('consolidate-v47.js'),'Apply the shell after existing modules');
console.log('PASS: truthful model summary, all existing sections reachable, section discovery, unchanged saved-data/model stores, and startup order.');
