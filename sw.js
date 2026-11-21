const CACHE="govai-v14-static-v1";
const ASSETS=["./","./index.html","./style.css","./app.js","./wizard.js","./manifest.webmanifest","./assets/icon-192.png","./assets/icon-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const req=event.request; if(req.method!=="GET")return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  const isNavigation=req.mode==="navigate";
  event.respondWith(caches.match(req).then(cached=>{
    if(cached)return cached;
    return fetch(req).then(response=>{
      if(response.ok && response.type==="basic"){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return response;
    }).catch(()=>{if(isNavigation)return caches.match("./index.html");return new Response("Asset unavailable offline",{status:503,headers:{"Content-Type":"text/plain"}});});
  }));
});