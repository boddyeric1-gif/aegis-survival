/* AEGIS Phase 3: deterministic offline procedure router, not generative AI. */
(()=>{'use strict';
const STOP=new Set('the a an and or to for with from have has got my your our can could would should what how please help show tell make build need want using about into of on in at do i me we you is are it this that then there some any'.split(' '));
const ALIASES={bannock:['camp bread','skillet bread'],hardtack:['travel biscuit','trail biscuit'],cordage:['rope','twine','string'],handline:['fishing line','catch fish'],shelter:['tarp shelter','lean to','rain shelter'],rehydration:['diarrhea dehydration','ors','rehydration drink'],cough:['honey lemon','cough syrup'],gargle:['sore throat'],digging:['digging stick'],forage:['edible plants','wild plants'],tracking:['animal tracks'],mallet:['wooden hammer']};
const tokenize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w));
const entries=[];
function register(kind,items){for(const x of items||[]){const title=x.title||x.name;if(!title)continue;entries.push({kind,title,group:x.group||'',materials:x.ingredients||x.gear||'',steps:x.steps||x.method||'',caution:x.caution||x.hazard||'',context:x.context||''});}}
function isQuestion(s){return /\b(?:how|recipe|instructions|guide|steps|teach|show|make|build|prepare|cook|bake|fix|repair|learn|what is|what are|find)\b/i.test(s)||/\?/.test(s)}
function score(query,entry){const q=new Set(tokenize(query)),title=tokenize(entry.title),group=tokenize(entry.group);let value=0;for(const t of title)if(q.has(t))value+=3;for(const t of group)if(q.has(t))value+=.5;for(const [key,words] of Object.entries(ALIASES)){const all=[key,...words];if(all.some(w=>query.includes(w))&&all.some(w=>entry.title.toLowerCase().includes(w)))value+=5;}return value;}
function format(x,query){let lines=['OFFLINE FIELD PROCEDURE: '+x.title,'Collection: '+x.group,'Materials: '+x.materials];if(Array.isArray(x.steps)){lines.push('Procedure:');for(let i=0;i<x.steps.length;i++){const st=x.steps[i];lines.push((i+1)+'. '+(Array.isArray(st)?st[0]+': '+st[1]:String(st)));}}else lines.push('Method: '+x.steps);lines.push('Safety and limitations: '+x.caution);if(x.context)lines.push('Context: '+x.context);lines.push('Source status: Original offline reference; not independently field-validated.');return lines.join('\n\n');}
function match(raw){const query=String(raw||'').toLowerCase().trim();if(!isQuestion(query)||query.length<5)return null;
 // Do not override immediate hazard triage or ongoing emergency dialogue.
 if(/\b(?:not breathing|unresponsive|blue lips|chest pain|severe bleeding|fire in|smell gas|carbon monoxide poisoning)\b/.test(query))return null;
 const ranked=entries.map(e=>({e,s:score(query,e)})).sort((a,b)=>b.s-a.s);
 const best=ranked[0],second=ranked[1];if(!best||best.s<5)return null;
 // Ambiguous short queries should ask for specificity rather than invent a recipe.
 if(second&&second.s>=best.s&&best.e.title!==second.e.title&&tokenize(query).length<=2)return {kind:'clarify',text:'Several offline procedures match. Please name the skill or recipe more specifically: '+ranked.slice(0,3).map(r=>r.e.title).join('; ')};
 return {kind:'offline_procedure',topic:best.e.title,score:best.s,text:format(best.e,query)};
}
window.AEGIS_PHASE3={register,match,stats:()=>({procedures:entries.length})};
})();