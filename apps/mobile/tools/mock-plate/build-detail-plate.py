"""Rebuild the clean game-detail background plate from the 8 detail mocks.

The `ChatGPT Image ...-N.png` mocks share one painted garden. A robust per-pixel
mode across them removes the per-screen UI. The central zone is covered by a
panel in most mocks, so it is taken from the count mock (the only one showing
the scene there) with that mock's UI inpainted: those holes sit under the app's
own count UI or the shared panel. Header chrome, the phone camera hole and the
test-ad strip are inpainted too (the app draws those itself).

Usage: python tools/mock-plate/build-detail-plate.py <out.webp>
"""
import glob, os, sys
import cv2, numpy as np
from PIL import Image

REF = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'docs', 'design', 'landscape', 'reference')
X0, Y0, X1, Y1 = 44, 48, 1732, 838  # phone screen interior inside the 1774x887 mocks
fs = sorted(glob.glob(os.path.join(REF, 'ChatGPT*.png')))
st = np.stack([np.array(Image.open(f).convert('RGB'))[Y0:Y1, X0:X1].astype(np.int16) for f in fs])
n, h, w, _ = st.shape
cnt = np.zeros((n, h, w), np.int16)
for i in range(n):
    for j in range(n):
        if i != j:
            cnt[i] += np.abs(st[i] - st[j]).max(-1) < 18
best = cnt.argmax(0)
plate = np.take_along_axis(st, best[None, :, :, None].repeat(3, -1), 0)[0].astype(np.uint8)

def rect(m, r, pad=0):
    x0, y0, x1, y1 = r
    m[max(0, y0 - Y0 - pad):y1 - Y0 + pad, max(0, x0 - X0 - pad):x1 - X0 + pad] = 255

count = st[2].astype(np.uint8)
mask = np.zeros((h, w), np.uint8)
for r in [(625, 165, 1145, 385), (290, 230, 695, 315), (310, 305, 465, 445), (590, 415, 1195, 595), (255, 625, 1495, 762)]:
    rect(mask, r, 6)
cin = cv2.inpaint(count, mask, 7, cv2.INPAINT_TELEA)
band = plate[726 - Y0:745 - Y0, 255 - X0:1495 - X0]  # meadow just under the panel, clean in every other mock
cin[726 - Y0:745 - Y0, 255 - X0:1495 - X0] = band
cin[707 - Y0:726 - Y0, 255 - X0:1495 - X0] = band[::-1]
cin[745 - Y0:764 - Y0, 255 - X0:1495 - X0] = band[::-1][:19]
x0, y0, x1, y1 = 362 - X0, 192 - Y0, 1418 - X0, 715 - Y0
blend = np.zeros((h, w), np.float32); blend[y0:y1, x0:x1] = 1
blend = cv2.GaussianBlur(blend, (0, 0), 14)[..., None]
plate = (cin * blend + plate * (1 - blend)).astype(np.uint8)
chrome = np.zeros((h, w), np.uint8)
for r in [(80, 64, 182, 158), (748, 68, 1018, 155), (1338, 66, 1696, 155), (62, 388, 125, 448), (398, 745, 1378, 842), (840, 748, 935, 778)]:
    rect(chrome, r, 4)
out = cv2.inpaint(plate, chrome, 7, cv2.INPAINT_TELEA)
# ad band (rows below the stage): native ad covers it; keep it meadow rather than a smear
out[697:] = cv2.GaussianBlur(out[697 - (h - 697):697][::-1], (0, 0), 1.2)
Image.fromarray(out).save(sys.argv[1], quality=88)
