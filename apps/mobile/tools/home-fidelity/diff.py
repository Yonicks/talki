"""Overlay/diff a captured Home stage against the v3 mock (dev tool)."""
import sys, os
from PIL import Image, ImageChops
import numpy as np

MOCK = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'v3', 'mocks', 'mock_home_mobile_v3.png')
SCREEN = (48, 47, 1800, 806)  # phone screen inside the mock's rendered bezel

def load_target(size):
    im = Image.open(MOCK).convert('RGB').crop(SCREEN)
    return im.resize(size, Image.LANCZOS)

def main(shot_path):
    shot = Image.open(shot_path).convert('RGB')
    tgt = load_target(shot.size)
    stem, _ = os.path.splitext(shot_path)

    Image.blend(tgt, shot, 0.5).save(f'{stem}-overlay.png')
    d = ImageChops.difference(tgt, shot)
    arr = np.asarray(d).astype(int).sum(axis=2)
    amp = np.clip(arr * 2, 0, 255).astype('uint8')
    Image.fromarray(amp).save(f'{stem}-diff.png')

    W, H = shot.size
    bands = {
        'header  (y 0-18%)': (0, 0, W, int(H * 0.18)),
        'hero    (y 18-63%)': (0, int(H * 0.18), W, int(H * 0.63)),
        'strip   (y 63-93%)': (0, int(H * 0.63), W, int(H * 0.93)),
        'floor   (y 93-100%)': (0, int(H * 0.93), W, H),
    }
    print(f'{os.path.basename(shot_path)}  {W}x{H}')
    for name, (x0, y0, x1, y1) in bands.items():
        sub = arr[y0:y1, x0:x1]
        print(f'  {name:22s} mean |Δ| = {sub.mean()/3:6.1f}')
    print(f'  {"WHOLE":22s} mean |Δ| = {arr.mean()/3:6.1f}')
    print(f'  overlay: {stem}-overlay.png')
    print(f'  diff:    {stem}-diff.png')

main(sys.argv[1])
