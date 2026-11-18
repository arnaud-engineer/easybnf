// Reuse the owning BnF Access appearance engine, not merely its image files.
import {applyLogoAppearance} from './bnf-logo/logo-appearance.js';
import {hydrateThemedSvgIcons} from './bnf-logo/catalog-icons.js';
import {scheduleLogoBackgrounds} from './bnf-logo/logo-background.js';
import {loadResources} from './runtime.js?v=65c16a4380fc2cae';
const byId=new Map((await loadResources()).resources.map(r=>[r.bnf_access_id,r]));
let queued=false;
const waiting=new WeakSet();
const visible=new WeakSet();
const nearScreen='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting){visible.add(entry.target);nearScreen.unobserve(entry.target);queue();}
},{rootMargin:'400px'}) : null;
function hydrate(){
 queued=false;
 for(const frame of document.querySelectorAll('.resource-artwork-frame')){
  if(frame.dataset.bnfPrepared==='true')continue;
  const initial=frame.querySelector('img');
  if(nearScreen&&initial?.loading==='lazy'&&!visible.has(frame)){
   if(!waiting.has(frame)){waiting.add(frame);nearScreen.observe(frame);}
   continue;
  }
  const resource=byId.get(frame.closest('[data-bnf-access-id]')?.dataset.bnfAccessId);
  if(!resource)continue;
  frame.dataset.bnfPrepared='true';
  const image=frame.querySelector('img');
  if(!image)continue;
  image.style.padding='0';
  frame.style.padding=resource.icon_no_padding?'0':'14%';
  applyLogoAppearance(frame,resource);
  const color=resource.icon_background_color;
  if(/^#[0-9a-f]{6}$/i.test(color||'')&&resource.icon.endsWith('.svg')){
   const themed=document.createElement('span');
   themed.className='themed-svg-icon';
   themed.dataset.iconSrc='/logo/'+resource.icon;
   themed.dataset.iconColor=color;
   image.replaceWith(themed);themed.append(image);
  }
 }
 hydrateThemedSvgIcons();scheduleLogoBackgrounds();
}
function queue(){if(!queued){queued=true;requestAnimationFrame(hydrate);}}
new MutationObserver(queue).observe(document.getElementById('app'),{childList:true,subtree:true});
queue();
