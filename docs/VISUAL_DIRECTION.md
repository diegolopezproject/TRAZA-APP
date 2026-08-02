# Visual direction

Electric London combines an editorial neo-travel layout with urban architectural geometry. Ink and Cloud form the base; each surface receives one dominant accent. The hero for 7 August uses London Sky and Electric Lime, with one restrained orange evening signal.

The visual system uses Geist Sans for display and Geist Mono for time and metadata, 28–32 px cover radii, 20–24 px secondary radii, restrained borders, and a floating Ink navigation pill. Local CSS/SVG compositions act as designed media rather than generic placeholders.

Giant numerals, cropped type, skyline masks and diagrammatic transit lines create the London-specific identity. Content screens use generous neutral space so status labels and large cards remain legible.

## Iteration 02 rules

- Type is tokenized as display, hero, section, card, body, metadata and caption; functional UI does not use the former 7–9 px scale.
- Geist Mono is restricted to time, date, coordinates, counters and short codes. Labels, controls and explanations use Geist Sans.
- Cover layers follow named tokens: date, media, protected copy, action, navigation, open day, detail, modal and toast.
- Every cover preserves explicit top information, protagonist date, media, protected headline, metadata, action and navigation-safe zones.
- At tablet/desktop the active cover is 420–450 px, centred inside a masked stage. Only partial, subdued neighbours remain visible.
- Recognizable places use local photographic media. CSS/SVG graphics remain valid as editorial framing or intentionally labelled graphic assets, not universal place placeholders.
- Media crops come from `MediaAsset.focalPoint`; each asset carries alt and provenance.
