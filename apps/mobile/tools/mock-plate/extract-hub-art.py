"""Card pictures for the Games / Practice hubs, cut from their mocks.

Each frame's interior (inside the white rim) is saved with the label-plate area painted
out, so the live label plate the app draws covers exactly what was removed.

Usage: python tools/mock-plate/extract-hub-art.py
"""
import os
import cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REFD = os.path.join(HERE, '..', '..', '..', '..', 'docs', 'design', 'landscape', 'reference')
OUT = os.path.join(HERE, '..', '..', 'assets', 'v2', 'hub-mock')
RIM = 7

# file, crop origin, frames in design coords (left, top, w, h) in RTL reading order, plate insets
JOBS = {
    'games': dict(
        file='Whimsical Talki Game Selection Screen.png', origin=(30, 50),
        ids=['quiz', 'memory', 'missing', 'cards', 'sounds', 'count'],
        frames=[(1090, 175, 442, 208), (650, 175, 432, 208), (195, 175, 447, 208),
                (1090, 395, 442, 210), (650, 395, 432, 210), (195, 395, 447, 210)],
        plate=(32, 37, 15, 58)),
    'practice': dict(
        file='Talki Fantasy Garden Game Menu.png', origin=(33, 52),
        ids=['focus', 'receptive', 'cloze', 'temptation', 'pairs', 'combine'],
        frames=[(1022, 188, 420, 212), (593, 188, 419, 212), (163, 188, 419, 212),
                (1022, 410, 420, 214), (593, 410, 419, 214), (163, 410, 419, 214)],
        plate=(24, 24, 14, 52)),
}

os.makedirs(OUT, exist_ok=True)
for name, j in JOBS.items():
    img = np.array(Image.open(os.path.join(REFD, j['file'])).convert('RGB'))
    ox, oy = j['origin']
    for cid, (l, t, w, h) in zip(j['ids'], j['frames']):
        x0, y0 = ox + l + RIM, oy + t + RIM
        iw, ih = w - 2 * RIM, h - 2 * RIM
        art = img[y0:y0 + ih, x0:x0 + iw].copy()
        si, ei, bt, ph = j['plate']
        mask = np.zeros(art.shape[:2], np.uint8)
        mask[ih - (bt - RIM) - ph - 8:ih, max(0, si - RIM - 8):iw - max(0, ei - RIM - 8)] = 255
        art = cv2.inpaint(art, mask, 5, cv2.INPAINT_TELEA)
        Image.fromarray(art).save(os.path.join(OUT, f'{name}-{cid}.webp'), quality=90)
print('ok')
