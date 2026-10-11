"""Build original, scalable hero chrome glyphs. Requires fonttools (build only).

The app loads the resulting font through its existing expo-font gate, so these
rounded paths and their native text shadows need no new native dependency.
"""
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

builder = FontBuilder(1000, isTTF=True)
builder.setupGlyphOrder([".notdef", "play", "sparkle"])
builder.setupCharacterMap({0xE001: "play", 0xE002: "sparkle"})
blank = TTGlyphPen(None)
play = TTGlyphPen(None)
play.moveTo((265, 155))
play.qCurveTo((180, 110), (180, 205))
play.lineTo((180, 795))
play.qCurveTo((180, 890), (265, 845))
play.lineTo((805, 545))
play.qCurveTo((885, 500), (805, 455))
play.closePath()
sparkle = TTGlyphPen(None)
sparkle.moveTo((480, 875))
sparkle.qCurveTo((500, 950), (520, 875))
sparkle.qCurveTo((585, 585), (875, 520))
sparkle.qCurveTo((950, 500), (875, 480))
sparkle.qCurveTo((585, 415), (520, 125))
sparkle.qCurveTo((500, 50), (480, 125))
sparkle.qCurveTo((415, 415), (125, 480))
sparkle.qCurveTo((50, 500), (125, 520))
sparkle.qCurveTo((415, 585), (480, 875))
sparkle.closePath()
builder.setupGlyf({".notdef": blank.glyph(), "play": play.glyph(), "sparkle": sparkle.glyph()})
builder.setupHorizontalMetrics({name: (1000, getattr(builder.font["glyf"][name], "xMin", 0)) for name in [".notdef", "play", "sparkle"]})
builder.setupHorizontalHeader(ascent=1000, descent=0)
builder.setupNameTable({"familyName": "TalkiHeroIcons", "styleName": "Regular", "uniqueFontIdentifier": "TalkiHeroIcons-Regular-1", "fullName": "TalkiHeroIcons Regular", "psName": "TalkiHeroIcons-Regular", "version": "Version 1.0"})
builder.setupOS2(sTypoAscender=1000, sTypoDescender=0, usWinAscent=1000, usWinDescent=0)
builder.setupPost()
builder.setupMaxp()
builder.save(Path(__file__).resolve().parents[2] / "assets/fonts/TalkiHeroIcons.ttf")
