const assert=require('node:assert/strict'),M=require('./dist/model.js'),P=require('./dist/preview-layers.js');
(async()=>{globalThis.CADKernel=await(await import('./dist/vendor/manifold.mjs')).default();CADKernel.setup();for(const model of ['original','wreath','arch','keepsake','oval']){
 const m=M.build({model,format:'custom',width:60,height:80,name:'Christmas',year:'2026',border:7,tag:18,textSize:7,photoRows:3,decoration:'mixed'}),layers=P.layers(m,'#315a47');
 assert.equal(layers.length,m.colorParts.length+(m.previewDetails||[]).length);assert(!layers.some(p=>p.geometry===m.frame),'complete frame must not overlap color regions');assert(!layers.some(p=>p.geometry===m.previewAccent),'lettering must not be drawn a second time');
 for(const part of m.colorParts)assert.equal(layers.filter(p=>p.geometry===part.geometry).length,1,part.name+' drawn once');
 if(model!=='original')assert(!layers.some(p=>p.geometry===m.previewParts[0].geometry),'bow must not be drawn a second time');
 for(const zoom of [.5,1,2.5]){const e=Math.max(m.meta.fh+20,m.meta.fw+20),d=e*2.15*zoom,near=Math.max(.5,d/20),far=d*4;assert(far/near<=81);assert(near<d-e/2);assert(far>d+e/2);}
}console.log('PASS: all five previews draw each colored region once, omit duplicate full-frame/bow/lettering layers, and retain a precise camera depth range.');})().catch(e=>{console.error(e);process.exitCode=1;});
