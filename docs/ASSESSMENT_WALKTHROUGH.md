# TRAZA × Google Maps — Assessment Walkthrough

## 1. Brief

TRAZA already organized one trip through Días, Guardados and Viaje, but places found in native Google Maps had no reliable way into that system. The assessment asked for a real mobile flow that could identify a shared place, save it durably, reuse TRAZA's existing product language and remain explainable through code, tests and external evidence.

The result is deliberately narrow: it solves **“I found this place in Google Maps; save it into this TRAZA trip”** without turning TRAZA into a general Google account synchronization product.

## 2. Initial hypothesis

The starting idea was direct synchronization with personal Google Maps saved lists. It was investigated because it would appear frictionless: save once in Maps, see it automatically in TRAZA.

It was rejected because the supported Google Maps Platform surfaces used here provide place search/details and ways to open Maps, but no reasonable public contract was identified for reading a consumer's private saved lists or receiving saved-list change events. Scraping, browser automation and Data Portability were not acceptable substitutes for an assessment feature that had to be secure and reproducible.

That rejection is part of the work, not a footnote: discovery changed the product interaction before implementation began.

## 3. Final product decision

```text
Google Maps
  → Android Share
  → TRAZA
  → Google Places
  → Supabase
  → Guardados / Day
```

The user remains in control: they explicitly share a place. TRAZA resolves a canonical Google Place ID, saves a minimal relationship, refreshes Google display content when loading Guardados and lets the place enter the existing day-planning flow.

Greater London also evolved from a hard rejection boundary into useful context. The trip can include day trips outside London; invalid/unknown geography still fails safely.

## 4. What the spec defined

**Spec = what must be true.**

The final [SDD](./SDD_GOOGLE_MAPS_IMPORT.md) defines the product and system contracts:

- Android shares through a bounded POST Web Share Target.
- Only supported Google Maps URLs cross the resolution boundary.
- A canonical Place ID is required; ambiguity fails rather than guessing.
- Four explicit TRAZA categories are supported, with a temporary signed category choice when needed.
- Supabase stores minimal identity/relationship state, not a copy of Google place content.
- Imported presentation uses stable `imported:{record UUID}` IDs.
- Google display/photo data is hydrated transiently and attributed.
- Duplicate, reload, delete and add-to-day behavior are deterministic.
- Mañana, Mediodía / tarde, Noche, Opciones cercanas and Decidir después keep distinct intentions.
- Existing TRAZA cards, toast, navigation and visual language are reused.
- Secrets and ownership stay behind server boundaries.

The SDD also records where reality changed the original assumptions: direct sync, outside-London behavior, real short-link failures and the final Android placement regression.

## 5. Implementation plan

**Implementation plan = in what order we build and validate it.**

The [final plan](./IMPLEMENTATION_PLAN.md) follows the actual sequence:

1. Technical discovery and feasibility.
2. Domain contracts, category mapping and geometry.
3. Minimal server-only Supabase persistence.
4. Secure Maps parsing, redirect resolution and mocked Places.
5. Import orchestration.
6. Authoritative Greater London data.
7. Real Google provider validation.
8. Android PWA/Web Share Target.
9. End-to-end identity, tickets, persistence, Guardados, delete and add-to-day.
10. Robustness for real short-link behavior and the evolved day-trip rule.
11. Transient Google photos, attribution and mobile polish.
12. Final rendered-component regression and physical Android acceptance.

Each phase has a purpose, reason, changed areas, validation gate, result and Git commit. That makes the plan useful as an execution trace rather than a second copy of the spec.

## 6. AI workflow

This was a supervised AI-assisted implementation.

**ChatGPT** supported research, decision framing, architecture, the initial SDD, implementation planning and review.

**Codex** implemented the approved phases, added tests, made controlled in-scope corrections, created phase commits and ran validation gates.

**Human supervision** made product decisions, approved direction and phase boundaries, tested the installed PWA on physical Android, rejected incorrect real-device results and gave final acceptance. The human is not presented as manually authoring code they did not author; their essential contribution was product judgment, approval and empirical QA.

The collaboration was iterative: AI output was treated as a proposal to verify, not as self-validating evidence.

## 7. Architecture

```text
Native Google Maps
        ↓ Share
Android Web Share Target
        ↓ bounded server POST
Maps parser + safe redirect boundary
        ↓
Google Places API (New)
        ↓ canonical Place ID
Supabase imported relationship
        ↓ list on next load
Transient Google hydration
        ↓
Existing TRAZA Guardados card
        ↓
Local add-to-day assignment
```

The important separation is durable identity versus current presentation. Supabase remembers which Google place this installation saved and which TRAZA category it owns. Google remains the source for current name, address, Maps link and photo. TRAZA's local repository remains the source for where the place was put in the trip.

## 8. Data ownership

Supabase stores:

- record UUID;
- installation UUID;
- trip ID;
- provider `google`;
- canonical Google Place ID;
- TRAZA category;
- timestamps.

It deliberately does not store Google display name, address, coordinates, types, Maps URI, photo resource name, photo URI, author attribution or full provider responses.

TRAZA local storage keeps the existing trip edits and assignments. For an imported place it references only the stable `imported:{record UUID}` ID; it does not serialize the imported Google view model.

That split keeps the durable database small, respects the provider boundary and avoids migrating the whole product merely to add one import path.

## 9. Validation evidence

Final validated implementation: `08a45eeabb854bed0b2f50f59b3514ca366de8fb`.

- Automated tests: **346/346 PASS**.
- Lint: **PASS**.
- Typecheck: **PASS**.
- Production build: **PASS**.
- Android Share Target registration and native Google Maps handoff: **validated**.
- Real import and Supabase relationship: **validated**.
- Duplicate behavior against Supabase: **validated**.
- Delete behavior against Supabase: **validated**.
- Reload persistence: **validated**.
- Day placement on physical Android: **validated after the composition fix**.
- Google photo, Google Maps attribution and author attribution: **validated**.
- Feature-branch Vercel Preview: **validated**.

Traceable detail lives in [Phase 2 Supabase evidence](./GOOGLE_MAPS_IMPORT_PHASE_2_VALIDATION.md), [Phase 3A readiness](./PHASE_3A_GOOGLE_MAPS_READINESS.md), [real Google validation](./PHASE_3D_REAL_GOOGLE_VALIDATION.md), [Android Share Target](./PHASE_4_ANDROID_SHARE_TARGET.md), [end-to-end import](./PHASE_5_6_END_TO_END_IMPORT.md) and [photos/final QA](./PHASE_7_PHOTOS_ATTRIBUTION_QA.md).

No Production deployment is claimed.

## 10. Important iteration example

The most useful supervision example came after the feature looked green.

```text
Mediodía / tarde selected
  → assignment persisted with the correct section and intention
  → automated tests green
  → real Android rendered it under Opciones cercanas
  → evidence showed the bug was in component composition
  → a rendered DayItinerary regression was added
  → renderer fixed
  → physical validation passed
```

The earlier tests proved the local roundtrip and a grouping helper. They did not prove where the composed itinerary actually placed the rendered card. The final regression inspects the rendered section markup and covers all five placement intentions.

This matters for agent supervision because “the tests pass” is not the same claim as “the user's workflow is correct.” The human test produced new evidence, the model was updated, and the acceptance boundary moved to the actual component where the failure occurred.

## 11. Final result

TRAZA now has a narrow, secure and physically validated path from native Google Maps into the existing trip companion. It preserves the product's local-first architecture, adds only minimal server-backed identity, keeps Google content transient, and shows its reasoning honestly: the first hypothesis was rejected, geographic and short-link assumptions evolved, and real Android QA caught a defect that automated tests initially missed.

For the walkthrough: start here, open the [final SDD](./SDD_GOOGLE_MAPS_IMPORT.md) for the contract, the [implementation plan](./IMPLEMENTATION_PLAN.md) for sequence/commits, and the linked phase documents for evidence.
