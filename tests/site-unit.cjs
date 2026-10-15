const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/site.js'),'utf8');
const el=(extra={})=>Object.assign({hidden:false,value:'',textContent:'',disabled:false,dataset:{},events:{},attributes:{},addEventListener(type,fn){this.events[type]=fn},setAttribute(k,v){this.attributes[k]=v},focus(){this.focused=true}},extra);
const buttons=['all','writing','podcast','speaking'].map(type=>el({dataset:{filter:type}}));
const items=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../assets/content.json'),'utf8'));
const cards=items.map(x=>el({dataset:{type:x.type,search:(x.title+' '+x.description+' '+x.source).toLowerCase()}}));
const nodes={'.filter-bar':el({hidden:true}),'#content-search':el(),'.result-count':el(),'.empty-state':el(),'#empty-description':el(),'#reset-filters':el(),'#contact-form':null};
vm.runInNewContext(source,{document:{querySelector:s=>nodes[s],querySelectorAll:s=>s==='[data-filter]'?buttons:s==='.media-card'?cards:[]}});
assert.equal(cards.filter(x=>!x.hidden).length,items.length);
buttons[2].events.click();assert.equal(cards.filter(x=>!x.hidden).length,items.filter(x=>x.type==='podcast').length);assert.equal(buttons[2].attributes['aria-pressed'],'true');
buttons[3].events.click();assert.equal(cards.filter(x=>!x.hidden).length,items.filter(x=>x.type==='speaking').length);
nodes['#reset-filters'].events.click();assert.equal(cards.filter(x=>!x.hidden).length,items.length);assert(buttons[0].focused);
nodes['#content-search'].value='ANDIUM';nodes['#content-search'].events.input();assert.equal(cards.filter(x=>!x.hidden).length,1);
nodes['#content-search'].value='not a real query';nodes['#content-search'].events.input();assert.equal(nodes['.result-count'].textContent,'0 items');
nodes['#reset-filters'].events.click();buttons[1].events.click();assert.equal(cards.filter(x=>!x.hidden).length,items.filter(x=>x.type==='writing').length);
for (const token of [null, '', '   ', 'test-captcha-token']) {
 const status=el(); let prevented=false; let reset=false;
 const form=el({reset:()=>{reset=true}});
 const document={querySelectorAll:()=>[],querySelector:s=>s==='#contact-form'?form:s==='#form-status'?status:null};
 vm.runInNewContext(source,{document,FormData:class {get(key){assert.equal(key,'g-recaptcha-response');return token;}}});
 form.events.submit({preventDefault(){prevented=true;}});
 if(token&&token.trim()){assert.equal(prevented,false);assert.equal(status.textContent,'Sending…');}
 else{assert.equal(prevented,true);assert.match(status.textContent,/complete the spam check/);}
 assert.equal(reset,false);
}
console.log('PASS: filters, search/reset; missing/blank CAPTCHA blocked without clearing inputs; token-present submission passes to native server validation (mock DOM).');
// Scroll progress, reduced motion and native manual control.
for (const reduced of [false,true]) {
 let top=1000;const summary=el({getBoundingClientRect:()=>({top})});
 const style=()=>({setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}});
 const chapters=[el({style:style()}),el({style:style()}),el({style:style()})];
 const timeline=el({style:style(),offsetHeight:600,querySelectorAll:()=>chapters});
 const career=el({open:true,querySelector:s=>s==='summary'?summary:timeline});
 const events={};const motion={matches:reduced,addEventListener(){},removeEventListener(){}};
 vm.runInNewContext(source,{document:{querySelector:s=>s==='.career'?career:null,querySelectorAll:()=>[]},innerHeight:1000,matchMedia:()=>motion,requestAnimationFrame:fn=>fn(),addEventListener:(type,fn)=>events[type]=fn,removeEventListener:type=>delete events[type]});
 assert.equal(career.open,false);
 top=575;events.scroll();assert.equal(career.open,true);
 assert.equal(timeline.style.height,reduced?'auto':'300px');
 assert.equal(timeline.style['--track-progress'],reduced?'1':'0.5');
 if(!reduced) assert(Number(chapters[0].style['--chapter-reveal'])>Number(chapters[2].style['--chapter-reveal']));
 top=200;events.scroll();assert.equal(timeline.style.height,'auto');
 top=1000;events.scroll();assert.equal(career.open,false);
 summary.events.click();assert.equal(timeline.style.height,'');assert.equal(events.scroll,undefined);
}
console.log('PASS: scroll reveal closed/mid/full/reverse, reduced motion, manual override.');

{
 const style=()=>({setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}});
 const timeline=el({style:style(),offsetHeight:600,querySelectorAll:()=>[]});
 const summary=el({getBoundingClientRect:()=>({top:2000})});
 const career=el({open:true,querySelector:s=>s==='summary'?summary:timeline});
 let scrolled=0;const target={scrollIntoView:()=>scrolled++};const handlers={};
 vm.runInNewContext(source,{document:{querySelector:s=>s==='.career'?career:s==='#contact'?target:null,querySelectorAll:()=>[],addEventListener:(t,f)=>handlers[t]=f},location:{hash:'#contact',origin:'https://example.com'},innerHeight:1000,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),requestAnimationFrame:f=>f(),addEventListener:(t,f)=>handlers[t]=f,removeEventListener:t=>delete handlers[t]});
 assert(career.open);assert.equal(scrolled,1);assert.equal(handlers.scroll,undefined);
}
console.log('PASS: contact hash settles disclosure before one-time anchor alignment.');
