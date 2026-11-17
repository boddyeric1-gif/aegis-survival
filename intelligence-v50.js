/* Bounded local retrieval and explicit conversation facts. No network or model dependency. */
(()=>{'use strict';
const stop=new Set('i we you a an the is are it this that how what can do to of for with and my have has please help tell me'.split(' '));
const words=s=>String(s||'').toLowerCase().match(/[a-z0-9]+/g)||[];
const tokens=s=>words(s).filter(w=>w.length>2&&!stop.has(w));
const aliases={rope:['cord','cordage','string','twine'],shelter:['tarp','lean','aframe'],fire:['tinder','kindling','ignition'],knot:['bowline','hitch','lashing'],water:['rainwater','storage','sanitation'],food:['bannock','cooking','recipe']};
function rank(query,entries,limit=4){const q=tokens(query),expanded=new Set(q);for(const [key,list]of Object.entries(aliases))if(q.some(t=>t===key||list.includes(t)))for(const t of [key,...list])expanded.add(t);if(!q.length)return[];const seen=new Set();return entries.map(e=>{const title=tokens(e.title),body=tokens([e.group,e.materials,JSON.stringify(e.steps),e.context].join(' '));let score=0;for(const t of expanded)score+=(title.includes(t)?(q.includes(t)?8:3):0)+(body.includes(t)?1:0);if(String(e.title).toLowerCase().includes(String(query).toLowerCase().trim()))score+=15;return{...e,score}}).filter(e=>e.score>0).sort((a,b)=>b.score-a.score||a.title.length-b.title.length).filter(e=>{const key=String(e.title).toLowerCase().replace(/[^a-z0-9]/g,'');if(seen.has(key))return false;seen.add(key);return true}).slice(0,limit)}
const items=['tarp','rope','cord','cordage','knife','matches','lighter','pot','pan','blanket','water','flour','salt','wood','batteries','compass','map','stakes','groundsheet'];
function facts(messages){const state=new Map();for(const m of messages){if(m.role!=='user')continue;let mode=null;for(const clause of String(m.text).toLowerCase().split(/[.;!?]|\bbut\b|\band\b|,/)){const neg=/\b(?:do not have|don't have|dont have|without|ran out of|no more|no)\b/.test(clause),pos=/\b(?:i (?:only )?have|we (?:only )?have|i've got|we've got|now have|found|brought)\b/.test(clause);if(/\b(?:if|suppose|imagine|maybe|might)\b/.test(clause)){mode=null;continue}if(neg)mode='missing';else if(pos)mode='reported';else if(/\b(?:can|could|would|should|if|maybe|might)\b/.test(clause))mode=null;if(!mode)continue;for(const item of items)if(new RegExp('\\b'+item+'\\b').test(clause))state.set(item==='cord'||item==='cordage'?'rope':item,mode)}}return [...state].map(([item,status])=>({item,status}))}
// Resolve short follow-ups from USER turns, never from generated model claims.
const topics=[['shelter',/\b(?:shelter|tarps?|lean[ -]?to|tent)\b/i],['fire',/\b(?:fire|tinder|kindling|ignite)\b/i],['water',/\b(?:water|purif\w*|disinfect\w*)\b/i],['food',/\b(?:food|cook\w*|bread|bannock)\b/i],['knot',/\b(?:knot|bowline|hitch|lashing)\b/i],['navigation',/\b(?:compass|navigate|navigation|lost)\b/i]];
const topicOf=text=>{
 // The requested activity takes precedence over a material mentioned in passing.
 if(/\b(?:purif\w*|disinfect\w*|treat|boil)\b.{0,35}\bwater\b/i.test(text))return 'water';
 if(/\b(?:build|make|pitch)\b.{0,35}\b(?:shelter|lean[ -]?to|tent)\b/i.test(text))return 'shelter';
 return topics.find(([,re])=>re.test(text))?.[0]||'';
};
const independent=text=>/\b(?:new question|different topic|who (?:are|and)|what are you|your name|hello|hi|histor\w*|capital of|calculate|weather forecast)\b/i.test(text);
function conversation(messages){
 const users=messages.filter(m=>m.role==='user'),last=users.at(-1)?.text||'';let topic=topicOf(last),prior=[],anchored=false;
 if(!independent(last)){for(let i=users.length-2;i>=0&&prior.length<4;i--){const candidate=users[i],oldTopic=topicOf(candidate.text);if(independent(candidate.text)||(topic&&oldTopic&&topic!==oldTopic))break;if(!topic&&oldTopic)topic=oldTopic;if(oldTopic&&oldTopic===topic)anchored=true;prior.unshift(candidate.text)}}
 const follow=anchored&&!!prior.length&&!!topic&&(!!topicOf(last)||/\b(?:it|that|those|instead|next|again|still|actually|only|less|more|attach|corner|corners|step|why|how|what about|what if)\b/i.test(last)||last.length<120);
 return {last,previous:follow?prior.join('\n'):'',topic:topicOf(last)||(follow?topic:''),follow};
}
function query(messages){const c=conversation(messages);return c.previous?c.previous.slice(-700)+' '+c.last:c.last}
function retrievalQuery(messages){const c=conversation(messages);return c.topic?[c.topic,c.topic==='shelter'&&/\btarp\b/i.test(c.previous+' '+c.last)?'tarp':'',c.last].join(' '):query(messages)}
function context(messages,catalog,budget=900){const resolved=retrievalQuery(messages),guides=rank(resolved,catalog,2),stock=facts(messages);const lines=[];for(const g of guides){const steps=(Array.isArray(g.steps)?g.steps.map(s=>Array.isArray(s)?s.join(': '):String(s)): [g.steps]).filter(Boolean);lines.push('[AEGIS guide: '+g.title+'] Needs: '+g.materials+'. Steps: '+steps.join('; '))}return{query:resolved,guides,stock,text:lines.join('\n').slice(0,budget)}}
window.AEGIS_INTELLIGENCE={rank,facts,query,context,conversation,retrievalQuery};
})();
