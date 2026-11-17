const fs=require('fs'),vm=require('vm');
const c={window:{dispatchEvent(){}},Event:class{},document:{readyState:'loading',addEventListener(){},createElement(){return{}},head:{append(){}},getElementById(id){return id==='aegis-chat-length'?{value:'120'}:null}},navigator:{userAgent:'iPhone',platform:'iPhone'},localStorage:{getItem(){return null}}};vm.createContext(c);
for(const f of ['phase3-procedure-router.js','practical-skills-v11.js','pioneer-handbook-v11.js','deep-shelter-earthworks.js','field-guide-expansion-v13.js','bushcraft-visuals-v41.js','bushcraft-v41.js','fm-search-v42.js','intelligence-v50.js','field-answers-v58.js','offline-ai-chat-v42.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
const engine=c.window.AEGIS_FM_SEARCH.create(JSON.parse(fs.readFileSync('manuals/fm-3-05-70.json')));
c.window.AEGIS_FM={search:engine.search,promptContext:(q,b)=>engine.search(q,2).map(r=>'[FM PDF page '+r.page+'] '+r.text.replace(/\s+/g,' ')).join('\n').slice(0,b)};
module.exports={context:c,chat:c.window.AEGIS_CHAT,intelligence:c.window.AEGIS_INTELLIGENCE,engine,field:c.window.AEGIS_FIELD_ANSWERS};
