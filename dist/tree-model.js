/* Solid personalized tree, shared by preview, STL and color-part export. */
(function(root){
function build(p,J){
 const K=root.CADKernel;if(!K)throw Error(root.CADKernelError||'Preparing the 3D engine…');
 const w=Number(p.treeWidth)||65,h=Number(p.treeHeight)||90,d=Number(p.treeThickness)||3,e=Math.max(.8,Math.min(2.4,Number(p.treeLetterRelief)||1.6)),starRelief=Math.max(3.6,Math.min(7,Number(p.treeStarRelief)||4.8)),miniRelief=Math.max(1.4,Math.min(3,Number(p.treeMiniRelief)||2.2));
 if(w<40||w>140||h<60||h>180||d<2||d>5)throw Error('Tree size: 40–140 mm wide, 60–180 mm tall, 2–5 mm thick.');
 const owned=[],keep=o=>(owned.push(o),o),tr=J.transforms.translate,cs=s=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(s))),circle=(r,x,y)=>tr([x,y],J.primitives.circle({radius:r,segments:96}));
 try{
 const starRadius=Math.min(w*.17,h*.10),starY=Math.min(h*.32,h*.5-8-starRadius);
 const star=tr([0,starY],J.primitives.star({vertices:5,outerRadius:starRadius,innerRadius:starRadius*.5,startAngle:Math.PI/2}));
 const outline=J.primitives.polygon({points:[[0,Math.min(h*.37,starY+starRadius*.5)],[-w*.24,h*.13],[-w*.13,h*.13],[-w*.38,-h*.1],[-w*.24,-h*.1],[-w*.5,-h*.36],[-w*.085,-h*.36],[-w*.085,-h*.5],[w*.085,-h*.5],[w*.085,-h*.36],[w*.5,-h*.36],[w*.24,-h*.1],[w*.38,-h*.1],[w*.13,h*.13],[w*.24,h*.13]]});
 const bezier=(a,b,c,d,n=64)=>Array.from({length:n},(_,i)=>{const t=i/n,u=1-t;return[0,1].map(k=>u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]);});
 const contour=points=>{let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-a[1]*b[0];}return J.primitives.polygon({points:area<0?points.reverse():points});};
 const bowWing=contour([...bezier([-3,-3],[-6,-5],[-22,-13],[-25,-12],32),...bezier([-25,-12],[-28,-11],[-30,-10],[-31,-6],32),...bezier([-31,-6],[-32,-2],[-31.3,10],[-30,12],32),...bezier([-30,12],[-28.7,14],[-27,16],[-24,16],32),...bezier([-24,16],[-21,16],[-6,6],[-3,4],32),...bezier([-3,4],[0,2],[0,-1],[-3,-3],16)]);
 const tipRadius=Math.min(2.6,w*.035),foliage=keep(keep(cs(outline).offset(-tipRadius)).offset(tipRadius));let profile=keep(foliage.add(keep(cs(star).offset(.25))));
 const stem=cs(tr([0,h*.425-2.5],J.primitives.rectangle({size:[6,h*.15+1]})));
 profile=keep(profile.add(stem));profile=keep(profile.add(cs(circle(5,0,h*.5-5))));profile=keep(profile.subtract(cs(circle(2,0,h*.5-5))));
 let body=keep(profile.extrude(d));
 const details=[];
  const clothCap=(shape,center,base,lift,crease=()=>1,bottomZ=0)=>{
   let boundary=J.geometries.geom2.toOutlines(shape)[0].map(v=>v.slice());
   let area=0;for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length];area+=a[0]*b[1]-a[1]*b[0];}if(area<0)boundary.reverse();
   const n=boundary.length,rings=24,vertices=[[center[0],center[1],base+lift*crease(...center)]],faces=[];
   for(let j=1;j<=rings;j++){const r=Math.sin(j/rings*Math.PI/2);for(const p of boundary){const x=center[0]+(p[0]-center[0])*r,y=center[1]+(p[1]-center[1])*r;vertices.push([x,y,base+lift*Math.sqrt(Math.max(0,1-r*r))*crease(x,y)]);}}
   const at=(ring,i)=>1+(ring-1)*n+(i+n)%n;
   for(let i=0;i<n;i++)faces.push([0,at(1,i),at(1,i+1)]);
   for(let j=1;j<rings;j++)for(let i=0;i<n;i++){const a=at(j,i),b=at(j+1,i),c=at(j+1,i+1),d=at(j,i+1);faces.push([a,b,c],[a,c,d]);}
   const bottom=vertices.length;vertices.push([center[0],center[1],bottomZ]);const edge=vertices.length;for(const p of boundary)vertices.push([p[0],p[1],bottomZ]);
   for(let i=0;i<n;i++){const k=(i+1)%n,a=at(rings,i),b=at(rings,k);faces.push([bottom,edge+k,edge+i],[a,edge+i,edge+k],[a,edge+k,b]);}
   const mesh=new K.Mesh({numProp:3,vertProperties:new Float32Array(vertices.flat()),triVerts:new Uint32Array(faces.flat())});const solid=keep(new K.Manifold(mesh));if(solid.status()!=='NoError')throw Error('Could not construct the cloth bow surface.');return solid;
  };
 const topper=clothCap(star,[0,starY],d+.4,starRelief-.4);body=keep(body.add(topper));
 const starMask=keep(keep(keep(cs(star).offset(.28)).extrude(9)).translate([0,0,d-.05]));details.push({name:'Star topper',solid:starMask});
 let bows,bowMask;const miniScale=Math.max(.07,Math.min(w*.10/62,h*.045/28));
 for(const [x,y] of [[-.075,.04],[.075,.04],[-.27,-.22],[.27,-.22],[0,-.29]]){
 const cx=x*w,cy=y*h,place=shape=>tr([cx,cy],J.transforms.scale([miniScale,miniScale],shape));
 for(const side of [-1,1]){
 const shape=place(side===-1?bowWing:J.transforms.mirrorX(bowWing)),cap=clothCap(shape,[cx+side*17*miniScale,cy+miniScale],d+miniRelief*.10,miniRelief*.74,()=>1,d-.02);
 bows=bows?keep(bows.add(cap)):cap;const mask=cs(shape);bowMask=bowMask?keep(bowMask.add(mask)):mask;
 }
 const wrapShape=place(J.primitives.roundedRectangle({size:[8,11],roundRadius:2.8,segments:48})),wrap=clothCap(wrapShape,[cx,cy],d+miniRelief*.2,miniRelief*.8,()=>1,d-.02);bows=keep(bows.add(wrap));bowMask=keep(bowMask.add(cs(wrapShape)));
 }
 const fabric=typeof module==='object'?require('./ribbon-texture.js'):root.RibbonTexture;bows=fabric.apply(bows,K,keep,d);
 const miniMask=keep(keep(keep(bowMask.offset(.04)).extrude(4)).translate([0,0,d-.05]));details.push({name:'Mini bows',solid:miniMask});body=keep(body.add(bows));
 // Soft, snowy drifts follow the branch tips; the name stays uncovered.
 if(p.treeSnow!==false){
 let snowShape;
 const add=shape=>{const c=cs(shape);snowShape=snowShape?keep(snowShape.add(c)):c;};
 const branchEdge=foliage.toPolygons().flat();
 // Each layer gets its own continuous snow swag, from left tip to right tip.
 for(const base of [.13,-.1,-.36]){
 const candidates=branchEdge.filter(v=>v[1]>=base*h-.05&&v[1]<=base*h+Math.min(h*.12,4*tipRadius)),tip=candidates.reduce((a,b)=>b[0]>a[0]?b:a),extent=tip[0]-.35;
 const radius=Math.max(.9,Math.min(1.65,w*.023));let previous;
 for(let i=0;i<=36;i++){
 const u=-1+2*i/36,x=u*extent,dip=(base===-.36?.022:.045)*h,y=tip[1]-.15*tipRadius-dip*(1-u*u);
 const blob=tr([x,y],J.primitives.circle({radius,segments:16}));add(previous?J.hulls.hull(previous,blob):blob);previous=blob;
 }
 }
 for(const [x,y] of [[0,.18],[-.14,-.17],[.15,-.30]])add(circle(Math.max(.6,Math.min(.85,w*.012)),x*w,y*h));
 // Support the whole curved lower edge, including the shallow tip joins.
 body=keep(body.add(keep(snowShape.extrude(d))));
 const edges=snowShape.toPolygons().flatMap(path=>path.map((v,i)=>[v,path[(i+1)%path.length]])),raw=keep(snowShape.extrude(1)),dense=keep(raw.refineToLength(.55));
 const drift=keep(dense.warp(v=>{let distance=Infinity;for(const [a,b] of edges){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((v[0]-a[0])*dx+(v[1]-a[1])*dy)/len)):0;distance=Math.min(distance,Math.hypot(v[0]-a[0]-t*dx,v[1]-a[1]-t*dy));}v[2]*=.15+1.05*Math.sqrt(Math.min(1,distance/1.4));}));
 body=keep(body.add(keep(drift.translate([0,0,d-.03]))));
 const mask=keep(keep(keep(snowShape.offset(.03)).extrude(3)).translate([0,0,d-.05]));details.push({name:'Snow',solid:mask});
 }
 const glyphs=typeof module==='object'?require('./cursive-font.js'):root.CursiveGlyphs,contours=[];let cursor=0,letters;
 for(const ch of (p.name||'').trim()){const glyph=glyphs[ch]||glyphs['?'];for(const path of glyph.paths)contours.push(path.map(v=>[v[0]+cursor,v[1]]));cursor+=glyph.advance;}
 let textBase=d;const bodyMesh=body.getMesh();for(let i=2;i<bodyMesh.vertProperties.length;i+=bodyMesh.numProp)textBase=Math.max(textBase,bodyMesh.vertProperties[i]+.2);
 const pts=contours.flat();
 if(pts.length){const xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),factor=Math.min(Math.min(Number(p.textSize)||7,h*.10)/(y1-y0),(w*.46-3)/(x1-x0));
 // Offset the final script slightly to keep fine strokes printable.
 letters=keep(new K.CrossSection(contours.map(path=>path.map(v=>[(v[0]-(x0+x1)/2)*factor,(v[1]-(y0+y1)/2)*factor-h*.04])),'NonZero'));
 letters=keep(letters.offset(.12));
 const solid=keep(keep(letters.extrude(textBase-d+.02+e)).translate([0,0,d-.02]));const topMask=keep(keep(keep(letters.offset(.05)).extrude(e+.2)).translate([0,0,textBase]));details.unshift({name:'Name and year',solid:topMask});body=keep(body.add(solid));}
 const hole=keep(keep(cs(circle(2,0,h*.5-5)).extrude(d+9)).translate([0,0,-.1]));body=keep(body.subtract(hole));
 body=keep(body.simplify(.001));
 if(body.status()!=='NoError')throw Error('Unable to build tree solid.');
 function geom(s){const m=s.getMesh(),tris=[];for(let i=0;i<m.triVerts.length;i+=3)tris.push(J.geometries.poly3.create([0,1,2].map(k=>{const j=m.triVerts[i+k]*m.numProp;return Array.from(m.vertProperties.slice(j,j+3));})));const g=J.geometries.geom3.create(tris);g.preTriangulated=true;return g;}
 const shells=body.decompose();shells.forEach(keep);if(shells.length!==1)throw Error('Tree details must form one connected ornament.');
 const frame=geom(body),parts=[];let remaining=body;
 for(const part of details){const split=remaining.split(part.solid);split.forEach(keep);if(split[0].numTri()>0)parts.push({name:part.name,geometry:geom(split[0])});remaining=split[1];}parts.push({name:'Tree',geometry:geom(remaining)});
 const bounds=J.measurements.measureBoundingBox(frame),fw=bounds[1][0]-bounds[0][0],fh=bounds[1][1]-bounds[0][1];
 return {frame,printFrame:frame,back:null,colorParts:parts,meta:{model:'tree',w,h,fw,fh,depth:pts.length?textBase+e:d+Math.max(starRelief,miniRelief),textBase,starRelief,miniRelief,letterRelief:e,centerX:0,centerY:0,top:h/2,assembly:'One connected ornament. Print flat back down, with the raised name facing up. Thread a ribbon through the 4 mm hanging hole.'}};
 }finally{for(const o of owned.reverse())o.delete();}
}
if(typeof module==='object')module.exports={build};else root.TreeOrnament={build};
})(typeof window==='object'?window:globalThis);
