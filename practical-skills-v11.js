/* AEGIS: practical food procurement and fieldcraft, offline text, draft for field review. */
(()=>{'use strict';
const guides=[
{group:'Hunting & food',name:'Hunting and tracking: a field workflow',gear:'Weatherproof notebook, sturdy footwear, map, water, first aid, binoculars if available',steps:[
['Choose a target species','Identify which animals are present using a local field guide. Learn the difference between tracks, scat, feeding signs and resting areas before making decisions.'],
['Scout without disturbing','Look for tracks in soft ground, trails through vegetation, browsed plants and fresh droppings. Observe from downwind and keep your distance.'],
['Record the pattern','Mark time, weather, wind, water sources and sign freshness. Repeated observations matter more than one track.'],
['Plan a safe return','Mark your start point and a return time. Avoid unfamiliar cliffs, water crossings and areas with poor visibility.'],
['Prioritize a clean, humane outcome','Use only equipment and methods you are trained to operate, within applicable seasons and local rules. Never take a shot without a positively identified animal and a safe backstop.'],
['Avoid spoilage','If harvesting food, plan clean field dressing and rapid cooling before leaving. Discard meat with signs of illness or contamination.']],hazard:'Never fire toward a road, building, unknown background or another person. Untrained hunting and poor meat handling can cause serious injury or illness.'},
{group:'Hunting & food',name:'Simple fishing: bank line and baited hook',gear:'Fishing line, appropriate hook, sinker or float if available, rod or safe handline spool, legal bait, pliers, water container',steps:[
['Identify a safe, permitted location','Choose stable bank access away from floodwater, power lines, and fast currents. Identify species and local consumption advisories.'],
['Match the tackle','Use a hook sized for the likely fish, a line with suitable breaking strength and a float or weight to present bait at the desired depth.'],
['Tie the hook securely','Pass line through the hook eye, wrap the tag around the standing line several turns, return through the small loop at the eye, wet, tighten and trim; test the knot with a steady pull.'],
['Set the bait and depth','Attach bait firmly enough to stay on the hook; position the float or weight so the bait can be found by fish without snagging the bottom.'],
['Fish with control','Keep hooks away from people and pets. Watch for a float dip or line movement, lift with controlled tension and avoid sudden jerks.'],
['Land and handle','Use wet hands or a landing net. Remove hooks with pliers, following species-specific handling advice. Keep or release according to rules.'],
['Keep food cold','If keeping fish, dispatch humanely and chill promptly. Do not eat fish from contaminated water.']],hazard:'Hooks, water and fishing line are hazardous. Never wrap a loaded handline around fingers. Do not eat unidentified or advisory-restricted fish.'},
{group:'Hunting & food',name:'Bow and arrow: understanding a simple traditional bow',gear:'Straight-grained seasoned wood, appropriate bowstring, commercially made arrows, protective eyewear, supervised archery range',steps:[
['Understand the components','A bow stores energy as its limbs bend; the grip is the central handhold and the string transfers energy to an arrow. The arrow requires a shaft, point, nock and stabilizing fletching.'],
['Choose a safe learning path','Begin with a low-draw-weight, inspected training bow and matched commercial arrows. Improvised bows and arrows can fracture unpredictably.'],
['Inspect before use','Look for cracks, splinters, twisting, damaged string loops, loose arrow points and bent shafts. Do not shoot damaged equipment.'],
['Learn safe range handling','Use an approved target and backstop. Keep everyone behind the shooting line, and only nock an arrow when the range is clear.'],
['Practice form at low draw weight','Stand balanced, grip without excessive torque, draw smoothly and release toward the target only on a clear range. Never dry-fire a bow.'],
['Build proficiency before hunting','Learn local bowhunting rules, animal anatomy, ethical range limits, tracking wounded game and food handling with a qualified instructor.']],hazard:'A functional bow is a projectile weapon. Do not improvise a hunting bow from untested materials or shoot without a safe backstop; poor arrows can shatter.'},
{group:'Hunting & food',name:'Small-game traps: choosing and checking humane equipment',gear:'Species identification guide, commercially manufactured species-appropriate live-capture trap, protective gloves, inspection schedule',steps:[
['Identify the species','Use tracks, habitat and observation to distinguish target animals from pets, protected wildlife and nontarget species.'],
['Select a humane method','For learning and lawful wildlife management, prefer a commercially manufactured species-specific live-capture trap with manufacturer instructions rather than improvised crushing or constricting mechanisms.'],
['Choose a protected location','Follow the manufacturer placement guidance. Avoid areas frequented by children, pets and non-target animals.'],
['Set only with a check plan','Arrange frequent inspections consistent with local requirements and weather. Never leave a captured animal exposed to heat, cold or dehydration.'],
['Respond without handling wildlife','Keep distance from captured animals. Follow wildlife agency or qualified rehabilitator guidance for lawful release, dispatch or transfer.'],
['Clean and store','Wear protective gloves, clean equipment safely, and document what worked without harming non-target animals.']],hazard:'Improvised snares and deadfalls can injure people, pets and wildlife. This entry is not an operational snare/deadfall construction manual.'},
{group:'Foraging',name:'Wild edible plants: positive identification workflow',gear:'Regional field guide with photographs of plant parts, notebook, clean collection bags, water',steps:[
['Learn one species at a time','Study an edible species and all local poisonous lookalikes before collecting anything. Learn leaf arrangement, stem, flowers, fruit, habitat and season.'],
['Inspect the whole plant','Compare multiple features on the actual specimen. One matching leaf shape or an image-app suggestion is not enough.'],
['Rule out dangerous sites','Avoid roadsides, sprayed lawns, industrial sites, flood deposits and water with contamination advisories.'],
['Confirm with reliable references','Use multiple reputable regional guides or a qualified local expert. If any important feature is uncertain, do not eat it.'],
['Harvest conservatively','Take only what is allowed and needed. Leave roots and enough plants for regeneration unless an approved species-specific method says otherwise.'],
['Prepare according to species','Some plants require cooking or removal of particular parts; never generalize across species. Keep samples separate and label them.']],hazard:'Do not taste an unidentified plant as a test. Some poisonous plants closely resemble edible ones; cooking does not make every toxin safe.'},
{group:'Foraging',name:'Mushrooms: safe identification and avoidance',gear:'Regional mushroom guide, camera, notebook, collection basket for observation only',steps:[
['Treat unknown mushrooms as inedible','Some deadly mushrooms resemble edible species and can cause delayed symptoms.'],
['Document rather than taste','Photograph cap, gills or pores, stem base, habitat and nearby trees without destroying the specimen.'],
['Compare multiple features','Spore print, bruising, season and growth substrate may help trained identifiers, but no single feature proves edibility.'],
['Get qualified confirmation','Only consume wild mushrooms identified by a competent local expert familiar with the region.'],
['Keep uncertain samples separate','Do not mix unidentified mushrooms with food. Wash hands and equipment after handling specimens.']],hazard:'Never use AI photo recognition alone to decide whether a mushroom is edible. If poisoning is suspected, seek emergency medical help promptly.'},
{group:'Food & preservation',name:'Field dressing and cooling: food-safety priorities',gear:'Clean knife and gloves if trained, potable water, clean food-contact bags, cooler and ice when available',steps:[
['Assess before handling','Do not handle wildlife that appeared sick, died of unknown causes, or has unusual lesions. Keep children and pets away.'],
['Protect yourself','Wear disposable gloves, cover cuts, avoid contact with body fluids and use a clean designated work area.'],
['Prevent contamination','Keep intestinal contents, soil, hair and dirty tools away from edible meat. If contamination occurs, remove affected portions.'],
['Cool quickly','Chill meat promptly to 40°F / 4°C or below when possible; large carcasses need effective heat removal. Do not rely on cool outdoor air without checking temperature.'],
['Separate raw food','Keep raw game away from ready-to-eat food, drinking water and clean utensils.'],
['Cook thoroughly','Use a food thermometer and species-specific food-safety guidance. Freezing and smoking do not reliably eliminate all parasites.']],hazard:'Field dressing requires hands-on training; this is a contamination-prevention checklist, not a substitute for species-specific butchering instruction.'},
{group:'Navigation',name:'Lost outdoors: stop, orient and signal',gear:'Paper map, compass, whistle, flashlight, bright fabric, water, insulating layer',steps:[
['Stop moving','Pause in a safe location, control panic and check for immediate hazards. Avoid wandering farther into unfamiliar terrain.'],
['Check your position','Compare map landmarks, trail signs, slope and direction of travel. Do not trust a phone location that cannot be verified.'],
['Conserve energy and heat','Put on insulation, shelter from wind and rain, and avoid unnecessary exertion.'],
['Signal visibly and audibly','Use a whistle, bright fabric, flashlight or reflective material from safe terrain.'],
['Communicate if possible','Call emergency services if you have signal; share your last known location, route, clothing and needs.'],
['Decide whether to stay','If rescuers know your route or you cannot navigate reliably, staying in a safe visible location is often preferable to aimless travel.']],hazard:'Do not enter dangerous terrain, climb unstable structures or start uncontrolled fires to signal.'}
,{group:'Primitive tools',name:'Build a practical wooden digging stick',gear:'Straight hardwood branch approximately 1–1.5 m long, hand saw, knife, coarse abrasive, gloves',steps:[
['Choose a working branch','Find straight-grained, sound, untreated fallen hardwood about wrist thickness. Reject cracks, rot, embedded metal and knots near the working end.'],
['Determine a safe length','Stand the branch beside you; mark a length that reaches roughly chest height so you can work without stooping deeply. Keep a broad grip area.'],
['Stabilize before cutting','Brace the branch against a fixed support and saw to length with your free hand outside the cutting path. Never carve toward your body.'],
['Form a broad working wedge','On one end, remove thin controlled shavings on opposite sides to form a flattened wedge, not a sharp point. Leave enough thickness to resist splitting.'],
['Finish the grip','Round the upper end and smooth the handhold, checking the whole shaft for splinters and loose bark.'],
['Test progressively','Probe loose garden soil with gentle downward pressure; check the grain and wedge after each few uses. Do not lever rocks or dig near buried utilities.'],
['Maintain or discard','Dry after use, smooth raised splinters and replace the tool if the shaft splits or flexes excessively.']],hazard:'Not a weapon or structural pry bar. Never excavate near buried electrical, gas or water lines.'}
,{group:'Primitive tools',name:'Make two-ply reverse-wrap cordage',gear:'Known nonirritating legal-to-harvest plant fibers or salvaged cotton strips, water, scissors or safe cutting tool',steps:[
['Choose the fiber','Use long flexible fibers from a positively identified nonirritating plant or clean salvaged cloth. Avoid brittle, moldy or chemically treated fibers.'],
['Prepare equal bundles','Separate fibers into two roughly equal bundles, remove weak sections and overlap short pieces to create a continuous working length.'],
['Start the first twist','Hold the starting point firmly. Twist the far bundle away from your body until it tightens but does not kink.'],
['Cross the strands','Bring the twisted far bundle over the near bundle toward your body. The former near bundle becomes the far bundle.'],
['Repeat at even tension','Twist the new far bundle away, cross it toward you, and maintain a uniform diameter along the cord.'],
['Splice additional fiber','Overlap fresh fibers into one strand before it runs out, then into the other strand at a different point to avoid a single weak joint.'],
['Finish and inspect','Tie a stopper knot at each end, gently flex the cord and inspect every join for slippage or cracking.'],
['Use only for low-risk tasks','Try tying a small dry bundle or repairing a pouch. Never use homemade cordage for climbing, rescue, lifting people or securing heavy overhead loads.']],hazard:'Cord strength is unpredictable, especially when wet or abraded. Practice cordage is not safety-rated.'}
,{group:'Fishing',name:'Assemble and fish a simple handline from shore',gear:'Fishing line, appropriate legal hook, sinker or float, bait, smooth hand spool, pliers, small cooler and ice',steps:[
['Check the site and rules','Choose a stable public bank, verify permission, species, season and local fish-consumption advisories. Avoid swift currents and slippery ledges.'],
['Prepare the hand spool','Wind enough line onto a smooth purpose-built spool without knots or tangles. Never wrap active fishing line around your fingers or wrist.'],
['Attach the hook','Pass the tag end through the hook eye, tie a recognized fishing knot appropriate to the line, moisten and tighten; test with a steady pull before baiting.'],
['Control bait depth','Attach a float for suspended bait or a suitable sinker for bottom fishing. Position them so the bait stays clear of obvious snags.'],
['Bait without injury','Hold the hook by the shank with pliers or careful grip, keep the point away from skin and attach lawful bait securely.'],
['Lower or cast safely','Check behind and beside you for people, pets and power lines. Lower the line or make a gentle short cast without whipping the hook.'],
['Watch and retrieve','Watch the float or feel for sustained tension. Retrieve steadily with the spool, keeping line off bare fingers and away from clothing.'],
['Handle the catch','Use wet hands or a net, remove hooks with pliers, identify the species and follow lawful keep or release rules.'],
['Preserve food promptly','If keeping fish, dispatch humanely, keep out of direct sun and place on ice immediately. Do not consume fish from waters with relevant advisories.']],hazard:'Open hooks and loaded line can injure hands. Fish can contain contaminants or parasites; cook to appropriate food-safe temperature.'}
,{group:'Foraging',name:'Forage safely without guessing edible species',gear:'Printed regional botany guide, magnifier, notebook, camera, labeled bags and known food reserves',steps:[
['Start with habitat','Write down region, elevation, season, moisture and surrounding trees. These help narrow possibilities but do not prove identity.'],
['Document the entire plant','Record leaf arrangement, leaf edges, stem shape, flowers or fruit, roots if already exposed, and overall growth habit.'],
['Compare toxic look-alikes','Use a reputable regional reference to identify at least two distinguishing features separating the candidate from dangerous look-alikes.'],
['Cross-check independently','Confirm with a second authoritative source or qualified local botanist; image recognition is not sufficient for ingestion decisions.'],
['Check the edible part','Verify exactly which part is edible, at what stage, and whether cooking or processing is required. Do not generalize across related species.'],
['Inspect collection site','Reject plants from sprayed roadsides, polluted streams, industrial ground, animal-waste areas and protected land.'],
['Harvest conservatively','Take only legally permitted amounts; leave enough for wildlife and regeneration, and avoid uprooting entire stands.'],
['Keep specimens separate','Label each collection with date, location and tentative identification. Never mix uncertain specimens with known food.'],
['Apply a strict stop rule','If any essential identifying feature is absent or contradictory, do not eat it. There is no universal safe taste or edibility test.']],hazard:'Misidentification can be fatal. This workflow intentionally does not declare any particular wild plant safe to eat.'}
,{group:'Hunting & food',name:'Track small game and plan a lawful food harvest',gear:'Local species guide, map, notebook, weatherproof clothing, binoculars, legal hunting equipment only if trained',steps:[
['Define the food objective','Estimate how much food is needed and whether fishing, stored food or other lawful options are safer than hunting.'],
['Verify rules before scouting','Identify land access, current season, permits, protected species and approved methods with the relevant wildlife authority.'],
['Find likely habitat','Study water sources, cover, feeding areas and terrain transitions on a map without entering private land.'],
['Read several signs','Photograph tracks beside a size reference; note stride, direction, scat and feeding sign without handling waste.'],
['Assess freshness cautiously','Compare track edges, rain, wind and new debris; a single print cannot reliably establish when an animal passed.'],
['Observe at a distance','Use binoculars from stable ground, avoid nests and dens, and positively identify species before any harvest decision.'],
['Choose a safe return route','Mark the starting point, expected return time and an alternate path; avoid pursuing animals into cliffs or flood channels.'],
['Prioritize humane competence','Only use legal equipment you know how to operate. Never take a shot without a clear target, safe background and realistic ability to recover the animal.'],
['Plan handling before harvesting','Have clean gloves, appropriate tools, a cooler and a way to chill meat promptly; otherwise postpone the harvest.']],hazard:'This is a tracking and harvest-planning guide, not authorization to hunt without training or permission.'}
,{group:'Food & preservation',name:'Make a safe no-refrigeration food plan',gear:'Shelf-stable packaged food, clean water, manual can opener, labels, notebook, sealed bins',steps:[
['Count mouths and days','List people and pets, age-related needs, allergies and the number of days the plan must cover.'],
['Inventory ready-to-eat food','Separate canned beans, fish, fruit, crackers, nut butter and other shelf-stable items from foods needing cooking or refrigeration.'],
['Read serving sizes','Calculate approximate daily energy and protein from package labels; do not assume one can equals one meal.'],
['Check water demands','Identify foods that require added drinking water and prioritize ready-to-eat options when water is scarce.'],
['Build a rotating menu','Assign breakfast, midday and evening food for each person, distributing protein and calories across the day.'],
['Pack safe opening tools','Keep a manual can opener, clean utensils, soap and handwashing water alongside the food.'],
['Control contamination','Use opened cans promptly; discard swollen, leaking or heavily damaged containers and never taste-test questionable food.'],
['Protect against pests','Store supplies in sealed food-grade bins above damp floors, away from chemicals and heat.'],
['Run a one-day rehearsal','Try the menu without electricity, note missing tools or insufficient portions, and revise before an emergency.']],hazard:'Food needs vary. This is a planning workflow, not a medically individualized nutrition prescription.'}
,{group:'Primitive tools',name:'Make and test a low-load wooden mallet',gear:'Sound hardwood branch with thick head section, hand saw, rasp or sandpaper, gloves, eye protection',steps:[
['Select a natural head','Choose an untreated sound hardwood piece with a thicker striking section and narrower handhold; avoid deep knots and splits.'],
['Mark the shape','Decide on a comfortable grip and a flat striking face without removing so much material that the head becomes weak.'],
['Brace for cutting','Support the wood on a stable bench or ground block; keep both hands outside the saw or carving path.'],
['Cut to length','Saw slowly through the marked end, then inspect the exposed grain for hidden cracks or rot.'],
['Shape the grip','Remove only small amounts of wood to make a secure handle; leave a gradual transition to the thicker head.'],
['Round impact edges','Smooth sharp head corners to reduce splintering, and sand the entire grip to prevent blisters.'],
['Test gently','Tap scrap wood at low force while wearing eye protection; watch for loose fragments and head cracking.'],
['Retire damaged stock','Discard immediately if a split forms, the handle loosens or wood fragments shed during testing.']],hazard:'Use only for gentle noncritical woodworking. Never strike hardened metal, stone chisels or objects that can shatter.'}
,{group:'Navigation',name:'Make a paper route and signaling card',gear:'Printed map, pencil, waterproof sleeve, whistle, flashlight, bright cloth',steps:[
['Identify your start','Mark the current location, date, time and the nearest reliable landmark on a paper map.'],
['Pick a reachable destination','Choose a known safe location with an identifiable trail or road, not a straight line through unknown terrain.'],
['Mark checkpoints','Write two or three unmistakable landmarks and expected travel times between them.'],
['List hazards','Note streams, steep contour lines, exposed ridges, private property and possible route closures.'],
['Set a turnaround rule','Choose a latest safe turnaround time and an alternate shelter if the destination cannot be reached.'],
['Prepare a check-in plan','Write contact details and expected check-in times; leave a copy with a trusted person if possible.'],
['Keep signaling accessible','Carry a whistle, flashlight and bright cloth on your body rather than buried in a bag.'],
['Reorient at every checkpoint','Stop and compare real terrain to the map. If they disagree, do not press forward on guesswork.']],hazard:'Maps may be outdated. Avoid dangerous terrain and call emergency services when immediate danger exists.'}

];
const root=document.getElementById('manualhub');if(!root)return;const el=document.createElement('section');el.id='aegis-practical';el.className='panel';el.innerHTML='<h2>Practical Survival Skills · Field Drafts</h2><p>Sixteen offline skill references covering food procurement, foraging, equipment, food safety and navigation. These are practical starting points, not complete training or expert-validated instructions. They do not replace the existing manuals.</p><label for="aegis-practical-search">Find a practical guide <input id="aegis-practical-search" type="search" placeholder="Search hunting, fishing, bow, plants, mushrooms..."></label><p id="aegis-practical-count" class="muted" role="status"></p><div id="aegis-practical-list"></div>';const reader=document.getElementById('aegis-reader');if(reader)reader.insertAdjacentElement('afterend',el);else root.insertBefore(el,root.firstChild);const q=el.querySelector('input'),out=el.querySelector('#aegis-practical-list'),count=el.querySelector('#aegis-practical-count');function draw(){let term=q.value.trim().toLowerCase(),matches=guides.filter(g=>[g.name,g.group,g.gear,...g.steps.flat(),g.hazard].join(' ').toLowerCase().includes(term));count.textContent=matches.length+' of '+guides.length+' skill references';out.replaceChildren();for(let g of matches){let d=document.createElement('details');d.className='wild-guide';let s=document.createElement('summary');s.textContent=g.name;let tag=document.createElement('span');tag.className='wild-guide-tag';tag.textContent=g.group;s.prepend(tag);d.append(s);let body=document.createElement('div');body.className='wild-guide-body';let h=document.createElement('h4');h.textContent='Materials and equipment';body.append(h);let p=document.createElement('p');p.textContent=g.gear;body.append(p);h=document.createElement('h4');h.textContent='Field procedure';body.append(h);let ol=document.createElement('ol');for(let [title,detail] of g.steps){let li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=title+' — ';li.append(strong,document.createTextNode(detail));ol.append(li)}body.append(ol);h=document.createElement('h4');h.textContent='Safety and limits';body.append(h);p=document.createElement('p');p.className='wild-guide-warning';p.textContent=g.hazard;body.append(p);p=document.createElement('p');p.className='muted';p.textContent='AEGIS educational draft · Offline bundled · Not independently field validated';body.append(p);d.append(body);out.append(d)}}q.addEventListener('input',draw);draw();
})();