/* Shared message/signature filter. Explicitly permits damn, hell and crap. */
(()=>{'use strict';
const prohibited=/^(?:fuck[a-z]*|motherfuck[a-z]*|shit(?:s|ty|ting|ted|head|heads|show)?|bullshit(?:s|ting|ted)?|bitch(?:es|ing|y)?|sonofabitch|ass|asses|assholes?|arseholes?|arse|dumbass(?:es)?|jackass(?:es)?|bastards?|cunts?|dicks?|dickheads?|cocks?|cockheads?|cocksuckers?|puss(?:y|ies)|pricks?|piss(?:ed|ing|es)?|twats?|sluts?|whores?|wank(?:er|ers|ing)?|bollocks|goddamn(?:ed|it)?|dammit|damnit|nigg(?:er|ers|a|as)|fagg?(?:ot|ots)?|retards?|trann(?:y|ies)|kikes?|chinks?|spics?|fck|sht|btch)$/;
function normalized(input){return String(input||'').normalize('NFKD').replace(/[\u0300-\u036f\u200b-\u200f\u2060\ufeff]/g,'').toLowerCase().replace(/[01345789@$]/g,ch=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','@':'a','$':'s'})[ch]).replace(/([a-z])!([a-z])/g,'$1i$2')}
function hasFoulLanguage(input){const value=normalized(input);const tokens=value.match(/[a-z]+/g)||[];if(tokens.some(t=>prohibited.test(t)))return true;
 // Join punctuation within a disguised word, while preserving ordinary word boundaries.
 const compact=value.replace(/([a-z])[._*\-]+(?=[a-z])/g,'$1').replace(/([a-z])[._*\-]+(?=[a-z])/g,'$1');if((compact.match(/[a-z]+/g)||[]).some(t=>prohibited.test(t)))return true;
 let run='';for(const token of [...tokens,'end']){if(token.length===1){run+=token;continue}if(run&&prohibited.test(run))return true;run=''}
 return /\b(?:f\*{2,}(?:k|ing)?|sh\*+t|s\*{2,}t?|b\*{2,}h|c\*{2,}t)(?=$|\s|[.,!?])/.test(value);
}
const api={hasFoulLanguage,allowedWords:['damn','hell','crap']};globalThis.AEGIS_COMMUNITY_FILTER=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
