# Information architecture

## Journey

- Closed: horizontally scrollable covers for 6–13 August.
- Open: one vertically scrollable itinerary, grouped by time of day.
- Activity detail: an immersive layer over the preserved itinerary.

## Saved

An editorial place bank with category filters and assignment affordances. It is intentionally not an administrative list.

A place can be assigned locally to one day. It then appears as an `Opción cercana` within that day and can be moved or removed. This relationship is prototype state only and does not imply a booking or fixed schedule.

## Trip

Overview, flights, stay and booking counts represented as travel documents. Private references never enter the demo-facing view model.

The floating bottom navigation owns top-level changes. It is hidden while an activity detail is open and unavailable behind an open-day layer.
