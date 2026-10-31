/* Core 3MF model package: named, aligned color parts; no printer profiles.
   ZIP uses the store method so exports work offline without another library. */
(function(root){
const enc=new TextEncoder(),xml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let c=0xffffffff;for(const n of data)c=crcTable[(c^n)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function zip(files){
 const locals=[],central=[];let offset=0;
 for(const [path,source] of Object.entries(files)){
  const name=enc.encode(path),data=typeof source==='string'?enc.encode(source):source,crc=crc32(data),header=new Uint8Array(30+name.length),h=new DataView(header.buffer);
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);header.set(name,30);locals.push(header,data);
  const dir=new Uint8Array(46+name.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(14,0x21,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);central.push(dir);offset+=header.length+data.length;
 }
 const size=central.reduce((n,d)=>n+d.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,central.length,true);e.setUint16(10,central.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);
 const out=new Uint8Array(offset+size+22);let i=0;for(const a of [...locals,...central,end]){out.set(a,i);i+=a.length;}return out;
}
function files(model){
 const M=typeof module==='object'?require('./model.js'):root.Ornament,parts=model.colorParts;
 if(!parts?.length)throw Error('Color parts are unavailable. Regenerate the model and retry.');
 const zShift=-M.triangles(model.frame).reduce((min,t)=>Math.min(min,...t.map(v=>v[2])),Infinity);
 const materialId=parts.length+2,hasColors=parts.some(part=>part.color),bambuColors=model.meta.model==='wreath'?[...new Set(parts.map(part=>(part.color||'#315a47').toUpperCase()))]:null;
 const objects=parts.map((part,i)=>{
  const vertices=[],indices=[],lookup=new Map();
  for(const tri of M.triangles(part.geometry))indices.push(tri.map(v=>{if(v.some(x=>!Number.isFinite(x)))throw Error('Invalid export coordinate.');const key=v.join(',');if(!lookup.has(key)){lookup.set(key,vertices.length);vertices.push(v);}return lookup.get(key);}));
  return `<object id="${i+1}" type="model" name="${xml(part.name)}"${hasColors?` pid="${materialId}" pindex="${i}"`:""}><mesh><vertices>${vertices.map(v=>`<vertex x="${v[0]}" y="${v[1]}" z="${v[2]+zShift}"/>`).join('')}</vertices><triangles>${indices.map(t=>`<triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}"/>`).join('')}</triangles></mesh></object>`;
 });
 const assembly=parts.length+1;
 return{
  ...(bambuColors?{'Metadata/project_settings.config':JSON.stringify({filament_colour:bambuColors})}:{}),
  '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="config" ContentType="application/xml"/></Types>',
  'Metadata/model_settings.config':`<?xml version="1.0" encoding="UTF-8"?><config><object id="${assembly}"><metadata key="name" value="Keepsake frame"/>${parts.map((p,i)=>`<part id="${i+1}" subtype="normal_part"><metadata key="name" value="${xml(p.name)}"/>${bambuColors?`<metadata key="extruder" value="${bambuColors.indexOf((p.color||'#315a47').toUpperCase())+1}"/>`:""}</part>`).join('')}</object></config>`,
  '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" Target="/3D/3dmodel.model"/></Relationships>',
  '3D/3dmodel.model':`<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"${bambuColors?' xmlns:BambuStudio="http://schemas.bambulab.com/package/2021"':""}>${bambuColors?'<metadata name="BambuStudio:3mfVersion">1</metadata>':""}<metadata name="Application">Keepsake Ornament Studio</metadata><metadata name="Title">Keepsake color parts</metadata><resources>${hasColors?`<basematerials id="${materialId}">${parts.map(part=>`<base name="${xml(part.name)}" displaycolor="${(part.color||'#315a47').toUpperCase()}FF"/>`).join('')}</basematerials>`:''}${objects.join('')}<object id="${assembly}" type="model" name="Keepsake frame"><components>${parts.map((_,i)=>`<component objectid="${i+1}"/>`).join('')}</components></object></resources><build><item objectid="${assembly}"/></build></model>`
 };
}
const api={files,threeMF:model=>zip(files(model)),zip};if(typeof module==='object')module.exports=api;else root.ColorExport=api;
})(typeof window==='object'?window:globalThis);
