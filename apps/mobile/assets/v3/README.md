# Talki v3 production assets

Glossy character-style category art for the landscape Home strip and related chrome.

## Category files → domain ids

| File | Domain `CategoryId` | Hebrew (plain) |
|---|---|---|
| `category_animals.png` | `animals` | חיות |
| `category_food.png` | `food` | אוכל |
| `category_art.png` | `colors` | צבעים וצורות |
| `category_home.png` | `home` | בית |
| `category_family.png` | `family` | משפחה |
| `category_body.png` | `body` | הגוף |
| `category_actions.png` | `actions` | פעולות |
| `category_outside.png` | `outside` | בחוץ |
| `category_numbers.png` | `numbers` | מספרים |
| `category_emotions.png` | `emotions` | רגשות |

Registered in `src/design-system/assets.ts` as both `categoryArt` and `categoryIcons`.

`mine` (custom words) is synthetic and still falls back to `brand.starMark`.

## Category scenic backgrounds

| Files | Registry | Use |
|---|---|---|
| `category_bg1.png` … `category_bg8.png` | `categoryCardBackgrounds` | Registered but **not** used on the Home strip (v3 mock uses clean white cards). Reserved for a later deliberate surface (e.g. category detail worlds). |

Portrait source size: 1086×1448. If reused, cover-crop — never stretch.

## Mocks (REFERENCE only)

`mocks/mock_home_mobile_v3.png` is a visual target for Home composition. Never load it as a runtime background or baked UI screen.
