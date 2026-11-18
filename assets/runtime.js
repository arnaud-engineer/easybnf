// Startup and background image loading remain entirely on this site and device.
let resourcePromise;
export function loadResources() {
  if (!resourcePromise) resourcePromise = fetch('/resources.json', {cache:'no-store'})
    .then(response => { if (!response.ok) throw new Error('Catalogue indisponible'); return response.json(); });
  return resourcePromise;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let revealed = false;
function reveal(error = false) {
  if (revealed) return;
  revealed = true;
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
  document.documentElement.dataset.readyAt = String(Date.now());
  if (error) document.documentElement.dataset.loadingError = 'true';
}
function waitImage(image) {
  if (image.complete) return Promise.resolve();
  return new Promise(resolve => { image.addEventListener('load',resolve,{once:true}); image.addEventListener('error',resolve,{once:true}); });
}
async function startup() {
  try {
    const catalog = await loadResources();
    await new Promise(resolve => {
      const check = () => {
        if (document.querySelector('.resource-tile,[data-bnf-access-id]') || location.pathname==='/nyt') {
          observer.disconnect(); resolve();
        }
      };
      const observer = new MutationObserver(check);
      observer.observe(document.getElementById('app'), {subtree:true,childList:true});
      check();
      setTimeout(()=>{observer.disconnect();resolve();},1500);
    });
    const first = [...document.images].filter(image=>image.loading!=='lazy').slice(0,72);
    await Promise.race([Promise.allSettled(first.map(waitImage)),pause(450)]);
    reveal();
    void warmImages(catalog);
  } catch {
    reveal(true);
    const status=document.getElementById('catalog-load-error');
    if(status)status.hidden=false;
  }
}
async function warmImages(catalog) {
  // Four at a time during idle periods, as in BnF Access. Warm only local files.
  const urls = new Set(['/assets/arnaud-cool.svg','/assets/contact.png']);
  for (const resource of catalog.resources) {
    if(resource.icon) urls.add('/logo/'+resource.icon);
    if(resource.icon_background_image) urls.add(new URL(resource.icon_background_image,location.origin+'/').pathname);
  }
  const assets=[...urls].filter(url=>new URL(url,location.href).origin===location.origin);
  await pause(80);
  for(let index=0;index<assets.length;index+=4) {
    if(document.visibilityState==='hidden') await new Promise(resolve=>document.addEventListener('visibilitychange',resolve,{once:true}));
    await new Promise(resolve=>('requestIdleCallback' in window) ? requestIdleCallback(resolve,{timeout:800}) : setTimeout(resolve,80));
    await Promise.allSettled(assets.slice(index,index+4).map(async url=>{
      const response=await fetch(url,{cache:'force-cache'});
      if(!response.ok)throw new Error('Image indisponible');
      await response.blob();
    }));
  }
  document.documentElement.dataset.warmupDoneAt=String(Date.now());
}
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(()=>{});
}
// A network failure must not trap the visitor behind an endless spinner.
setTimeout(()=>reveal(true),8000);
void startup();
