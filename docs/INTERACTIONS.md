# Interactions

## Day switching and opening

Closed covers use native horizontal scroll snapping, with visible previous/next controls and a partial adjacent cover. The selected cover accepts an upward drag; a silent, labelled handle is the reliable accessible alternative.

The carousel is keyboard focusable: Left/Right move one day, Home/End move to the first/last day. Initial centring uses measured offsets after layout and repeats on resize so visual and selected state cannot diverge.

Opening combines vertical translation, subtle X rotation, scale and parallax to reveal Cloud. Its full-screen layer uses `touch-action: pan-y`, which blocks horizontal day switching. Closing is available through a persistent control or a deliberate downward pull of 96 px while the itinerary is already at its top. Full values and reduced-motion behavior are specified in `DAY_TRANSITION.md`.

## Activity detail

Sky Garden's media block and detail hero share a layout identifier. The detail is layered over the mounted itinerary, so browser scroll position is naturally retained. Back returns to that exact position.

Reduced motion keeps all state changes and controls, replacing spatial movement with near-instant fades.

## Saved place assignment

`Añadir a un día` opens a modal bottom sheet. Choosing a date, section and planning level stores a local `Place → Day` relation and returns immediate text feedback with undo. Opening the selector again can move or reclassify it, and the sheet can remove it. The relation is persisted by the versioned local repository.

Meal cards open a restaurant picker, prioritize matching areas, retain `sourcePlaceId`, and never remove the source place from Guardados. `Añadir plan` offers either that same reference-based path or a locally created editable plan.

## Bottom navigation

The active pill uses a short shared-layout transition. Saved and Trip scroll inside a viewport area that ends above the navigation dock, so the floating pill never covers their actions. Reduced motion preserves the state change without the spatial interpolation.
