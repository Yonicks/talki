"""Best-fit (dx, dy) of each text/glyph region against the Android mock (dev tool).

Bounding boxes are fooled by soft shadows, anti-aliasing and art behind the
control. This slides the capture's crop over the mock's, per region, and
reports the integer shift that minimises the mean absolute difference: that is
how far the element really sits from where the mock draws it. `MAE 0->best`
shows how much of the error a pure translation explains.

Positive dx = the capture's element sits that many px to the LEFT of the
mock's (move it right by dx); positive dy = it sits HIGHER (move it down by dy).
(The search compares capture[y - dy] with mock[y], hence the inversion.)

Usage: python tools/home-fidelity/align_report.py <capture-stage.png>
"""
import sys

import numpy as np
from PIL import Image

from mock_targets import MOCK

R = 14  # search radius, px

# name -> (x0, y0, x1, y1) in mock px: tight around the element's ink.
REGIONS = {
    'music glyph': (58, 44, 120, 108),
    'profile glyph': (1524, 40, 1596, 110),
    'pill star': (1650, 40, 1724, 110),
    'pill "12"': (1726, 54, 1782, 98),
    'eyebrow': (770, 182, 980, 214),
    'title': (712, 222, 968, 292),
    'subtitle': (708, 292, 1030, 328),
    'progress "8/10"': (688, 352, 762, 386),
    'progress track': (764, 346, 1042, 390),
    'CTA label': (786, 428, 1046, 486),
    'CTA play disc': (660, 411, 752, 502),
    'arrow chevron R': (1745, 632, 1800, 700),
    'arrow chevron L': (44, 632, 100, 700),
}
for i, x0 in enumerate((134, 334, 533, 730, 927, 1124, 1319, 1516)):
    REGIONS[f'card label {i}'] = (x0 + 24, 730, x0 + 168, 774)


def gray(a):
    return (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])


def main() -> None:
    cap = sys.argv[1]
    m = gray(np.asarray(Image.open(MOCK).convert('RGB').crop((0, 0, 1843, 853))).astype(float))
    c = gray(np.asarray(Image.open(cap).convert('RGB').crop((0, 0, 1843, 853))).astype(float))
    print(f'{"region":18s} {"dx":>4s} {"dy":>4s}   {"MAE@0":>6s} -> {"best":>6s}')
    for name, (x0, y0, x1, y1) in REGIONS.items():
        ref = m[y0:y1, x0:x1]
        best = (1e9, 0, 0)
        at0 = np.abs(c[y0:y1, x0:x1] - ref).mean()
        for dy in range(-R, R + 1):
            for dx in range(-R, R + 1):
                cur = c[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
                if cur.shape != ref.shape:
                    continue
                e = np.abs(cur - ref).mean()
                if e < best[0]:
                    best = (e, dx, dy)
        flag = '' if max(abs(best[1]), abs(best[2])) <= 2 else '  <<'
        print(f'{name:18s} {best[1]:4d} {best[2]:4d}   {at0:6.1f} -> {best[0]:6.1f}{flag}')


if __name__ == '__main__':
    main()
