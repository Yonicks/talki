"""Stack a mock crop over the matching capture crop (dev tool).

  python tools/visual-validation/crop.py <screen> <label> x0 y0 x1 y1 [vp] [out.png]
Coordinates are in the 1688 x 790 mock-interior space. Mock on top, capture below.
"""
import os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
screen, label = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = (int(v) for v in sys.argv[3:7])
vp = sys.argv[7] if len(sys.argv) > 7 else 'ref'
d = os.path.join(ROOT, 'visual-validation', screen, vp)
ref = Image.open(os.path.join(d, 'reference.png')).convert('RGB').crop((x0, y0, x1, y1))
act = Image.open(os.path.join(d, f'{label}-actual.png')).convert('RGB')
if act.size != Image.open(os.path.join(d, 'reference.png')).size:
    act = act.resize(Image.open(os.path.join(d, 'reference.png')).size)
act = act.crop((x0, y0, x1, y1))
s = Image.new('RGB', (x1 - x0, (y1 - y0) * 2 + 4), (255, 0, 0)); s.paste(ref, (0, 0)); s.paste(act, (0, y1 - y0 + 4))
out = sys.argv[8] if len(sys.argv) > 8 else os.path.join('C:/Users/User/AppData/Local/Temp/claude/D--Git-talki/bfa5b574-4a6d-4609-9244-f3d713c54b1a/scratchpad', 'crop.png')
s.save(out); print(out)
