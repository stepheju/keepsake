/* Draw each color region once; never overlay the complete frame and its
   embossed ribbon/lettering on the same faces. Shared with regression checks. */
(function(root){
function layers(model,finish){
 const accent=finish==='#e7dcc5'?'#64472d':'#efcc83';
 const regions=model.colorParts?.length?model.colorParts.map(part=>({geometry:part.geometry,color:part.color|| (part.name==='Ribbon and bow'?(model.meta.model==='tree'?'#dca2ad':model.meta.model==='wreath'?'#e9dbbe':'#a83945'):part.name==='Connected name'?accent:part.name==='Name and year'?(model.meta.model==='tree'?'#f3d4da':accent):part.name==='Name band'?'#e7dcc5':part.name==='Star topper'?'#efcc83':part.name==='Mini bows'?'#dca2ad':part.name==='Snow'?'#fff5e8':part.name==='Christmas balls'?'#f3e5d6':part.name==='Pearls'?'#f3e5d6':part.name==='Baubles'?'#982d36':finish)})):[{geometry:model.frame,color:finish}];
 return [...regions,...(model.previewDetails||[])];
}
if(typeof module==='object')module.exports={layers};else root.PreviewLayers={layers};
})(typeof window==='object'?window:globalThis);
