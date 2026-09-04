# Google Maps → TRAZA — Final Implementation Plan

This document answers **“In what order was the final specification built and validated?”** The [SDD](./SDD_GOOGLE_MAPS_IMPORT.md) defines what must be true; this plan records the executable sequence that actually happened. Older TRAZA product iterations remain in their dedicated `ITERATION_*` documents and are not duplicated here.

Baseline: `7266d2fa38297a2296f1bbbf3ac43b262d016055`

Final validated implementation: `08a45eeabb854bed0b2f50f59b3514ca366de8fb`

Branch: `feat/google-maps-traza-import`

## Phase 0 — Technical discovery / feasibility

**Purpose.** Decide whether Google Maps personal saved lists could be synchronized and establish a safe assessment-sized alternative.

**Why this phase existed.** The original request assumed direct saved-list sync. Repository discovery also showed a local-only trip model, no PWA/share target, no Supabase connection and an existing Guardados visual system that should not be replaced.

**What changed.** Direct consumer saved-list sync was rejected because no reasonable supported API/event contract was identified. The product direction became Google Maps → Android Share → TRAZA → Places API. Hybrid persistence, server-only Google/Supabase boundaries and installation identity were specified before implementation.

**Main files / areas.** `docs/SDD_GOOGLE_MAPS_IMPORT.md`, `src/app/page.tsx`, `src/components/trip-app.tsx`, `src/data/local-trip-repository.ts`, Google Maps Platform documentation.

**Validation gate.** Feasibility and security review; preserve Journey/Días, Guardados, Viaje, local state and existing design patterns; no Production deployment.

**Result.** A reviewable SDD and phased architecture replaced the unsupported initial hypothesis.

**Relevant commit.** Initial SDD entered with `82ec8790c94e0499d60a714c1c55798d08f95425`; pre-feature baseline `7266d2fa38297a2296f1bbbf3ac43b262d016055`.

## Phase 1 — Domain foundation

**Purpose.** Create provider-independent contracts before network, database or UI work.

**Why this phase existed.** Identity, category and geography decisions needed deterministic tests independent of Google and Supabase.

**What changed.** Added imported-place identity/view contracts, four import categories, result/failure types, stable `imported:{record UUID}` presentation IDs, explicit Google-type mapping, factual tags, geometry primitives and the initial London scope contract.

**Main files / areas.** `src/domain/place-import.ts`, `place-category.ts`, `geometry.ts`, `london-scope.ts` and their tests.

**Validation gate.** Pure domain tests pass with no browser, network, provider credentials or persistence.

**Result.** Stable domain seams supported later adapters without embedding provider payloads in UI state.

**Relevant commit.** `82ec8790c94e0499d60a714c1c55798d08f95425`.

## Phase 2 — Supabase persistence boundary

**Purpose.** Persist the minimum imported relationship through a server-only repository.

**Why this phase existed.** Canonical duplicate and ownership behavior needed database enforcement without migrating TRAZA's local trip state.

**What changed.** Added `public.imported_places`, unique identity `(installation, trip, provider, Place ID)`, RLS with no browser policies, least required server-role grants, list/insert/delete repository methods and strict runtime mapping.

**Main files / areas.** `supabase/migrations/20260831175852_create_imported_places.sql`, `src/server/imported-place-repository.ts`, `supabase-config.ts`, `supabase.ts`, [Phase 2 evidence](./GOOGLE_MAPS_IMPORT_PHASE_2_VALIDATION.md).

**Validation gate.** Migration/repository tests plus isolated Supabase review: schema contains no Google display/photo data; ownership isolation, uniqueness, insert/list/delete and grants/RLS pass.

**Result.** A minimal server-only durable boundary, independent of Google ingestion and browser state.

**Relevant commit.** `cb9f09eb0f78fb146b780e9af8b3ca25cb0b784f`.

## Phase 3A — Secure Google Maps resolution boundary

**Purpose.** Parse Maps shares and talk to mocked Places API without weakening the server boundary.

**Why this phase existed.** Shared text and redirect locations are untrusted, and Text Search can return plausible but incorrect candidates.

**What changed.** Added bounded share parsing, exact host/path allow-lists, manual redirect resolution with three-hop and time budgets, documented Place-ID parsing, Text Search/Details client, deterministic candidate selection and normalization.

**Main files / areas.** `src/server/google-maps-share-parser.ts`, `google-maps-url.ts`, `google-maps-url-resolver.ts`, `google-maps-place-resolution.ts`, `google-places-client.ts`, candidate selection/normalizer, [Phase 3A evidence](./PHASE_3A_GOOGLE_MAPS_READINESS.md).

**Validation gate.** Offline parser, SSRF, redirect, provider-contract, candidate ambiguity and normalization tests; no real network, persistence or UI.

**Result.** Secure independent boundaries ready for composition.

**Relevant commit.** `b66038dfc2c582b0c45e1273d5fa23ca21769ac6`.

## Phase 3B — Import orchestration

**Purpose.** Compose share → Maps → Google → normalized candidate into one pre-persistence result.

**Why this phase existed.** Route/UI code needed one provider-neutral outcome rather than knowledge of each network step.

**What changed.** Added a server-only orchestrator with injectable redirects, Places client and London evaluator; mapped failures; separated durable prepared identity from transient Google presentation data; returned ready, category-needed or failed outcomes.

**Main files / areas.** `src/server/google-maps-import-orchestrator.ts` and integration tests.

**Validation gate.** Mocked end-to-end orchestration covers direct Place ID, Text Search, ambiguity, geography, classification, provider errors and repeatability without network/Supabase.

**Result.** A composition boundary prepared imports without creating rows or UI state.

**Relevant commit.** `e118660979705f60f196a9f461cacd944e92c02e`.

## Phase 3C — Authoritative Greater London dataset

**Purpose.** Replace placeholder geography with a reproducible authoritative boundary.

**Why this phase existed.** The original spec treated Greater London as a hard scope rule and required deterministic evidence rather than a rough bounding box.

**What changed.** Added the GLA source record, OSGB36 → WGS84 build script, versioned full polygon, strict loader and inside/outside/edge/failure tests.

**Main files / areas.** `scripts/build-greater-london-boundary.mjs`, `src/data/greater-london-boundary.json`, `src/domain/london-scope.ts`, [boundary provenance](./GREATER_LONDON_BOUNDARY_SOURCE.md).

**Validation gate.** Source/hash/license, transformation example, polygon invariants and known points verified offline.

**Result.** Authoritative context exists. **Evolved final decision:** later physical/product evidence showed day trips must be allowed, so `outside` no longer blocks persistence; invalid/unknown geography still fails. The dataset was retained rather than retconned away.

**Relevant commit.** `505197b22367f2a226b372e08323881e8cd83f6f`; product-rule evolution in `fc965f7236030b6c04c20be5d702fc3b8b7bd8c0`.

## Phase 3D — Real Google provider validation

**Purpose.** Exercise the real provider boundary before connecting persistence/UI.

**Why this phase existed.** Mocked contracts could not prove real short-link redirects, API access, response shapes or ambiguity behavior.

**What changed.** Added the production composition root and ran a temporary sanitized harness against three real Maps fixtures. Two resolved/classified; Hamleys stopped as identity-ambiguous. An initial IP restriction failure was fixed in external credential configuration, not code.

**Main files / areas.** `src/server/google-maps-import-service.ts`, [real Google evidence](./PHASE_3D_REAL_GOOGLE_VALIDATION.md).

**Validation gate.** Only approved hosts contacted; no secret output, Supabase call, persistence, PWA or UI; ordinary gates pass after removing the harness.

**Result.** Real Places behavior matched the secured pre-persistence pipeline, including honest ambiguity.

**Relevant commit.** `69c6a2aa12e0f96e992ef8577a3efdd8de6543cd`.

## Phase 4 — PWA / Android Web Share Target

**Purpose.** Make TRAZA installable and reachable from native Google Maps Share.

**Why this phase existed.** Provider/domain work had no Android entry point, and emulator/browser checks cannot prove share-sheet registration.

**What changed.** Added manifest identity/icons, `POST /share` multipart contract, bounded/closed transport, minimal no-fetch service worker and registration.

**Main files / areas.** `src/app/manifest.ts`, `src/app/share/route.ts`, `src/components/service-worker-registration.tsx`, `public/sw.js`, icons, [Phase 4 evidence](./PHASE_4_ANDROID_SHARE_TARGET.md).

**Validation gate.** Manifest/route tests, build asset checks, then physical Android install and Días → Google Maps → Share → TRAZA → Guardados.

**Result.** Native Android Share Target PASS; this checkpoint intentionally opened Guardados without yet persisting a place.

**Relevant commit.** `a1978c295d1d073da79b5cc59063999a38c3d240`.

## Phases 5 + 6 — End-to-end import

**Purpose.** Connect Android Share to persistence and the existing product lifecycle.

**Why this phase existed.** The prior phases were isolated proof points; the assessment required save, duplicate, ambiguity, hydration, delete and add-to-day behavior.

**What changed.** Added signed installation cookie/bootstrap, ten-minute signed category ticket, real `/share` orchestration/persistence, same-origin finalize/delete routes, server hydration, hybrid merge, degraded cards, stable imported IDs, one-shot result toasts, category sheet and local cleanup/assignment integration.

**Main files / areas.** `src/app/share/route.ts`, `api/installation`, `api/imported-places`, `src/server/installation-identity.ts`, `import-ticket.ts`, `finalize-import.ts`, `imported-place-hydration.ts`, `src/domain/hybrid-places.ts`, `TripApp`, [Phases 5–6 evidence](./PHASE_5_6_END_TO_END_IMPORT.md).

**Validation gate.** Offline route/security/lifecycle tests plus controlled real insert → duplicate → list/hydrate → delete in Supabase; physical import/reload/delete acceptance.

**Result.** End-to-end import worked while Supabase stored only relationship data and day placement stayed local.

**Relevant commit.** `48b824c49503f886ba7bb07e109958d1575d8d63`.

## Robustness pass

**Purpose.** Make real `maps.app.goo.gl` shares resilient without broadening trust.

**Why this phase existed.** Android opened a valid short link that Vercel returned as 404 without `Location`; the original server-resolution assumption was false. The same real use showed that a legitimate trip can include outside-London day trips.

**What changed.** Added sanitized title/text fallback only for typed availability failures after source validation; unsafe redirects remain terminal. Removed outside-London rejection/result while retaining geography evaluation and tests.

**Main files / areas.** parser, URL resolver, place resolution, import orchestrator/service, finalize/persistence and result contracts; Phases 5–6 evidence.

**Validation gate.** Regression tests prove safe fallback, rejection boundary and outside continuation; real Android/Preview flow rechecked.

**Result.** Real shares no longer depend on every token resolving server-to-server, and day trips are a final product rule.

**Relevant commit.** `fc965f7236030b6c04c20be5d702fc3b8b7bd8c0`.

## Phase 7 — Google photos, attribution and final UI polish

**Purpose.** Complete transient Google presentation and finish import-specific polish inside existing components.

**Why this phase existed.** Imported places needed current imagery with compliant attribution and failure isolation; the existing mobile toast also exposed a centering defect under Motion transforms.

**What changed.** Added photo parsing/media requests with `no-store`, ephemeral validated URI, Google Maps/source/author attribution, fallback isolation and mobile toast geometry correction. No schema or durable photo data was added.

**Main files / areas.** `src/server/google-places-client.ts`, `imported-place-hydration.ts`, `src/components/media-frame.tsx`, `src/app/globals.css`, [Phase 7 evidence](./PHASE_7_PHOTOS_ATTRIBUTION_QA.md).

**Validation gate.** Provider parsing/media/fallback/attribution tests, mobile bounds check, full repository gates and physical photo/attribution acceptance.

**Result.** Google media is transient and attributed; photo failure never fails import; existing TRAZA cards/toast remain the UI.

**Relevant commit.** `f5a44e6541d20dc0fd3e139aa71ab84ca7311f56`.

## Final QA / regression

**Purpose.** Convert physical Android evidence into a regression at the actual composition boundary.

**Why this phase existed.** Selecting Mediodía/tarde produced correct persisted `section`/`level`, and all tests were green, yet the real Android itinerary rendered the place under Opciones cercanas. Tests had proved storage/helper behavior, not `DayItinerary` composition.

**What changed.** First preserved assignment placement through local state, then explicitly mapped the five combinations: morning/intention, afternoon/intention, evening/intention, anytime/nearby-option and anytime/intention. Added server-rendered component assertions that check the chosen section's markup.

**Main files / areas.** `src/components/day-itinerary.tsx`, `day-itinerary-assignment.test.ts`, `src/components/trip-app.tsx`, `src/data/local-trip-repository.ts`, Phase 7/final QA evidence.

**Validation gate.** 346/346 tests, lint, typecheck and build PASS; physical Android day placement and reload PASS.

**Result.** The renderer now respects the selected temporal block. This is the clearest example of why green tests do not replace supervised real-device acceptance.

**Relevant commits.** `ee11c3b2a2ca4b600bb3bbed18f10833abc96c3a`, then final composition fix `08a45eeabb854bed0b2f50f59b3514ca366de8fb`.

## Final evidence gate

- Final implementation: `08a45eeabb854bed0b2f50f59b3514ca366de8fb`.
- Automated: 346/346 tests, lint, typecheck and build PASS.
- External: real Google API validation; isolated Supabase schema/ownership/duplicate checks.
- Physical: Android Share Target, real import, reload, duplicate, delete, five-intention day placement, photos and attribution PASS.
- Deployment: feature-branch Vercel Preview validated; no Production deployment and no merge to `main`.
- Assessment navigation starts at [ASSESSMENT_WALKTHROUGH.md](./ASSESSMENT_WALKTHROUGH.md).
