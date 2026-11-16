const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},document:{readyState:'loading',addEventListener(){},getElementById(){return null}},navigator:{userAgent:'iPhone',platform:'iPhone'},localStorage:{getItem(){return null}}};vm.createContext(c);for(const f of ['intelligence-v50.js','offline-ai-chat-v42.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const I=c.window.AEGIS_INTELLIGENCE;
const turns=[{role:'user',text:'I have a tarp, rope and knife. How do I build a shelter?'},{role:'assistant',text:'Use the tarp.'},{role:'user',text:"Actually I don't have rope. What can I do with that instead?"}];
assert.equal(I.facts(turns).find(x=>x.item==='rope').status,'missing');assert.equal(I.facts(turns).find(x=>x.item==='knife').status,'reported');assert(I.query(turns).includes('shelter'));assert.equal(I.facts([{role:'user',text:'Could I use a knife and rope?'}]).length,0);
assert.equal(I.facts([{role:'user',text:'If I have rope and a tarp, could I make a shelter?'}]).length,0);
const entries=[{title:'Bowline knot',group:'Cordage',steps:['Form loop'],materials:'rope'},{title:'Food storage',group:'Food',steps:['Label'],materials:'bins'}];assert.equal(I.rank('tie a rope knot',entries)[0].title,'Bowline knot');assert.equal(I.rank('zzxyyunmatched',entries).length,0);
const p=c.window.AEGIS_CHAT.promptFor(turns);assert(p.user.includes("don't have rope"));assert(p.user.includes('Recent conversation'));assert(p.system.includes('Answer general questions'));assert(p.user.length<1400);assert(p.max_tokens<=80);
console.log('PASS: follow-up retrieval, explicit equipment facts, correction precedence, no inferred inventory and bounded iPhone conversation.');
