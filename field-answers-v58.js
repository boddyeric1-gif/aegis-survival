/* Guide-backed practical answers. No generated steps, invented supplies or network calls. */
(()=>{'use strict';
const plain=x=>Array.isArray(x)?x.join(': '):String(x||'');
const words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12,fifteen:15,twenty:20,thirty:30};
const number=x=>Number(x)||words[x.toLowerCase()]||null;
function ropeLength(messages){
 let length=null;
 for(const m of messages){if(m.role!=='user')continue;
  const text=m.text.toLowerCase();
  if(/\b(?:do i need|will i need|would i need|should i (?:buy|get)|how much)\b/.test(text)&&! /\b(?:i (?:only )?have|i.ve got|actually)\b/.test(text))continue;
  if(/\b(?:no|without|don't have|do not have)\s+(?:any\s+)?(?:rope|cord|cordage)\b/.test(text))length=0;
  for(const hit of text.matchAll(/\b(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty)\s*(feet|foot|ft|meters?|metres?|m)\s+(?:of\s+)?(?:rope|cord|cordage)\b/g))length=number(hit[1])*(/^(m|meter|metre)/.test(hit[2])?3.28084:1);
 }
 return length;
}
function answer(messages,catalog){
 const I=window.AEGIS_INTELLIGENCE;if(!I)return null;
 const state=I.conversation(messages),last=state.last;
 // Use supported practical procedures; unrelated/general chat still goes to the AI.
 if(!['shelter','fire','knot'].includes(state.topic)||!(/\b(?:how|build|make|pitch|prepare|tie|teach|attach|corner|next|step|instead|what if|what about|still|only|actually|without|don't have|do not have)\b/i.test(last)))return null;
 const ranked=I.rank(I.retrievalQuery(messages),catalog,8);
 let candidates=ranked.filter(g=>new RegExp(state.topic==='knot'?'knot|bowline|hitch|lashing':state.topic,'i').test(g.title+' '+g.group));
 if(state.topic==='shelter'&&/\btarp\b/i.test(state.previous+' '+last))candidates=candidates.filter(g=>/tarp/i.test(g.title));
 if(/lean[ -]?to/i.test(last)){const specific=candidates.filter(g=>/lean[ -]?to/i.test(g.title));if(specific.length)candidates=specific}
 const guide=candidates[0];if(!guide||guide.score<7||!Array.isArray(guide.steps)||!guide.steps.length)return null;
 const steps=guide.steps.map(plain),materials=plain(guide.materials),constraint=[];
 const scenario=[{role:'user',text:state.previous},{role:'user',text:last}],feet=ropeLength(scenario);
 const minimum=materials.match(/(\d+)(?:\s*[–-]\s*\d+)?\s*(?:ft|feet|foot)\s+(?:of\s+)?(?:cord|rope)/i);
 const missing=I.facts(scenario).filter(f=>f.status==='missing');
 if(feet!==null&&minimum&&feet<Number(minimum[1]))constraint.push('You described '+Math.round(feet*10)/10+' feet of rope. This '+guide.title+' guide calls for '+minimum[0]+'. I cannot confirm that this layout fits your rope; allow for knots as well as the distance between anchors.');
 for(const f of missing){const aliases=f.item==='rope'||f.item==='cord'?'rope|cord|cordage':f.item;if(new RegExp('\\b(?:'+aliases+')\\b','i').test(materials)&&!constraint.some(c=>f.item==='rope'&&c.includes('feet of rope')))constraint.push('You said you do not have '+f.item+'. The guide lists it as a material; I will not assume you have it or invent a replacement.');}
 const corrected=state.follow&&/\b(?:only|actually|instead|without|don't have|do not have|no rope|less|shorter)\b/i.test(last);
 let selected=steps;
 const corners=state.topic==='shelter'&&/\b(?:attach|corners?|grommets?|tie.?outs?)\b/i.test(last);
 if(corners){const relevant=steps.filter(s=>/corner|tie.out|reinforc|stake/i.test(s));if(relevant.length)selected=relevant}
 let text;
 if(corrected&&constraint.length){text=constraint.join('\n\n')+'\n\n'+(state.topic==='shelter'?'Before selecting a different layout, what size is your tarp, and what sound supports or anchors are available?':'What materials do you still have available?');}
 else{text=(corners?'For the corners of your '+guide.title+':':'For your '+guide.title+':')+'\n\n'+(constraint.length?constraint.join('\n\n')+'\n\n':'')+(corners?'':'Guide materials (not confirmed as available): '+materials+'\n\n')+selected.map((s,i)=>(i+1)+'. '+s).join('\n')+(corners?'\n\nThe guide uses stakes and reinforced tie-out points. Does your tarp have grommets or reinforced loops, and do you have stakes?':'')+(constraint.length?'\n\nThese are the guide’s assembly steps, not confirmation that your available supplies complete this design.':'');}
 if(guide.caution)text+='\n\nLimits: '+plain(guide.caution);
 return {role:'assistant',text,mode:'guided',guide:guide.title,sources:[],constraint:constraint.length>0};
}
window.AEGIS_FIELD_ANSWERS={answer,ropeLength};
})();
