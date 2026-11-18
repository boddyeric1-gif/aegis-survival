const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const session={window:{},fetch(){throw Error('Recipes must work offline')}};
vm.runInNewContext(fs.readFileSync('assistant-planning-v60.js','utf8'),session);
const planner=session.window.AEGIS_ASSISTANT_PLANNING;
const user=text=>({role:'user',text});
const question="I have brown rice, chicken broth, kidney beans, canned chicken, canned corn and potato’s, canned pineapples, and a few cans of green beans. Can you give me a recipe to make with the food I have?";
const original=[user(question)];
const first=planner.answer(original);
assert.match(first.text,/Pineapple chicken and corn brown rice bowl/);
assert.match(first.text,/Suggested amounts for 2 servings/);
assert.match(first.text,/½ cup brown rice/);
assert.match(first.text,/Ingredients[\s\S]*Directions/);
assert.match(first.text,/fold it through with a spoonful of its juice/i);
assert.match(first.text,/Set aside kidney beans/);
assert.doesNotMatch(first.text,/olive oil|soy sauce|15 oz/i);
const another=planner.answer([...original,first,user('Give me another recipe')]);
assert.match(another.text,/soup/);
assert.match(another.text,/Simmer the potato cubes/);
assert.notEqual(first.text,another.text);
const correction=[...original,first,user('Actually I have no broth. How do I change it?')];
assert.doesNotMatch(planner.answer(correction).text,/broth/i);
const canned=[...correction,planner.answer(correction),user("They're canned.")];
assert.match(planner.answer(canned).text,/½ cup canned kidney beans/);
const cold=[...canned,user('Actually I have no stove.')];
assert.match(planner.answer(cold).text,/chopped salad/);
assert.match(planner.answer(cold).text,/Toss.*with diced pineapple/);
assert.doesNotMatch(planner.answer(cold).text,/Simmer|Boil|sauté/);
assert.match(planner.answer([...original,user('Make it for four people')]).text,/4 servings[\s\S]*1 cup brown rice/);
assert.doesNotMatch(planner.answer([...original,user('Make it vegetarian.')]).text,/chicken/i);
assert.doesNotMatch(planner.answer([...original,user("I'm allergic to chicken. Remove chicken.")]).text,/chicken/i);
assert.match(planner.answer([...original,user('I have no pot.'),user('How much rice can I use?')]).text,/Save the uncooked brown rice/);
assert.equal(planner.answer([...original,user('How do I attach the tarp corners?')]),null);
assert.equal(planner.answer([user('If I had rice and canned tuna, what meal could I cook?')]),null);
for(const [prompt,expected] of [
 ['Eggs, spinach, cheddar, oil. What can I make?',/Spinach scramble[\s\S]*folding in the cheese/],
 ['I have tortillas, peanut butter and banana. Give me a recipe.',/Banana and peanut butter roll-ups/],
 ['I have flour, milk, butter, eggs and baking powder. Can I make pancakes?',/Skillet pancakes[\s\S]*flip and cook/],
 ['I have canned tuna and canned chickpeas. I have no stove. What can I eat?',/Tuna chopped salad/],
 ['I have potatoes, canned carrots and canned chicken. Give me a meal recipe.',/Simmer the potato cubes/],
 ['I have oats, banana and peanut butter. What can I make?',/Banana oatmeal/],
 ['I have raw chicken and dried kidney beans. I have no stove. Give me a meal recipe.',/Which foods do you have that are ready to eat/],
]){
 const recipe=planner.answer([user(prompt)]);
 assert.ok(recipe,prompt);
 assert.match(recipe.text,expected,prompt);
}
const novel=[user('I have couscous, miso, and canned corn. Can you make a recipe?')];
assert.equal(planner.answer(novel),null,'Leave an unknown combination for the recipe model');
assert.match(planner.recipeContext(novel),/couscous, miso, and canned corn/);
assert.match(planner.recipeContext([...novel,user('Actually I have no corn.')]),/corn: NOT AVAILABLE[\s\S]*couscous, miso/);
assert.equal(planner.answer([...original,user('Can I make a casserole instead?')]),null);
assert.match(planner.answer([...original,user('I only have pasta and canned tuna. Give me a recipe.')]).text,/Tuna pasta/i);
for(let i=0;i<25;i++)assert.equal(planner.answer(JSON.parse(JSON.stringify(cold))).text,planner.answer(cold).text);
console.log('PASS: original pantry, recipe variations, quantities, restrictions, diverse ingredient lists, open-ended recipe context and saved history.');
