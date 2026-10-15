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
async function formTest(mode){
 const button=el();const status=el();let reset=false;let calls=0;
 const form=el({querySelector:()=>button,reset:()=>{reset=true}});
 const document={querySelectorAll:()=>[],querySelector:s=>s==='#contact-form'?form:s==='#form-status'?status:null};
 let resolve;const pending=new Promise(r=>resolve=r);
 vm.runInNewContext(source,{document,FormData:class{},URLSearchParams:class{toString(){return 'form-name=contact'}},fetch:async()=>{calls++;if(mode==='network')throw Error('offline');if(mode==='pending'){await pending;}return {ok:mode==='success'||mode==='pending'}}});
 const first=form.events.submit({preventDefault(){}});
 if(mode==='pending'){await form.events.submit({preventDefault(){}});assert.equal(calls,1);resolve();}
 await first;
 assert.equal(button.disabled,false);
 if(['success','pending'].includes(mode)){assert(reset);assert.match(status.textContent,/submitted/)}
 else{assert(!reset);assert.match(status.textContent,/wasn’t sent/)}
}
(async()=>{for(const mode of ['success','http-error','network','pending'])await formTest(mode);console.log('PASS: filters, combined search, empty state, reset, pressed states; form success, HTTP/network failure, retained input and duplicate-submit prevention (mock DOM/network).');})();
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
