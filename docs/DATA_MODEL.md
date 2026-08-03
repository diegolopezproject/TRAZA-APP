# Data model

- `Trip`: dates, travellers, hotel and travel segments.
- `Day`: one date, cover metadata and ordered activities.
- `Activity`: type, strategic level, status, flexible or exact timing, area and map query.
- `Place`: saved place with category, assignment state and optional area/tags.
- `Booking`: safe public metadata only; private references are excluded from view models.
- `TravelSegment`: immutable flight summary.
- `TransferPlan`: editable arrival/return logistics without real-time data or exposed private references.
- `MealSlot`: an activity specialization that stays deliberately flexible.
- `MediaAsset`: local photo, illustration or graphic with alt, focal point, dimensions and provenance metadata.
- `PlaceAssignment`: reference to a saved place plus day, section and planning level.
- `MealSelection`: reference from a meal slot to a saved place through `sourcePlaceId`.
- `UserPlan`: locally created activity with day, section and editable status.
- `LocalTripState`: versioned persisted document containing places, assignments, meals, custom plans and transfers.

`SeedTripRepository` maps the source JSON into typed domain objects. `LocalTripRepository` materializes local edits over that seed, owns migration/fallback behavior and is the only layer that touches storage. Components receive domain data and do not import JSON or access `localStorage`, allowing a later Supabase repository to replace it without changing presentation.

`media-catalog.ts` enriches selected seed entities without modifying the source file. Generated photos are local, explicitly labelled as generated project assets, and rendered through one `MediaFrame` contract. The focal point remains data, not component-specific CSS.
