# Media assets — Iterations 02–03

All raster assets were generated with the built-in ImageGen mode and copied into `public/media/`. They contain no text, logos or remote runtime dependency. `src/data/media-catalog.ts` records alt, focal point, dimensions, kind and provenance.

## Final prompt set

### Sky Garden

Premium natural editorial travel photograph of the recognizable Sky Garden interior: lush planting, curved glass architecture and the City skyline in early August morning light. Vertical mobile crop, realistic texture, subtle 35 mm grain, safe responsive edges; no prominent people, logos, signage, text, watermark or fake UI.

### Camden Market food

Editorial close-up at Camden Market with three visual zones: warm apple crumble, loaded chips and macaroni cheese on a dark market counter. Vertical crop designed for distinct focal-point crops, warm authentic food-hall lighting and natural texture; no visible brands, legible signage, text, watermark or fake UI.

### Royal Albert Hall

Recognizable vertical exterior photograph of the Royal Albert Hall emphasizing its circular red-brick architecture and arched windows in late-afternoon August light. Premium travel photography with realistic architectural texture; no blocking cars, prominent people, text, watermark or fake UI.

### Kynance Mews

Recognizable vertical street photograph of Kynance Mews with its cobbled lane, white mews houses, dark trim and climbing greenery in diffused August light. Quiet hidden-city mood and strong depth; no dominant vehicle, prominent people, text, watermark or fake UI.

Hard Rock Cafe uses a deterministic local SVG graphic, explicitly typed as `graphic`, rather than pretending to be photography.

## Iteration 03 additions

All three additions were generated on 2026-08-02 with built-in ImageGen. They are marked `editorial: true`, source `OpenAI ImageGen`, author `OpenAI`, and project-generated license. They are not presented as documentary reproductions of a specific stall.

| Asset | Place | Type | Alt | Focal point |
| --- | --- | --- | --- | --- |
| `/media/humble-crumble-editorial-v3.png` | Humble Crumble \| Camden Market | generated/editorial photo | Crumble de manzana caliente servido en un vaso en Camden Market | 50% 56% |
| `/media/funky-chips-editorial-v3.png` | Funky Chips – Camden | generated/editorial photo | Bandeja de patatas cargadas en un puesto de comida de Camden Market | 50% 63% |
| `/media/mac-factory-editorial-v3.png` | The Mac Factory | generated/editorial photo | Cuenco de macarrones con queso dorado en Camden Market | 50% 61% |

### Humble Crumble prompt

Use case: photorealistic-natural. Vertical saved-place card. Hot apple crumble in one paper cup at Camden Market, simple market table and softly blurred food-stall atmosphere, natural editorial food photography but not documentary, complete cup centered for a mobile crop, soft warm market light. No logos, brands, text, identifiable people, exact-stall claim, plastic appearance, duplicated food or watermark.

### Funky Chips prompt

Use case: photorealistic-natural. Vertical saved-place card. One tray of loaded crispy chips with sauce, cheese and herbs as London street food in Camden, dark market counter and defocused urban lights, natural editorial food photography but not documentary, complete three-quarter tray for a mobile crop. No logos, brands, text, identifiable people, exact-stall claim, crumble-like container, duplicate food, malformed utensils or watermark.

### The Mac Factory prompt

Use case: photorealistic-natural. Vertical saved-place card. One low bowl of creamy golden macaroni cheese with toasted crust at a Camden market stall, steel tray and bright softly blurred market environment, natural editorial food photography but not documentary, slightly overhead composition distinct from chips and crumble. No logos, brands, text, identifiable people, exact-stall claim, fries, crumble, multiple dishes, plastic texture or watermark.

## Quality gate

`duplicateVisibleMediaSources()` rejects duplicate `src` values among visible place media unless an asset is explicitly marked `sharedFallback`. Places without photography use deterministic, name-derived graphical fallbacks rather than pretending to show the real venue.
