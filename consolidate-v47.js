/* Each daily panel owns a distinct job. Older records remain recoverable. */
(()=>{'use strict';function init(){
 const $=id=>document.getElementById(id),library=$('manualhub'),archive=$('field-original-container');
 const protocol=$('library');if(protocol){protocol.classList.remove('view');protocol.hidden=false;$('emergency').append(protocol)}
 const oldGuide=$('fieldmanual');if(oldGuide&&archive){oldGuide.classList.remove('view');oldGuide.hidden=false;archive.append(oldGuide)}
 if(archive){const details=archive.closest('details');details.querySelector('summary').textContent='Source archive · original collections';details.querySelector('p').textContent='Preserved source readers and earlier collections. Daily browsing uses the single topic search above; overlapping source material is kept here for reference.';}
 if(library&&archive){for(const section of Array.from(library.children)){if(section.classList.contains('panel')&&!['unified-field-manual','fm-offline-manual'].includes(section.id))archive.append(section)}const hero=library.querySelector('.wild-hero');if(hero)library.prepend(hero);const unified=$('unified-field-manual');if(unified&&hero)hero.after(unified);}
 const heading=library?.querySelector('.wild-hero h2');if(heading)heading.textContent='Field Library';
 const directory=library?.querySelector('[aria-label="All AEGIS sections"]')?.closest('details');directory?.remove();
 // Move the standalone advisor into Tools. Preserve the old independent example inventory explicitly.
 const phase=$('phase4'),advisor=$('p4-situation')?.closest('section');if(advisor){advisor.querySelector('h2').textContent='Situation advisor';advisor.querySelector('p').textContent='Describe a situation for deterministic planning prompts. This tool does not read or change your saved Household supplies.';$('tools').prepend(advisor)}
 if(phase){phase.classList.remove('view');phase.hidden=false;const d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('p');s.textContent='Earlier Field Intelligence records · separate legacy workspace';p.textContent='This older workspace can contain example quantities and earlier saved records. It is not your Household stock list and is never counted toward household coverage. Review and transfer any real items manually into Household.';d.append(s,p,phase);$('tools').append(d)}
 // Remove the second saved-stock projection from everyday Tools. Keep its controls available for existing scripts.
 const projection=$('projrows')?.closest('.panel');if(projection)projection.hidden=true;
 for(const el of document.querySelectorAll('[data-tab="prep"] strong'))el.textContent='Household';
 const intro=library?.querySelector('.wild-hero p');if(intro)intro.textContent='One topic catalog and the original FM reader. Bushcraft opens illustrated practice lessons; Household holds your own plans and supplies.';
 const stockNav=document.querySelector('[data-v9-jump="prep"]');if(stockNav)stockNav.textContent='Household & supplies';
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init);else init();})();
