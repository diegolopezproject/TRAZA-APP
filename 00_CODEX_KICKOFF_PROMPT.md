# Codex kickoff prompt — London Trip App

You are the lead product engineer and design engineer for a new mobile-first travel-planning web app.

Work inside this repository. Assume it may be empty. Inspect the environment first and do not overwrite unrelated existing work.

## Source of truth

Read these files before making decisions:

- `01_PRODUCT_BRIEF.md`
- `02_VISUAL_DIRECTION.md`
- `03_SEED_DATA.json`
- `04_AGENTS_TEMPLATE.md`

Treat them as the product source of truth. When implementation details conflict with them, preserve the product intent and document the decision.

## Goal of this run

Create the project foundation and implement one polished, testable vertical slice that proves the core experience:

1. A full-screen horizontal carousel of journey-day covers.
2. The 7 August cover as the most polished example.
3. Opening that day into a vertically scrollable itinerary.
4. The morning Sky Garden activity card.
5. Opening Sky Garden into an immersive activity-detail view.
6. Returning reliably from the activity detail to the day, and from the open day to the day-cover carousel.
7. Lightweight placeholder versions of `Saved` and `Trip`, so the bottom navigation can be evaluated.

Do not build the complete product in this run. Do not connect Supabase yet. The purpose is to validate architecture, visual language, mobile gestures, and the most important interaction before scaling the app.

## Before coding

1. Inspect the repository and available tooling.
2. Choose a stable, current React/Next.js stack compatible with the environment:
   - Next.js with App Router
   - TypeScript in strict mode
   - Tailwind CSS
   - A small, well-maintained animation solution compatible with the selected versions
3. Avoid unnecessary dependencies. Explain any non-obvious dependency in the final report.
4. Create:
   - `AGENTS.md`, kept concise and based on `04_AGENTS_TEMPLATE.md`
   - `docs/PRODUCT.md`
   - `docs/INFORMATION_ARCHITECTURE.md`
   - `docs/INTERACTIONS.md`
   - `docs/VISUAL_DIRECTION.md`
   - `docs/DATA_MODEL.md`
   - `docs/ROADMAP.md`
5. Write a short implementation plan in `docs/IMPLEMENTATION_PLAN.md`.
6. Then implement the vertical slice. Do not stop after documentation.

## Core information architecture

Bottom navigation:

- `Journey`
- `Saved`
- `Trip`

There is no map tab. Every relevant activity or place may expose an `Open in Google Maps` action using a normal external maps URL.

### Journey

The Journey root is a horizontal carousel of immersive day covers for 6–13 August 2026.

When a day cover is closed:
- Horizontal swiping changes day.
- A visible affordance and a deliberate vertical gesture open the selected day.

When a day is open:
- Horizontal day switching is disabled.
- The itinerary scrolls vertically.
- A deliberate overscroll beyond the top, or an always-visible equivalent control, closes the day and returns to the full cover.
- Do not rely on a hidden gesture alone.
- Avoid gesture conflicts and accidental navigation.

### Activity detail

Tapping an activity card opens an immersive detail view. Use a shared-element-style transition where practical.

The detail view must include:
- hero media or an editorial placeholder composition
- activity name
- time and status
- short context
- plan notes
- location
- `Open in Google Maps`
- booking area
- nearby saved places
- a clear back control
- support for the native edge-back gesture where the platform/browser provides it

## Product behavior

The app is strategic, not a minute-by-minute rigid itinerary.

Represent three content levels:

1. **Anchors** — fixed, confirmed activities such as flights, booked tours and musicals.
2. **Intentions** — plans assigned to a day or period but with flexible timing.
3. **Nearby options** — saved places that may fit around the current area or activity.

Use explicit statuses and labels. Do not communicate status by color alone.

## Visual direction

Implement the `Electric London` system from `02_VISUAL_DIRECTION.md`.

Key requirements:
- mobile-first
- editorial, immersive, energetic
- very large rounded cards and large component blocks
- Geist Sans and Geist Mono
- giant dates and typography
- warm neutral base with electric accents
- photography treated as an editorial composition; for this prototype, create tasteful local abstract/editorial placeholders rather than depending on fragile remote assets
- one dominant accent per screen
- floating black pill-shaped bottom navigation
- restrained shadows
- clear contrast
- reduced-motion support
- no excessive glassmorphism
- no generic dashboard appearance

The 7 August cover should communicate:
- Sky Garden / City of London in the morning
- Canary Wharf and The Hunger Games in the evening
- a giant `07`
- layered depth using typography, gradients, shapes and a local visual placeholder
- only a small amount of summary information

## Seed data

Load typed seed data from `03_SEED_DATA.json`.

For this run, render:
- all day covers sufficiently to test horizontal navigation
- the detailed itinerary for 7 August
- the Sky Garden detail
- a few Saved cards
- the Trip overview

Never display private booking references or confirmation codes.

## Responsive scope

Primary target:
- modern mobile viewport around 390 × 844 px
- touch interaction

Also ensure:
- usable desktop preview
- keyboard-accessible controls
- no horizontal overflow except the intentional day carousel
- safe-area support for bottom navigation

## Architecture

Keep content separate from presentation.

Create typed domain models for:
- Trip
- Day
- Activity
- Place
- Booking
- TravelSegment
- MealSlot or flexible meal activity

Use a repository/service boundary so local seed data can later be replaced by Supabase without rewriting UI components.

Do not introduce Supabase in this run.

## Quality requirements

- semantic HTML
- accessible names for icon-only controls
- visible focus states
- minimum practical touch targets
- no status conveyed solely through color
- respect `prefers-reduced-motion`
- lint and type-check cleanly
- add focused tests for the most important state transitions and domain mapping
- avoid `any`
- avoid giant components
- comment only where the behavior is genuinely non-obvious

## Scope boundaries for this run

Do not implement:
- authentication
- Supabase
- multi-user collaboration
- file uploads
- automatic route optimization
- embedded maps
- automatic nearby calculations
- live transport data
- AI recommendations
- every activity-detail page
- final production photography
- full CRUD

A minimal local edit affordance may be represented visually, but do not build a full editor yet.

## Validation

Run the project and test the experience in a mobile-sized browser.

Verify at minimum:
1. day covers can be changed horizontally
2. the 7 August day opens without accidental horizontal switching
3. its itinerary scrolls
4. Sky Garden opens and closes correctly
5. the day can return to its full cover using both the gesture behavior and a visible control
6. bottom navigation switches between Journey, Saved and Trip
7. reduced motion does not break navigation
8. there are no console errors
9. lint, tests and type-check pass

If browser automation is available, use it for the main flow. Otherwise document the manual validation performed.

## Final response

At the end, report:
- what you built
- file structure
- commands to run
- tests and checks run
- dependencies added and why
- known limitations
- decisions that need product review
- screenshots or a concise description of the mobile flow, if screenshots are available

Stop after this vertical slice. Do not proceed to Supabase or the full application until the interaction and visual direction are reviewed.
