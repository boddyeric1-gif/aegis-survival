/* Offline task planning: user-reported pantry, corrections and complete meal methods.
   Food safety: FDA Bad Bug Book (kidney beans), USDA FSIS leftovers guidance.
   This is compositional field-assistant logic, not a claim of model reasoning. */
(()=>{'use strict';
const foods=[
 ['brown rice',/\bbrown rice\b/,'grain'],['rice',/\brice\b/,'grain'],['pasta',/\b(?:pasta|noodles|spaghetti|macaroni)\b/,'grain'],['oats',/\b(?:oats|oatmeal)\b/,'grain'],
 ['chicken broth',/\b(?:chicken broth|broth|stock)\b/,'liquid'],['kidney beans',/\bkidney beans?\b/,'bean'],['black beans',/\bblack beans?\b/,'bean'],['chickpeas',/\b(?:chickpeas|garbanzo beans)\b/,'bean'],
 ['chicken',/\bchicken\b/,'protein'],['tuna',/\btuna\b/,'protein'],['corn',/\bcorn\b/,'vegetable'],['potatoes',/\bpotato(?:es|s|[’']s)?\b/,'starch'],['green beans',/\bgreen beans?\b/,'vegetable'],['carrots',/\bcarrots?\b/,'vegetable'],['peas',/\bpeas\b/,'vegetable'],['tomatoes',/\btomato(?:es|s)?\b/,'vegetable'],['pineapple',/\bpineapples?\b/,'fruit'],['peaches',/\bpeaches\b/,'fruit'],['applesauce',/\bapplesauce\b/,'fruit']
];
const recipeIntent=/\b(?:recipe|meal|dinner|lunch|breakfast|what (?:can|could|should) (?:i|we) (?:make|cook|eat)|cook(?:ing)?|make (?:food|something to eat))\b/i;
const otherTask=/\b(?:shelter|tarps?|rope|compass|navigate|purify|knot|kindling|tinder|who are you|capital of|new (?:topic|question))\b/i;
const noHeat=/\b(?:no|without|don['’]?t have|do not have|can['’]?t use)\s+(?:a |any )?(?:heat|stove|fire|fuel|cooker)\b/i;
function pantry(messages){
 const stock=new Map();let heat=null,water=null,cookware=null,diet=null,active=false;
 for(const m of messages){if(m.role!=='user')continue;const text=m.text||'';if(otherTask.test(text)&&!recipeIntent.test(text)){active=false;continue}
  if(recipeIntent.test(text))active=true;
  if(/\b(?:no|without|don't have|don’t have) (?:a |any )?(?:pot|pan|cookware)\b/i.test(text))cookware=false;else if(/\b(?:have|got) (?:a |some )?(?:pot|pan|cookware)\b/i.test(text))cookware=true;
  if(/\b(?:not|no longer) (?:vegan|vegetarian)\b/i.test(text))diet=null;else if(/\b(?:vegan|vegetarian|no meat)\b/i.test(text))diet='vegetarian';
  if(/\b(?:start over|new pantry|only (?:have|got)|all (?:i|we) have)\b/i.test(text))stock.clear();
  if(/\b(?:if i (?:had|have)|imagine|suppose)\b/i.test(text))continue;
  if(noHeat.test(text))heat=false;else if(/\b(?:have|got|can use)\s+(?:a |the )?(?:stove|heat|fire|cooker)\b/i.test(text))heat=true;
  if(/\b(?:no|without|out of|don't have|don’t have)\s+(?:clean |safe |drinking |any )?water\b/i.test(text))water=false;
  else if(/\b(?:have|got)\s+(?:clean |safe |drinking |some )?water\b/i.test(text))water=true;
  if(!active)continue;
  // Scope form markers to each list clause. A can of broth doesn't make nearby dry beans canned.
  const clauses=text.toLowerCase().split(/[,;.?!]|\b(?:and|but|instead of)\b/);
  for(const clause of clauses){let consumed=clause;
   for(const [name,re,kind]of foods){const match=re.exec(consumed);if(!match)continue;
    if(name==='rice'&&/brown rice/.test(clause))continue;
    if(name==='chicken'&&/chicken broth/.test(consumed)){consumed=consumed.replace(/chicken broth/g,'');if(!re.test(consumed))continue}
    const before=consumed.slice(0,consumed.search(re));
    const missing=/\b(?:no|without|out of|don't have|don’t have|do not have|used up|ran out of|remove|leave out|skip|allergic to|can't eat|can’t eat|cannot eat)\b/.test(before)||/\b(?:is gone|is all gone|is finished)\b/.test(consumed);
    const assertion=/\b(?:have|got|there is|there are|pantry|canned|cans?|dried|raw|cooked|actually|instead|only|no|without|remove|skip|allergic|don't|don’t)\b/.test(text.toLowerCase());
    if(!assertion&&!stock.has(name))continue;
    const form=/\bnot canned\b/.test(clause)?'unknown':/\b(?:canned|cans?|tinned)\b/.test(clause)?'canned':/\b(?:fully cooked|already cooked|cooked)\b/.test(clause)?'cooked':/\b(?:dry|dried|raw|uncooked)\b/.test(clause)?'raw':stock.get(name)?.form||'unknown';
    stock.set(name,{name,kind,form,missing});
   }
  }
  if(/\b(?:allergic to|can't eat|can’t eat|cannot eat) chicken\b/i.test(text)){for(const [k,v]of stock)if(k.includes('chicken'))stock.set(k,{...v,missing:true})}
  // Resolve unambiguous pronoun replies to the most recent bean-form question.
  if(/^(?:yes[, ]+)?(?:they(?:'re| are)|the beans are|those are) (?:canned|fully cooked)/i.test(text.trim())){for(const [k,v]of stock)if(v.kind==='bean'&&!v.missing)stock.set(k,{...v,form:/canned/i.test(text)?'canned':'cooked'})}
 }
 return {items:[...stock.values()],heat,water,cookware,diet,active};
}
function answer(messages){
 const state=pantry(messages),last=messages.filter(m=>m.role==='user').at(-1)?.text||'';
 if(/\b(?:poison|vomit|sick|refrigerat|leftovers|storage|safe to eat)\b/i.test(last))return null;
 if(!state.active||otherTask.test(last)&&!recipeIntent.test(last))return null;
 // Nutrition, storage, poisoning and unrelated follow-ups go to the normal assistant.
 if(!recipeIntent.test(last)&&! /\b(?:it|that|those|they|beans|rice|broth|instead|actually|only|more|less|amount|much|many|servings?|people|no |without|stove|heat|water|canned|cook|pot|pan|cookware|vegetarian|vegan|step|potato|remove|allergic|skip|chicken|tuna)\b/i.test(last))return null;
 const have=state.items.filter(x=>!x.missing&&!(state.diet&&(x.kind==='protein'||x.name==='chicken broth'))),usable=have.filter(x=>!['bean','protein'].includes(x.kind)||['canned','cooked'].includes(x.form));
 if(!have.length)return null;
 const known=have.map(x=>(x.form==='canned'?'canned ':x.form==='cooked'?'cooked ':'')+x.name);
 const excluded=have.filter(x=>['bean','protein'].includes(x.kind)&&!['canned','cooked'].includes(x.form));
 const caution=excluded.length?'Leave out '+excluded.map(x=>x.name).join(' and ')+' for now: '+excluded.map(x=>x.kind==='bean'?'are the '+x.name+' canned/fully cooked, or dried?':'is the '+x.name+' canned/fully cooked, or raw?').join(' ')+' Dried kidney beans need separate safe preparation; do not just warm them in this meal.':'';
 const side=usable.filter(x=>x.kind==='fruit'),add=usable.filter(x=>['protein','bean','vegetable'].includes(x.kind));
 const grain=usable.find(x=>x.kind==='grain'),potato=usable.find(x=>x.name==='potatoes'),broth=usable.find(x=>x.kind==='liquid');
 const cold=state.heat===false||state.cookware===false||state.water===false&&!broth;
 const ready=usable.filter(x=>['canned','cooked'].includes(x.form)&&x.kind!=='liquid'&&(x.kind!=='grain'||x.form==='cooked'));
 let title,steps=[];
 if(cold){
  if(!ready.length)return {role:'assistant',mode:'planned',text:'I can’t build a no-cook meal from confirmed ready-to-eat ingredients yet. Which of your foods are canned or already cooked? '+caution,sources:[]};
  title='No-cook pantry plate';steps=['Use only intact, properly stored cans labeled ready-to-eat, or safely stored cooked food. Open and drain '+ready.map(x=>x.name).join(', ')+'.', 'Combine the savory items, or eat them separately. '+(side.length?'Keep '+side.map(x=>x.name).join(' and ')+' as a side.':''), 'Make only what you can eat now if you have no refrigeration.'];
  if(grain)steps.push('Leave uncooked '+grain.name+' out; it needs safe cooking liquid and heat.');
 }else if(grain){
  title=grain.name[0].toUpperCase()+grain.name.slice(1)+' pantry bowl';
  if(grain.form==='cooked'){steps.push('Use safely stored cooked '+grain.name+'. When reheating leftovers, bring the whole dish to 165°F (74°C).')}else steps.push('Choose an amount of '+grain.name+' that fits your pot and the liquid available. Use its package’s liquid ratio and cooking time'+(broth?'; '+broth.name+' can replace some or all of the water.':'; you need safe drinking water.')+'');
  if(grain.form!=='cooked')steps.push(grain.name==='pasta'?'Boil the pasta as directed until tender, then drain.':'Cook '+grain.name+' as directed until tender. Keep the pot covered if the package directs it, and do not let it boil dry.');
  const fresh=add.filter(x=>x.kind==='vegetable'&&!['canned','cooked'].includes(x.form));if(fresh.length)steps.push('If '+fresh.map(x=>x.name).join(' and ')+' are fresh or frozen, wash/prepare them as appropriate and cook separately until tender before combining. Follow package directions for frozen vegetables.');
  if(add.length)steps.push('Stir in '+add.map(x=>(x.form==='canned'?'drained canned ':x.form==='cooked'?'cooked ':'')+x.name).join(', ')+'. Heat the mixture through.');
  if(potato)steps.push(potato.form==='canned'?'Drain and cut the canned potatoes; add them near the end to warm through.':'Wash, dice and cook the potatoes separately until fork-tender; then add them. Do not expect raw potatoes to cook just by stirring them into finished rice.');
  steps.push('Serve'+(side.length?' with '+side.map(x=>x.name).join(' and ')+' on the side': ' when ready')+'.');
 }else if(potato){
  title='Potato pantry pot';steps=[potato.form==='canned'?'Drain and cut the canned potatoes.':'Wash and dice the potatoes; simmer in safe water until fork-tender, then drain.', 'Add '+(add.map(x=>x.name).join(', ')||'the potatoes to the pot')+(broth?' with enough '+broth.name+' for the consistency you want':'; use a little safe water if needed to prevent sticking')+'. Heat through.', 'Serve'+(side.length?' with '+side.map(x=>x.name).join(' and ')+' separately':'')+'.'];
 }else if(ready.length){title='Ready-to-eat pantry plate';steps=['Open and drain '+ready.map(x=>x.name).join(', ')+'. Use intact, properly stored ready-to-eat cans.', 'Combine savory items; keep fruit separate. Eat cold if the labels allow, or warm gently in a pot.'];}
 else return null;
 const quantities=/\b(?:how much|how many|amount|servings?|people|feed)\b/i.test(last)?'\nAmounts: package sizes determine portions. How much '+(grain?.name||potato?.name||'food')+' do you have, and how many are eating (if you haven’t already said)? I won’t guess portions.':'';
 return {role:'assistant',mode:'planned',sources:[],text:title+'\n\nFrom your list: '+known.join(', ')+'.\n\n'+steps.map((s,i)=>(i+1)+'. '+s).join('\n')+(caution?'\n\n'+caution:'')+quantities+'\n\nSave leftovers below 40°F (4°C) within 2 hours, or 1 hour above 90°F (32°C). Without safe refrigeration, make only what you can eat now.'};
}
function context(messages){const s=pantry(messages);return s.active&&s.items.length?'User-reported pantry (latest corrections win): '+s.items.map(x=>x.name+': '+(x.missing?'NOT AVAILABLE':x.form)).join('; ')+(s.diet?'; VEGETARIAN MEAL REQUEST':'')+(s.cookware===false?'; NO COOKWARE':'')+(s.heat===false?'; NO HEAT':'')+(s.water===false?'; NO SAFE WATER':''):''}
window.AEGIS_ASSISTANT_PLANNING={pantry,answer,context};
})();
