/* Flat open bauble: ring, connected script and optional snowflakes, with no backing plate. */
(function(root){
function build(p,J){
 const K=root.CADKernel;if(!K)throw Error('Preparing the 3D engine…');
 const diameter=Number(p.baubleDiameter)||80,ring=Number(p.baubleRing)||3,depth=Number(p.baubleThickness)||3;
 if(diameter<60||diameter>160||ring<2||ring>6||depth<2||depth>5)throw Error('Bauble: diameter 60–160 mm, outline 2–6 mm, thickness 2–5 mm.');
 const bows=p.model==='bauble-bow';
 const owned=[],keep=o=>(owned.push(o),o),R=diameter/2,inner=R-ring,tr=J.transforms.translate;
 const cs=s=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(s))),circle=(radius,x=0,y=0)=>tr([x,y],J.primitives.circle({radius,segments:128}));
 const capsule=(a,b,r)=>cs(J.hulls.hull(tr(a,J.primitives.circle({radius:r,segments:24})),tr(b,J.primitives.circle({radius:r,segments:24}))));
 try{
 let rim=keep(cs(circle(R)).subtract(cs(circle(inner))));
 const cap=cs(tr([0,R+.8],J.primitives.roundedRectangle({size:[12,8],roundRadius:2,segments:48}))),loop=cs(circle(5,0,R+6));
 rim=keep(keep(rim.add(cap)).add(loop));rim=keep(rim.subtract(cs(circle(2,0,R+6))));
 const glyphs=typeof module==='object'?require('./cursive-font.js'):root.CursiveGlyphs,contours=[];let cursor=0,nameShape;
 for(const ch of (p.name||'').trim()){const g=glyphs[ch]||glyphs['?'];for(const path of g.paths)contours.push(path.map(v=>[v[0]+cursor,v[1]]));cursor+=g.advance;}
 if(contours.length&&!bows){
 const pts=contours.flat(),xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),fit=Math.min((bows?diameter*.64:diameter-2*ring+1)/(x1-x0),diameter*(bows?.14:.28)/(y1-y0));
 nameShape=keep(new K.CrossSection(contours.map(path=>path.map(v=>[(v[0]-(x0+x1)/2)*fit,(v[1]-(y0+y1)/2)*fit])),'NonZero'));nameShape=keep(nameShape.offset(.22));
 const points=nameShape.toPolygons().flat(),left=points.reduce((a,b)=>b[0]<a[0]?b:a),right=points.reduce((a,b)=>b[0]>a[0]?b:a),r=Math.max(.45,Math.min(.75,ring*.2));
 if(!bows){
 // A single flowing underline supports the script without parallel bars.
 const samples=Array.from({length:65},(_,i)=>{const x=-inner-.8+(inner+.8)*2*i/64;return [x,-diameter*.07+diameter*.04*(x/inner)**2];});
 for(let i=1;i<samples.length;i++)nameShape=keep(nameShape.add(capsule(samples[i-1],samples[i],r)));

 }
 }
 if(bows&&(p.name||'').trim()){
 const paths=J.text.vectorText({height:14,input:p.name.trim()}),pts=paths.flat();
 if(pts.length){
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),fit=Math.min(diameter*.68/(x1-x0||1),diameter*.15/(y1-y0||1)),stroke=Math.max(.55,diameter*.009);
 const map=p=>[(p[0]-(x0+x1)/2)*fit,(p[1]-(y0+y1)/2)*fit];
 for(const path of paths)for(let i=1;i<path.length;i++){
 const segment=capsule(map(path[i-1]),map(path[i]),stroke);nameShape=nameShape?keep(nameShape.add(segment)):segment;
 }
 }
 }
 let snowShape,treeShape;
 if(bows||p.baubleSnow!==false){
 // Four soft snowflakes with rounded branch tips, all joined to the rim.
 const flakes=[];
 if(bows){
 flakes.push(cs(J.primitives.rectangle({size:[diameter,diameter*.25]})));
 // Three five-point stars directly overlap the upper rim, leaving open sky around them.
 for(const [angle,size] of [[Math.PI/2,.082],[Math.PI*.23,.06],[Math.PI*.77,.06]]){
 const radius=diameter*size,points=Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5,r=i%2?radius*.46:radius;return [Math.cos(a)*r,Math.sin(a)*r];});
 let lo=0,hi=R;for(let i=0;i<24;i++){const t=(lo+hi)/2,max=Math.max(...points.map(p=>Math.hypot(p[0]+Math.cos(angle)*t,p[1]+Math.sin(angle)*t)));if(max<R-ring*.25)lo=t;else hi=t;}
 const star=keep(new K.CrossSection([points.map(p=>[p[0]+Math.cos(angle)*lo,p[1]+Math.sin(angle)*lo])],'EvenOdd'));flakes.push(keep(star.offset(.25)));
 }
 // One fuller, softly scalloped evergreen at the lower-left rim.
 const d=diameter;for(const [position,scale] of [[-.25,.73],[0,1],[.25,.82]]){
 const cx=d*position,base=-Math.sqrt((R-ring*.35)**2-cx*cx),height=(-d*.125-.6-base)*scale,sx=d*.16*scale;
 const point=(x,y)=>[cx+x*sx,base+y*height];
 const bez=(a,b,c,e)=>Array.from({length:21},(_,i)=>{const t=i/20,u=1-t;return point(u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*e[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*e[1]);});
 const curves=[[[0,1],[.07,.92],[.14,.86],[.24,.82]],[[.24,.82],[.39,.79],[.31,.75],[.18,.77]],[[.18,.77],[.25,.70],[.33,.66],[.40,.64]],[[.40,.64],[.56,.60],[.46,.55],[.27,.59]],[[.27,.59],[.36,.51],[.47,.46],[.56,.44]],[[.56,.44],[.76,.39],[.61,.34],[.36,.39]],[[.36,.39],[.49,.29],[.63,.23],[.73,.21]],[[.73,.21],[.93,.15],[.62,.10],[.11,.15]]];
 const right=curves.flatMap((curve,i)=>bez(...curve).slice(i?1:0)),left=right.map(p=>[2*cx-p[0],p[1]]).reverse();
 const outline=[...right,point(.10,-.02),point(-.10,-.02),...left];
 treeShape=keep(new K.CrossSection([outline],'EvenOdd'));flakes.push(treeShape);
 }
 }
 for(const [x,y,size] of (bows?[]:[[-.58,.58,.28],[.58,-.58,.28],[.65,.65,.21],[-.65,-.65,.21]])){
 const cx=x*R,cy=y*R,radius=size*R;

 const stroke=Math.max(.65,diameter*.010),segments=[cs(circle(stroke*1.65,cx,cy))];
 for(let arm=0;arm<6;arm++){
 const angle=arm*Math.PI/3,point=(d,a=angle)=>[cx+Math.cos(a)*d,cy+Math.sin(a)*d];
 segments.push(capsule([cx,cy],point(radius),stroke));
 const tip=point(radius);segments.push(cs(circle(stroke*1.2,...tip)));
 for(const distance of [.54])for(const side of [-1,1]){
 const a=point(radius*distance),b=[a[0]+Math.cos(angle+side*Math.PI/3)*radius*.32,a[1]+Math.sin(angle+side*Math.PI/3)*radius*.32];
 segments.push(capsule(a,b,stroke*.9));
 }
 }
 let flake=segments[0];for(const segment of segments.slice(1))flake=keep(flake.add(segment));flakes.push(flake);
 }
 let snow=flakes[0];for(const flake of flakes.slice(1))snow=keep(snow.add(flake));
 snowShape=keep(snow.intersect(cs(circle(R))));
 }
 let shape=nameShape&&!bows?keep(rim.add(nameShape)):rim;
 if(snowShape)shape=keep(shape.add(snowShape));
 // Join detached letters, spaces and dots by short strokes rather than a panel.
 for(let pass=0;pass<100;pass++){
 const components=shape.decompose();components.forEach(keep);if(components.length===1)break;
 components.sort((a,b)=>b.area()-a.area());const base=components[0];
 const sample=c=>c.toPolygons().flatMap(path=>path.filter((_,i)=>i%Math.max(1,Math.floor(path.length/100))===0));
 const aPoints=sample(base);let best=Infinity,link;
 for(const c of components.slice(1)){const bPoints=sample(c);for(const a of aPoints)for(const b of bPoints){const distance=(a[0]-b[0])**2+(a[1]-b[1])**2;if(distance<best){best=distance;link=[a,b];}}
 }
 if(!link)throw Error('Could not connect this name. Try a shorter name.');
 const bridge=capsule(link[0],link[1],Math.max(.45,Math.min(.7,ring*.2)));nameShape=nameShape?keep(nameShape.add(bridge)):bridge;shape=keep(shape.add(bridge));
 if(pass===99)throw Error('Please shorten the name so all letters can connect.');
 }
 const normalized=s=>keep(new K.CrossSection(s.toPolygons().map(path=>path.map(p=>p.map(n=>Math.round(n*10000)/10000))),'NonZero'));shape=normalized(shape);if(nameShape)nameShape=normalized(nameShape);
 let body=keep(keep(shape.extrude(depth)).simplify(.001));
 if(nameShape)body=keep(keep(body.add(keep(keep(nameShape.extrude(1.03)).translate([0,0,depth-.03])))).simplify(.001));
 if(body.status()!=='NoError')throw Error('Could not build the open bauble.');
 const shells=body.decompose();shells.forEach(keep);if(shells.length!==1)throw Error('The ornament must stay connected.');
 const geom=s=>{const m=s.getMesh(),polys=[];for(let i=0;i<m.triVerts.length;i+=3)polys.push(J.geometries.poly3.create([0,1,2].map(k=>{const n=m.triVerts[i+k]*m.numProp;return Array.from(m.vertProperties.slice(n,n+3));})));const g=J.geometries.geom3.create(polys);g.preTriangulated=true;return g;};
 const frame=geom(body),colorParts=[];
 let remainder=body;
 if(bows&&nameShape){const topMask=keep(keep(keep(nameShape.offset(.05)).extrude(1.2)).translate([0,0,depth]));const parts=remainder.split(topMask);parts.forEach(keep);colorParts.push({name:'Top name',color:'#fff8ef',geometry:geom(parts[0])});remainder=parts[1];}
 if(snowShape&&!bows){const parts=remainder.split(keep(snowShape.extrude(depth)));parts.forEach(keep);if(parts[0].volume()>0)colorParts.push({name:bows?'Name band, evergreen grove and stars':'Snow',color:bows?'#b72c3c':'#315a47',geometry:geom(parts[0])});remainder=parts[1];}
 if(!bows&&nameShape){const mask=keep(keep(keep(nameShape.offset(.05)).extrude(1.2)).translate([0,0,depth]));const parts=remainder.split(mask);parts.forEach(keep);if(parts[0].volume()>0)colorParts.push({name:'Connected name',color:'#b72c3c',geometry:geom(parts[0])});remainder=parts[1];}
 if(remainder.volume()>0)colorParts.push({name:bows?'Red base':'Bauble outline',...(bows?{color:'#b72c3c'}:{}),geometry:geom(remainder)});
 return {frame,printFrame:frame,back:null,colorParts,planOutlines:shape.toPolygons(),meta:{model:bows?'bauble-bow':'bauble',w:diameter,h:diameter,fw:diameter,fh:diameter+11,depth:depth+(nameShape?1:0),textBase:depth,baseDepth:depth,centerX:0,centerY:5.5,top:R+11,ring,assembly:(bows?'One connected ornament: print the whole base red, then switch to white for the name raised 1 mm on top. The 3MF keeps white out of all base layers. ':'One flat, connected ornament. ')+ ' Open spaces remain hollow around the name and rim-connected decorations. Print flat at 100% scale; thread ribbon through the 4 mm hanging hole.'}};
 }finally{for(const o of owned.reverse())o.delete();}
}
if(typeof module==='object')module.exports={build};else root.OpenBauble={build};
})(typeof window==='object'?window:globalThis);
