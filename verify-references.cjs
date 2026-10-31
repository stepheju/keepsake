const assert=require('node:assert/strict'),M=require('./dist/model.js'),J=require('./dist/vendor/jscad.js');
function check(g,label){const data=M.stl(g),view=new DataView(data),n=view.getUint32(80,true),edges=new Map();assert.equal(data.byteLength,84+n*50);let volume=0;for(let i=0;i<n;i++){const t=[];for(let k=0;k<3;k++){const v=[];for(let a=0;a<3;a++){const x=view.getFloat32(84+i*50+12+k*12+a*4,true);assert(Number.isFinite(x));v.push(x);}t.push(v);}const key=v=>v.join(',');for(let k=0;k<3;k++){const edge=[key(t[k]),key(t[(k+1)%3])].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);}const [a,b,c]=t;volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;}assert(volume>0,`${label} positive volume`);assert.equal([...edges.values()].filter(x=>x!==2).length,0,`${label} closed two-manifold mesh`);return n;}
(async()=>{const Module=(await import('./dist/vendor/manifold.mjs')).default;globalThis.CADKernel=await Module();globalThis.CADKernel.setup();
let count=0;
for(const model of ['wreath','arch','keepsake','oval'])for(const format of ['mini','square','wide','3r','4r','booth2x6','custom']){
 const p={model,format,width:60,height:model==='wreath'?60:80,name:'Merry Christmas',year:'2026',border:7,tag:18,textSize:7,photoRows:3};
 const m=M.build(p);check(m.printFrame,model+' '+format+' frame');check(m.back,model+' '+format+' back');count+=2;
 const bounds=J.measurements.measureBoundingBox(m.printFrame);assert(Math.abs(bounds[0][2])<1e-5);assert(Math.abs(bounds[1][2]-m.meta.depth)<1e-5);assert(M.trimSvg(m).includes('width="'+m.meta.w+'mm"'));
 const blank=M.build({...p,name:'',year:''});assert(J.measurements.measureVolume(m.frame)>J.measurements.measureVolume(blank.frame),'message must be in STL');
}
for(const format of ['booth2x4','booth2x6','booth2x8'])for(const photoRows of [1,2,3,4]){
 const m=M.build({model:'arch',format,name:'The Smith Family',year:'2026',border:7,tag:18,textSize:7,photoRows});check(m.printFrame,format+' '+photoRows+' windows');count++;assert.equal(m.meta.w,50.8);assert.equal(m.meta.photoRows,photoRows);
 const outlines=J.geometries.geom2.toOutlines(m.photoWindow);assert.equal(outlines.length,photoRows,'window count');
}
for(const model of ['wreath','arch','keepsake','oval'])for(const dimensions of [[20,20],[60,80],[200,250]]){
 const m=M.build({model,format:'custom',width:dimensions[0],height:dimensions[1],name:'Ava',year:'',border:5,tag:14,textSize:7,photoRows:1});check(m.printFrame,model+' dimension extremes');check(m.back,model+' back dimension extremes');count+=2;
}
for(const model of ['wreath','arch','keepsake','oval'])for(const embossHeight of [.4,1.6])for(const ribbonHeight of [2.4,8]){
 const p={model,format:'custom',width:60,height:80,name:'Ava & Noah',year:'2026',border:7,tag:18,textSize:7,photoRows:3,embossHeight,ribbonHeight};const m=M.build(p);check(m.printFrame,`${model} emboss ${embossHeight} ribbon ${ribbonHeight}`);count++;
 assert(Math.abs(m.meta.depth-(4.5+Math.max(embossHeight,ribbonHeight*1.15)))<1e-4);assert.equal(m.meta.embossHeight,embossHeight);
 const blank=M.build({...p,name:'',year:''});assert(J.measurements.measureVolume(m.frame)>J.measurements.measureVolume(blank.frame));assert.deepEqual(Buffer.from(M.stl(m.back)),Buffer.from(M.stl(blank.back)),'embossing must preserve backplate');
}
console.log('PASS: '+count+' reference STL exports; all four shapes, supported sizes, embossed messages, trimming guides and photobooth windows.');

})().catch(e=>{console.error(e);process.exitCode=1;});
