"""Count-game plate: the count mock's own painting with only the monkeys removed.

The count screen draws no panel, so unlike the shared detail plate its whole scene is
visible. Banners, chips, answer pills and the hanging sign are left in (the app draws
the same pieces over them at the mock's own positions); the three sample monkeys are
replaced with meadow quilted from the clean ground just to their end side, row by row,
so the horizon and ground texture stay aligned. Header chrome, the phone camera hole and
the test-ad strip are inpainted as in the detail plate.

Usage: python tools/mock-plate/build-count-plate.py assets/v2/landscape/scenes/count.webp
"""
import glob, os, sys
import cv2, numpy as np
from PIL import Image

REF = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'docs', 'design', 'landscape', 'reference')
X0, Y0, X1, Y1 = 44, 48, 1732, 838
f = sorted(glob.glob(os.path.join(REF, 'ChatGPT*.png')))[2]
img = np.array(Image.open(f).convert('RGB'))[Y0:Y1, X0:X1].copy()
h, w, _ = img.shape
rng = np.random.default_rng(7)

# monkeys (mock coords -> plate coords)
mx0, my0, mx1, my1 = 586 - X0, 412 - Y0, 1200 - X0, 600 - Y0
src_x0, src_x1 = 1215 - X0, 1480 - X0
blk, feather = 120, 40
split = 505 - Y0  # above: hills (no bridge/river source), below: open meadow
for band, (sy0, sy1, lo, hi) in enumerate([(my0, split, 1205 - X0, 1330 - X0), (split, my1, 1215 - X0, 1480 - X0)]):
    for k, bx in enumerate(range(mx0, mx1, blk - feather)):
        bw = min(blk, mx1 - bx + feather)
        sx = int(rng.integers(lo, max(lo + 1, hi - bw)))
        patch = img[sy0:sy1, sx:sx + bw].astype(np.float32)
        if k % 2:
            patch = patch[:, ::-1]
        alpha = np.ones((1, bw, 1), np.float32)
        ramp = np.linspace(0, 1, feather, dtype=np.float32)
        if bx > mx0:
            alpha[0, :feather, 0] = ramp
        alpha[0, -feather:, 0] = np.minimum(alpha[0, -feather:, 0], ramp[::-1])
        tgt = img[sy0:sy1, bx:bx + bw].astype(np.float32)
        img[sy0:sy1, bx:bx + bw] = (patch * alpha + tgt * (1 - alpha)).astype(np.uint8)

def rect(m, r, pad=0):
    x0, y0, x1, y1 = r
    m[max(0, y0 - Y0 - pad):y1 - Y0 + pad, max(0, x0 - X0 - pad):x1 - X0 + pad] = 255

chrome = np.zeros((h, w), np.uint8)
for r in [(80, 64, 182, 158), (748, 68, 1018, 155), (1338, 66, 1696, 155), (62, 388, 125, 448), (398, 745, 1378, 842), (840, 748, 935, 778)]:
    rect(chrome, r, 4)
out = cv2.inpaint(img, chrome, 7, cv2.INPAINT_TELEA)
out[697:] = cv2.GaussianBlur(out[697 - (h - 697):697][::-1], (0, 0), 1.2)
Image.fromarray(out).save(sys.argv[1], quality=88)
