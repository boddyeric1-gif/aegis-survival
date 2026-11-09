/* Correct temperature-unit slips only in explicit temperature contexts; distances stay distances. */
(()=>{'use strict';
function normalize(text){return String(text).replace(/(°\s*)(-?\d+(?:\.\d+)?)\s*(?:ft\b|feet\b)/gi,'$1$2F').replace(/(-?\d+(?:\.\d+)?)\s*(?:ft\b|feet\b)/gi,(all,n,offset,source)=>{const prefix=source.slice(Math.max(0,offset-75),offset).split(/[.!?;\n]/).pop();if(/altitud|elevat|above sea|height|distance|deep|tall|long|wide|away/i.test(prefix))return all;return /(?:temperatures?|degrees(?:\s+fahrenheit)?|fahrenheit|oven|preheat|bake|refrigerat|chill|food.{0,20}(?:below|above|under))[^\d]{0,45}$/i.test(prefix)?n+'°F':all;});}
window.AEGIS_TEMPERATURE={normalize};
})();
