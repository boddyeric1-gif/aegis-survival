const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('offline-ai-chat-v42.js','utf8').replace('window.AEGIS_CHAT={references,','window.AEGIS_CHAT={send,references,');
const planning=fs.readFileSync('assistant-planning-v60.js','utf8');
const store=new Map();let calls=0,request;const rendered=[];
function reopen(){
 const input={value:'',focus(){}},status={},thread={replaceChildren(){rendered.length=0},append(...a){rendered.push(...a)},scrollHeight:0};
 const nodes={'aegis-chat-input':input,'aegis-chat-status':status,'aegis-chat-thread':thread,'aegis-chat-length':{value:'120'},'aegis-response-mode':{value:'auto'}};
 const window={AEGISNative:{status:async()=>({ready:true,integrity_ok:true,model:'fixture'}),completeDetailed:async q=>{request=q;calls++;return calls===1?{text:'A detailed explanation of how the process works and what happens next, with an unfinished final instruction to continue the process by',finish_reason:'length'}:{text:'checking the result. Then you are finished.',finish_reason:'stop'}}}};
 const c={window,performance,navigator:{userAgent:'iPhone',platform:'iPhone'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{readyState:'loading',addEventListener(){},getElementById:id=>nodes[id],createElement:tag=>({tag,style:{},children:[],append(...a){this.children.push(...a)}})}};
 vm.runInNewContext(planning,c);vm.runInNewContext(source,c);return{api:window.AEGIS_CHAT,input,status,window};
}
(async()=>{
 let ui=reopen();ui.input.value='Explain how a mechanical clock works.';await ui.api.send();assert.equal(calls,1);assert.equal(ui.api.getHistory().at(-1).incomplete,true);assert.match(ui.status.textContent,/Response limit reached/);assert(rendered.at(-1).children.some(x=>x.textContent==='Continue answer'));
 ui=reopen();assert.equal(ui.api.getHistory().at(-1).incomplete,true,'Cutoff state survives full JS restart');
 await ui.api.send(true);assert.equal(calls,2);assert(request.messages.some(x=>x.role==='assistant'&&x.content.endsWith('process by')));assert(request.messages.some(x=>x.role==='user'&&x.content.includes('mechanical clock')));assert.equal(ui.api.getHistory().at(-1).incomplete,false);assert.match(ui.status.textContent,/Local answer finished/);
 ui=reopen();ui.input.value='I have rice, canned tuna, and canned corn. Give me a meal recipe.';await ui.api.send();assert.equal(calls,2,'Recipe planner works with no inference');assert.equal(ui.api.getHistory().at(-1).mode,'planned');
 ui=reopen();ui.input.value='Actually I have no stove.';await ui.api.send();assert.match(ui.api.getHistory().at(-1).text,/chopped salad/);assert.equal(calls,2);assert.match(ui.status.textContent,/Pantry plan complete/);
 ui=reopen();ui.input.value='I have couscous, miso and canned corn. Can you make a recipe?';await ui.api.send();
 assert.equal(calls,3);assert.match(request.system,/couscous, miso and canned corn/);assert.equal(request.sources.length,0);assert(request.max_tokens>120);
 ui=reopen();ui.window.AEGISNative.status=async()=>({ready:false,reason:'model unavailable'});
 ui.input.value='I have plantains, tamarind and coconut cream. Give me a recipe.';await ui.api.send();
 assert.equal(calls,3);assert.match(ui.input.value,/plantains/);assert.match(ui.status.textContent,/Your draft is still here/);
 console.log('PASS: real send/render/save/restart, persisted cutoff marker, Continue button and context, completed continuation and offline recipe corrections without inference.');
})().catch(e=>{console.error(e);process.exitCode=1});
