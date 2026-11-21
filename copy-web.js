const fs=require("fs"),path=require("path");
const root=process.cwd(), out=path.join(root,"www");
fs.mkdirSync(path.join(out,"assets"),{recursive:true});
for(const f of ["index.html","style.css","app.js","wizard.js","manifest.webmanifest","sw.js"])fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const f of fs.readdirSync(path.join(root,"assets")))fs.copyFileSync(path.join(root,"assets",f),path.join(out,"assets",f));
console.log("Web assets copied to www/");
