"""Compare an actual capture against its approved mock (dev tool).

  python tools/visual-validation/compare.py <screen> <label> [viewport]

Writes next to the capture: reference.png, <label>-overlay.png (50 %), <label>-diff.png,
<label>-sbs.png and appends metrics (MAE, % px over tolerance, SSIM, resize note)
to metrics.json. The actual is only resized (never cropped) when its size differs.
"""
import json, os, sys
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
screen, label = sys.argv[1], sys.argv[2]
vp = sys.argv[3] if len(sys.argv) > 3 else 'ref'
sc = json.load(open(os.path.join(HERE, 'screens.json')))[screen]
d = os.path.join(ROOT, 'visual-validation', screen, vp)
ref = Image.open(os.path.join(ROOT, 'docs', 'design', 'landscape', 'reference', sc['mock'])).convert('RGB')
if sc['crop']:
    ref = ref.crop(tuple(sc['crop']))
act = Image.open(os.path.join(d, f'{label}-actual.png')).convert('RGB')
note = None
if vp == 'ref' or True:
    if act.size != ref.size:
        note = f'actual {act.size} resized to reference {ref.size}'
        act = act.resize(ref.size, Image.LANCZOS)
ref.save(os.path.join(d, 'reference.png'))
a = np.asarray(act).astype(np.int16); r = np.asarray(ref).astype(np.int16)
# the mock's test-ad band (bottom 12 %) is native in the app: excluded from metrics
ad = sc['adY'] if sc.get('adY') else (int(r.shape[0] * 697 / 790) if (sc['crop'] and sc.get('ad', True)) else r.shape[0])
delta = np.abs(a - r).max(-1)
m = {
    'label': label, 'size': list(ref.size), 'note': note,
    'mae': round(float(np.abs(a - r)[:ad].mean()), 2),
    'pct_over_32': round(float((delta[:ad] > 32).mean() * 100), 2),
    'ssim': round(float(ssim(np.asarray(ref.convert('L'))[:ad], np.asarray(act.convert('L'))[:ad])), 4),
}
Image.blend(ref, act, 0.5).save(os.path.join(d, f'{label}-overlay.png'))
heat = np.clip(delta * 3, 0, 255).astype(np.uint8)
Image.fromarray(heat).save(os.path.join(d, f'{label}-diff.png'))
w, h = ref.size
sbs = Image.new('RGB', (w * 2, h)); sbs.paste(ref, (0, 0)); sbs.paste(act, (w, 0)); sbs.save(os.path.join(d, f'{label}-sbs.png'))
mp = os.path.join(d, 'metrics.json')
hist = json.load(open(mp)) if os.path.exists(mp) else []
hist = [x for x in hist if x['label'] != label] + [m]
json.dump(hist, open(mp, 'w'), indent=1)
print(json.dumps(m))
