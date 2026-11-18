/* Wildlands visual refinement. Presentation only; no records, model or navigation changes. */
(()=>{'use strict';
const CSS=`
body.v54.v59-polish{--polish-gold:#d9b879;--polish-edge:#3b4236;--polish-muted:#b7beae;--polish-radius:16px;line-height:1.6}
body.v59-polish .shell{padding-top:24px;padding-bottom:48px}
body.v59-polish .view{min-width:0}
body.v59-polish .view h2{line-height:1.2;text-wrap:balance}
body.v59-polish .view h3{line-height:1.35}
body.v59-polish .view p{line-height:1.7}
body.v59-polish .view :is(p,li,summary){overflow-wrap:break-word}
body.v59-polish .view li+li{margin-top:5px}
body.v59-polish .muted,body.v59-polish .v54-subtle{color:var(--polish-muted)}
body.v59-polish .v54-section-intro{padding:4px 0 12px;margin-bottom:12px}
body.v59-polish .v54-section-intro h2{margin:8px 0 10px;font-size:clamp(27px,3vw,34px)}
body.v59-polish .v54-section-intro p{max-width:70ch;margin:0;color:var(--polish-muted)}
body.v59-polish :is(.panel,.card,.manual-reader,.wild-guide){border-radius:var(--polish-radius)!important;border-color:var(--polish-edge)!important}
body.v59-polish .panel{padding:24px;margin:16px 0}
body.v59-polish .panel>h2:first-child,body.v59-polish .panel>h3:first-child{margin-top:0}
body.v59-polish .panel>p:last-child{margin-bottom:0}
body.v59-polish .view label{font-size:13px;font-weight:550;line-height:1.5;color:#c5ccbb;margin:14px 0 7px}
body.v59-polish :is(input:not([type=checkbox]):not([type=radio]),select,textarea){min-height:48px;padding:12px 14px;font-size:16px;line-height:1.5;border:1px solid #505c46;background:#101410;color:#f0f0e9;border-radius:11px;box-shadow:none;caret-color:var(--polish-gold)}
body.v59-polish :is(input,textarea)::placeholder{color:#929b8b;opacity:1}
body.v59-polish :is(input,select,textarea):focus-visible{outline:2px solid var(--polish-gold);outline-offset:3px;border-color:var(--polish-gold)}
body.v59-polish input[type=checkbox],body.v59-polish input[type=radio]{accent-color:var(--polish-gold);width:20px;height:20px;flex-shrink:0}
body.v59-polish .view :is(button,.btn){font-size:14px;line-height:1.4;min-height:44px;border-radius:11px;font-weight:550;padding:11px 15px;white-space:normal}
body.v59-polish button:disabled{opacity:.55;cursor:not-allowed}
body.v59-polish :is(button,a,summary):focus-visible{outline:2px solid #f3d69c;outline-offset:4px}
body.v59-polish :is(.grid,.cards){gap:16px}
body.v59-polish .view :is(.crow,.bc-actions,.fm-actions){gap:10px;align-items:center}
body.v59-polish .view :is(.alert,.bc-note){padding:14px 16px;border-radius:0 10px 10px 0;line-height:1.65}
body.v59-polish .view summary{line-height:1.5;cursor:pointer}
body.v59-polish .view details[open]>summary{margin-bottom:12px}
body.v59-polish .view :is(ol,ul){padding-left:24px}
body.v59-polish table.facts{font-size:14px}body.v59-polish table.facts :is(td,th){padding:10px 12px;vertical-align:top;border-color:#394132}
/* Familiar home composition, with a quieter and more consistent component finish. */
body.v59-polish #home>.wild-hero{border:1px solid #3c4433!important;padding:38px!important}
body.v59-polish .v54-readiness button{border-color:#4e5940;border-radius:12px;padding:12px 16px}
body.v59-polish .v54-readiness strong{line-height:1.5}
body.v59-polish .v54-home-search{border-radius:var(--polish-radius)!important}
body.v59-polish .v54-destinations>h3{font-size:14px;letter-spacing:.01em;margin:4px 0 14px}
body.v59-polish .v54-card-grid{gap:16px}
body.v59-polish .v54-feature-card{padding:24px;gap:14px;border-radius:var(--polish-radius);min-height:204px;border-color:#414b37;box-shadow:inset 0 1px 0 #ffffff04}
body.v59-polish .v54-card-top small{font-size:11px;font-weight:500;padding:3px 8px;color:#c3c9b6}
body.v59-polish .v54-card-description{font-size:14px;font-weight:400;line-height:1.65;color:#b8c1ad}
body.v59-polish .v54-card-tail{font-size:12px;gap:9px;padding-top:2px}
body.v59-polish .v54-desktop-nav button{padding:10px 15px;border-radius:11px}
body.v59-polish .v54-header-actions button{border-radius:11px}
body.v59-polish .v54-bottom button{transform:none;line-height:1.3;gap:5px}
body.v59-polish .v54-bottom button[aria-current=page]{box-shadow:inset 0 0 0 1px #8c815744}
body.v59-polish .v54-back-top{border-radius:22px;padding:9px 14px;box-shadow:0 3px 14px #0003}
/* Menus and device settings use the same spacing and control proportions. */
body.v59-polish .v54-dialog{border-color:#68724f;border-radius:20px;padding:26px}
body.v59-polish .v54-dialog-head{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #39432f}
body.v59-polish .v54-dialog-head h2{font-size:24px;letter-spacing:-.025em}
body.v59-polish .v54-nav-group{margin:24px 0}
body.v59-polish .v54-nav-group h3{color:#bdc6ac;font-size:11px;margin-bottom:12px}
body.v59-polish .v54-nav-group>div{gap:10px}
body.v59-polish .v54-link-label strong{font-size:14px;line-height:1.4}
body.v59-polish .v54-link-label small{font-size:12px;line-height:1.6}
body.v59-polish .v54-device-content>.pill{padding:14px;line-height:1.6}
/* Library, illustrated lessons and household forms. */
body.v59-polish #unified-field-manual>h2,body.v59-polish #fm-offline-manual>h2{font-size:clamp(24px,3vw,30px)}
body.v59-polish .wild-guide>summary{padding:18px 20px;font-weight:650}
body.v59-polish .wild-guide-body{padding:0 20px 22px;line-height:1.75}
body.v59-polish .fm-result{padding:20px;border-radius:14px;border-color:#424c37;margin:14px 0}
body.v59-polish .fm-result h4{font-size:16px;line-height:1.45;margin:0 0 10px}
body.v59-polish .fm-excerpt,body.v59-polish #fm-page-text{font-size:16px;line-height:1.8}
body.v59-polish #bushcraft :is(.bc-panel,.bc-item,.bc-cat,.bc-step,.bc-photo){border-radius:12px}
body.v59-polish #bushcraft .bc-panel{padding:20px}
body.v59-polish #bushcraft .bc-list{gap:9px}
body.v59-polish #bc-cats{scrollbar-width:thin;scrollbar-color:#65704b transparent;padding-bottom:10px}
body.v59-polish #bushcraft .bc-item{padding:12px 14px;line-height:1.5}
body.v59-polish #bushcraft .bc-step p{padding:14px 16px;line-height:1.7}
body.v59-polish #bushcraft .bc-stepgrid{gap:18px}
body.v59-polish #household .hh-form{padding:18px;border-radius:13px;border-color:#414b37;margin:16px 0}
body.v59-polish #household details{border-color:#414b37;border-radius:13px;padding:16px;margin:12px 0}
body.v59-polish #household summary{font-size:15px;font-weight:600}
body.v59-polish #household .hh-task{gap:12px;padding:14px 0;border-color:#394132}
body.v59-polish #household .hh-grid{gap:16px}
body.v59-polish #household label{gap:7px}
/* Readable conversation bubbles replace the heavy panel-inside-panel treatment. */
body.v59-polish #aegis-chat-root{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
body.v59-polish #aegis-chat-root>h2{font-size:clamp(27px,3vw,34px);margin:4px 0 12px}
body.v59-polish #aegis-chat-root>p{font-size:14px;color:var(--polish-muted);max-width:78ch}
body.v59-polish #aegis-chat-status{font-size:13px;line-height:1.6;padding:12px 15px;border:1px solid #48543b;border-radius:11px;background:#192116;color:#d1dcc4;margin:16px 0}
body.v59-polish #aegis-chat-thread{border:0!important;background:transparent!important;padding:4px 4px 12px!important;max-height:60dvh!important;min-height:240px!important;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#646b4c transparent;scroll-padding:12px}
body.v59-polish .aegis-chat-message{margin:14px 0;max-width:94%;min-width:0;border:1px solid #3c4734;border-radius:16px 16px 16px 5px;padding:20px 22px;background:#161c15;color:#e9eee1;overflow-wrap:anywhere}
body.v59-polish .aegis-chat-user{margin-left:auto;max-width:78%;background:#282c20;border-color:#605d40;border-radius:16px 16px 5px 16px}
body.v59-polish .aegis-chat-speaker{display:block;font-size:11px;line-height:1.4;letter-spacing:.07em;text-transform:uppercase;color:#ddc492;font-weight:700;margin-bottom:10px}
body.v59-polish .aegis-chat-message-body{font-size:16px;line-height:1.8;white-space:pre-wrap;max-width:82ch}
body.v59-polish .aegis-chat-user .aegis-chat-message-body{line-height:1.65}
body.v59-polish #aegis-chat-input{min-height:104px;resize:vertical;border-color:#727653;padding:15px 16px;border-radius:14px;line-height:1.65}
body.v59-polish .v54-ai-actions{gap:10px;margin-top:12px}
body.v59-polish .v54-ai-actions>button{min-height:50px;padding:13px 16px}
body.v59-polish #aegis-chat-send{background:#d6b878;border-color:#d6b878;color:#171e13;font-weight:700}
body.v59-polish #aegis-chat-manual{background:#22291e;border-color:#536046;color:#dfdcc8}
body.v59-polish .v54-ai-options{padding:13px 16px;border:1px solid #3a4531;border-radius:12px;background:#141a12;margin:14px 0;font-size:13px}
body.v59-polish .v54-ai-options>summary{font-weight:600;color:#c9d0bc;min-height:22px}
/* Community retains its group-text layout and independent notification controls. */
body.v59-polish #community .community-chat-header{gap:12px;border-color:#3b4236;background:#171d15}
body.v59-polish #community .community-chat-title h2{font-size:20px;line-height:1.3}
body.v59-polish #community .community-info{padding:11px 22px;background:#12180f;border-color:#353f2d;font-size:13px}
body.v59-polish #community .community-message{padding:13px 16px;border-color:#414c37;background:#1b2318;line-height:1.65}
body.v59-polish #community .community-own{background:#3c3726;border-color:#736443}
body.v59-polish #community .community-message-head strong{font-size:12px}
body.v59-polish #community .community-message-head time{font-size:11px}
body.v59-polish #community .community-message p{line-height:1.65}
body.v59-polish #community #community-form{background:#171d15;border-color:#3b4236;padding-top:14px}
body.v59-polish #community #community-notifications{font-size:13px;min-height:44px;padding:9px 13px}
/* Emergency, reference tools, records and device diagnostics share the same finish. */
body.v59-polish #emergency :is(.alert,.card.danger){border-color:#99634f!important}
body.v59-polish #emergency h2{font-size:clamp(25px,3vw,32px)}
body.v59-polish #tools .panel{margin:0 0 16px}
body.v59-polish #data textarea{min-height:160px;line-height:1.75}
body.v59-polish :is(#diag,#messages,#updates,#radiohub) .panel>p{max-width:85ch}
body.v59-polish #repair-aegis-results>div{padding:14px;margin:10px 0;border-radius:11px;line-height:1.65}
body.v59-polish footer{font-size:11px;line-height:1.8;padding:24px 18px}
@media(hover:hover){body.v59-polish .v54-feature-card:hover{background:#242c1e;border-color:#9d956a}body.v59-polish .view button:not(.v54-feature-card):hover{filter:brightness(1.08);transform:none}body.v59-polish #aegis-chat-send:hover{background:#e0c78f}}
@media(max-width:800px){
 body.v59-polish .shell{padding:18px 16px 36px}
 body.v59-polish .panel{padding:19px;margin:14px 0}
 body.v59-polish #home>.wild-hero{padding:27px 23px!important}
 body.v59-polish #home>.wild-hero h2{font-size:35px;line-height:1.12;letter-spacing:-.04em}
 body.v59-polish #home>.wild-hero p{font-size:14px;line-height:1.65}
 body.v59-polish .v54-readiness button{padding:11px 9px;gap:5px;min-height:88px}
 body.v59-polish .v54-readiness span{font-size:9px}
 body.v59-polish .v54-readiness strong{font-size:11px}
 body.v59-polish .v54-card-grid{gap:12px}
 body.v59-polish .v54-feature-card{padding:18px 15px;min-height:216px;gap:12px}
 body.v59-polish .v54-feature-card>strong{font-size:17px;line-height:1.3}
 body.v59-polish .v54-card-description{font-size:13px;line-height:1.7}
 body.v59-polish .v54-card-top small{font-size:9px;padding:0;border:0}
 body.v59-polish .v54-card-tail{font-size:11px}
 body.v59-polish .v54-bottom button span{font-size:10px}
 body.v59-polish .v54-bottom button{min-height:49px;padding:6px 2px}
 body.v59-polish .v54-dialog{padding:22px 18px;border-radius:18px}
 body.v59-polish .v54-dialog-head{top:-22px}
 body.v59-polish .v54-link-label strong{font-size:14px}
 body.v59-polish .v54-link-label small{font-size:12px}
 body.v59-polish .view :is(button,.btn){font-size:14px;min-height:46px}
 body.v59-polish #bushcraft .bc-panel{padding:17px}
 body.v59-polish #household .hh-form{padding:15px}
 body.v59-polish #household .hh-grid{grid-template-columns:minmax(0,1fr)}
 body.v59-polish .wild-guide>summary{padding:16px}
 body.v59-polish .wild-guide-body{padding:0 16px 18px}
 body.v59-polish #aegis-chat-thread{max-height:55dvh!important;min-height:220px!important;padding:0 0 8px!important}
 body.v59-polish .aegis-chat-message{padding:16px 17px;max-width:96%;margin:12px 0}
 body.v59-polish .aegis-chat-user{max-width:88%}
 body.v59-polish .aegis-chat-message-body{font-size:16px;line-height:1.75}
 body.v59-polish .aegis-chat-speaker{font-size:10px;margin-bottom:8px}
 body.v59-polish #aegis-chat-root>p{font-size:13px;line-height:1.7}
 body.v59-polish #aegis-chat-status{font-size:12px;padding:11px 13px}
 body.v59-polish #community .community-message{max-width:88%}
 body.v59-polish table.facts{display:block;max-width:100%;overflow-x:auto}
}
@media(max-width:360px){body.v59-polish .v54-card-grid{grid-template-columns:1fr}body.v59-polish .v54-feature-card{min-height:180px}body.v59-polish .v54-header-actions button{padding:8px;font-size:10px}}
body.v59-polish.big .view :is(button,.btn,label){font-size:1em;min-height:48px}
body.v59-polish.big .aegis-chat-message-body{font-size:20px}
body.v59-polish.big .v54-bottom button span{font-size:13px}
body.v59-polish.hc :is(.panel,.card,.aegis-chat-message,#aegis-chat-status,.v54-ai-options,.community-message,.community-chat-header,.community-info,#community,#community-form){background:#000!important;border-color:#fff!important;color:#fff!important}
body.v59-polish.hc :is(.muted,.aegis-chat-speaker,.v54-card-description){color:#fff!important}
body.v59-polish.hc :is(input,select,textarea){background:#000!important;border-color:#fff!important;color:#fff!important}
@media(max-height:480px){body.v59-polish #community .community-chat-header{padding-top:calc(8px + env(safe-area-inset-top,0px));padding-bottom:8px}body.v59-polish #community .community-info{padding:6px 16px}body.v59-polish #community-feed{padding:8px 16px}body.v59-polish #community #community-form{padding-top:8px;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))}}
body.v59-polish.lowpower *{box-shadow:none!important;filter:none!important}
@media(prefers-reduced-motion:reduce){body.v59-polish *{transition:none!important;scroll-behavior:auto!important}}
`;
function init(){document.body.classList.add('v59-polish');const style=document.createElement('style');style.id='aegis-visual-polish';style.textContent=CSS;document.head.append(style)}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',()=>queueMicrotask(init));else init();
})();
