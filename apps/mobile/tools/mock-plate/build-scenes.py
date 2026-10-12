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
    'gate': (0, [(x, y, x + 112, y + 110) for y in (187, 301, 414, 527) for x in (412, 540, 668)] + [(1008, 168, 1182, 278, 0), (950, 276, 1230, 345), (910, 348, 1262, 388), (867, 405, 1310, 520, 3), (985, 585, 1198, 622)], 4),
    'parent': (1, [(722, 166, 966, 222), (1248, 182, 1320, 222), (1195, 237, 1345, 310, 3), (1040, 237, 1185, 310, 3), (872, 237, 1030, 310, 3), (748, 237, 862, 310, 3), (598, 237, 738, 310, 3), (410, 345, 1285, 696, 0)], 4),
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

def build_crop(path, crop, rects, chrome, ad_y, pad, smooth=False):
    x0, y0, x1, y1 = crop
    img = np.array(Image.open(path).convert('RGB'))[y0:y1, x0:x1].copy()
    h, w, _ = img.shape
    mask = np.zeros((h, w), np.uint8)
    for r in list(rects):
        rx0, ry0, rx1, ry1 = r[:4]
        p = r[4] if len(r) > 4 else pad
        mask[max(0, ry0 - p):ry1 + p, max(0, rx0 - p):rx1 + p] = 255
    for cx0, cy0, cx1, cy1 in chrome:
        mask[max(0, cy0 - 4):cy1 + 4, max(0, cx0 - 4):cx1 + 4] = 255
    out = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    if smooth:
        # frosted-glass holes: Telea leaves diamond streaks in wide gaps, a heavy blur reads as glass
        soft = cv2.GaussianBlur(out, (0, 0), 9)
        m = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.5)[..., None]
        out = (soft * m + out * (1 - m)).astype(np.uint8)
    bh = h - ad_y
    out[ad_y:] = cv2.GaussianBlur(out[ad_y - bh:ad_y][::-1], (0, 0), 1.2)
    return out

def grid(xs, ys, w, h, pad=14):
    return [(x, y, x + w, y + h, pad) for y in ys for x in xs]

REFD = os.path.join(HERE, '..', '..', '..', '..', 'docs', 'design', 'landscape', 'reference')
HUBS = {
    'games': dict(
        file='Whimsical Talki Game Selection Screen.png', crop=(30, 50, 1760, 835), ad_y=693,
        chrome=[(28, 12, 128, 108), (710, 20, 1005, 115), (1372, 18, 1526, 116), (1584, 10, 1690, 118), (1553, 118, 1722, 158), (470, 693, 1263, 785)],
        rects=[(195, 175, 642, 383), (650, 175, 1082, 383), (1090, 175, 1532, 383), (195, 395, 642, 605), (650, 395, 1082, 605), (1090, 395, 1532, 605)], pad=2),
    'practice': dict(
        file='Talki Fantasy Garden Game Menu.png', crop=(33, 52, 1642, 868), ad_y=733,
        chrome=[(28, 16, 132, 122), (645, 30, 950, 130), (1290, 28, 1460, 115), (1458, 26, 1578, 116), (429, 733, 1173, 816), (755, 665, 850, 700)],
        rects=[(163, 188, 582, 400), (593, 188, 1012, 400), (1022, 188, 1442, 400), (163, 410, 582, 624), (593, 410, 1012, 624), (1022, 410, 1442, 624)], pad=2),
    'rewards': dict(
        file='Talki Sticker Meadow Adventure.png', crop=(45, 42, 1865, 788), ad_y=656,
        smooth=True,
        chrome=[(32, 12, 142, 115), (760, 14, 1040, 100), (1455, 14, 1618, 108), (1628, 8, 1740, 114), (20, 335, 85, 395), (477, 656, 1337, 746)],
        rects=[(722, 136, 1096, 196), (740, 186, 1075, 222), (780, 224, 1035, 254), (630, 250, 1185, 290), (268, 296, 1550, 372)]
              + [(x - 45, 405, x - 45 + 120, 513, 3) for x in [218, 355, 493, 628, 757, 892, 1025, 1158, 1290, 1425, 1562]]
              + [(x - 45, 528, x - 45 + 120, 638, 3) for x in [218, 352, 492, 628, 760, 892, 1025, 1160, 1292, 1430]], pad=4),
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or (list(SCENES) + list(HUBS))
    for n in names:
        if n in HUBS:
            c = HUBS[n]
            out = build_crop(os.path.join(REFD, c['file']), c['crop'], c['rects'], c['chrome'], c['ad_y'], c['pad'], c.get('smooth', False))
            Image.fromarray(out).save(os.path.join(OUT, n + '.webp'), quality=88)
            print(n)
            continue
        idx, rects, pad = SCENES[n]
        Image.fromarray(finish(load(idx), rects, pad)).save(os.path.join(OUT, n + '.webp'), quality=88)
        print(n)
