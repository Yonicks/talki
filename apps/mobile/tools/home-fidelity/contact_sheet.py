"""Contact sheets of the device sweep (dev tool).

Usage: python tools/home-fidelity/contact_sheet.py <device> [cols] [thumb_w]
Reads artifacts/device/<device>/*.png (from device-sweep.mjs all) and writes
artifacts/device/<device>-sheet-<n>.jpg, one sheet per 12 screens, each thumb
labelled with its screen name. JPEG so the sheets stay small enough to commit.
"""
import glob
import os
import sys

from PIL import Image, ImageDraw

ORDER = [
    'home', 'games', 'practice', 'rewards', 'parent', 'category', 'cards',
    'game-quiz', 'game-memory', 'game-missing', 'game-match', 'game-bubbles', 'game-sounds',
    'game-count', 'game-sort', 'game-puzzle',
    'practice-focus', 'practice-cloze', 'practice-temptation', 'practice-receptive',
    'practice-pairs', 'practice-combine',
]


def main() -> None:
    device = sys.argv[1]
    cols = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    tw = int(sys.argv[3]) if len(sys.argv) > 3 else 640
    root = os.path.join('artifacts', 'device')
    names = [n for n in ORDER if os.path.exists(os.path.join(root, device, n + '.png'))]
    per = 12
    for sheet_i in range(0, len(names), per):
        chunk = names[sheet_i:sheet_i + per]
        thumbs = []
        for n in chunk:
            im = Image.open(os.path.join(root, device, n + '.png')).convert('RGB')
            th = int(im.height * tw / im.width)
            thumbs.append((n, im.resize((tw, th), Image.LANCZOS)))
        th = thumbs[0][1].height
        rows = (len(thumbs) + cols - 1) // cols
        label_h = 18
        sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + label_h + 8) + 8), (28, 28, 34))
        d = ImageDraw.Draw(sheet)
        for i, (n, im) in enumerate(thumbs):
            x = 8 + (i % cols) * (tw + 8)
            y = 8 + (i // cols) * (th + label_h + 8)
            d.text((x + 2, y + 2), f'{device}  {n}', fill=(255, 255, 255))
            sheet.paste(im, (x, y + label_h))
        out = os.path.join(root, f'{device}-sheet-{sheet_i // per + 1}.jpg')
        sheet.save(out, quality=82)
        print(out, sheet.size)


if __name__ == '__main__':
    main()
