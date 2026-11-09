/* Deterministic, on-device passage retrieval. No model or external search calls. */
(()=>{'use strict';
const STOP=new Set('a an the to of in on for from with and or is are was were it this that how what why when where can could would should do does did i me my we you your please tell show help need want about some have has be use using'.split(' '));
const STEM=w=>w.length>5?w.replace(/(?:ing|ed|es|s)$/,''):w;
const tokens=s=>(String(s).toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>w.length>2&&!STOP.has(w)).map(STEM);
const ALIASES={purify:['purification','disinfection'],purifying:['purification','disinfection'],purification:['purify','disinfection'],tarp:['poncho','shelter'],tent:['poncho','shelter'],ignite:['fire','tinder'],lost:['direction','signal'],twine:['cordage'],kindling:['tinder'],cord:['cordage','rope'],rope:['cordage'],hypothermia:['cold'],dehydrated:['dehydration'],shelters:['shelter'],bowline:['bowline']};
function create(data){
 const docs=[],postings=new Map();let total=0;
 for(const page of data.pages){if(page.page<10||!page.text.trim())continue;
 const body=page.text.replace(/^FM 3-05\.70\s*\n/,'').replace(/\n\s*(?:\d+-\d+|[A-I]-\d+|[ivx]+)\s*$/,'').trim();
 // Page-scoped overlapping windows retain exact PDF-page provenance.
 for(let start=0;start<body.length;){let end=Math.min(body.length,start+950);if(end<body.length){const boundary=body.lastIndexOf('\n',end);if(boundary>start+450)end=boundary;}
 const text=body.slice(start,end).trim();if(text.length>70){const terms=tokens(text),freq=new Map();for(const t of terms)freq.set(t,(freq.get(t)||0)+1);const doc={id:docs.length,page:page.page,label:page.label||'',heading:page.heading||'',text,length:terms.length};docs.push(doc);total+=terms.length;for(const [term,tf]of freq){if(!postings.has(term))postings.set(term,[]);postings.get(term).push([doc.id,tf]);}}
 if(end===body.length)break;const overlap=Math.max(start+1,end-130),space=body.indexOf(' ',overlap);start=space>=0&&space<end?space+1:end;
 }
 }
 const avg=total/Math.max(docs.length,1),N=docs.length;
 const memo=new Map();
 function search(query,limit=4){const cacheKey=String(query).trim().toLowerCase()+'::'+limit;if(memo.has(cacheKey))return memo.get(cacheKey).map(x=>({...x}));const original=[...new Set(tokens(query))].slice(0,18);if(!original.length)return[];
 const expanded=new Set(original);for(const word of String(query).toLowerCase().split(/\W+/))for(const alt of ALIASES[word]||[])expanded.add(STEM(alt));
 const scores=new Map(),matches=new Map();for(const term of expanded){const hits=postings.get(term)||[],idf=Math.log(1+(N-hits.length+.5)/(hits.length+.5));for(const[id,tf]of hits){const dl=docs[id].length;const s=idf*(tf*2.2)/(tf+1.2*(.25+.75*dl/avg));scores.set(id,(scores.get(id)||0)+s*(original.includes(term)?1:.65));if(original.includes(term)){if(!matches.has(id))matches.set(id,new Set());matches.get(id).add(term);}}}
 const topicBoost=(heading)=>{const q=String(query).toLowerCase();const targets=[[/shelter|tarp|poncho|lean.to/,/^Chapter 5 /],[/tinder|kindling|fire|ignite/,/^Chapter 7 /],[/water|purif|disinfect/,/^Chapter 6 /],[/compass|navigation|direction|north/,/^Chapter 18 /],[/bowline|knot|cordage|rope/,/^Appendix G /]];return targets.some(([qre,hre])=>qre.test(q)&&hre.test(heading))?2:1};
 const ranked=[...scores].map(([id,score])=>{const d=docs[id],matched=matches.get(id)?.size||0;return{...d,score:score*(.5+matched/Math.max(original.length,1))*topicBoost(d.heading),matched}}).filter(x=>x.matched>0).sort((a,b)=>b.score-a.score);
 const selected=[];for(const r of ranked){if(selected.some(x=>x.page===r.page))continue;selected.push(r);if(selected.length>=Math.min(10,Math.max(1,limit)))break;}if(memo.size>=80)memo.delete(memo.keys().next().value);memo.set(cacheKey,selected);return selected.map(x=>({...x}));
 }
 return{search,pages:data.pages,stats:{pages:data.pageCount,passages:docs.length,terms:postings.size},source:data};
}
window.AEGIS_FM_SEARCH={create,tokens};
})();
