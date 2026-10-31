const assert=require('node:assert/strict');const M=require('./dist/model.js');const J=require('./dist/vendor/jscad.js');
const base={format:'mini',name:'Christmas 2026',border:7,tag:18,textSize:7,stars:true};
function check(g,label){const data=M.stl(g),view=new DataView(data),n=view.getUint32(80,true),edges=new Map();assert.equal(data.byteLength,84+n*50);let volume=0;for(let i=0;i<n;i++){const t=[];for(let k=0;k<3;k++){const v=[];for(let a=0;a<3;a++){const x=view.getFloat32(84+i*50+12+k*12+a*4,true);assert(Number.isFinite(x));v.push(x);}t.push(v);}const key=v=>v.join(',');for(let k=0;k<3;k++){const edge=[key(t[k]),key(t[(k+1)%3])].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);}const [a,b,c]=t;volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;}assert(volume>0,`${label} positive volume`);assert.equal([...edges.values()].filter(x=>x!==2).length,0,`${label} closed two-manifold mesh`);return n;}
(async()=>{const Module=(await import('./dist/vendor/manifold.mjs')).default;globalThis.CADKernel=await Module();CADKernel.setup();
let count=0;for(const format of ['mini','square','wide','3r','4r','custom'])for(const variation of [{},{name:'8888',border:5,tag:14,textSize:12},{name:'',border:15,tag:35,landscape:true}]){const p={...base,format,width:60,height:80,...variation},m=M.build(p);check(m.printFrame,`${format} frame`);check(m.back,`${format} back`);const bounds=J.measurements.measureBoundingBox(m.printFrame);assert(Math.abs(bounds[0][2])<1e-5);assert(Math.abs(bounds[1][2]-m.meta.depth)<1e-5);count+=2;}
for(const name of ['Ava & Noah','THE SANTOS FAMILY','Merry Christmas','A'.repeat(32),'!@#$%^&*()_+-=[]{};:,.?']){check(M.build({...base,name}).printFrame,name);count++;}
for(const decoration of ['classic','trees','baubles','snowflakes','mixed','none'])for(const format of ['mini','square','wide','3r','4r','custom']){
 const m=M.build({...base,decoration,format,width:20,height:20});check(m.printFrame,`${decoration} ${format}`);count++;
 if(decoration==='none')assert(m.previewAccent); // name remains visible with no decorations
 const named=J.measurements.measureVolume(m.frame),blank=M.build({...base,decoration,format,width:20,height:20,name:''});assert(named>J.measurements.measureVolume(blank.frame),'name must add raised material');
}
assert.notEqual(Buffer.from(M.stl(M.build(base).printFrame)).toString('base64'),Buffer.from(M.stl(M.build({...base,name:'Ava'}).printFrame)).toString('base64'));
console.log(`PASS: ${count} binary STL exports checked for closed edges, finite vertices, positive volume; all format dimensions and print orientation checked.`);

})().catch(e=>{console.error(e);process.exitCode=1;});
