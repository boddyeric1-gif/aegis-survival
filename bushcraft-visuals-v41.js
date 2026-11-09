/* AEGIS v41: 130 bundled action diagrams. No network images or search results.
   Original vector teaching aids; not certified construction or life-safety diagrams. */
(()=>{'use strict';
const ink='#233b35',gold='#aa6819',blue='#247b9a',green='#5e805b',red='#b44938';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,t,c=ink,size=18)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-family="system-ui, sans-serif">${esc(t)}</text>`;
const path=(d,c=ink,w=4,fill='none',extra='')=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill='#e6e3d6',stroke=ink)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
const circle=(x,y,r,fill='none',stroke=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
const arrow=(x,y,X,Y,c=gold)=>path(`M${x} ${y}L${X} ${Y}`,c,4,'none',`marker-end="url(#${c===red?'red':'arr'})"`);
const cross=(x,y)=>path(`M${x-12} ${y-12}l24 24m0-24l-24 24`,red,5);
const check=(x,y)=>path(`M${x-10} ${y}l8 8 16-19`,green,5);
const tree=(x,broken=false)=>path(`M${x} 220V30`,ink,13)+path(`M${x} 85l-35-25m35 65l38-22`,ink,7)+(broken?path(`M${x} 45l65 15-13 25`,red,6)+cross(x+80,40):'');
const ground=()=>path('M35 225H565','#8d9586',3);
const peg=(x,y=215)=>path(`M${x} ${y-20}l-10 30m-6-28h26`,ink,5);
const cord=d=>path(d,gold,7);
const log=(x,y,w=140,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle})">${rect(0,0,w,26,'#b8976e','#674d30')}${circle(w,13,11,'#d8bd94','#674d30')}</g>`;
const drop=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${path('M0-24C-35 16-17 34 0 34S35 16 0-24Z',blue,3,'#acd5df')}</g>`;
const bottle=(x,y,label='WATER',color='#afd1ce')=>rect(x+18,y,44,17,'#607b71')+rect(x,y+17,80,115,color)+text(x+8,y+73,label,ink,13);
const bin=(x,y,label='SUPPLIES',fill='#ccd6bf')=>rect(x,y,130,85,fill)+path(`M${x-5} ${y}h140`,ink,8)+text(x+10,y+48,label,ink,15);
const page=(x,y,title,lines=[])=>rect(x,y,180,190,'#fffdf5')+text(x+15,y+28,title,ink,17)+lines.map((t,i)=>text(x+15,y+60+i*29,t,ink,14)).join('');
const label=(x,y,t,c=ink)=>text(x,y,t,c,17);
const pad=(x,y,w=340,h=35)=>rect(x,y,w,h,'#a2b087')+path(`M${x+15} ${y+10}h${w-30}m-${w-30} 13h${w-30}`,'#647a57',3);
const book=(x,y,title)=>rect(x,y,150,145,'#c1d0b2')+path(`M${x+18} ${y}v145`,ink,4)+text(x+30,y+65,title,ink,16)+text(x+30,y+94,'REFERENCE',ink,12);
const phone=(x,y)=>rect(x,y,70,110,'#344c47')+rect(x+7,y+12,56,78,'#c2d8cf')+circle(x+35,y+101,3,'#f4ead3');
const plant=(x,y)=>path(`M${x} ${y}v-115`,green,5)+path(`M${x} ${y-35}q-65-55-45-65q50 8 45 65m0-30q60-50 45-64q-50 5-45 64`,green,3,'#b0c79c')+circle(x,y-130,15,'#e3bd6e',green);
const print=(x,y)=>`<g transform="translate(${x} ${y})">${path('M-17 12Q-19-8 0-15Q19-8 17 12Q0 24-17 12Z',ink,2,'#6f8069')}${[-23,-8,8,23].map((a,i)=>`<ellipse cx="${a}" cy="${i===0||i===3?-17:-28}" rx="7" ry="10" fill="#6f8069"/>`).join('')}</g>`;
const map=(x=80,y=30)=>rect(x,y,400,190,'#e5e9d5')+path(`M${x+20} ${y+150}q130-140 200-80t155-45`,'#90ad89',22)+path(`M${x+70} ${y}q150 100 40 190`,blue,8)+path(`M${x+180} ${y+170}l80-70 80 20`,gold,4,'none','stroke-dasharray="8 7"');
const compass=(x,y,angle=0)=>circle(x,y,70,'#f8f4e5')+circle(x,y,59)+`<g transform="rotate(${angle} ${x} ${y})">${path(`M${x} ${y-47}l-13 47 13 47 13-47Z`,ink,2,'#d6dcca')}${path(`M${x} ${y-47}l-13 47h26Z`,red,2,red)}</g>`+text(x-7,y-79,'N',red,18);
const lens=(x,y)=>circle(x,y,25,'#d6e7e0')+path(`M${x+20} ${y+20}l24 24`,ink,9);
const roof=(mode='lean',stage=4)=>{
 let s=ground()+tree(95)+tree(500)+cord('M95 70H500');
 if(stage>=2)s+=mode==='lean'?path('M95 75L500 75 390 210 35 210Z',green,3,'#9aaa7e'):path('M95 75L500 75 560 210 160 210Z',green,3,'#9aaa7e')+path('M95 75L160 210 35 210Z',ink,3,'#d4d9ba');
 if(stage>=3)s+=peg(40)+peg(390)+(mode==='frame'?peg(560):'');return s;
};
const D={}; const set=(name,scenes,notes)=>{D[name]={scenes,notes}};
set('Tarp lean-to',[
 ground()+tree(110)+tree(490)+check(280,180)+label(210,145,'LEVEL, DRAINED SITE')+label(165,250,'Look above and around first'),
 ground()+tree(95)+tree(500)+cord('M95 80H500')+arrow(240,120,240,85)+label(170,160,'RIDGELINE · SOUND ANCHORS'),
 roof('lean',2)+arrow(290,30,290,100)+label(250,255,'TARP OVER LINE'),
 roof('lean',3)+arrow(400,145,392,210)+label(230,255,'LOW EDGE SECURED'),
 roof('lean',4)+arrow(580,100,500,100)+arrow(250,140,200,205,blue)+label(185,255,'WIND + RAIN RUNOFF')
],['Clear overhead hazards before rigging.','Use sound anchors; keep the line visible.','Slope the roof toward the low edge.','Anchor reinforced attachment points.','Keep runoff away from the sleeping area.']);
set('A-frame tarp shelter',[
 ground()+path('M70 215Q280 120 540 215',green,4)+check(285,155)+drop(90,190,.5)+cross(90,145)+label(185,250,'HIGHER GROUND'),
 roof('frame',1)+arrow(270,125,270,77)+label(195,170,'TAUT RIDGELINE'),
 roof('frame',2)+path('M95 75L160 210',gold,5)+arrow(300,20,300,80)+label(190,255,'CENTER THE TARP'),
 roof('frame',3)+arrow(530,145,555,210)+arrow(190,150,165,210)+label(190,255,'STAKE BOTH SIDES'),
 roof('frame',4)+arrow(95,230,95,150,blue)+label(115,255,'CLEAR EXIT + VENTILATION')
],['Avoid flood paths and dead limbs.','Set sound anchors before covering.','Balance fabric on both sides.','Keep the roof steep enough to drain.','Keep stoves and flames outside.']);
set('Ground insulation bed',[
 ground()+drop(90,180,.8)+cross(90,130)+check(345,170)+label(265,110,'DRY, SAFE SPOT'),
 ground()+rect(125,175,340,25,'#acc3c5')+arrow(500,125,425,175)+label(185,135,'MOISTURE BARRIER'),
 ground()+rect(125,198,340,12,'#acc3c5')+pad(125,150)+label(155,115,'EVEN INSULATING LAYER'),
 ground()+pad(125,165)+path('M120 160H470',blue,10)+label(165,120,'CLEAN FABRIC COVER'),
 ground()+pad(125,165)+lens(325,140)+arrow(320,105,320,164)+label(180,250,'CHECK COLD / DAMP SPOTS')
],['Look for sharp debris and insects.','Keep the barrier within the roof footprint.','Avoid thin spots beneath hips and shoulders.','Keep damp material out of bedding.','Add insulation or relocate when needed.']);
set('Shelter site selection',[
 tree(280,true)+arrow(170,130,280,65)+label(125,255,'CHECK OVERHEAD'),
 path('M50 100Q180 250 300 100T550 100',green,5)+drop(180,165)+cross(180,110)+label(295,210,'AVOID LOW CHANNELS'),
 roof('lean',2)+arrow(570,70,500,70)+label(205,255,'ASSESS WIND EXPOSURE'),
 map()+cross(165,125)+check(390,150)+label(175,255,'DISTANCE FROM HAZARDS'),
 map()+circle(330,130,15,'#f5c671')+arrow(340,140,440,185)+label(170,255,'PLAN A CLEAR EXIT')
],['Dead or damaged limbs can fall.','Rain can turn a hollow into a flow path.','Consider wind shifts and exposure.','Check nearby water and unstable ground.','Know where to move if conditions worsen.']);
set('Rainwater diversion',[
 path('M40 70Q240 120 550 220',green,6)+[140,270,400].map(x=>arrow(x,120,x+70,155,blue)).join('')+label(170,65,'OBSERVE FLOW FIRST'),
 path('M45 215Q300 55 550 215',green,5)+check(300,100)+drop(85,190)+label(180,255,'PREFER HIGHER GROUND'),
 path('M40 220H560',ink,3)+bin(240,85,'DRY KIT')+path('M220 175H390M240 175v45m130-45v45',ink,6)+drop(120,200)+label(180,255,'LIFT EQUIPMENT'),
 map()+path('M230 110Q280 130 360 190',blue,8)+arrow(300,150,355,190,blue)+label(100,255,'MINOR SURFACE FLOW ONLY'),
 roof('lean',3)+drop(245,30)+lens(390,175)+label(180,255,'RECHECK AFTER RAIN')
],['Watch where water naturally travels.','Relocation is the first option.','Raise supplies above surface runoff.','Do not excavate unstable slopes.','Move if water reaches the sleeping area.']);
set('Tinder preparation',[
 path('M120 190q50-65 110-25m-100-30l80 50m-70-80l85 73', '#8b6742',5)+bin(340,100,'DRY RESERVE')+label(110,70,'DRY, PERMITTED MATERIAL'),
 rect(60,70,220,135,'#ece6d3')+rect(320,70,220,135,'#ece6d3')+[0,1,2,3,4,5].map(i=>path(`M${85+i*25} 150l17-40`,gold,2)).join('')+log(345,115,150)+label(100,245,'FINE TINDER')+label(365,245,'KINDLING'),
 bin(220,90,'DRY TINDER')+drop(440,100)+cross(440,60)+label(185,245,'KEEP A DRY RESERVE'),
 path('M80 180q45-70 90 0q-35 25-90 0',gold,3,'#d4bd81')+log(255,135,85)+log(255,175,100)+log(410,125,120)+label(75,235,'TINDER')+label(240,235,'SMALL STICKS')+label(410,235,'FUEL'),
 bin(80,110,'DRY TINDER')+arrow(240,155,380,155)+path('M460 200q-65-60 0-120q-20 50 25 65q30 45-25 55',gold,3,'#e2ae5a')+label(220,95,'STORE APART')
],['Collect only where permitted.','Fine fibers catch first; sticks sustain heat.','Protect a reserve from rain and damp ground.','Prepare every fuel size before ignition.','Keep the reserve away from flame and sparks.']);
set('Fire lay planning',[
 page(210,25,'FIRE RULES',['Local restrictions','Approved location','Permit if needed'])+check(440,140),
 ground()+circle(300,150,72,'#dbd3bc')+path('M220 220H380',ink,5)+label(175,50,'DESIGNATED FIRE AREA')+label(170,255,'CLEAR COMBUSTIBLES'),
 path('M260 185l40-90 40 90',gold,7)+path('M240 185l60-115 60 115',ink,7)+label(165,245,'TINDER + GRADED KINDLING'),
 circle(220,165,60,'#d9d1bd')+bottle(400,75,'WATER')+arrow(400,155,295,160)+label(170,255,'EXTINGUISHING WATER READY'),
 circle(300,170,72,'#c8c8bc')+drop(285,75)+drop(330,80)+path('M240 150l120 35m-95 10l60-45',ink,4)+label(170,255,'SOAK · STIR · CHECK HEAT')
],['Confirm fires are allowed before setting up.','Use an approved site away from fuels.','Keep the lay small and controlled.','Water must be reachable before lighting.','Do not leave until every part is cold.']);
set('Firewood moisture sorting',[
 rect(50,70,225,135,'#e5e2d5')+rect(325,70,225,135,'#d7e5e6')+log(80,120,150)+log(360,120,150)+drop(450,85,.5)+label(125,245,'DRY')+label(405,245,'WET'),
 log(130,100,300)+path('M150 110l90 8m45-8l80 9',ink,2)+lens(400,135)+label(165,245,'CHECK SPLIT SURFACES'),
 ground()+path('M125 190H475M145 190v35m310-35v35',ink,6)+log(160,145,260)+label(170,105,'OFF WET GROUND'),
 log(140,80,270)+log(140,145,270)+arrow(80,125,120,125,blue)+arrow(440,125,510,125,blue)+label(225,125,'AIR GAP',blue,16),
 path('M100 75L300 25 500 75',green,8)+log(170,145,260)+drop(500,120)+cross(500,80)+label(170,245,'COVERED DRY RESERVE')
],['Separate piles rather than mixing them.','Surface appearance alone is not proof of dryness.','Support the stack on a stable base.','Allow air to move between pieces.','Do not burn painted or treated wood.']);
set('Emergency water storage',[
 bottle(100,75,'FOOD SAFE')+check(225,160)+bottle(380,75,'CHEMICAL','#d8b3a5')+cross(500,150),
 bottle(250,65,'CLEAN')+drop(190,100)+page(390,30,'DIRECTIONS',['Follow sanitizer','product label']),
 bottle(270,95,'POTABLE')+path('M290 40h50v50',blue,7)+arrow(310,55,310,105,blue),
 bottle(250,55,'WATER')+rect(260,150,160,45,'#fff4d5')+text(273,178,'FILLED: ____',ink,17)+arrow(450,110,390,155),
 path('M80 90H530M100 90v145m410-145v145',ink,7)+bottle(140,100,'WATER')+bottle(285,100,'WATER')+label(180,55,'COOL STORAGE · ROTATE')
],['Use containers intended for drinking water.','Clean and sanitize as directed.','Fill with a known potable supply.','Record the fill date clearly.','Keep away from sunlight and chemicals.']);
set('Water source risk check',[
 path('M90 20Q420 80 270 240',blue,25)+rect(100,35,90,50,'#cdbda5')+arrow(180,105,260,130,red)+label(350,120,'UPSTREAM')+label(350,145,'RISKS'),
 path('M60 175H540',blue,30)+path('M200 50v90h90',red,10)+cross(330,135)+label(100,240,'AVOID SEWAGE / CHEMICAL RUNOFF'),
 bottle(130,80,'CLEAN')+check(250,175)+bottle(380,80,'DIRTY','#cdbca6')+cross(500,160),
 bottle(65,70,'RAW','#cdbca6')+arrow(160,140,230,140)+rect(250,75,110,120,'#c4d7cf')+text(263,125,'VALIDATED',ink,13)+text(263,148,'TREATMENT',ink,13)+arrow(380,140,450,140)+bottle(475,70,'SAFE'),
 bottle(100,80,'RAW','#cdbca6')+bottle(390,80,'TREATED')+path('M300 50V230',gold,4,'none','stroke-dasharray="8 8"')+label(190,35,'KEEP SEPARATE')
],['Trace likely contamination upstream.','Do not attempt to treat chemical contamination.','Avoid contaminating clean equipment.','Choose a method appropriate to the hazard.','Clear water can still contain pathogens.']);
set('Rain collection setup',[
 path('M100 70L460 40 500 190 140 220Z',green,4,'#b8c9a2')+lens(330,115)+label(170,255,'CLEAN COLLECTION SURFACE'),
 path('M90 45L440 100 360 170 100 125Z',green,4,'#b8c9a2')+arrow(220,100,350,150,blue)+`<g transform="translate(350 165) scale(.6)">${bottle(0,0,'RAW')}</g>`+label(95,245,'SLOPE TOWARD VESSEL'),
 bottle(250,75,'RAW')+path('M235 95h110',green,6)+label(360,110,'DEBRIS COVER')+arrow(355,120,330,105),
 bottle(80,75,'RAW','#cdbca6')+arrow(185,140,255,140)+rect(280,70,210,130,'#c7d6cc')+text(300,125,'TREAT BEFORE',ink,19)+text(300,155,'DRINKING',ink,19),
 path('M100 60H500M130 60v170m340-170v170',ink,5)+path('M160 65v120h270V65',green,4,'#b8c9a2')+arrow(250,220,250,170,blue)+label(175,250,'CLEAN + AIR DRY')
],['Start with a clean, suitable surface.','Keep the vessel stable and food-safe.','Keep debris and animal access out.','Rainwater is not automatically potable.','Dry equipment before packing it away.']);
set('Foraging observation journal',[
 plant(280,225)+phone(100,75)+arrow(185,125,250,125)+label(165,255,'WHOLE PLANT IN PLACE'),
 page(210,25,'FIELD RECORD',['Date / season','Location / habitat','Weather / notes'])+plant(465,220),
 plant(155,220)+page(330,25,'FEATURES',['Leaf shape','Flower / fruit','Stem / arrangement'])+arrow(200,120,320,120),
 page(80,30,'YOUR NOTES',['Habitat','Features','Season'])+book(360,55,'REGIONAL GUIDE')+arrow(280,140,345,140),
 plant(290,220)+cross(440,140)+label(90,55,'UNKNOWN PLANT: LEAVE IT')+path('M80 240H520',green,3)
],['Record the whole plant, not just one leaf.','Habitat and season matter to identification.','Document multiple diagnostic features.','Use expert-reviewed regional references.','Never eat a plant identified by AI alone.']);
set('Food storage rotation',[
 bin(70,90,'SEALED FOOD')+page(340,25,'INVENTORY',['Item / quantity','Sealed / opened','Storage location']),
 bin(100,100,'OPENED: ___')+page(340,25,'DATE RECORD',['Best-before date','Opened date','Use-by guidance']),
 bin(220,100,'DRY + SEALED')+drop(460,110)+cross(460,70)+label(155,250,'DRY, PEST-RESISTANT STORAGE'),
 bin(60,100,'OLDER SAFE')+bin(400,100,'NEWER')+arrow(340,140,230,140)+label(170,245,'USE OLDER SAFE STOCK FIRST'),
 bin(80,100,'INSPECT')+lens(230,120)+bin(400,100,'DISCARD','#d8b3a5')+arrow(290,140,385,140)+label(150,245,'SPOILAGE: DISCARD SAFELY')
],['Count actual sealed supplies.','Date information needs to remain legible.','Maintain safe storage temperatures.','Rotation does not make spoiled food safe.','Do not taste questionable food to test it.']);
set('Wildlife sign observation',[
 print(400,170)+phone(80,80)+path('M180 135H320',gold,3,'none','stroke-dasharray="8 8"')+label(180,240,'OBSERVE FROM A DISTANCE'),
 print(280,130)+rect(180,185,230,24,'#ebcf8f')+[0,1,2,3,4,5,6,7].map(i=>path(`M${195+i*28} 185v12`,ink,2)).join('')+label(170,245,'RECORD SIZE + SUBSTRATE'),
 page(200,25,'OBSERVATION',['Date / time','Recent weather','Ground conditions'])+print(470,170),
 print(350,150)+phone(130,60)+arrow(210,110,300,130)+label(150,245,'PHOTOGRAPH IN PLACE'),
 page(80,30,'YOUR RECORD',['Scale','Stride','Location'])+book(360,60,'TRACK GUIDE')+label(160,255,'CROSS-CHECK · DO NOT ASSUME')
],['Do not approach wildlife to improve a view.','Include a scale without disturbing the sign.','Weather changes the appearance of tracks.','Leave the habitat as you found it.','Tracks alone do not prove species identity.']);
set('Humane live-capture planning',[
 page(200,25,'LEGAL CHECK',['Species','Local restrictions','Required permits'])+check(440,150),
 rect(160,70,290,150,'#d5dbca')+[0,1,2,3,4,5,6].map(i=>path(`M${180+i*40} 75v140`,ink,2)).join('')+path('M165 115h280m-280 50h280',ink,2)+label(155,255,'PURPOSE-BUILT HUMANE ENCLOSURE'),
 path('M100 70L300 25 500 70',green,7)+page(200,80,'CHECK PLAN',['Frequent checks','Shade / weather','No unattended trap']),
 page(70,30,'HANDLING PLAN',['Safe equipment','Professional contact','Emergency number'])+phone(390,80),
 page(200,30,'LEGAL DIRECTION',['Release location','Transfer contact','Follow authority'])+arrow(420,135,510,135)+label(170,255,'AUTHORIZED RELEASE / TRANSFER')
],['Check the rules before obtaining equipment.','This is planning, not a trap construction diagram.','Do not leave an occupied trap unattended.','Plan professional support before capture.','Follow species-specific legal direction.']);
set('Animal track recording',[
 path('M80 220Q220 130 500 40',green,35)+print(250,125)+label(115,255,'SAFE TRAIL · DO NOT PURSUE'),
 print(320,130)+rect(200,190,260,24,'#ebcf8f')+[0,1,2,3,4,5,6,7].map(i=>path(`M${215+i*30} 190v12`,ink,2)).join('')+phone(70,65)+label(185,255,'INCLUDE A SIZE REFERENCE'),
 print(160,180)+print(350,90)+arrow(205,160,310,105)+label(250,210,'STRIDE + DIRECTION'),
 page(80,25,'TRACK RECORD',['Width / length','Stride','Habitat'])+book(365,65,'REGIONAL GUIDE'),
 print(300,160)+arrow(200,100,100,60)+label(150,250,'LEAVE THE AREA UNDISTURBED')
],['Stay on safe, permitted ground.','Photograph the scale beside the track.','Record direction without following wildlife.','Compare multiple features.','Avoid trampling or handling the sign.']);
set('Simple wooden mallet',[
 log(130,120,310)+check(490,135)+label(150,70,'SOUND, UNTREATED WOOD'),
 log(120,115,340)+path('M290 110v40m-90-37v45',gold,3,'none','stroke-dasharray="5 5"')+label(150,75,'MARK HEAD + HANDLE'),
 rect(160,70,210,65,'#b8976e','#674d30')+path('M265 140v90','#674d30',25)+label(140,255,'FIT HEAD + HANDLE SECURELY'),
 rect(160,70,210,65,'#b8976e','#674d30')+path('M265 140v90','#674d30',25)+rect(385,90,90,40,'#c4bfae')+arrow(385,145,365,130)+label(175,255,'SMOOTH SHARP EDGES'),
 rect(200,50,160,55,'#b8976e','#674d30')+path('M280 110v85','#674d30',22)+arrow(365,110,365,180)+log(170,210,260)+label(125,255,'GENTLE TEST · CHECK FOR LOOSENING')
],['Reject rotten, cracked or treated stock.','Plan a comfortable grip and balanced head.','Use eye protection and safe cutting technique.','Remove splinters before handling.','Stop if the head moves or the wood splits.']);
set('Camp utensil care',[
 rect(80,70,190,150,'#d5e0d2')+rect(330,70,190,150,'#dfc9b7')+label(125,150,'CLEAN')+label(380,150,'DIRTY')+path('M300 50V230',gold,3),
 rect(150,100,300,110,'#b9d8de')+drop(300,65)+rect(450,65,70,50,'#efdfae')+text(460,95,'SOAP',ink,14)+label(135,255,'SAFE WATER + SOAP'),
 path('M180 60h70v90',blue,8)+drop(225,165)+rect(180,200,250,25,'#c8d6c1')+label(170,255,'RINSE THOROUGHLY'),
 rect(150,160,300,35,'#d2ddc5')+arrow(210,140,210,75,blue)+arrow(390,140,390,75,blue)+label(165,245,'DRY COMPLETELY'),
 bin(220,110,'CLEAN UTENSILS')+check(420,150)+label(170,65,'PROTECTED STORAGE')
],['Keep clean items away from dirty equipment.','Use suitable soap and safe water.','Do not use untreated water for the final rinse.','Allow every surface to dry.','Protect from pests and dirty hands.']);
// Rope segments are color-separated so the working end remains traceable.
const standing=()=>cord('M320 15V95C230 60 230 155 320 135C400 120 400 60 320 95');
const loop='M320 95C380 140 445 165 425 205C395 270 150 250 165 195C175 160 260 170 300 125';
const working=d=>path(d,blue,8);
const bow=(step)=>standing()+(step>0?working(loop):'')+(step>1?working('M300 125V70C300 40 355 40 355 70'):'')+(step>2?working('M355 70L340 130 350 180'):'')+path('M317 82L324 104','#f3efdf',13)+cord('M317 82L324 104');
set('Bowline knot',[
 bow(0)+label(415,55,'STANDING PART')+arrow(410,65,330,40)+label(95,165,'SMALL LOOP')+arrow(210,160,270,125),
 bow(1)+arrow(240,175,295,130)+label(50,65,'WORKING END UP')+label(50,90,'THROUGH THE LOOP',blue),
 bow(2)+arrow(400,45,355,55)+label(50,65,'WORKING END AROUND')+label(50,90,'THE STANDING PART',blue),
 bow(3)+arrow(410,150,350,160)+label(50,65,'BACK DOWN THROUGH')+label(50,90,'THE SAME LOOP',blue),
 bow(4)+arrow(320,35,320,5)+arrow(430,205,480,230)+label(55,65,'DRESS THE STRANDS')+label(55,90,'AND SNUG THE KNOT')
],['Gold: standing part. Blue: the working end and fixed loop.','Pass the working end up through the small opening.','Take the working end behind and around the standing part.','Return down through the small opening beside the loop leg.','Practice only; not a climbing or life-safety reference.']);
const post=()=>path('M100 40V240','#674d30',22);
const hitch=(step)=>{
 let d=post()+cord('M530 90H100Q55 90 65 170Q70 205 110 205L250 205');
 if(step===0)return d+working('M250 205L390 155');
 d+=working('M250 205C340 205 325 140 290 120');
 // Two inside turns around the horizontal standing part.
 d+=working('M290 120C260 120 260 62 285 62C310 62 310 120 325 120C345 120 345 62 320 62');
 if(step>1)d+=working('M320 62C345 45 365 75 370 115C380 150 425 125 410 80C400 55 370 80 395 115L440 155');
 return d+path('M269 88H305M310 88H341','#f3efdf',12)+cord('M269 88H305M310 88H341');
};
set('Taut-line hitch',[
 hitch(0)+label(210,255,'WRAP AROUND ANCHOR'),
 hitch(1)+arrow(415,50,335,70)+label(225,255,'TWO INSIDE TURNS',blue),
 hitch(2)+arrow(500,185,420,140)+label(250,255,'ONE OUTSIDE TURN',blue),
 hitch(3)+arrow(470,190,415,150)+label(210,255,'DRESS + SNUG THE TURNS'),
 hitch(4)+arrow(230,35,330,35)+arrow(330,240,230,240)+label(380,50,'SLIDE TO ADJUST')
],['Wrap the anchor and leave enough working end for the hitch.','Make the two turns inside the loop, toward the anchor.','Finish with the outside half hitch in the same direction.','Set the turns neatly and test under a small load.','Test for slipping; not for climbing or life safety.']);
const poles=()=>path('M280 30V235','#96724a',28)+path('M100 130H490','#b18a5b',28);
set('Square lashing practice',[
 poles()+circle(280,130,60)+label(110,255,'CROSS TWO PRACTICE POLES'),
 poles()+[0,1,2,3].map(i=>path(`M${238+i*14} 85V180H${340-i*14}V85Z`,gold,5)).join('')+label(170,255,'WRAPPING TURNS'),
 poles()+[0,1,2].map(i=>path(`M220 ${112+i*12}H350`,gold,6)).join('')+arrow(410,165,345,145)+label(150,255,'FRAP BETWEEN THE POLES'),
 poles()+path('M230 95V175H340V85H240V190',gold,7)+circle(240,190,11,'#e0c58e',gold)+label(170,255,'SECURE CORD ENDS'),
 poles()+path('M230 95V175H340V85H240',gold,8)+arrow(160,75,225,105)+arrow(430,210,350,165)+label(150,255,'CHECK FOR MOVEMENT')
],['Use small practice poles on stable ground.','Lay each wrap next to the previous turn.','Frapping tightens the wraps around the joint.','Secure the ends before testing.','Practice joint only; not an engineered structure.']);
set('Landmark route notes',[
 map()+circle(265,180,16,'#edc46f')+label(320,210,'START'),
 map()+path('M370 80l30-45 30 45Z',ink,3,'#bac5ab')+circle(400,65,35)+label(160,255,'DISTINCTIVE LANDMARKS'),
 map()+arrow(270,170,330,105)+label(345,160,'DIRECTION')+label(345,185,'+ DISTANCE'),
 page(210,25,'TURNAROUND',['Time: ______','Return route','Allow daylight'])+compass(470,145),
 map(40,50)+phone(490,70)+arrow(410,145,485,145)+label(120,255,'SHARE THE ROUTE BEFORE DEPARTURE')
],['Record your starting point first.','Choose features you can identify again.','Estimate distance and check it as you travel.','Set a conservative turnaround time.','Tell someone the route and expected return.']);
set('Compass orientation',[
 map()+label(175,255,'LEVEL MAP SURFACE'),
 compass(300,140)+arrow(420,100,340,90,red)+label(100,255,'IDENTIFY MAGNETIC NORTH'),
 map()+compass(390,140)+arrow(260,70,300,35)+label(110,255,'ALIGN MAP · ACCOUNT FOR DECLINATION'),
 map()+compass(160,130)+arrow(230,130,415,80)+path('M420 80l25-40 25 40Z',ink,3,'#bac5ab')+label(170,255,'CHOOSE A LANDMARK'),
 map()+compass(160,130)+arrow(230,130,415,80)+lens(430,160)+label(160,255,'STOP + RECHECK WHILE MOVING')
],['Keep away from magnetic interference.','The red needle indicates magnetic north.','Use local declination with your map method.','Confirm the landmark on the map and terrain.','Carry another navigation method.']);
set('Leave-no-trace camp routine',[
 rect(70,75,210,135,'#bcc9ae')+rect(330,75,210,135,'#9e9e90')+label(110,140,'VEGETATION')+label(365,140,'DURABLE')+cross(165,180)+check(440,180),
 bin(220,100,'FOOD SECURED')+check(420,145)+label(155,55,'FOLLOW LOCAL WILDLIFE RULES'),
 rect(230,80,145,150,'#c9cebc')+path('M230 85q70-55 145 0',ink,4)+text(255,160,'PACK OUT',ink,18)+arrow(430,100,380,145),
 ground()+path('M150 220q100-30 200 0',green,6)+check(420,200)+label(135,95,'RESTORE MINOR DISTURBANCE'),
 map()+lens(390,140)+label(155,255,'FINAL SITE SWEEP')
],['Choose permitted durable surfaces.','Use locally recommended food storage.','Take all trash and food scraps with you.','Avoid digging or altering the site.','Leave the site ready for the next visitor.']);
set('Rainproof supply storage',[
 bin(60,100,'FOOD')+bin(235,100,'TOOLS')+bin(410,100,'CLOTHING')+label(160,55,'SORT BY USE'),
 bin(220,100,'SEALED + DRY')+path('M215 90h140',blue,4)+drop(450,115)+label(130,255,'MOISTURE-RESISTANT CONTAINERS'),
 ground()+path('M130 180H480M150 180v45m310-45v45',ink,7)+bin(210,90,'SUPPLIES')+drop(80,195)+label(175,255,'RAISE ABOVE DAMP FLOORS'),
 bin(90,110,'LABEL: ____')+page(350,25,'INVENTORY',['Contents','Quantity','Location']),
 bin(200,100,'INSPECT')+drop(285,145,.5)+lens(370,155)+label(160,55,'CHECK CONDENSATION MONTHLY')
],['Separate supplies by function and storage need.','Inspect lids and seals.','Keep shelves stable and accessible.','Use legible labels and a matching list.','Dry damp contents before sealing again.']);
set('Household repair inventory',[
 page(210,25,'HOME SYSTEMS',['Water / sanitation','Heat / power','Doors / structure']),
 bin(70,100,'SPARE PARTS')+page(350,25,'PARTS LIST',['Name / size','Quantity','Compatible system']),
 log(130,100,180)+path('M330 90v95m-35-95h70',ink,16)+rect(100,190,400,35,'#cfceb9')+label(170,55,'ORGANIZE HAND TOOLS'),
 bottle(140,70,'WATER')+bin(335,110,'SANITATION')+label(160,55,'PRIORITIZE ESSENTIAL SYSTEMS'),
 book(100,65,'MAINTENANCE')+book(350,65,'EQUIPMENT')+label(140,255,'KEEP PRINTED REFERENCES')
],['Record the systems you rely on.','Check part fit before an emergency.','Keep tools visible, dry and in good condition.','Water and sanitation take priority.','Leave fuel and electrical repairs to qualified people.']);
function wrap(s,max=64){const out=[];let line='';for(const word of s.split(' ')){if((line+' '+word).trim().length>max){out.push(line);line=word}else line+=(line?' ':'')+word}if(line)out.push(line);return out;}
function render(name,step){const entry=D[name];if(!entry||!entry.scenes[step])throw Error('Missing bushcraft diagram: '+name+' '+step);const note=wrap(entry.notes[step],68);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 410" role="img"><title>${esc(name)} — step ${step+1}</title><desc>${esc(entry.notes[step])}</desc><defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3 0 6Z" fill="${gold}"/></marker><marker id="red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3 0 6Z" fill="${red}"/></marker></defs><rect width="640" height="410" rx="16" fill="#f3efdf"/><rect width="640" height="55" rx="16" fill="#233b35"/><rect y="30" width="640" height="25" fill="#233b35"/>${text(20,35,'STEP '+(step+1),'#efc77f',19)}${text(110,35,name,'#fff8e5',19)}<g transform="translate(20 62)">${entry.scenes[step]}</g><path d="M20 337H620" stroke="#c7c5b3"/>${note.map((t,i)=>text(24,365+i*23,t,ink,17)).join('')}</svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
window.AEGIS_BUSHCRAFT_VISUALS={render,names:()=>Object.keys(D),count:()=>Object.values(D).reduce((n,e)=>n+e.scenes.length,0)};
})();
