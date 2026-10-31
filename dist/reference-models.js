/* Reference-inspired ornaments. Smooth embossed bows and raised lettering;
   rear-loading photo pocket with removable backing. All units are mm. */
(function(root){
function build(p,J){
 const {union,subtract,intersect}=J.booleans,{translate,scale}=J.transforms,{circle,rectangle,polygon}=J.primitives;
 const cutShapes=[],textShapes=[];const ex=(shape,z,height)=>{if(z===1.4&&height===.65)cutShapes.push(shape);return translate([0,0,z],J.extrusions.extrudeLinear({height},shape));};
 const presets={mini:[54,86],square:[72,86],wide:[108,86],'3r':[88.9,127],'4r':[101.6,152.4],booth2x4:[50.8,101.6],booth2x6:[50.8,152.4],booth2x8:[50.8,203.2]};
 let [w,h]=presets[p.format]||[p.width,p.height];if(p.landscape&&h>w)[w,h]=[h,w];
 if(!Number.isFinite(w)||!Number.isFinite(h)||w<20||h<20||w>200||h>250)throw Error('Photo size must be 20–200 mm wide and 20–250 mm high.');
 const model=p.model||'keepsake',b=p.border,t=p.tag,embossHeight=Math.max(.4,Math.min(1.6,Number(p.embossHeight)||.8)),ribbonHeight=Math.max(2.4,Math.min(8,Number(p.ribbonHeight)||6));
 if(model==='wreath')w=h=Math.min(w,h);
 const cw=w+.5,ch=h+.5,cy=-t/2;
 const ellipse=(x,y)=>scale([x/2,y/2],circle({radius:1,segments:96}));
 const scallop=(rx,ry,centerY,amp,n)=>polygon({points:Array.from({length:192},(_,i)=>{const a=i*Math.PI*2/192,k=amp*Math.cos(n*a);return [(rx+k)*Math.cos(a),centerY+(ry+k)*Math.sin(a)];})});
 const arch=(x,y)=>{const rx=x/2,ry=Math.min(x/2,y*.42),yc=y/2-ry;return polygon({points:[[-rx,-y/2],[rx,-y/2],...Array.from({length:65},(_,i)=>{const a=i*Math.PI/64;return[rx*Math.cos(a),yc+ry*Math.sin(a)];})]});};
 const footprint=(x,y)=>model==='wreath'?circle({radius:Math.min(x,y)/2,segments:96}):model==='oval'?ellipse(x,y):model==='arch'?arch(x,y):rectangle({size:[x,y]});
 const photo=footprint(w,h),pocket=footprint(cw,ch);
 let body;
 if(model==='wreath'||model==='oval')body=scallop(cw/2+b+2,ch/2+b+t/2,cy,model==='wreath'?1.8:2,model==='wreath'?18:14);
 else if(model==='arch')body=union(J.expansions.offset({delta:b,corners:'round',segments:32},pocket),translate([0,-ch/2-b/2-t/2+.5],rectangle({size:[cw+2*b,b+t+1]})));
 else body=translate([0,cy],J.primitives.roundedRectangle({size:[cw+2*b,ch+2*b+t],roundRadius:3,segments:32}));
 const bodyBounds=J.measurements.measureBoundingBox(body),top=bodyBounds[1][1];
 let window=footprint(w-4,h-4);
 if(model==='wreath')window=scallop((w-4)/2,(h-4)/2,0,.65,12);
 if(model==='arch'){
  const rows=Math.max(1,Math.min(4,Number(p.photoRows)||1)),gap=2.5,step=(h-4)/rows;
  const slots=[];for(let i=0;i<rows;i++){const lo=-(h-4)/2+i*step+(i?gap/2:0),hi=-(h-4)/2+(i+1)*step-(i<rows-1?gap/2:0);slots.push(intersect(window,translate([0,(lo+hi)/2],rectangle({size:[w+2,hi-lo]}))));}window=union(slots);
 }
 const bowScale=Math.min(1.3,Math.max(.55,(cw+2*b)/75));
 const bezier=(a,b,c,d,n=64)=>Array.from({length:n},(_,i)=>{const t=i/n,u=1-t;return[0,1].map(k=>u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]);});
 const contour=points=>{let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-a[1]*b[0];}return polygon({points:area<0?points.reverse():points});};
 const bowWing=contour([...bezier([-3,-3],[-6,-5],[-22,-13],[-25,-12],32),...bezier([-25,-12],[-28,-11],[-30,-10],[-31,-6],32),...bezier([-31,-6],[-32,-2],[-31.3,10],[-30,12],32),...bezier([-30,12],[-28.7,14],[-27,16],[-24,16],32),...bezier([-24,16],[-21,16],[-6,6],[-3,4],32),...bezier([-3,4],[0,2],[0,-1],[-3,-3],16)]);
 const knotProfile=J.primitives.roundedRectangle({size:[8,11],roundRadius:2.8,segments:48});
 const bowAt=top-1;
 const stroke=(points,r)=>union(points.slice(1).map((q,i)=>J.hulls.hull(translate(points[i],circle({radius:r,segments:16})),translate(q,circle({radius:r,segments:16})))));
 const bowProfiles=[bowWing,J.transforms.mirrorX(bowWing),knotProfile].map(shape=>translate([0,bowAt],scale([bowScale,bowScale],shape)));const tailShapes=[],tailPaths=[];
 const smooth=points=>{const result=[];for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];for(let j=0;j<6;j++){const t=j/6;result.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t)));}}result.push(points[points.length-1]);return result;};
 for(const side of [-1,1]){
  const control=(model==='wreath'||model==='oval')?[[side*3,bowAt-2],...[80,60,40,20,0,-20,-42].map(angle=>{const a=angle*Math.PI/180;return[side*(w/2+b*.5)*Math.cos(a),(h/2+b*.4)*Math.sin(a)];})]:[[side*3,bowAt-2],[side*(cw/2+b*.25),h/2+b*.5],[side*(cw/2+b*.85),h*.35]];
  const points=smooth(control),left=[],right=[];let lastTangent;
  for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],z=points[Math.min(points.length-1,i+1)],len=Math.hypot(z[0]-a[0],z[1]-a[1])||1,tangent=[(z[0]-a[0])/len,(z[1]-a[1])/len],normal=[-tangent[1],tangent[0]],width=Math.max(3.5,5.5*bowScale)*(1-.2*Math.sin(i/(points.length-1)*Math.PI));left.push(points[i].map((v,k)=>v+normal[k]*width/2));right.push(points[i].map((v,k)=>v-normal[k]*width/2));lastTangent=tangent;}
  const end=points[points.length-1],notch=end.map((v,k)=>v-lastTangent[k]*Math.max(1.5,2.4*bowScale));
  const tail=contour([...left,notch,...right.reverse()]);tailShapes.push(tail);tailPaths.push(points);bowProfiles.push(tail);
 }
 const hanger=union(translate([0,top+12],circle({radius:5,segments:48})),translate([0,top+4],rectangle({size:[6,18]})));
 const hangerHole=translate([0,top+12],circle({radius:2,segments:32}));
 const notch=translate([0,ch/2+.8],circle({radius:3,segments:24}));
 let frame;
 const cuts=[];
 function textShape(message,maxWidth,height,curved){
  if(!message.trim())return null;
  const paths=J.text.vectorText({height:14,input:message}),points=paths.flat();if(!points.length)return null;
  const xs=points.map(v=>v[0]),ys=points.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),k=Math.min((maxWidth-.9)/(x1-x0||1),height/(y1-y0||1));
  const lines=[];for(const path of paths)for(let i=1;i<path.length;i++){
   const fit=v=>{const x=(v[0]-(x0+x1)/2)*k;return[x,(v[1]-(y0+y1)/2)*k+(curved?x*x/(Math.max(w,50)*2):0)];};
   const a=fit(path[i-1]),z=fit(path[i]);if(Math.hypot(a[0]-z[0],a[1]-z[1])>1e-6)lines.push(J.hulls.hull(translate(a,circle({radius:.4,segments:model==='wreath'?32:8})),translate(z,circle({radius:.4,segments:model==='wreath'?32:8}))));
  }return lines.length?union(lines):null;
 }
 const name=p.name||'',year=(p.year||'').trim(),rounded=model==='wreath'||model==='oval';
 const labelY=-ch/2-b-t/2+(model==='wreath'?5:0);
 let lines=[name];if(model==='wreath'&&name.length>10&&name.includes(' ')){const words=name.split(' '),middle=Math.ceil(words.length/2);lines=[words.slice(0,middle).join(' '),words.slice(middle).join(' ')];}
 if(year)lines.push(year);
 const spacing=Math.min(6.5,(t-3)/Math.max(1,lines.length)),labelWidth=rounded?w*(model==='wreath'?.5:.65):cw+2*b-14;
 lines.forEach((line,i)=>{const y=labelY+(lines.length-1)*spacing/2-i*spacing;let shape=textShape(line,labelWidth,Math.min(p.textSize||7,spacing-1),model==='oval');if(shape){shape=intersect(translate([0,y],shape),body);textShapes.push(shape);}});
 let berries=null;
 // Use a robust manifold kernel for the curved reference silhouettes.
 // All WASM objects are released after copying out their indexed meshes.
 const K=root.CADKernel;if(!K)throw Error(root.CADKernelError||'The curved-frame CAD engine is loading. Please wait a moment.');
 const owned=[],keep=o=>(owned.push(o),o);
 const cs=shape=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(shape).map(path=>path.map(v=>v.map(n=>Math.round(n*10000)/10000)))));
 const toGeometry=solid=>{
  if(solid.status()!=='NoError')throw Error('Could not create a closed frame mesh: '+solid.status());
  const mesh=solid.getMesh(),triangles=[];
  for(let i=0;i<mesh.triVerts.length;i+=3)triangles.push([0,1,2].map(j=>{const idx=mesh.triVerts[i+j]*mesh.numProp;return[mesh.vertProperties[idx],mesh.vertProperties[idx+1],mesh.vertProperties[idx+2]];}));
  const g=J.geometries.geom3.create(triangles.map(t=>J.geometries.poly3.create(t)));g.preTriangulated=true;return g;
 };
 let back,previewBow,textBase=2,latchValidation;const colorParts=[];
 try{
  const bodyCS=cs(body),hangerCS=cs(hanger),windowCS=cs(window),holeCS=cs(hangerHole);let bowCS=cs(bowProfiles[0]);for(const profile of bowProfiles.slice(1))bowCS=keep(bowCS.add(cs(profile)));bowCS=keep(bowCS.subtract(windowCS));
  const bodyExtruded=keep(bodyCS.extrude(4.5)),bodySolid=keep(bodyExtruded.translate([0,0,-2.5]));
  const ribbonCS=hangerCS,ribbon=keep(ribbonCS.extrude(2)),joined=keep(bodySolid.add(ribbon));
  const openingCS=keep(windowCS.add(holeCS));
  // A single cloth surface follows the actual lobe boundary all the way
  // to its edge. There is no inset oval cap, backing rim, or slit cutter.
  const place=(solid,pos)=>keep(solid.translate(pos));
  const clothCap=(shape,center,base,lift,crease=()=>1)=>{
   let boundary=J.geometries.geom2.toOutlines(shape)[0].map(v=>v.slice());
   let area=0;for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length];area+=a[0]*b[1]-a[1]*b[0];}if(area<0)boundary.reverse();
   const n=boundary.length,rings=24,vertices=[[center[0],center[1],base+lift*crease(...center)]],faces=[];
   for(let j=1;j<=rings;j++){const r=Math.sin(j/rings*Math.PI/2);for(const p of boundary){const x=center[0]+(p[0]-center[0])*r,y=center[1]+(p[1]-center[1])*r;vertices.push([x,y,base+lift*Math.sqrt(Math.max(0,1-r*r))*crease(x,y)]);}}
   const at=(ring,i)=>1+(ring-1)*n+(i+n)%n;
   for(let i=0;i<n;i++)faces.push([0,at(1,i),at(1,i+1)]);
   for(let j=1;j<rings;j++)for(let i=0;i<n;i++){const a=at(j,i),b=at(j+1,i),c=at(j+1,i+1),d=at(j,i+1);faces.push([a,b,c],[a,c,d]);}
   const bottom=vertices.length;vertices.push([center[0],center[1],0]);const edge=vertices.length;for(const p of boundary)vertices.push([p[0],p[1],0]);
   for(let i=0;i<n;i++){const k=(i+1)%n,a=at(rings,i),b=at(rings,k);faces.push([bottom,edge+k,edge+i],[a,edge+i,edge+k],[a,edge+k,b]);}
   const mesh=new K.Mesh({numProp:3,vertProperties:new Float32Array(vertices.flat()),triVerts:new Uint32Array(faces.flat())});const solid=keep(new K.Manifold(mesh));if(solid.status()!=='NoError')throw Error('Could not construct the cloth bow surface.');return solid;
  };
  let raised;
  for(const side of [-1,1]){
   const wing=translate([0,bowAt],scale([bowScale,bowScale],side===-1?bowWing:J.transforms.mirrorX(bowWing)));
   const crease=(x,y)=>{const u=Math.abs(x)/bowScale,v=(y-bowAt)/bowScale,d=.28*(u-3);return 1-.09*Math.exp(-Math.pow((u-6)/6,2))*(Math.exp(-Math.pow((v-d)/1.6,2))+Math.exp(-Math.pow((v+d)/1.6,2)));};
   const loop=clothCap(wing,[side*17*bowScale,bowAt+bowScale],2+ribbonHeight*.12,ribbonHeight*.88,crease);raised=raised?keep(raised.add(loop)):loop;
  }
  // The tails have an arched cross-section across their full width, instead
  // of a separate narrow raised strip sitting on a flat silhouette.
  for(let t=0;t<tailShapes.length;t++){
   const path=tailPaths[t],raw=keep(cs(tailShapes[t]).extrude(1)),dense=keep(raw.refineToLength(Math.max(.65,bowScale)));
   const tail=keep(dense.warp(v=>{let best=Infinity,s=0;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,q=len?Math.max(0,Math.min(1,((v[0]-a[0])*dx+(v[1]-a[1])*dy)/len)):0,d=Math.hypot(v[0]-a[0]-q*dx,v[1]-a[1]-q*dy);if(d<best){best=d;s=(i-1+q)/(path.length-1);}}const cross=Math.max(0,1-(best/(2.75*bowScale))**2);v[2]*=2+ribbonHeight*(.10+.24*cross*(1-.4*s));}));raised=keep(raised.add(tail));
  }
  const wrap=clothCap(translate([0,bowAt],scale([bowScale,bowScale],knotProfile)),[0,bowAt],2+ribbonHeight*.35,ribbonHeight*.8);raised=keep(raised.add(wrap));
  const fullOpeningRaw=keep(openingCS.extrude(24)),fullOpening=keep(fullOpeningRaw.translate([0,0,-2.6]));raised=keep(raised.subtract(fullOpening));
  const fabric=typeof module==='object'?require('./ribbon-texture.js'):root.RibbonTexture;raised=fabric.apply(raised,K,keep,2);
  previewBow=toGeometry(raised);
  let combined=keep(joined.add(raised)),textSolid;
  if(model!=='wreath'){const raisedMesh=raised.getMesh();for(let i=2;i<raisedMesh.vertProperties.length;i+=raisedMesh.numProp)textBase=Math.max(textBase,raisedMesh.vertProperties[i]+.2);}
  if(textShapes.length){const textRaw=keep(cs(union(textShapes)).extrude(textBase-1.98+embossHeight)),textPlaced=keep(textRaw.translate([0,0,1.98]));textSolid=textPlaced;combined=keep(combined.add(textSolid));}
  const openBody=keep(combined.subtract(fullOpening));
  const pocketCS=keep(cs(pocket).add(cs(notch))),pocketRaw=keep(pocketCS.extrude(2.6)),pocketCutter=keep(pocketRaw.translate([0,0,-2.6]));
  let cutResult=keep(openBody.subtract(pocketCutter));
  if(cutShapes.length){const cutter=keep(cs(union(cutShapes)).extrude(.65)),cutterMoved=keep(cutter.translate([0,0,1.4]));cutResult=keep(cutResult.subtract(cutterMoved));}
  let lockingBack;
  if(model==='wreath'){
   const radius=w/2,tabWidth=4,tabRadial=3,turn=16,angles=[0,180,270],tabShape=(angle,clearance=0)=>J.transforms.rotateZ(angle*Math.PI/180,translate([radius+1,0],J.primitives.roundedRectangle({size:[tabRadial+2*clearance,tabWidth+2*clearance],roundRadius:.6,segments:32})));
   let channels,entries;
   for(const angle of angles){
    const entry=cs(tabShape(angle,.25));entries=entries?keep(entries.add(entry)):entry;
    let previous;
    for(let step=0;step<=8;step++){
     const profile=tabShape(angle+turn*step/8,.25),sweep=cs(previous?J.hulls.hull(previous,profile):profile);channels=channels?keep(channels.add(sweep)):sweep;previous=profile;
    }
   }
   const entrance=keep(keep(entries.extrude(2.55)).translate([0,0,-2.6])),track=keep(keep(channels.extrude(1.6)).translate([0,0,-1.7]));
   cutResult=keep(keep(cutResult.subtract(entrance)).subtract(track));
   lockingBack=keep(cs(circle({radius:radius-.15,segments:96})).extrude(1.2));
   for(const angle of angles)lockingBack=keep(lockingBack.add(keep(cs(tabShape(angle)).extrude(1.2))));
   // Rear finger recesses provide grip without projecting into the photo pocket.
   for(const x of [-5,5]){const grip=cs(translate([x,0],J.primitives.roundedRectangle({size:[3.2,12],roundRadius:1.5,segments:32}))),cut=keep(grip.extrude(.55));lockingBack=keep(lockingBack.subtract(cut));}
   lockingBack=keep(lockingBack.simplify(.001));
   if(p.verifyLatch){
    const volume=(angle,z)=>{const positioned=keep(keep(lockingBack.rotate([0,0,angle])).translate([0,0,z])),hit=keep(cutResult.intersect(positioned));return hit.volume();};
    latchValidation={insertion:[-3,-2.4,-1.5].map(z=>volume(0,z)),rotation:[0,4,8,12,16].map(a=>volume(a,-1.5)),retained:volume(turn,-2.4),released:volume(0,-2.4)};
   }
  }
  const components=cutResult.decompose();owned.push(...components);if(components.length!==1)throw Error('The selected frame is disconnected. Adjust its size or border.');const finalSolid=keep(cutResult.simplify(.005));frame=toGeometry(finalSolid);
  back=lockingBack?toGeometry(lockingBack):toGeometry(keep(cs(footprint(w-.1,h-.1)).extrude(1.2)));
  // Partition the final solid, so color regions share interfaces without overlap.
  let rest=cutResult;
  const take=(name,mask)=>{const [part,remainder]=rest.split(mask);keep(part);keep(remainder);rest=remainder;if(part.volume()>1e-6)colorParts.push({name,color:name==='Ribbon and bow'?(p.ribbonColor||(model==='wreath'?'#e9dbbe':'#a83945')):p.nameColor||'#efcc83',geometry:toGeometry(keep(part.simplify(model==='wreath'?.02:.005)))});};
  const knotOutline=keep(cs(translate([0,bowAt],scale([bowScale,bowScale],knotProfile))).offset(.04)),colorOutline=keep(keep(bowCS.offset(.02)).add(knotOutline)),colorRaw=keep(colorOutline.extrude(24)),ribbonMask=keep(colorRaw.translate([0,0,model==='wreath'?2:1.8]));
  const textSlab=keep(keep(K.Manifold.cube([1000,1000,24])).translate([-500,-500,textBase+(model==='wreath'?.001:0)]));
  if(model==='wreath')take('Ribbon and bow',ribbonMask);
  if(textSolid)take('Name and year',textSlab);
  if(model!=='wreath')take('Ribbon and bow',ribbonMask);
  if(rest.volume()>1e-6)colorParts.unshift({name:'Frame',color:p.frameColor||(model==='wreath'?'#315a47':'#d9b58e'),geometry:toGeometry(keep(rest.simplify(model==='wreath'?.02:.005)))});

 }finally{for(const object of owned.reverse())object.delete();}
 const accent=textShapes.length?ex(union(textShapes),textBase+embossHeight+.003,.005):null;
 const bounds=J.measurements.measureBoundingBox(frame),fw=bounds[1][0]-bounds[0][0],fh=bounds[1][1]-bounds[0][1],depth=bounds[1][2]-bounds[0][2];
 const previewParts=[{geometry:translate([0,0,.006],previewBow),color:model==='wreath'?'#e9dbbe':'#a83945'}];
 if(berries)previewParts.push({geometry:ex(berries,1.407,.02),color:'#bc2635'});
 const printFrame=translate([0,0,2.5],frame);printFrame.preTriangulated=true;

 return{frame,back,colorParts,previewDetails:previewParts.slice(1),previewAccent:accent,previewParts,trimShape:photo,photoWindow:window,meta:{w,h,fw,fh,depth,textBase,embossHeight,ribbonHeight,top,backZ:model==='wreath'?-1.5:-2.2,backRotation:model==='wreath'?16:0,latchValidation,backingLatch:model==='wreath'?{type:'bayonet',tabs:3,turnDegrees:16,radialClearance:.25,axialClearance:.2}:null,centerX:(bounds[0][0]+bounds[1][0])/2,centerY:(bounds[0][1]+bounds[1][1])/2,model,printing:'Print the frame back down. Enable supports under protruding bows, photo lips and photobooth dividers; the embossed face stays upward.',photoRows:model==='arch'?Math.max(1,Math.min(4,Number(p.photoRows)||1)):1,assembly:model==='wreath'?'Load the circular photo from the rear. Align the three backing tabs with the entry slots, press in, then turn 16° to the track stops. Reverse to remove. Reprint both frame and backing for this twist-lock version.':'Trim the photo to the backing outline, load it from the rear, then secure the backing with removable tape. The backplate is your trimming guide.'},printFrame};
}
const api={build};if(typeof module==='object')module.exports=api;else root.ReferenceFrames=api;
})(typeof window==='object'?window:globalThis);
