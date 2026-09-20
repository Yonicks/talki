"""Per-edge deltas between a capture and the Android Home mock (dev tool).

Runs the same pixel extraction (`mock_targets.extract`) on the mock and on a
same-size capture, then prints, for every chrome box, how many mock pixels each
edge is off. Positive = the capture's edge is further right / lower.

Usage: python tools/home-fidelity/pixel_report.py <capture-stage.png> [--all]
"""
import os
import sys

from mock_targets import MOCK, extract

TOL = 2  # px; the mock's soft shadows blur every edge by about a pixel

SINGLE = ['music', 'profile', 'pill', 'panel', 'arrowEnd', 'arrowStart', 'musicGlyph', 'profileGlyph',
          'pillStar', 'pillText', 'thumbArt', 'cta', 'ctaCircle', 'titleStar', 'progressTrack',
          'progressCount', 'eyebrowText', 'titleText', 'subtitleText', 'ctaLabel']


def edges(m, c):
    return [c[i] - m[i] for i in range(4)]


def main() -> None:
    cap = sys.argv[1]
    show_all = '--all' in sys.argv
    m, c = extract(MOCK), extract(cap)
    bad = 0
    print(f'{"element":16s} {"mock x0,y0,x1,y1":24s} {"d x0":>5s} {"d y0":>5s} {"d x1":>5s} {"d y1":>5s}')
    for k in SINGLE:
        if m.get(k) is None or c.get(k) is None:
            print(f'{k:16s} {"MISSING in " + ("capture" if c.get(k) is None else "mock")}')
            bad += 1
            continue
        d = edges(m[k], c[k])
        flag = '' if max(abs(v) for v in d) <= TOL else '  <<'
        bad += bool(flag)
        if flag or show_all:
            print(f'{k:16s} {str(m[k]):24s} {d[0]:5d} {d[1]:5d} {d[2]:5d} {d[3]:5d}{flag}')
    for i, (mb, cb) in enumerate(zip(m['cards'], c['cards'])):
        d = edges(mb, cb)
        flag = '' if max(abs(v) for v in d) <= TOL else '  <<'
        bad += bool(flag)
        if flag or show_all:
            print(f'{"card[" + str(i) + "]":16s} {str(mb):24s} {d[0]:5d} {d[1]:5d} {d[2]:5d} {d[3]:5d}{flag}')
    if len(m['cards']) != len(c['cards']):
        print(f'cards: mock {len(m["cards"])} vs capture {len(c["cards"])}  <<')
        bad += 1
    ml, cl = m['textLines'], c['textLines']
    for i in range(max(len(ml), len(cl))):
        if i < len(ml) and i < len(cl):
            d = edges(ml[i], cl[i])
            flag = '' if max(abs(v) for v in d) <= TOL else '  <<'
            bad += bool(flag)
            if flag or show_all:
                print(f'{"textLine[" + str(i) + "]":16s} {str(ml[i]):24s} {d[0]:5d} {d[1]:5d} {d[2]:5d} {d[3]:5d}{flag}')
        else:
            print(f'textLine[{i}] present in only one image  <<')
            bad += 1
    print(f'\n{bad} element(s) outside +-{TOL}px' if bad else f'\nALL chrome boxes within +-{TOL}px of the mock')


if __name__ == '__main__':
    main()
