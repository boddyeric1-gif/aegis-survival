/* AEGIS Surface performance lab. Measures real local model calls; no network requests. */
(()=>{'use strict';
const KEY='aegis.surface.benchmark.v23',TARGET=10;
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);return e};
const prompts=[
 {label:'General conversation',user:'In two short sentences, explain why the sky looks blue.'},
 {label:'Survival planning',user:'I have a tarp, rope, and sleeping bag. Give three concise shelter setup steps.'},
 {label:'Follow-up continuity',user:'We already checked wind and runoff and found no hazards. What are the next three shelter steps? Do not ask about wind or runoff again.'}
];
const average=arr=>arr.reduce((s,x)=>s+x,0)/arr.length;
function evaluate(results){const valid=results.filter(r=>r.ok);if(!valid.length)return {pass:false,averageSeconds:null,medianSeconds:null,reason:'No successful inference runs'};const times=valid.map(r=>r.seconds).sort((a,b)=>a-b);const median=times[Math.floor(times.length/2)];return {pass:valid.length===results.length&&median<=TARGET,averageSeconds:+average(times).toFixed(2),medianSeconds:+median.toFixed(2),reason:valid.length!==results.length?'Some inference calls failed':median<=TARGET?'Median meets 10-second target':'Median exceeds 10-second target'};}
let running=false;
function init(){
 const root=$('aegis-chat-root');if(!root||$('aegis-benchmark-root'))return;
 const panel=el('section');panel.id='aegis-benchmark-root';panel.className='panel';panel.style.marginTop='18px';
 panel.append(el('h3','Surface Performance Lab · 10-second target'),el('p','Measures warm-model end-to-end response time on THIS device. First load/download is excluded. No online benchmark service. Results stay on this device.'));
 const row=el('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center';
 const run=el('button','Run 3-question benchmark');run.type='button';run.id='aegis-benchmark-run';
 const exportBtn=el('button','Export results');exportBtn.type='button';exportBtn.id='aegis-benchmark-export';
 const threads=el('select');threads.id='aegis-benchmark-threads';for(const n of [1,2]){const opt=el('option',n+' CPU thread'+(n===1?'':'s'));opt.value=n;threads.append(opt)}threads.value=localStorage.getItem('aegis.llm.threads')||'2';
 const apply=el('button','Save threads (reload required)');apply.type='button';
 row.append(run,exportBtn,el('label','CPU threads'),threads,apply);panel.append(row);
 const status=el('p','Ready to benchmark. Model must be downloaded and loaded.');status.id='aegis-benchmark-status';status.setAttribute('role','status');panel.append(status);
 const results=el('pre');results.id='aegis-benchmark-results';results.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';panel.append(results);root.append(panel);
 let latest=null;try{latest=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
 if(latest)results.textContent=format(latest);
 apply.addEventListener('click',()=>{localStorage.setItem('aegis.llm.threads',threads.value);status.textContent='Saved '+threads.value+' CPU thread(s). Reload AEGIS to apply. Existing model cache is preserved.'});
 run.addEventListener('click',async()=>{if(running)return;const engine=window.AEGISNative||window.AEGISWebLLM;if(!engine?.complete||!engine?.status){status.textContent='Model runtime not available.';return}const st=await engine.status();if(!st.ready){status.textContent='Model not ready: '+(st.reason||st.state);return}
 running=true;run.disabled=true;const rows=[];status.textContent='Benchmark running locally. Please keep this tab open.';
 try{for(let i=0;i<prompts.length;i++){const p=prompts[i];status.textContent='Question '+(i+1)+' of '+prompts.length+': '+p.label;const t=performance.now();try{const answer=String(await engine.complete({system:'You are AEGIS. Give a direct, helpful, short answer. Do not repeat already answered questions.',user:p.user,max_tokens:64}));rows.push({label:p.label,seconds:+((performance.now()-t)/1000).toFixed(2),characters:answer.length,ok:!!answer.trim(),answer:answer.slice(0,700)})}catch(e){rows.push({label:p.label,seconds:+((performance.now()-t)/1000).toFixed(2),ok:false,error:String(e)})}}const report={format:'AEGIS-BENCHMARK',version:23,date:new Date().toISOString(),targetSeconds:TARGET,model:st.model,backend:st.backend,threads:st.threads||Number(threads.value),offline:!navigator.onLine,results:rows,summary:evaluate(rows)};latest=report;localStorage.setItem(KEY,JSON.stringify(report));results.textContent=format(report);status.textContent=report.summary.reason+'. Run again in airplane mode to confirm offline operation.'}finally{running=false;run.disabled=false}});
 exportBtn.addEventListener('click',()=>{if(!latest){status.textContent='Run the benchmark first.';return}const blob=new Blob([JSON.stringify(latest,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='aegis-surface-benchmark.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)});
}
function format(r){return 'Model: '+r.model+'\nBackend: '+r.backend+'\nCPU threads: '+r.threads+'\nOffline: '+r.offline+'\nTarget: '+r.targetSeconds+' seconds (median of 3)\nMedian: '+r.summary.medianSeconds+' s\nAverage: '+r.summary.averageSeconds+' s\nResult: '+r.summary.reason+'\n\n'+r.results.map(x=>x.label+': '+x.seconds+' s'+(x.error?' · '+x.error:'')+'\n'+(x.answer||'')).join('\n\n');}
window.AEGIS_BENCHMARK={evaluate,prompts,TARGET};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();