"""Flatten licensed Pacifico glyph outlines into a browser/Node shared asset."""
import sys,json,math
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
font=TTFont('dist/vendor/Pacifico-Regular.ttf');gs=font.getGlyphSet();em=font['head'].unitsPerEm
class Flatten(BasePen):
 def __init__(self):super().__init__(gs);self.paths=[];self.path=[]
 def _moveTo(self,p):self.path=[p]
 def _lineTo(self,p):self.path.append(p)
 def _qCurveToOne(self,b,c):
  a=self._getCurrentPoint();n=max(4,int((math.dist(a,b)+math.dist(b,c))/em*100))
  for i in range(1,n+1):
   t=i/n;u=1-t;self.path.append((u*u*a[0]+2*u*t*b[0]+t*t*c[0],u*u*a[1]+2*u*t*b[1]+t*t*c[1]))
 def _curveToOne(self,b,c,d):
  a=self._getCurrentPoint();n=max(6,int((math.dist(a,b)+math.dist(b,c)+math.dist(c,d))/em*100))
  for i in range(1,n+1):
   t=i/n;u=1-t;self.path.append(tuple(u**3*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t**3*d[k] for k in [0,1]))
 def _closePath(self):
  if len(self.path)>2:
   if self.path[0]==self.path[-1]:self.path.pop()
   # TrueType has clockwise exterior contours; Manifold uses CCW.
   self.paths.append([[round(x/em,6),round(y/em,6)] for x,y in self.path[::-1]])
  self.path=[]
 def _endPath(self):self._closePath()
out={}
for code in range(32,127):
 name=font.getBestCmap().get(code)
 if not name:continue
 p=Flatten();gs[name].draw(p);out[chr(code)]={'advance':font['hmtx'][name][0]/em,'paths':p.paths}
s='/* Pacifico by Vernon Adams et al.; SIL OFL, see vendor/LICENSE-pacifico.txt. */\n(function(root){const glyphs='+json.dumps(out,separators=(',',':'))+';if(typeof module==="object")module.exports=glyphs;else root.CursiveGlyphs=glyphs;})(typeof window==="object"?window:globalThis);\n'
open('dist/cursive-font.js','w').write(s)
print('Prepared',len(out),'printable cursive glyphs')
