"""Side-by-side crop of the Android Home mock vs a captured stage (dev tool).

Usage: python tools/home-fidelity/compare_crop.py <captured-stage.png> x0 y0 x1 y1 [scale] [out.png]

Coordinates are mock pixels (1843 x 853). Mock on top, capture underneath, so
the two share an x axis and offsets can be read off by eye at any zoom.
"""
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
MOCK = os.path.join(HERE, '..', '..', 'assets', 'v3', 'mocks', 'mock_home_android_1843x853.png')


def main() -> None:
    shot_path = sys.argv[1]
    x0, y0, x1, y1 = (int(v) for v in sys.argv[2:6])
    scale = float(sys.argv[6]) if len(sys.argv) > 6 else 2.0
    out = sys.argv[7] if len(sys.argv) > 7 else os.path.splitext(shot_path)[0] + '-crop.png'

    mock = Image.open(MOCK).convert('RGB')
    shot = Image.open(shot_path).convert('RGB')
    box = (x0, y0, x1, y1)
    a = mock.crop(box)
    b = shot.crop(box)
    size = (int((x1 - x0) * scale), int((y1 - y0) * scale))
    a = a.resize(size, Image.LANCZOS)
    b = b.resize(size, Image.LANCZOS)

    label_h = 18
    sheet = Image.new('RGB', (size[0], size[1] * 2 + label_h * 2 + 4), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    d.text((4, 3), f'MOCK  {box}  x{scale}', fill=(255, 255, 255))
    sheet.paste(a, (0, label_h))
    d.text((4, label_h + size[1] + 3), 'OURS', fill=(255, 220, 120))
    sheet.paste(b, (0, label_h * 2 + size[1]))
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
