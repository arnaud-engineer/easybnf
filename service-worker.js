const imageCache='easybnf:images:f992e84ceb906051';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('easybnf:images:')&&name!==imageCache).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));
const inFlight=new Map();
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
  if(!url.pathname.startsWith('/logo/')&&!url.pathname.startsWith('/assets/branding/')&&!['/assets/arnaud-cool.svg','/assets/contact.png','/favicon.ico','/favicon.svg','/apple-touch-icon.png','/safari-pinned-tab.svg'].includes(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(imageCache);
    const hit=await cache.match(event.request);
    if(hit)return hit;
    const key=event.request.url;
    if(!inFlight.has(key))inFlight.set(key,(async()=>{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    })().finally(()=>inFlight.delete(key)));
    return (await inFlight.get(key)).clone();
  })());
});
