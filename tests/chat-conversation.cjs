const assert=require('node:assert/strict');
const {chat,intelligence:I}=require('./helpers/chat-fixture.cjs');
const user=text=>({role:'user',text}),assistant=text=>({role:'assistant',text});
const question='If I have a tarp, knife, some wood, and 9 feet of rope and I’m in the woods can I make a shelter? How?';
const bad='My knowledge cap is 100% accurate and up-to-date. Historical events and scientific concepts.';
const initial=[user('Who and/or what are you?'),assistant(bad),user(question)];
let p=chat.promptFor(initial);
assert.equal(p.messages.at(-1).role,'user');assert.equal(p.messages.at(-1).content,question);
assert(!JSON.stringify(p.messages).includes(bad),'An unrelated failed introduction must not poison a new task');
assert(p.messages[0].content.includes('between sound anchors'),'Actual building steps must reach the model');
assert(p.messages[0].content.includes('15–30 ft cord'),'Guide requirements must reach the model alongside steps');
assert(!p.messages[0].content.includes('PARACHUTE HAMMOCK'));
const follow=[...initial,assistant('Pitch a low tarp shelter with sound anchors.'),user('How do I attach the corners?')];
p=chat.promptFor(follow);assert(p.user.includes(question));assert.equal(I.conversation(follow).topic,'shelter');assert(!p.user.includes('BRUSH RAFT'));
assert.equal(p.messages.at(-2).role,'assistant','A relevant previous answer is retained as an actual assistant turn');
const correction=[...follow,assistant('Use the reinforced points.'),user('Actually I only have 3 feet of rope. Can I still do it?')];
p=chat.promptFor(correction);assert.equal(p.messages.at(-1).content,correction.at(-1).text);assert(p.user.includes(question));assert(p.user.includes('3 feet'));assert.equal(I.conversation(correction).topic,'shelter');
const changed=[...correction,assistant('Check the span first.'),user('How do I purify water?')];
p=chat.promptFor(changed);assert(!p.user.includes('9 feet'));assert(!p.user.includes('3 feet'));assert.equal(I.conversation(changed).topic,'water');assert(!p.messages.some(m=>m.role==='assistant'));
assert.equal(I.conversation([...changed,user('What about boiling it?')]).topic,'water');
assert.equal(I.conversation([user('I have a tarp. How do I purify water?')]).topic,'water');
assert.equal(I.facts([user('I only have rope and a tarp.')]).length,2);
assert.equal(I.facts([user('If I have rope, can I build it?')]).length,0,'Hypothetical equipment is not saved as inventory');
for(const ms of [initial,follow,correction,changed]){
 const q=chat.promptFor(ms);assert(q.messages.every(m=>['user','assistant','system'].includes(m.role)));
 assert(JSON.stringify(q.messages).length<2600,'Bound mobile context so the latest request and response fit');
 assert(q.sources.length===0,'Do not attach unrelated FM links when the model used a bundled project guide');
}
console.log('PASS: recorded shelter question, failed-intro isolation, actual procedure/requirements, corner follow-up, quantity correction, topic switch, structured chat roles and bounded mobile context.');
const {field,context:c}=require('./helpers/chat-fixture.cjs'),catalog=c.window.AEGIS_PHASE3.catalog();
let reply=field.answer(initial,catalog);assert(reply.text.includes('9 feet of rope'));assert(reply.text.includes('15–30 ft cord'));assert(reply.text.includes('Rig a low ridgeline between sound anchors'));assert(!reply.text.includes(bad));assert.equal(reply.mode,'guided');
reply=field.answer(correction,catalog);assert(reply.text.includes('3 feet of rope'));assert(!reply.text.includes('9 feet of rope'));assert(reply.text.includes('what size is your tarp'));assert(!reply.text.includes('15-foot anchors'));
reply=field.answer(follow,catalog);assert(reply.text.includes('Stake four corners'));assert(reply.text.includes('reinforced'));assert(!reply.text.includes('Inspect tarp seams'),'Answer the corner follow-up, not the entire project again');
const noRope=[...initial,assistant('For your tarp shelter.'),user("Actually I don't have rope. What can I do instead?")];
reply=field.answer(noRope,catalog);assert(reply.text.includes('0 feet of rope'));assert(!reply.text.includes('9 feet of rope'));assert(reply.text.includes('what size is your tarp'));
assert.equal(field.answer([...initial,user('Who are you?')],catalog),null);
assert.equal(field.answer([user('What is the capital of France?')],catalog),null);
assert.equal(field.ropeLength([user('I have nine feet of rope.'),user('Actually, three feet of rope.')]),3);
assert.equal(field.ropeLength([user('I have 9 feet of rope.'),assistant('You have 30 feet of rope.')]),9);
for(let i=0;i<25;i++){const saved=JSON.parse(JSON.stringify(correction));assert.equal(field.answer(saved,catalog).text,field.answer(correction,catalog).text,'Reopening saved conversation retains correction and task');}
assert.equal(field.answer([user('How do I prepare tinder for a fire?')],catalog)?.mode,'guided');
console.log('PASS: source-backed building answers, specific corner reply, rope shortages/corrections, no invented replacements, unrelated-chat routing and 25 saved-conversation reopen checks.');
// Exercise the real send path and persistence, not only the answer helper.
(async()=>{
 const vm=require('node:vm'),fs=require('node:fs'),store=new Map();
 const source=fs.readFileSync('offline-ai-chat-v42.js','utf8').replace('window.AEGIS_CHAT={references,','window.AEGIS_CHAT={send,references,');
 function reopen(){
  const input={value:'',focus(){}},status={},thread={replaceChildren(){},append(){},scrollHeight:0};
  const nodes={'aegis-chat-input':input,'aegis-chat-status':status,'aegis-chat-thread':thread,'aegis-response-mode':{value:'auto'}};
  const window={AEGIS_INTELLIGENCE:I,AEGIS_FIELD_ANSWERS:field,AEGIS_PHASE3:{catalog:()=>catalog},AEGISNative:{status(){throw Error('Supported procedure must not wait for model startup')},complete(){throw Error('Supported procedure must not invoke the model')}}};
  const sandbox={window,document:{readyState:'loading',addEventListener(){},getElementById:id=>nodes[id],createElement:()=>({style:{},append(){}})},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},navigator:{userAgent:'iPhone',platform:'iPhone'}};
  vm.runInNewContext(source,sandbox);return {input,status,api:window.AEGIS_CHAT};
 }
 let ui=reopen();ui.input.value=question;await ui.api.send();assert.equal(ui.input.value,'');assert.match(ui.status.textContent,/Guide-backed answer/);assert.equal(ui.api.getHistory().at(-1).role,'assistant');assert.match(ui.api.getHistory().at(-1).text,/9 feet of rope/);
 ui=reopen();assert.equal(ui.api.getHistory().length,2,'Both user question and answer survive a full JS restart');
 ui.input.value='Actually I only have 3 feet of rope. Can I still do it?';await ui.api.send();assert.match(ui.api.getHistory().at(-1).text,/3 feet of rope/);
 ui=reopen();ui.input.value='How do I attach the corners?';await ui.api.send();assert.match(ui.api.getHistory().at(-1).text,/Stake four corners/);assert.match(ui.api.getHistory().at(-1).text,/3 feet of rope/);assert.doesNotMatch(ui.api.getHistory().at(-1).text,/9 feet of rope/);
 assert.equal(ui.api.getHistory().length,6);
 console.log('PASS: actual send -> render -> save -> restart -> corrected rope -> restart -> corner follow-up, without model or network access.');
})().catch(e=>{console.error(e);process.exitCode=1});
