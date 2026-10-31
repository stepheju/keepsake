/* Open five-point parol with integral tails and raised personalized name. */
(function(root){
function build(p,J){
 const K=root.CADKernel;if(!K)throw Error('Preparing the 3D engine…');
 const width=Number(p.baubleDiameter)||80,ring=Number(p.baubleRing)||3,depth=Number(p.baubleThickness)||3;
 if(width<60||width>160||ring<2||ring>6||depth<2||depth>5)throw Error('Parol: width 60–160 mm, frame 2–6 mm, thickness 2–5 mm.');
 const owned=[],keep=o=>(owned.push(o),o),R=width/(2*Math.cos(Math.PI/10));
 const cross=points=>keep(new K.CrossSection([points],'EvenOdd'));
 const circle=(r,x=0,y=0)=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(J.transforms.translate([x,y],J.primitives.circle({radius:r,segments:96})))));
 const capsule=(a,b,r)=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(J.hulls.hull(...[a,b].map(v=>J.transforms.translate(v,J.primitives.circle({radius:r,segments:32})))))));
 const add=(a,b)=>keep(a.add(b));
 try{
 const vertices=Array.from({length:10},(_,i)=>{const angle=Math.PI/2+i*Math.PI/5,r=i%2?R*.46:R;return [Math.cos(angle)*r,Math.sin(angle)*r];});
 const outer=cross(vertices),inset=keep(outer.offset(-ring)),star=keep(outer.subtract(inset));
 let frame=star;
 const loopY=R+4,loop=circle(5,0,loopY);frame=add(frame,loop);frame=add(frame,capsule([0,R-4],[0,loopY],Math.max(1.5,ring/2)));frame=keep(frame.subtract(circle(2,0,loopY)));
 let tails;
 for(const index of [4,6]){
 const [x,y]=vertices[index],w=width*.052,L=width*.30;
 const tail=cross([[x-1.2,y+2],[x+1.2,y+2],[x+w*.65,y-L*.32],[x+w,y-L],[x+w*.22,y-L*.83],[x,y-L],[x-w*.22,y-L*.83],[x-w,y-L],[x-w*.65,y-L*.32]]);
 tails=tails?add(tails,tail):tail;
 }
 frame=add(frame,tails);
 let ribs;
 for(let i=0;i<10;i+=2){const line=capsule([0,0],vertices[i],Math.max(.65,ring*.23));ribs=ribs?add(ribs,line):line;}
 ribs=keep(ribs.intersect(outer));frame=add(frame,ribs);
 const band=keep(cross([[-width, -width*.105],[width,-width*.105],[width,width*.105],[-width,width*.105]]).intersect(outer));frame=add(frame,band);
 let letters;
 const paths=J.text.vectorText({height:14,input:(p.name||'').trim()}),pts=paths.flat();
 if(pts.length){
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),fit=Math.min(width*.42/(x1-x0||1),width*.115/(y1-y0||1)),stroke=Math.max(.5,width*.008);
 const map=p=>[(p[0]-(x0+x1)/2)*fit,(p[1]-(y0+y1)/2)*fit];
 for(const path of paths)for(let i=1;i<path.length;i++){const segment=capsule(map(path[i-1]),map(path[i]),stroke);letters=letters?add(letters,segment):segment;}
 }
 let body=keep(frame.extrude(depth));if(letters)body=add(body,keep(letters.extrude(depth+1)));
 body=keep(body.simplify(.005));
 if(body.status()!=='NoError')throw Error('Could not build this parol.');
 const shells=body.decompose();shells.forEach(keep);if(shells.length!==1)throw Error('The parol must print as one connected piece.');
 const geom=s=>{const m=s.getMesh(),polys=[];for(let i=0;i<m.triVerts.length;i+=3)polys.push(J.geometries.poly3.create([0,1,2].map(k=>{const n=m.triVerts[i+k]*m.numProp;return Array.from(m.vertProperties.slice(n,n+3));})));const g=J.geometries.geom3.create(polys);g.preTriangulated=true;return g;};
 const colorParts=[];let rest=body;
 const take=(name,shape,color,height=depth)=>{const parts=rest.split(keep(shape.extrude(height)));parts.forEach(keep);if(parts[0].volume()>0)colorParts.push({name,color,geometry:geom(parts[0])});rest=parts[1];};
 if(letters){const mask=keep(keep(keep(letters.offset(.05)).extrude(1.2)).translate([0,0,depth])),parts=rest.split(mask);parts.forEach(keep);colorParts.push({name:'Raised name',color:'#fff8ef',geometry:geom(parts[0])});rest=parts[1];}
 take('Name band',band,'#315a47');take('Parol tails',tails,'#b72c3c');
 if(rest.volume()>0)colorParts.push({name:'Star frame and ribs',color:'#dfb84e',geometry:geom(rest)});
 const frameGeom=geom(body),minY=Math.min(...frame.toPolygons().flat().map(p=>p[1])),top=loopY+5,fh=top-minY;
 return {frame:frameGeom,printFrame:frameGeom,back:null,colorParts,planOutlines:frame.toPolygons(),meta:{model:'parol',w:width,h:fh,fw:width,fh,depth:depth+(letters?1:0),centerX:0,centerY:(top+minY)/2,top,baseDepth:depth,textBase:depth,assembly:'One connected parol with a five-point star frame, open lantern panels, two integral tails and a name raised 1 mm. Print flat at 100% scale; use the 4 mm hanging hole.'}};
 }finally{for(const item of owned.reverse())item.delete();}
}
if(typeof module==='object')module.exports={build};else root.ParolModel={build};
})(typeof window==='object'?window:globalThis);
