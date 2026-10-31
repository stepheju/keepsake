/* Open holly bauble with connected cursive name and aligned color regions. */
(function(root){
function build(p,J){
 const K=root.CADKernel;if(!K)throw Error('Preparing the 3D engine…');
 const d=Number(p.baubleDiameter)||80,ring=Number(p.baubleRing)||3,depth=Number(p.baubleThickness)||3,R=d/2,inner=R-ring;
 if(d<60||d>160||ring<2||ring>6||depth<2||depth>5)throw Error('Bauble: diameter 60–160 mm, outline 2–6 mm, thickness 2–5 mm.');
 const owned=[],keep=o=>(owned.push(o),o),cs=paths=>keep(new K.CrossSection(paths.map(path=>path.map(p=>p.map(n=>Math.round(n*10000)/10000))),'NonZero'));
 const circle=(r,x=0,y=0)=>cs(J.geometries.geom2.toOutlines(J.transforms.translate([x,y],J.primitives.circle({radius:r,segments:96}))));
 const capsule=(a,b,r)=>cs(J.geometries.geom2.toOutlines(J.hulls.hull(...[a,b].map(v=>J.transforms.translate(v,J.primitives.circle({radius:r,segments:32}))))));
 const add=(a,b)=>keep(a.add(b)),bez=(a,b,c,e,n=32)=>Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return [0,1].map(k=>u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*e[k]);});
 try{
 let frame=keep(circle(R).subtract(circle(inner)));
 const cap=cs(J.geometries.geom2.toOutlines(J.transforms.translate([0,R+d*.03],J.primitives.roundedRectangle({size:[d*.27,d*.13],roundRadius:d*.02,segments:64}))));
 frame=add(frame,cap);const loopY=R+d*.15;frame=add(frame,capsule([0,R],[0,loopY],Math.max(2,ring)));frame=add(frame,circle(Math.max(5,d*.065),0,loopY));frame=keep(frame.subtract(circle(2,0,loopY)));
 let leaves,berries;
 for(const side of [1,-1]){
 const map=v=>v.map(n=>n*d*side),rootPoint=map([.31,.27]);
 const path=[...bez(map([.02,.49]),map([.02,.25]),map([.20,.36]),rootPoint),...bez(rootPoint,map([.36,.25]),map([.42,.21]),map([.465,.18])).slice(1)];
 for(let i=1;i<path.length;i++)frame=add(frame,capsule(path[i-1],path[i],Math.max(.65,d*.01)));
 for(const tip of [[.13,.36],[.22,.43],[.15,.19],[.36,.10]]){
 const end=map(tip),vx=end[0]-rootPoint[0],vy=end[1]-rootPoint[1],length=Math.hypot(vx,vy),nx=-vy/length*d*.038,ny=vx/length*d*.038;
 const controls=(sign)=>[[rootPoint[0]+vx*.32+nx*sign,rootPoint[1]+vy*.32+ny*sign],[rootPoint[0]+vx*.78+nx*sign,rootPoint[1]+vy*.78+ny*sign]];
 const upper=controls(1),lower=controls(-1),outline=[...bez(rootPoint,...upper,end),...bez(end,lower[1],lower[0],rootPoint).slice(1)];
 const leaf=cs([outline]);leaves=leaves?add(leaves,leaf):leaf;
 }
 for(const point of [[.295,.285],[.34,.275],[.315,.235]]){const [x,y]=map(point),berry=circle(d*.026,x,y);berries=berries?add(berries,berry):berry;}
 }
 leaves=keep(leaves.intersect(circle(R)));berries=keep(berries.intersect(circle(R)));
 let name;
 const glyphs=typeof module==='object'?require('./cursive-font.js'):root.CursiveGlyphs,contours=[];let cursor=0;
 for(const ch of (p.name||'').trim()){const g=glyphs[ch]||glyphs['?'];for(const path of g.paths)contours.push(path.map(v=>[v[0]+cursor,v[1]]));cursor+=g.advance;}
 if(contours.length){const pts=contours.flat(),xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),fit=Math.min(inner*1.64/(x1-x0),inner*.72/(y1-y0));name=keep(cs(contours.map(path=>path.map(v=>[(v[0]-(x0+x1)/2)*fit,(v[1]-(y0+y1)/2)*fit-d*.015]))).offset(.25));
 const points=name.toPolygons().flat();for(const side of [-1,1]){const end=points.reduce((a,b)=>side*b[0]>side*a[0]?b:a),start=[side*(Math.sqrt(inner*inner-end[1]*end[1])+.6),end[1]],mid=[(start[0]+end[0])/2,end[1]-d*.035],path=bez(start,mid,mid,end,24);for(let i=1;i<path.length;i++)name=add(name,capsule(path[i-1],path[i],Math.max(.5,ring*.20)));}
 }
 let plan=add(add(frame,leaves),berries);if(name)plan=add(plan,name);
 // Keep dots and separated glyphs attached without adding a filled panel.
 for(let pass=0;pass<80;pass++){const parts=plan.decompose();parts.forEach(keep);if(parts.length===1)break;parts.sort((a,b)=>b.area()-a.area());const sample=s=>s.toPolygons().flatMap(path=>path.filter((_,i)=>i%Math.max(1,Math.floor(path.length/80))===0)),a=sample(parts[0]);let best=Infinity,ends;for(const part of parts.slice(1)){const b=sample(part);for(const u of a)for(const v of b){const dist=(u[0]-v[0])**2+(u[1]-v[1])**2;if(dist<best){best=dist;ends=[u,v];}}}if(!ends)throw Error('Try a shorter name.');const line=capsule(...ends,.55);name=name?add(name,line):line;plan=add(plan,line);}
 plan=cs(plan.toPolygons());leaves=cs(leaves.toPolygons());berries=cs(berries.toPolygons());if(name)name=cs(name.toPolygons());
 let body=keep(plan.extrude(depth));const relief=(shape,h)=>keep(keep(shape.extrude(h+.03)).translate([0,0,depth-.03]));if(name)body=add(body,relief(name,2.3));body=add(body,relief(leaves,.6));body=add(body,relief(berries,1.1));body=add(body,relief(cap,.6));
 // Four shallow cap grooves, modeled in the printable solid.
 for(const x of [-.09,-.03,.03,.09]){const cut=capsule([x*d,R+d*.005],[x*d,R+d*.06],d*.008);body=keep(body.subtract(keep(keep(cut.extrude(.55)).translate([0,0,depth+.15]))));}
 body=keep(body.simplify(.003));if(body.status()!=='NoError')throw Error('Could not build this holly bauble.');const shells=body.decompose();shells.forEach(keep);if(shells.length!==1)throw Error('The ornament must be one connected piece.');
 const geom=s=>{const m=s.getMesh(),polys=[];for(let i=0;i<m.triVerts.length;i+=3)polys.push(J.geometries.poly3.create([0,1,2].map(k=>{const n=m.triVerts[i+k]*m.numProp;return Array.from(m.vertProperties.slice(n,n+3));})));const g=J.geometries.geom3.create(polys);g.preTriangulated=true;return g;};
 let rest=body;const colorParts=[],take=(label,shape,color)=>{const parts=rest.split(keep(shape.extrude(depth+2)));parts.forEach(keep);if(parts[0].volume()>0)colorParts.push({name:label,color,geometry:geom(parts[0])});rest=parts[1];};
 if(name){const mask=keep(keep(keep(name.offset(.05)).extrude(1.2)).translate([0,0,depth+1.3])),parts=rest.split(mask);parts.forEach(keep);colorParts.push({name:'Cursive name',color:'#dfb84e',geometry:geom(parts[0])});rest=parts[1];}take('Red berries',berries,'#b72c3c');take('Holly leaves',leaves,'#315a47');take('Gold cap',cap,'#dfb84e');if(rest.volume()>0)colorParts.push({name:'Bauble and holly stems',color:'#b72c3c',geometry:geom(rest)});
 const geometry=geom(body),top=loopY+Math.max(5,d*.065);
 return {frame:geometry,printFrame:geometry,back:null,colorParts,planOutlines:plan.toPolygons(),meta:{model:'holly',w:d,h:d,fw:d,fh:top+R,centerX:0,centerY:(top-R)/2,top,depth:depth+(name?2.3:1.1),textBase:depth+1.3,baseDepth:depth,assembly:'One connected open ornament with holly, berries, a gold cap and a personalized cursive name. Print flat at 100% scale; use the 4 mm hanging hole.'}};
 }finally{for(const item of owned.reverse())item.delete();}
}
if(typeof module==='object')module.exports={build};else root.HollyModel={build};
})(typeof window==='object'?window:globalThis);
