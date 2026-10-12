"""Per-screen scene plates for the mock-parity detail screens.

Each plate is that screen's own mock with the pieces the app draws as live UI (text,
chips, cards, buttons, art) painted out; static dressing (panel, banners, vines, hanging
sign, answer-pill plates for count) stays baked so the scene matches the mock exactly.
The phone bezel/camera hole, the header chrome (the app draws its own) and the test-ad
strip are inpainted too. Rects are mock-interior units (1688 x 790).

Usage: python tools/mock-plate/build-scenes.py [name ...]   -> assets/v2/landscape/scenes/<name>.webp
"""
import glob, os, sys
import cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, '..', '..', '..', '..', 'docs', 'design', 'landscape', 'reference')
OUT = os.path.join(HERE, '..', '..', 'assets', 'v2', 'landscape', 'scenes')
X0, Y0, X1, Y1 = 44, 48, 1732, 838
MOCKS = sorted(glob.glob(os.path.join(REF, 'ChatGPT*.png')))
CHROME = [(38, 18, 136, 107), (700, 16, 980, 108), (1294, 14, 1654, 110), (18, 340, 81, 400), (354, 697, 1334, 794), (796, 700, 891, 730)]

def cards(xs, ys, w, h):
    return [(x, y, x + w, y + h) for y in ys for x in xs]

# name -> (mock index, [rects painted out], pad)
SCENES = {
    'quiz': (5, [(560, 170, 1125, 242), (780, 244, 1300, 330), (770, 332, 1305, 384), (405, 262, 735, 372)] + cards([378, 614, 852, 1089], [400], 218, 230), 8),
    'sounds': (3, [(365, 198, 702, 280), (715, 196, 1205, 290), (1134, 382, 1345, 526)] + cards([369, 624, 880], [319], 237, 242), 8),
    'memory': (6, [(698, 141, 900, 203), (470, 141, 672, 203), (930, 138, 1232, 208)] + cards([433, 643, 854, 1066], [232, 400, 566], 187, 154), 6),
    'missing': (7, [(500, 165, 800, 235), (805, 160, 1140, 240), (674, 246, 1013, 282)] + cards([415, 635, 855, 1075], [327], 198, 341), 4),
    'cards': (4, [(725, 122, 800, 168), (826, 118, 962, 172), (690, 205, 990, 512), (690, 492, 996, 602), (542, 640, 728, 728, 18), (752, 640, 928, 728, 22), (956, 640, 1146, 728, 18), (636, 746, 1066, 780)], 3),
}

def load(i):
    return np.array(Image.open(MOCKS[i]).convert('RGB'))[Y0:Y1, X0:X1].copy()

def finish(img, rects, pad):
    h, w, _ = img.shape
    mask = np.zeros((h, w), np.uint8)
    for r in rects:
        x0, y0, x1, y1 = r[:4]
        p = r[4] if len(r) > 4 else pad
        mask[max(0, y0 - p):y1 + p, max(0, x0 - p):x1 + p] = 255
    for x0, y0, x1, y1 in CHROME:
        mask[max(0, y0 - 4):y1 + 4, max(0, x0 - 4):x1 + 4] = 255
    out = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    # the mock's ad band is never shown in gameplay: continue the meadow by reflection
    out[697:] = cv2.GaussianBlur(out[697 - (h - 697):697][::-1], (0, 0), 1.2)
    return out

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or list(SCENES)
    for n in names:
        idx, rects, pad = SCENES[n]
        Image.fromarray(finish(load(idx), rects, pad)).save(os.path.join(OUT, n + '.webp'), quality=88)
        print(n)
