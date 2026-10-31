/* Deterministic, printable fabric pile. No random seeds or preview-only maps. */
(function(root){
const amplitude=.18,pitch=.7;
function grain(x,y){
 const hash=(i,j)=>{const n=Math.sin(i*127.1+j*311.7)*43758.5453;return n-Math.floor(n);};
 const noise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);return (hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v;};
 return (noise(x/pitch,y/pitch)*.75+noise(x/pitch*1.9+7,y/pitch*1.9-3)*.25)*2-1;
}
function apply(solid,K,keep,base=2){
 const dense=keep(solid.refineToLength(.55));
 return keep(dense.warp(v=>{let fade=Math.max(0,Math.min(1,(v[2]-base-.04)/.7));fade=fade*fade*(3-2*fade);v[2]+=amplitude*grain(v[0],v[1])*fade;}));
}
const api={apply,grain,amplitude,pitch};if(typeof module==='object')module.exports=api;else root.RibbonTexture=api;
})(typeof window==='object'?window:globalThis);
