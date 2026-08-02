# Product brief — London Trip App

## Working concept

A private, mobile-first trip companion for a London journey from 6 to 13 August 2026.

The central idea is:

> The trip is not consulted like a spreadsheet or conventional calendar. It is explored as a collection of immersive days.

Each day is a visual chapter. The user moves horizontally between day covers and enters vertically into the selected day's strategic itinerary.

## Users

Primary:
- Diego, planner and initial editor

Secondary:
- María, initially a viewer and potentially a second editor later

## Problem

The current plan is distributed across a spreadsheet, booking confirmations, saved Google Maps places and evolving ideas. It is difficult to consult quickly on a phone and does not communicate which plans are fixed, flexible or merely possible.

## Product goals

- Understand in seconds what matters on a selected day.
- Keep fixed bookings visible without turning the trip into a rigid hourly schedule.
- Connect planned activities with flexible meals, nearby options and saved places.
- Open relevant destinations in Google Maps.
- Centralize flights, hotel and bookings.
- Allow the content layer to evolve during the trip.
- Produce a visually distinctive product suitable for a UX/UI and product-design portfolio case study.

## Non-goals for the first version

- Replacing Google Maps
- Live navigation
- Automatic route optimization
- Live public-transport information
- A general marketplace for trips
- AI-generated recommendations
- Complex social collaboration
- A rigid minute-by-minute itinerary

## Information architecture

### Journey

The primary experience:
- day-cover carousel, 6–13 August
- open-day itinerary
- morning, afternoon and evening grouping where useful
- anchor, intention and nearby-option content
- activity details
- add/edit affordances in later phases

### Saved

A strategic bank of places:
- Food & Drink
- Attractions
- Museums & Culture
- Shopping
- Entertainment
- Neighbourhoods
- One Direction
- Other ideas

Places may be:
- unassigned
- suggested for a day
- planned
- visited
- skipped

### Trip

Cross-trip information:
- overview
- flights
- hotel
- transfers
- bookings
- documents or links later
- settings and editing entry points

No profile tab is needed in the first version.

## Content model

### Anchors

Fixed or confirmed:
- flights
- booked tours
- musicals
- timed entries

### Intentions

Flexible but meaningful:
- Camden
- Soho at night
- Uber Boat
- a museum without a fixed slot
- a One Direction route
- shopping in a specific area

### Nearby options

Saved places that might fit around an anchor or intention:
- restaurants
- cafés
- shops
- secondary attractions
- alternative museums

## Core flows

### Explore the journey

1. Open Journey.
2. See the current or selected day cover.
3. Swipe horizontally to another date.
4. Open the selected day vertically or through a visible affordance.
5. Review strategic blocks and anchors.

### Open an activity

1. Tap an activity card.
2. Enter an immersive detail page.
3. Read context and logistics.
4. Open its location in Google Maps.
5. Review booking information and nearby saved places.
6. Return to the same position in the day.

### Use a flexible meal slot

1. See an unplanned meal or flexible food block.
2. Open nearby saved options.
3. Select or assign a place later.

### Review trip logistics

1. Open Trip.
2. Access flight, hotel and booking summaries.
3. Avoid exposing private confirmation codes in public/demo views.

## Navigation principles

- Horizontal navigation belongs to switching closed day covers.
- Vertical navigation belongs to opening and scrolling a day.
- Horizontal switching is disabled while a day is open.
- Hidden gestures always have a visible alternative.
- Activity details have a clear back action.
- The app should preserve context when returning.

## Editing strategy

The final beta should support in-app content editing.

Recommended progression:
1. typed seed data
2. local prototype
3. Supabase persistence
4. single-admin editing
5. optional second editor

Codex should change the product implementation. Diego should not need Codex to add each restaurant or activity once editing exists.

## Privacy

Booking references and confirmation codes are private. The architecture should support a future demo/public mode that hides sensitive fields.
