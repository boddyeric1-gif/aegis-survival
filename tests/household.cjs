const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx={window:{},crypto:require('crypto').webcrypto};vm.createContext(ctx);vm.runInContext(fs.readFileSync('household-core-v47.js','utf8'),ctx);const C=ctx.window.AEGIS_HOUSEHOLD_CORE,s=C.empty();
assert.equal(s.members.length,0);assert.equal(s.pets.length,0);assert.equal(s.plans.length,0);
s.members=[{id:'a',name:'Test A',included:true},{id:'b',name:'Test B',included:false}];s.pets=[{id:'p',name:'Test pet'}];
const stock=[{name:'Water',qty:12,perPersonPerDay:2,unit:'L'},{name:'Lamp',qty:8,perPersonPerDay:2,unit:'hours',scope:'household'},{name:'Pet meals',qty:9,perPersonPerDay:3,unit:'meals',scope:'pet'},{name:'Unknown',qty:10,perPersonPerDay:0,unit:'units'}];
let rows=C.coverage(stock,s);assert.deepEqual(Array.from(rows,x=>x.days),[6,4,3,null]);
s.members[1].included=true;rows=C.coverage(stock,s);assert.equal(rows[0].days,3);assert.equal(rows[1].days,4);assert.equal(rows[2].days,3);
s.pets=[];assert.equal(C.coverage(stock,s)[2].days,null);
for(const type of Object.keys(C.templates)){const p=C.plan(type);assert.equal(p.tasks.length,4);assert(p.tasks.every(t=>!t.owner&&!t.done));}
s.plans=[C.plan('Evacuation')];s.plans[0].tasks[0].owner='a';s.pins=[{id:'pin',kind:'fm',title:'Reference',page:108,planId:s.plans[0].id}];
const backup=C.snapshot(s,stock,[{name:'Test contact',phone:'555-0100',note:'Test'}]);const round=C.parse(JSON.stringify(backup));assert.equal(round.household.plans[0].tasks[0].owner,'a');assert.equal(round.supplies.length,4);assert.equal(round.contacts.length,1);
assert.throws(()=>C.parse({...backup,version:2}));assert.throws(()=>C.parse({...backup,supplies:[{name:'X',qty:-1,perPersonPerDay:1}]}));assert.throws(()=>C.supplies([stock[0],{...stock[0],name:'water'}]));assert.throws(()=>C.parse({...backup,household:{...s,pins:[{...s.pins[0],page:677}]}}));assert.throws(()=>C.parse({...backup,household:{...s,members:[]}}));
const html=fs.readFileSync('index.html','utf8'),ui=fs.readFileSync('household-v47.js','utf8'),help=fs.readFileSync('quick-start.js','utf8');
assert(html.includes('await window.AEGIS?.prepReady')||ui.includes('await window.AEGIS?.prepReady'));
for(const retired of ['prep','library','fieldmanual','phase4'])assert(!html.includes('role="tab" data-tab="'+retired+'"'));
assert(help.includes("['household','Household'"));assert(help.includes("['data','Journal'"));
assert(ui.includes('localStorage.setItem(JOURNAL,JSON.stringify(previous))'));assert(ui.includes('await writeSnapshot(previous)'));assert(!ui.includes('AEGIS_PHASE4.getState'));
console.log('PASS: explicit people/pet/household coverage, unknown assumptions, validated backup roundtrip and rejection, assigned plans, readiness and consolidated navigation.');
