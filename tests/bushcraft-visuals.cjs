const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{dispatchEvent(){}},Event:class{},document:{createElement(){return{}},head:{append(){}},getElementById(){return null}}};vm.createContext(ctx);
for(const name of ['phase3-procedure-router.js','bushcraft-visuals-v41.js','bushcraft-v41.js'])vm.runInContext(read(name),ctx,{filename:name});
const catalog=ctx.window.AEGIS_PHASE3.catalog(),visuals=ctx.window.AEGIS_BUSHCRAFT_VISUALS;
assert.equal(catalog.length,26);assert.equal(visuals.count(),130);
const seen=new Set();
for(const lesson of catalog){assert.equal(lesson.steps.length,5);for(let i=0;i<5;i++){
 const uri=visuals.render(lesson.title,i);assert(uri.startsWith('data:image/svg+xml;charset=utf-8,'));
 const svg=decodeURIComponent(uri.slice(uri.indexOf(',')+1));assert(svg.includes('step '+(i+1)+'</title>'));assert(!svg.includes('undefined'));assert(!svg.includes('<image'));assert(!seen.has(svg),'Repeated step image');seen.add(svg);
}}
const sw=read('sw.js'),html=read('index.html'),assets=JSON.parse(sw.match(/const ASSETS=(\[[^;]+\]);/)[1]);
for(const file of assets)if(file!=='./')assert(fs.existsSync(file),'Missing precache asset: '+file);
for(const file of ['bushcraft-v41.js','bushcraft-visuals-v41.js']){assert(assets.includes('./'+file));assert(html.includes('src="'+file+'"'));}
assert(html.indexOf('src="bushcraft-visuals-v41.js"')<html.indexOf('src="bushcraft-v41.js"'));
assert(!/src="bushcraft-photo-steps/.test(html),'Retired photo lookup must not run');
assert(read('bushcraft-v41.js').includes('dialog.showModal()'));
assert(read('manual-offline-check.js').includes('bushcraft-visuals-v41.js'));
console.log('PASS: 26 lessons, 130 unique matching embedded images, correct script order, precache files and enlargement wiring.');
