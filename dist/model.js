/* Parametric geometry shared by the preview and STL export. JSCAD MIT. */
(function(root){
const J=typeof module==='object'?require('./vendor/jscad.js'):root.jscadModeling;
const {union,subtract}=J.booleans,{roundedRectangle,rectangle,circle,cuboid,star}=J.primitives,{extrudeLinear,extrudeRectangular}=J.extrusions,{translate,scale,rotateX}=J.transforms;
function buildOriginal(p){
 const presets={mini:[54,86],square:[72,86],wide:[108,86],'3r':[88.9,127],'4r':[101.6,152.4],booth2x4:[50.8,101.6],booth2x6:[50.8,152.4],booth2x8:[50.8,203.2]};
 let [w,h]=presets[p.format]||[p.width,p.height];if(p.landscape&&h>w)[w,h]=[h,w];
 if(!Number.isFinite(w)||!Number.isFinite(h)||w<20||h<20||w>200||h>250)throw Error('Photo size must be 20–200 mm wide and 20–250 mm high.');
 const b=p.border,t=p.tag,cw=w+.5,ch=h+.5,fw=cw+2*b,fh=ch+2*b+t,top=ch/2+b,bottom=-ch/2-b-t,embossHeight=Math.max(.4,Math.min(1.6,Number(p.embossHeight)||.8));
 const rr=(x,y)=>{const r=Math.min(4,x/3,y/3),a=x/2,b=y/2;return J.primitives.polygon({points:[[-a+r,-b],[a-r,-b],[a,-b+r],[a,b-r],[a-r,b],[-a+r,b],[-a,b-r],[-a,-b+r]]});};
 const ex=(s,z,height)=>translate([0,0,z],extrudeLinear({height},s));
 const box=(x,y,z,dx,dy,dz)=>cuboid({center:[x,y,z+dz/2],size:[dx,dy,dz]});
 const outline=union(translate([0,-t/2],rr(fw,fh)),translate([0,top+3],circle({radius:5.5,segments:64})));
 const face=subtract(outline,rectangle({size:[w-4,h-4]}),translate([0,top+3],circle({radius:2,segments:48})));
 const body=translate([0,-t/2],rr(fw,fh));
 const channel=(width)=>subtract(body,translate([0,b+10],rectangle({size:[width,ch+2*b+20]})));
 let frame;
 let cuts=[],textShapes=[],decorShapes=[];
 if(p.name.trim()){
 const paths=J.text.vectorText({height:14,input:p.name});
 if(paths.length){
 const pts=paths.flat(),xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const factor=Math.min(p.textSize/(y1-y0||1),(fw-15)/(x1-x0||1),(t-6)/(y1-y0||1));
 const strokes=[];
 for(const points of paths)for(let i=1;i<points.length;i++){
 const fit=v=>[(v[0]-(x0+x1)/2)*factor,(v[1]-(y0+y1)/2)*factor];
 const a=fit(points[i-1]),b=fit(points[i]);if(Math.hypot(b[0]-a[0],b[1]-a[1])<1e-6)continue;
 strokes.push(J.hulls.hull(translate(a,circle({radius:.45,segments:8})),translate(b,circle({radius:.45,segments:8}))));
 }
 if(strokes.length)textShapes.push(translate([0,-ch/2-b-t/2],union(strokes)));
 }}
 const decoration=p.decoration ?? (p.stars?'classic':'none');
 const tree=()=>J.primitives.polygon({points:[[-.55,-3.6],[.55,-3.6],[.55,-2.5],[2.5,-2.5],[1.3,-.7],[2,-.7],[.85,1],[1.4,1],[0,3.6],[-1.4,1],[-.85,1],[-2,-.7],[-1.3,-.7],[-2.5,-2.5],[-.55,-2.5]]});
 const bauble=()=>union(circle({radius:2.2,segments:32}),translate([0,2.25],rectangle({size:[1.8,1.4]})),translate([0,3],circle({radius:.65,segments:16})));
 const snowflake=()=>union([0,Math.PI/3,Math.PI*2/3].map(a=>J.transforms.rotateZ(a,rectangle({size:[.6,5]}))));
 const motif=kind=>kind==='trees'?tree():kind==='baubles'?bauble():kind==='snowflakes'?snowflake():star({vertices:5,outerRadius:2.5,innerRadius:1.05});
 if(decoration!=='none')for(const side of [-1,1]){
 const positions=decoration==='classic'?[0]:[-h*.23,h*.23];
 for(let i=0;i<positions.length;i++){
 const kind=decoration==='mixed'?['trees','baubles','snowflakes','classic'][(side===-1?0:2)+i]:decoration;
 const k=Math.min(1.8,(b-1.8)/5);
 decorShapes.push(translate([side*(fw/2-b/2),positions[i]],scale([k,k],motif(kind))));cuts.push(ex(decorShapes[decorShapes.length-1],1.4,.65));
 }}
 const accents=cuts.length?[translate([0,0,1.405],scale([1,1,.03],translate([0,0,-1.4],union(cuts))))]:[];
 if(textShapes.length)accents.push(ex(union(textShapes),2+embossHeight+.003,.005));
 const previewAccent=accents.length?union(accents):null;
 const colorParts=[];const K=root.CADKernel;if(!K)throw Error(root.CADKernelError||'Loading the 3D model engine…');
 const owned=[],keep=o=>(owned.push(o),o),cs=shape=>keep(new K.CrossSection(J.geometries.geom2.toOutlines(shape)));const solidAt=(shape,height,z=0)=>keep(keep(cs(shape).extrude(height)).translate([0,0,z]));
 try{
 let textSolid;let solid=solidAt(body,5.7,-3.7);
 solid=keep(K.Manifold.union([solid,solidAt(translate([0,top+3],circle({radius:5.5,segments:64})),2)]));
 const opening=union(rectangle({size:[w-4,h-4]}),translate([0,top+3],circle({radius:2,segments:48})));
 solid=keep(solid.subtract(solidAt(opening,8,-3.8)));
 for(const [width,z,height] of [[cw,-2.5,2.5],[cw-3,-3.7,1.2]])solid=keep(solid.subtract(solidAt(translate([0,b+10],rectangle({size:[width,ch+2*b+20]})),height,z)));
 if(cuts.length){const footprints=decorShapes;solid=keep(solid.subtract(solidAt(union(footprints),.65,1.4)));}
 if(textShapes.length){textSolid=solidAt(union(textShapes),embossHeight+.02,1.98);solid=keep(K.Manifold.union([solid,textSolid]));}
 solid=keep(solid.simplify(.005));if(solid.status()!=='NoError')throw Error('Unable to create the embossed frame.');
 const components=solid.decompose();components.forEach(keep);if(components.length!==1)throw Error('Lettering must remain attached to the frame.');
 const mesh=solid.getMesh(),polys=[];for(let i=0;i<mesh.triVerts.length;i+=3){const t=[];for(let j=0;j<3;j++){const k=mesh.triVerts[i+j]*mesh.numProp;t.push(Array.from(mesh.vertProperties.slice(k,k+3)));}polys.push(J.geometries.poly3.create(t));}frame=J.geometries.geom3.create(polys);frame.preTriangulated=true;
 const geometry=part=>{const m=part.getMesh(),p=[];for(let i=0;i<m.triVerts.length;i+=3)p.push(J.geometries.poly3.create([0,1,2].map(j=>{const k=m.triVerts[i+j]*m.numProp;return Array.from(m.vertProperties.slice(k,k+3));})));const g=J.geometries.geom3.create(p);g.preTriangulated=true;return g;};
 if(textSolid){const topMask=keep(keep(keep(cs(union(textShapes)).offset(.05)).extrude(embossHeight+.2)).translate([0,0,2]));const [letters,base]=solid.split(topMask);keep(letters);keep(base);colorParts.push({name:'Frame',geometry:geometry(base)},{name:'Name and year',geometry:geometry(letters)});}else colorParts.push({name:'Frame',geometry:frame});

 }finally{for(const o of owned.reverse())o.delete();}
 const depth=5.7+(textShapes.length?embossHeight:0);
 const back=ex(union(rectangle({size:[cw-.6,ch-.3],center:[0,.15]}),translate([0,ch/2+2],rr(Math.min(20,cw-4),8))),0,1.2);
 const printFrame=translate([0,0,3.7],frame);printFrame.preTriangulated=true;return{frame,back,colorParts,previewDetails:cuts.length?[{geometry:translate([0,0,1.405],scale([1,1,.03],translate([0,0,-1.4],union(cuts)))),color:'#efcc83'}]:[],previewAccent,meta:{w,h,fw,fh,depth,top,textBase:2,backZ:-2.2,embossHeight,printing:'Print back down with the embossed face upward. Enable supports beneath the photo retaining lips.'},printFrame};
}
function build(p){
 if(p.model==='holly')return (typeof module==='object'?require('./holly-model.js'):root.HollyModel).build(p,J);
 if(p.model==='parol')return (typeof module==='object'?require('./parol-model.js'):root.ParolModel).build(p,J);
 if(p.model==='bauble'||p.model==='bauble-bow')return (typeof module==='object'?require('./bauble-model.js'):root.OpenBauble).build(p,J);
 if(p.model==='tree')return (typeof module==='object'?require('./tree-model.js'):root.TreeOrnament).build(p,J);if(p.model&&p.model!=='original'){const refs=typeof module==='object'?require('./reference-models.js'):root.ReferenceFrames;return refs.build(p,J);}return buildOriginal(p);}
function trimSvg(model){if(!model.trimShape)return null;const w=model.meta.w,h=model.meta.h,paths=J.geometries.geom2.toOutlines(model.trimShape).map(points=>'M '+points.map(v=>(v[0]+w/2).toFixed(3)+','+(h/2-v[1]).toFixed(3)).join(' L ')+' Z').join(' ');return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><title>Photo trimming outline — print at 100% scale</title><path d="${paths}" fill="none" stroke="black" stroke-width="0.15"/></svg>`;}
const triangleCache=new WeakMap();
function triangles(g){
 if(g.preTriangulated)return J.geometries.geom3.toPolygons(g).map(p=>p.vertices);
 if(triangleCache.has(g))return triangleCache.get(g);
 // Weld common vertices, split shared edges at T-junctions, then fan each
 // convex CAD face from its centre. This preserves every boundary segment.
 const verts=new Map(),eps=g.meshTolerance||.003;
 const weld=v=>{const cell=v.map(n=>Math.floor(n/eps));
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
 const found=verts.get([cell[0]+x,cell[1]+y,cell[2]+z].join(','));if(found)for(const p of found)if(Math.hypot(...v.map((n,k)=>n-p[k]))<eps)return p;
 }
 const k=cell.join(',');if(!verts.has(k))verts.set(k,[]);const p=v.slice();verts.get(k).push(p);return p;};
 const polygons=J.geometries.geom3.toPolygons(g).map(p=>p.vertices.map(weld)).map(p=>p.filter((v,i)=>v!==p[(i+1)%p.length])).filter(p=>p.length>=3);
 const all=[...verts.values()].flat(),out=[];
 for(const poly of polygons){
  const boundary=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],d=b.map((n,k)=>n-a[k]),len=d.reduce((s,n)=>s+n*n,0);if(len<1e-10)continue;
   const points=[[0,a]];
   for(const v of all){if(v===a||v===b)continue;if(v.some((n,k)=>n<Math.min(a[k],b[k])-eps||n>Math.max(a[k],b[k])+eps))continue;
    const t=v.reduce((s,n,k)=>s+(n-a[k])*d[k],0)/len;if(t<=eps/Math.sqrt(len)||t>=1-eps/Math.sqrt(len))continue;
    if(v.reduce((s,n,k)=>s+(a[k]+t*d[k]-n)**2,0)<eps*eps)points.push([t,v]);
   }
   points.sort((a,b)=>a[0]-b[0]);boundary.push(...points.map(x=>x[1]));
  }
  if(boundary.length<3)continue;
  const c=[0,1,2].map(k=>boundary.reduce((s,v)=>s+v[k],0)/boundary.length);
  for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length];const u=a.map((n,k)=>n-c[k]),v=b.map((n,k)=>n-c[k]);if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])>1e-10)out.push([c,a,b]);}
 }
 triangleCache.set(g,out);return out;
}
function stl(g){const tris=triangles(g),data=new ArrayBuffer(84+tris.length*50),v=new DataView(data);v.setUint32(80,tris.length,true);let o=84;for(const t of tris){let a=t[0],b=t[1],c=t[2],u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n)||1;for(const q of [n.map(x=>x/len),...t])for(const x of q){v.setFloat32(o,x,true);o+=4;}v.setUint16(o,0,true);o+=2;}return data;}
const api={build,triangles,stl,trimSvg};if(typeof module==='object')module.exports=api;else root.Ornament=api;
})(typeof window==='object'?window:globalThis);
