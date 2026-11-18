/* Offline task planning: user-reported pantry, corrections and complete meal methods.
   Food safety: FDA Bad Bug Book (kidney beans), USDA FSIS leftovers guidance.
   This is compositional field-assistant logic, not a claim of model reasoning. */
(()=>{'use strict';
const foods=[
 ['brown rice',/\bbrown rice\b/,'grain'],['rice',/\brice\b/,'grain'],['pasta',/\b(?:pasta|noodles|spaghetti|macaroni)\b/,'grain'],['oats',/\b(?:oats|oatmeal)\b/,'grain'],
 ['chicken broth',/\b(?:chicken broth|broth|stock)\b/,'liquid'],['kidney beans',/\bkidney beans?\b/,'bean'],['black beans',/\bblack beans?\b/,'bean'],['chickpeas',/\b(?:chickpeas|garbanzo beans)\b/,'bean'],
 ['flour',/\b(?:all-purpose |plain )?flour\b/,'flour'],['milk',/\bmilk\b/,'milk'],
 ['butter',/\bbutter\b(?!\s+beans)/,'fat'],['baking powder',/\bbaking powder\b/,'leavener'],
 ['eggs',/\beggs?\b/,'egg'],['bread',/\b(?:bread|toast)\b/,'bread'],['tortillas',/\btortillas?\b/,'wrap'],
 ['onion',/\bonions?\b/,'aromatic'],['garlic',/\bgarlic\b/,'aromatic'],['oil',/\b(?:olive |vegetable |canola )?oil\b/,'fat'],
 ['lemon',/\blemons?\b/,'acid'],['lime',/\blimes?\b/,'acid'],['vinegar',/\bvinegar\b/,'acid'],
 ['bell pepper',/\b(?:bell peppers?|capsicum)\b/,'vegetable'],['spinach',/\bspinach\b/,'vegetable'],
 ['mushrooms',/\bmushrooms?\b/,'vegetable'],['zucchini',/\bzucchini\b/,'vegetable'],
 ['cucumber',/\bcucumbers?\b/,'salad'],['avocado',/\bavocados?\b/,'salad'],['lettuce',/\blettuce\b/,'salad'],
 ['banana',/\bbananas?\b/,'fruit'],['apple',/\bapples?\b/,'fruit'],['peanut butter',/\bpeanut butter\b/,'spread'],
 ['cheese',/\b(?:cheese|cheddar|mozzarella)\b/,'dairy'],['yogurt',/\byogurt\b/,'dairy'],
 ['chicken',/\bchicken\b/,'protein'],['tuna',/\btuna\b/,'protein'],['corn',/\bcorn\b/,'vegetable'],['potatoes',/\bpotato(?:es|s|[’']s)?\b/,'starch'],['green beans',/\bgreen beans?\b/,'vegetable'],['carrots',/\bcarrots?\b/,'vegetable'],['peas',/\bpeas\b/,'vegetable'],['tomatoes',/\btomato(?:es|s)?\b/,'vegetable'],['pineapple',/\bpineapples?\b/,'fruit'],['peaches',/\bpeaches\b/,'fruit'],['applesauce',/\bapplesauce\b/,'fruit']
];
const recipeIntent=/\b(?:recipe|pancakes?|meal|dinner|lunch|breakfast|what (?:can|could|should) (?:i|we) (?:make|cook|eat)|cook(?:ing)?|make (?:food|something to eat))\b/i;
const otherTask=/\b(?:shelter|tarps?|rope|compass|navigate|purify|knot|kindling|tinder|who are you|capital of|new (?:topic|question))\b/i;
const noHeat=/\b(?:no|without|don['’]?t have|do not have|can['’]?t use)\s+(?:a |any )?(?:heat|stove|fire|fuel|cooker)\b/i;
function pantry(messages){
 const stock=new Map();let inventory='',unknown=[];let heat=null,water=null,cookware=null,diet=null,active=false;
 for(const m of messages){if(m.role!=='user')continue;const text=m.text||'';if(/\b(?:if i (?:had|have)|imagine|suppose)\b/i.test(text))continue;if(otherTask.test(text)&&!recipeIntent.test(text)){active=false;continue}
  if(recipeIntent.test(text))active=true;
  const list=text.match(/\b(?:have|got|ingredients\s*:)\s+([^.!?]+)/i)?.[1]||
    (recipeIntent.test(text)?text.match(/^[^.!?]+,[^.!?]+/)?.[0]:'');
  const isList=list&&/[,;]|\band\b/i.test(list)&&!/^no\b/i.test(list);
  if(isList){
   if(recipeIntent.test(text)&&!/\b(?:also|still|add|instead|actually)\b/i.test(text))stock.clear();
   inventory=text;
   unknown=list.split(/[,;]|\band\b/).map(part=>part.trim()).filter(part=>part&&
    !foods.some(([,pattern])=>pattern.test(part.toLowerCase()))&&!/^(?:a |some |clean |safe )?(?:water|stove|pot|pan)\b/i.test(part));
  }
  if(/\b(?:no|without|don't have|don’t have) (?:a |any )?(?:pot|pan|cookware)\b/i.test(text))cookware=false;else if(/\b(?:have|got) (?:a |some )?(?:pot|pan|cookware)\b/i.test(text))cookware=true;
  if(/\b(?:not|no longer) (?:vegan|vegetarian)\b/i.test(text))diet=null;else if(/\b(?:vegan|vegetarian|no meat)\b/i.test(text))diet=/\bvegan\b/i.test(text)?'vegan':'vegetarian';
  if(/\b(?:start over|new pantry|only (?:have|got)|all (?:i|we) have)\b/i.test(text)){stock.clear();if(!isList){inventory='';unknown=[]}}
  if(noHeat.test(text))heat=false;else if(/\b(?:have|got|can use)\s+(?:a |the )?(?:stove|heat|fire|cooker)\b/i.test(text))heat=true;
  if(/\b(?:no|without|out of|don't have|don’t have)\s+(?:clean |safe |drinking |any )?water\b/i.test(text))water=false;
  else if(/\b(?:have|got)\s+(?:clean |safe |drinking |some )?water\b/i.test(text))water=true;

  // Scope form markers to each list clause. A can of broth doesn't make nearby dry beans canned.
  const clauses=text.toLowerCase().split(/[,;.?!]|\b(?:and|but|instead of)\b/);
  for(const clause of clauses){let consumed=clause;
   for(const [name,re,kind]of foods){const match=re.exec(consumed);if(!match)continue;
    if(name==='butter'&&/peanut butter/.test(clause))continue;
    if(name==='rice'&&/brown rice/.test(clause))continue;
    if(name==='chicken'&&/chicken broth/.test(consumed)){consumed=consumed.replace(/chicken broth/g,'');if(!re.test(consumed))continue}
    const before=consumed.slice(0,consumed.search(re));
    const missing=/\b(?:no|without|out of|don't have|don’t have|do not have|used up|ran out of|remove|leave out|skip|allergic to|can't eat|can’t eat|cannot eat)\b/.test(before)||/\b(?:is gone|is all gone|is finished)\b/.test(consumed);
    const assertion=/\b(?:have|got|there is|there are|pantry|canned|cans?|dried|raw|cooked|actually|instead|only|no|without|remove|skip|allergic|don't|don’t)\b/.test(text.toLowerCase());
    if(!assertion&&!isList&&!stock.has(name))continue;
    const form=/\bnot canned\b/.test(clause)?'unknown':/\b(?:canned|cans?|tinned)\b/.test(clause)?'canned':/\b(?:fully cooked|already cooked|cooked)\b/.test(clause)?'cooked':/\b(?:dry|dried|raw|uncooked)\b/.test(clause)?'raw':stock.get(name)?.form||'unknown';
    stock.set(name,{name,kind,form,missing});
   }
  }
  if(/\b(?:allergic to|can't eat|can’t eat|cannot eat) chicken\b/i.test(text)){for(const [k,v]of stock)if(k.includes('chicken'))stock.set(k,{...v,missing:true})}
  // Resolve unambiguous pronoun replies to the most recent bean-form question.
  if(/^(?:yes[, ]+)?(?:they(?:'re| are)|the beans are|those are) (?:canned|fully cooked)/i.test(text.trim())){for(const [k,v]of stock)if(v.kind==='bean'&&!v.missing)stock.set(k,{...v,form:/canned/i.test(text)?'canned':'cooked'})}
 }
 return {items:[...stock.values()],heat,water,cookware,diet,active,inventory,unknown};
}
function requestsOtherCookingMethod(text){
 return /\b(?:pizza|cake|cookies?|muffins?|bake|oven|casserole|smoothie|air fryer|microwave)\b/i.test(text);
}
function answer(messages){
 const state=pantry(messages),last=messages.filter(m=>m.role==='user').at(-1)?.text||'';
 if(/\b(?:poison|vomit|sick|refrigerat|leftovers|storage|safe to eat)\b/i.test(last))return null;
 if(!state.active||otherTask.test(last)&&!recipeIntent.test(last))return null;
 // Nutrition, storage, poisoning and unrelated follow-ups go to the normal assistant.
 if(!recipeIntent.test(last)&&! /\b(?:it|that|those|they|beans|rice|broth|instead|actually|only|more|less|amount|much|many|servings?|people|no |without|stove|heat|water|canned|cook|pot|pan|cookware|vegetarian|vegan|another|different|something else|soup|stew|chowder|step|potato|remove|allergic|skip|chicken|tuna)\b/i.test(last))return null;
 const have=state.items.filter(x=>!x.missing&&!(state.diet&&(x.kind==='protein'||x.name==='chicken broth'||state.diet==='vegan'&&['egg','dairy','milk'].includes(x.kind)||state.diet==='vegan'&&x.name==='butter'))),usable=have.filter(x=>!['bean','protein'].includes(x.kind)||['canned','cooked'].includes(x.form));
 if(!have.length)return null;
 if(state.unknown.length||/\b(?:wild|foraged|unidentified) mushrooms?\b/i.test(state.inventory||last))return null;
 const excluded=have.filter(item=>['bean','protein'].includes(item.kind)&&!usable.includes(item));
 const note=excluded.length?'\n\nSet aside '+excluded.map(item=>item.name).join(' and ')+
  ' until you confirm whether '+(excluded.length===1?'it’s':'they’re')+' canned or fully cooked.'+
  (excluded.some(item=>item.name==='kidney beans')?' Dried kidney beans require separate preparation.':''):'';
 const portion=(last.match(/\bfor (one|two|three|four|five|six|seven|eight)\b/i)?.[1]||'').toLowerCase();
 const servings=({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8})[portion]||Number(last.match(/\b(?:for|serves?)\s+(\d{1,2})(?:\s+(?:people|servings))?\b/i)?.[1]||
  messages.filter(m=>m.role==='user').map(m=>m.text.match(/\b(?:for|serves?)\s+(\d{1,2})\s+(?:people|servings)\b/i)?.[1]).filter(Boolean).at(-1))||2;
 const cups=n=>{
  const value=+(n*servings/2).toFixed(3);
  const whole=Math.floor(value), fraction=({0.125:'⅛',0.25:'¼',0.375:'⅜',0.5:'½',0.625:'⅝',0.75:'¾',0.875:'⅞'})[value-whole];
  return (fraction?(whole||'')+fraction:value)+' cup'+(value>1?'s':'');
 };
 const select=(...kinds)=>usable.filter(item=>kinds.includes(item.kind));
 const grain=select('grain')[0], potato=select('starch')[0], broth=select('liquid')[0];
 const oil=select('fat')[0], acid=select('acid')[0], fruit=select('fruit')[0];
 const filling=select('protein','bean','vegetable').slice(0,3);
 const savory=select('protein','bean','vegetable','salad','starch','grain').filter(item=>
  ['canned','cooked'].includes(item.form)||item.kind==='salad'||item.name==='tomatoes');
 const cold=state.heat===false||state.cookware===false;
 const wantsCold=cold||/\b(?:no[- ]cook|cold salad)\b/i.test(last);
 const wantsSoup=/\b(?:soup|stew|chowder)\b/i.test(last);
 const wantsAnother=/\b(?:another|different|something else)\b/i.test(last);
 const lastDish=messages.filter(m=>m.mode==='planned').at(-1)?.text||'';
 const name=item=>(item.form==='canned'?'canned ':item.form==='cooked'?'cooked ':'')+item.name;
 const amount=(item,n)=>cups(n)+' '+name(item);
 const dish=(title,ingredients,steps)=>({title,ingredients,steps});
 const yogurt=select('dairy').find(item=>item.name==='yogurt');
 const dressing=yogurt?'plain yogurt, if yours is unsweetened':acid?(acid.name==='vinegar'?'a splash of vinegar':'a squeeze of '+acid.name):fruit?.name==='pineapple'?'a spoonful of pineapple juice':'a spoonful of liquid from a ready-to-eat vegetable can, if available';
 const dressingIngredient=yogurt?cups(.25)+' plain yogurt (optional)':acid?name(acid):fruit?.name==='pineapple'?'Pineapple juice from the can (optional)':'A spoonful of liquid from the vegetable can (optional)';
 const potatoPrep=potato&&['canned','cooked'].includes(potato.form)?
  'Drain if canned and dice the potatoes.':'Scrub and dice the potatoes into small cubes.';
 const vegetables=filling.filter(item=>item.kind==='vegetable');
 const cookedFilling=filling.filter(item=>item.kind!=='vegetable'||['canned','cooked'].includes(item.form));
 const fresh=filling.filter(item=>!cookedFilling.includes(item));
 const prepFresh=fresh.length?'Chop '+fresh.map(item=>item.name).join(' and ')+' and cook until tender before folding them in. ':'';
 const protein=select('protein','bean')[0];
 const flavor=protein?protein.name+((vegetables[0]||potato)?' and ':'')+(vegetables[0]?.name||potato?.name||''):(vegetables.map(item=>item.name).slice(0,2).join(' and ')||potato?.name||grain?.name||'pantry');
 const titleCase=text=>text[0].toUpperCase()+text.slice(1);
 const recipes=[];
 if(!wantsCold&&(broth||state.water!==false)&&(potato||grain?.name.includes('rice'))&&(filling.length||broth)){
  const useRice=!potato&&grain?.name.includes('rice');
  const base=useRice?grain:potato;
  const soupBase=cups(2)+' '+(broth?'chicken broth'+(state.water===false?'':' (top up with drinking water if needed)'):'drinking water');
  const simmer=useRice?(grain.form==='cooked'?'Bring the liquid to a simmer. Keep the cooked rice for the final step.':
   'Simmer the rice in the liquid until tender, using the timing on the package.'):
   ['canned','cooked'].includes(potato.form)?'Bring the liquid to a simmer. Keep the cooked potatoes for the final step.':
   'Simmer the potato cubes in the liquid until fork-tender, about 10–15 minutes.';
  const addAtEnd=[...cookedFilling,...(['canned','cooked'].includes(base.form)?[base]:[])];
  recipes.push(dish(titleCase(flavor)+(broth?' soup':' stew'),
   [soupBase,amount(base,useRice&&grain.form!=='cooked'?.25:1.5),...filling.map(item=>amount(item,.5))],
   [useRice?'Measure the rice and the cooking liquid.':potatoPrep,
    simmer,
    ...(fresh.length?['Add '+fresh.map(item=>item.name).join(' and ')+' and simmer until tender.']:[]),
    ...(addAtEnd.length?['Drain any canned solids, then stir in '+addAtEnd.map(name).join(', ')+'.']:[]),
    'Bring the soup to a boil and serve.']));
 }
 if(!wantsCold&&grain&&grain.name!=='oats'&&(grain.form==='cooked'||broth||state.water!==false)){
  const pasta=grain.name==='pasta';
  const bowlFlavor=protein?protein.name+(vegetables[0]?' and '+vegetables[0].name:''):vegetables.map(item=>item.name).slice(0,2).join(' and ');
  const pineapple=fruit?.name==='pineapple'&&filling.length;
  const liquid=broth?'chicken broth'+(state.water===false?'':' or drinking water'):'drinking water';
  const liquidLabel=pasta?(broth?'Chicken broth'+(state.water===false?'':' or drinking water')+' for boiling':'Drinking water for boiling'):
   'Cooking liquid per the rice package ('+liquid+')';
  recipes.unshift(dish(titleCase([pineapple?'pineapple':'',bowlFlavor,pasta?'pasta':grain.name+' bowl'].filter(Boolean).join(' ')),
   [amount(grain,grain.form==='cooked'?1.5:pasta?1:.5),...(grain.form==='cooked'?[]:[liquidLabel]),
    ...filling.map(item=>amount(item,.5)),...(pineapple?[amount(fruit,.25)]:[])],
   [grain.form==='cooked'?'Start with safely refrigerated cooked '+grain.name+'.':
    pasta?'Boil the pasta in '+liquid+' until just tender. Save a splash of its cooking liquid, then drain. Toss it back into the pasta to loosen the mixture as needed.':
    'Simmer the '+grain.name+' in '+liquid+' using the package ratio and timing. Let it rest covered for 5 minutes, then fluff.',
    ...(fresh.length?[prepFresh.trim()]:[]),
    ...(cookedFilling.length?['Drain any canned solids. Fold '+cookedFilling.map(item=>name(item)).join(', ')+' into the hot '+grain.name+'.']:[]),
    pineapple?'Chop the pineapple and fold it through with a spoonful of its juice. Heat to 165°F if using leftovers, then serve.':
     grain.form==='cooked'?'Heat the mixture to 165°F and serve.':'Toss everything together over low heat until hot, then serve.']));
 }
 const eggs=select('egg')[0], flour=select('flour')[0], milk=select('milk')[0];
 if(!wantsCold&&eggs&&flour&&milk&&oil){
  const leavener=select('leavener')[0];
  recipes.unshift(dish(leavener?'Skillet pancakes':'Thin skillet pancakes',
   [cups(.5)+' flour',cups(.75)+' milk',String(Math.ceil(servings/2))+' egg'+(servings>2?'s':''),
    ...(leavener?[String(servings/2)+' tsp baking powder']:[]),'A little '+oil.name],
   ['Whisk the egg and milk together. Whisk in the flour'+(leavener?' and baking powder':'')+' until the batter comes together.',
    'Lightly grease a skillet and warm it over medium heat. Pour a small ladleful of batter into the pan.',
    'When the edges look dry and the underside is golden, flip and cook the other side. Repeat until the batter is used.']));
 }
 if(/\bpancakes?\b/i.test(last)&&!recipes.some(item=>/pancakes/.test(item.title)))return null;
 const cheese=select('dairy').find(item=>item.name==='cheese');
 if(!wantsCold&&eggs&&oil&&!/\bpancakes?\b/i.test(last)){
  const veg=select('aromatic','vegetable').slice(0,2);
  recipes.unshift(dish(veg.length?titleCase(veg.map(item=>item.name).join(' and '))+' scramble':'Soft scrambled eggs',
   [String(2*servings)+' eggs','A little '+oil.name,...veg.map(item=>amount(item,.25)),...(cheese?[amount(cheese,.25)]:[])],
   [veg.length?'Chop '+veg.map(item=>item.name).join(' and ')+' and sauté in '+oil.name+' over medium heat until tender.':'Warm a little '+oil.name+' in a skillet over medium-low heat.',
    'Beat the eggs. Reduce the heat to medium-low and pour the eggs into the skillet.',
    'Push the eggs gently across the skillet as they set'+(cheese?', folding in the cheese at the end':'')+'. Cook until fully set and serve.']));
 }
 const wrap=select('wrap','bread')[0], spread=select('spread')[0];
 if(wrap&&spread&&fruit){
  recipes.unshift(dish(titleCase(fruit.name)+' and peanut butter '+(wrap.kind==='wrap'?'roll-ups':'sandwiches'),
   [String(servings)+' '+(wrap.kind==='wrap'?'tortillas':'pairs of bread slices'),String(servings*2)+' tbsp peanut butter',amount(fruit,1)],
   ['Slice or finely chop the '+fruit.name+'. Drain it first if canned.',
    'Spread the peanut butter evenly, layer on the fruit, and '+(wrap.kind==='wrap'?'roll up each tortilla.':'close each sandwich.')]));
 }
 if(savory.length&&(wantsCold||!recipes.length||wrap)){
  const mix=savory.slice(0,4);
  const base=mix[0].name;
  recipes.push(dish(titleCase(base)+(wrap?(wrap.kind==='wrap'?' salad wraps':' salad sandwiches'):' chopped salad'),
   [...mix.map(item=>amount(item,.5)),...(wrap?[String(servings)+' '+(wrap.kind==='wrap'?'tortillas':'pairs of bread slices')]:[]),
    ...(fruit?.name==='pineapple'?[amount(fruit,.25)]:[]),dressingIngredient],
   [(mix.some(item=>item.form==='canned')?'Drain the ready-to-eat canned ingredients. ':'')+
    (mix.some(item=>['salad','starch'].includes(item.kind)||item.name==='tomatoes')?'Dice the vegetables into bite-size pieces. ':'')+
    (mix.some(item=>item.kind==='protein')?'Flake the '+mix.find(item=>item.kind==='protein').name+' with a fork.':'Combine the prepared ingredients in a bowl.'),
    'Toss '+mix.map(item=>item.name).join(', ')+(fruit?.name==='pineapple'?' with diced pineapple':'')+'. Dress with '+dressing+'.',
    wrap?'Spoon the filling into '+wrap.name+' and serve.':'Let it sit for a few minutes so the flavors mix, then serve.']));
 }
 if(!wantsCold&&grain?.name==='oats'&&(state.water!==false||grain.form==='cooked')){
  recipes.push(dish(titleCase(fruit?.name||'warm')+' oatmeal',
   [amount(grain,grain.form==='cooked'?1.5:.5),...(grain.form==='cooked'?[]:['Drinking water per oat package']),...(fruit?[amount(fruit,.5)]:[]),...(spread?[String(servings)+' tbsp peanut butter']:[])],
   [grain.form==='cooked'?'Reheat the safely stored oatmeal to 165°F.':'Cook the oats in drinking water according to the package until creamy.',
    'Spoon into bowls'+(fruit?' and top with chopped '+fruit.name:'')+(spread?' with peanut butter swirled in':'')+'.']));
 }
 if(!recipes.length&&cold&&excluded.length)return {role:'assistant',mode:'planned',sources:[],
  text:'Which foods do you have that are ready to eat? With no heat, I need a canned or fully cooked ingredient to build this recipe.'+note};
 if(!recipes.length||wantsSoup&&!recipes.some(item=>/soup|stew/.test(item.title)))return null;
 if(requestsOtherCookingMethod(last))return null;
 const requested=/\bpancakes?\b/i.test(last)?recipes.find(item=>/pancakes/.test(item.title)):wantsSoup?recipes.find(item=>/soup|stew/.test(item.title)):null;
 const different=recipes.find(item=>!lastDish.startsWith(item.title));
 if(wantsAnother&&!requested&&!different)return null;
 const recipe=requested||(wantsAnother?different:null)||recipes[0];
 const intro=recipe.title+'\n\nSuggested amounts for '+servings+(servings===1?' serving':' servings')+'. Scale down if you have less.';
 const ingredients=recipe.ingredients.map(item=>'• '+item).join('\n');
 const steps=recipe.steps.map((step,i)=>(i+1)+'. '+step).join('\n');
 return {role:'assistant',mode:'planned',sources:[],text:intro+'\n\nIngredients\n'+ingredients+'\n\nDirections\n'+steps+note+(wantsCold&&grain&&grain.form!=='cooked'?'\n\nSave the uncooked '+grain.name+' for a recipe with heat.':'')};
}

function context(messages){const s=pantry(messages);return s.active&&s.items.length?'User-reported pantry (latest corrections win): '+s.items.map(x=>x.name+': '+(x.missing?'NOT AVAILABLE':x.form)).join('; ')+(s.diet?'; '+s.diet.toUpperCase()+' MEAL REQUEST':'')+(s.cookware===false?'; NO COOKWARE':'')+(s.heat===false?'; NO HEAT':'')+(s.water===false?'; NO SAFE WATER':''):''}
function recipeContext(messages){
 const state=pantry(messages),last=messages.at(-1)?.text||'';
 if(!state.active||!(recipeIntent.test(last)||/^(?:actually|instead|what about|can (?:i|we)|make it|another|something else)\b/i.test(last)))return '';
 return 'Recipe request. Create one named dish with suggested amounts, servings, and numbered cooking directions. Use only reported ingredients. Water, heat and cookware must be conditional if unconfirmed. Respect removals, allergies and dietary limits. Ask one focused question if a missing fact prevents an appropriate recipe. Keep optional substitutions separate. Use commercial ready-to-eat cans only in no-cook dishes. Do not use unidentified wild foods or undercooked dried beans. '+context(messages)+
  (state.inventory?' Original ingredient list: '+state.inventory.slice(0,500):'')+
  ' User additions or corrections: '+messages.filter(m=>m.role==='user'&&m.text!==state.inventory&&m.text!==last&&
   /\b(?:have|got|add|allergic|without|skip|use up|instead|no)\b/i.test(m.text)).slice(-3).map(m=>m.text.slice(0,110)).join(' / ');
}
window.AEGIS_ASSISTANT_PLANNING={pantry,answer,context,recipeContext};
})();
