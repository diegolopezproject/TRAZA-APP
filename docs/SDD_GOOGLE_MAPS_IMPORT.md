# SDD — Google Maps → TRAZA Place Import

## 1. Document metadata

| Field | Value |
| --- | --- |
| Feature | Google Maps → TRAZA Place Import |
| Document type | Spec-Driven Development implementation contract |
| Status | Proposed specification; implementation not authorized by this document |
| Date | 2026-08-31 |
| Repository branch at discovery | `iteration-12-art-direction-ui-maturation` |
| Repository HEAD at discovery | `7266d2fa38297a2296f1bbbf3ac43b262d016055` |
| Target application | TRAZA · Londres 2026 |
| Primary platform | Installed PWA on Android, launched from native Google Maps |
| Database decision | Supabase Postgres, server-side access only |
| Trip scope | `london-2026` / Greater London |

**FACT:** This SDD is based on the repository Technical Discovery performed at the branch and commit above. It is a planning artifact, not evidence that the feature has been implemented or externally configured.

**DECISION:** Changes authorized by this specification are limited to the feature described here. Production deployment remains forbidden without explicit approval.

## 2. Problem statement

TRAZA currently lets the user manage a London trip through Días, Guardados and Viaje, but saved places originate from the repository seed or manual browser-local input. A place viewed in native Google Maps cannot be shared into TRAZA, identified, validated or persisted through a backend.

The desired outcome is:

```text
Google Maps on Android
    → Share
    → TRAZA
    → identify with Places API (New)
    → validate Greater London
    → classify into a TRAZA category
    → persist the TRAZA-owned saved relationship
    → open Guardados
    → render through the existing card and toast patterns
```

The feature must add a real external API, server logic and durable imported-place state without turning the assessment into a migration or redesign of the whole application.

## 3. Goals

1. Make TRAZA installable and register it as an Android Web Share Target.
2. Accept valid Google Maps shared title, text and URL combinations through a server POST.
3. Resolve supported Google URLs without becoming an arbitrary URL-fetching service.
4. Identify a canonical Google Place using Places API (New).
5. reject places outside Greater London before persistence.
6. Classify confidently mapped places into the four supported Guardados product categories.
7. Ask the user for a category when classification is ambiguous.
8. Persist Google Place identity and TRAZA-owned state in Supabase Postgres.
9. Protect duplicate creation with a database constraint.
10. Hydrate Google-owned display data transiently and render it through the existing Guardados UI.
11. Preserve manual “Añadir lugar”, current local persistence, details, filters, add-to-day and deletion.
12. Use a current Google Places photo when available and compliant, otherwise use the existing TRAZA fallback.
13. Produce unit, integration, regression and real-device Android evidence.

## 4. Non-goals

**NON-GOAL:** Synchronizing Google Maps personal saved lists or receiving saved-list events.

**NON-GOAL:** Google Data Portability, scraping Google Maps or scraping arbitrary websites.

**NON-GOAL:** Supabase Auth, login, registration or multi-user product architecture.

**NON-GOAL:** Migrating the current 28 places, assignments, plans, transfers or all local state to Supabase.

**NON-GOAL:** Replacing `LocalTripRepository` for existing/manual functionality.

**NON-GOAL:** Redesigning Guardados, navigation, `SavedPlaceCard` or TRAZA’s visual identity.

**NON-GOAL:** AI classification, editing Google-owned place metadata, offline importing or desktop share-target parity.

**NON-GOAL:** Production-scale synchronization, collaboration or a general-purpose places platform.

## 5. Current-state architecture

### 5.1 Verified baseline

**FACT:** `src/app/page.tsx:4-6` is an async Next.js App Router Server Component that loads a `Trip` through `SeedTripRepository` and passes it to `TripApp`.

**FACT:** `src/data/seed-trip-repository.ts:58-66` maps `03_SEED_DATA.json` saved places into `Place` objects, derives IDs from slug plus array index, supplies tags, media and a fallback Maps query.

**FACT:** `src/components/trip-app.tsx:28-40` is the client-side application orchestrator. It creates initial state from the seed and then loads `window.localStorage` through `LocalTripRepository`.

**FACT:** `src/data/local-trip-repository.ts:11-22` defines versioned local schema `traza:trip:v4` containing places, assignments, meal selections, user plans, placements and transfers.

**FACT:** `src/data/local-trip-repository.ts:89-107` serializes that whole document to browser `localStorage`; this is browser persistence, not database persistence.

**FACT:** `src/components/saved-view.tsx:31-47` filters the supplied `Place[]` and renders the result through the shared `SavedPlaceCard`.

**FACT:** `src/design-system/patterns/product-patterns.tsx:14-20` defines the existing saved-place card actions and visual anatomy.

**FACT:** `src/components/place-form-sheet.tsx:19-65` implements the current manual place editor and creates local IDs. This behavior must remain available.

**FACT:** `src/components/trip-app.tsx:116-142` implements local add-to-day, deletion and cleanup of local assignment/meal references.

**FACT:** `src/components/trip-app.tsx:102-106` and `:210` implement the existing timed `role="status"` toast with optional undo.

**FACT:** `src/lib/use-app-navigation.ts:44-61` represents primary navigation through URL fragments; Guardados is `#saved` rather than a dedicated Next.js page route.

**FACT:** `src/lib/format.ts:14-15` always converts `mapsQuery` into a Google Maps Search URL, so it cannot safely receive a canonical Google Maps URI unchanged.

**FACT:** `src/app/layout.tsx:6-15`, `docs/ITERATION_08_REAL_DEVICE_AUDIT.md:18-27` and `docs/MOBILE_VIEWPORT_SYSTEM.md:55` confirm that there is currently no manifest, service worker, install surface or share target.

**FACT:** `README.md:25` and `docs/DATA_MODEL.md:17` identify `LocalTripRepository` as the current storage boundary and explicitly anticipate a later Supabase repository without having connected one.

### 5.2 Existing flow

```text
03_SEED_DATA.json
        ↓
SeedTripRepository
        ↓
page.tsx (server)
        ↓
TripApp (client)
        ↓
LocalTripRepository ↔ localStorage
        ↓
SavedView
        ↓
SavedPlaceCard
```

### 5.3 Constraints derived from the current architecture

- Imported records cannot be written into `LocalTripState.places`; doing so would persist hydrated Google content indefinitely and blur the local/remote ownership boundary.
- `TripApp` must receive imported view models as a separate collection and merge only for presentation and interaction lookup.
- Imported record IDs must be stable across reloads so current `PlaceAssignment.placeId` references can remain in local storage.
- Manual-place actions must continue to route through the existing local handlers.
- Imported-place mutations must route through server boundaries based on an explicit source discriminator.

## 6. Product requirements

**REQUIREMENT PR-1:** From a place in native Google Maps on Android, the installed TRAZA PWA appears in the system share sheet.

**REQUIREMENT PR-2:** Selecting TRAZA opens the existing app experience, processes the share server-side and lands on Guardados.

**REQUIREMENT PR-3:** The newly saved imported place uses the existing `SavedPlaceCard`; no parallel visual card system is allowed.

**REQUIREMENT PR-4:** Existing/manual places and imported Google places coexist in one Guardados presentation while retaining separate persistence sources.

**REQUIREMENT PR-5:** The four categories for new imports are `food-drink`, `museum-culture`, `attraction` and `shopping`. The legacy `neighbourhood` value remains untouched but is never emitted by Google import classification.

**REQUIREMENT PR-6:** The import must not invent editorial tags or claims. Generic tags may only come from an explicit, factual type-to-label allow-list.

**REQUIREMENT PR-7:** Duplicate, outside-London, failure and ambiguous-classification behavior must be visible and deterministic.

**REQUIREMENT PR-8:** Google-owned content must be refreshed rather than treated as a permanent database copy.

## 7. Functional requirements

### 7.1 Share ingestion

- Accept `POST multipart/form-data` at `/share`.
- Accept fields mapped from manifest parameters `title`, `text` and `url`.
- Do not require all three fields.
- Extract supported URLs from the explicit URL field first, then text, then title.
- Reject file shares and unrecognized fields beyond safe limits.
- Resolve only approved Google short-link hosts.

### 7.2 Import processing

- Determine a reliable Google Place ID.
- Fetch canonical Place Details server-side.
- Normalize the response into an internal candidate.
- Validate the candidate against Greater London.
- Classify it or return `needs-category`.
- Insert a minimal imported-place relationship atomically.
- Convert a uniqueness conflict to `duplicate`.
- Redirect with `303 See Other` after every accepted POST outcome.

### 7.3 Presentation and lifecycle

- Load imported database records for the current installation and `london-2026`.
- Hydrate them through Places API without writing hydrated payloads to local storage or Supabase.
- Merge imported view models with local `Place[]` only for rendering and lookups.
- Support details, Maps navigation, add-to-day and deletion.
- Use the existing fallback when hydration/photo retrieval fails.

## 8. UX/state behaviour

| Domain outcome | Guardados behavior | User copy |
| --- | --- | --- |
| `saved` | Select Guardados, show newly hydrated card, show existing toast | “Lugar guardado” |
| `duplicate` | Select Guardados, do not add a row, show existing toast | “Ya tienes guardado este sitio” |
| `outside-scope` | Select Guardados, persist nothing, show existing toast | “Este sitio está fuera de tu viaje a Londres” |
| `needs-category` | Select Guardados and open a small existing-style category sheet | No generic toast while the choice is active |
| `failed` | Select Guardados, persist nothing, show existing toast | “No hemos podido guardar este sitio. Inténtalo de nuevo.” |

**DECISION:** The redirect result is represented as a short query value, for example `/?importResult=saved#saved`. `TripApp` consumes it once, renders the existing toast and removes the query parameter with history replacement so reload/back does not repeat the message.

**DECISION:** `needs-category` uses the existing sheet language and controls. It offers exactly Comer y beber, Cultura, Lugares and Compras.

**DECISION:** The normal manual editor does not open for imported records. An imported card retains Detail and add-to-day. Its management action routes to imported detail/management behavior containing deletion, not the free-form Google-metadata editor.

**REQUIREMENT:** Loading, disabled, focus, reduced-motion and error states must follow existing component patterns. Finalization disables repeated submission while pending and returns focus predictably when the sheet closes.

## 9. Architecture decision

### 9.1 Hybrid persistence

**DECISION:** Do not migrate the application to a single database repository. Add a second, imported-place repository and retain the current local architecture.

```text
Existing/manual places                    Google imports
03_SEED_DATA.json                         Supabase imported_places
        ↓                                          ↓
SeedTripRepository                     server hydration via Places
        ↓                                          ↓
LocalTripRepository/localStorage       transient imported view models
        │                                          │
        └────────────────────┬─────────────────────┘
                             ↓
                    combined presentation
                             ↓
                         SavedView
                             ↓
                     SavedPlaceCard
```

### 9.2 Boundary rules

1. `LocalTripState.places` contains seed/manual local places only.
2. `ImportedPlaceRecord` contains database-owned identity and TRAZA state only.
3. `ImportedPlaceViewModel` is transient and never passed to `LocalTripRepository.save`.
4. Combined presentation is derived state, not a new persistence document.
5. Actions dispatch by `place.source`: local/manual actions stay local; imported actions use server endpoints.

### 9.3 Proposed server and module boundaries

Names are directional and may be adjusted to the repository’s conventions during implementation, but responsibilities must remain separate:

| Responsibility | Likely boundary |
| --- | --- |
| Web Share Target POST | `src/app/share/route.ts` |
| First-party installation bootstrap | `src/app/api/installation/bootstrap/route.ts` |
| Cookie creation/verification | `src/server/installation-identity.ts` |
| Google Maps payload extraction | `src/server/google-maps-share-parser.ts` |
| Controlled short-link resolution | `src/server/google-maps-url-resolver.ts` |
| Places API (New) HTTP client | `src/server/google-places-client.ts` |
| External response normalization | `src/server/google-place-normalizer.ts` |
| Provider-independent import orchestration/outcomes | `src/domain/place-import.ts` |
| Greater London rule | `src/domain/london-scope.ts` plus a versioned boundary asset |
| Google type → TRAZA category rule | `src/domain/place-category.ts` |
| Supabase server client | `src/server/supabase.ts` |
| Imported-place persistence | `src/server/imported-place-repository.ts` |
| Imported identity → transient card model | `src/server/imported-place-hydration.ts` |
| Photo delivery | `src/app/api/imported-places/[id]/photo/route.ts` |
| Category finalization | `src/app/api/imported-places/finalize/route.ts` or an equivalent Server Action |
| Imported deletion | `src/app/api/imported-places/[id]/route.ts` or an equivalent Server Action |
| Result/query → existing toast adapter | a small client adapter consumed by `TripApp` |
| Ambiguous category interaction | a small sheet built from existing sheet/form primitives |

Server-only modules must not be re-exported through client-importable barrels. Domain modules remain pure wherever they do not require credentials, network or database access.


## 10. Target architecture diagram

```text
Native Google Maps
        │ Share
        ▼
Android Share Sheet
        │ installed manifest share_target
        ▼
POST /share — Next.js Route Handler
        │
        ├── read verified installation cookie
        ├── enforce multipart/size limits
        ├── extract supported Google URL
        └── resolve approved short links safely
                         │
                         ▼
              Google place resolver
          direct ID → Text Search fallback
                         │
                         ▼
             Place Details API (New)
                         │ minimal field mask
                         ▼
               normalized candidate
                         │
              ┌──────────┴───────────┐
              ▼                      ▼
    Greater London rule       category rule
              │                      │
              └──────────┬───────────┘
                         ▼
          saved / duplicate / outside-scope /
               needs-category / failed
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
  atomic Supabase insert       signed short-lived
  Google ID + TRAZA state      pending cookie
           │                           │
           └─────────────┬─────────────┘
                         ▼
           303 /?importResult=...#saved
                         │
                         ▼
       server load imported identity records
                         │
                         ▼
       transient Google hydration + photo adapter
                         │
                         ▼
     TripApp(local places, imported view models)
                         │
                         ▼
        SavedView → existing SavedPlaceCard/toast
```

## 11. Data ownership and Google policy constraints

### 11.1 Persisted Google identity

The only Google-owned identifier intentionally stored long-term is:

- Google Place ID (`external_place_id`).

### 11.2 Persisted TRAZA-owned state

- internal record ID;
- installation ID;
- trip ID;
- provider (`google`);
- TRAZA category;
- creation/update timestamps.

### 11.3 Transient/refreshed Google content

- display name;
- formatted address;
- address components;
- coordinates;
- primary type and types;
- Google Maps URI;
- photo resource name/reference;
- photo author attribution and source URI.

**REQUIREMENT:** The transient fields above must not be written into Supabase or `LocalTripRepository` merely for convenience.

**REQUIREMENT:** Google photo resource names must never be stored permanently.

**REQUIREMENT:** Server request-scoped memoization is allowed to deduplicate calls during one request. Cross-request/database/browser persistence of Google responses is not part of this design and requires a separate policy review.

**VALIDATION GATE:** Before implementation, confirm the applicable Google Maps Platform/Places API (New) terms for the billing entity, including EEA-specific terms, display without a Google map, attribution and allowed caching windows. Canonical references:

- <https://developers.google.com/maps/documentation/places/web-service/policies>
- <https://developers.google.com/maps/documentation/places/web-service/place-id>
- <https://developers.google.com/maps/documentation/places/web-service/place-photos>

## 12. Database schema

### 12.1 Minimum table

The migration should express a schema conceptually equivalent to:

```sql
create table imported_places (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null,
  trip_id text not null,
  provider text not null,
  external_place_id text not null,
  traza_category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint imported_places_provider_check
    check (provider = 'google'),
  constraint imported_places_category_check
    check (traza_category in (
      'food-drink',
      'museum-culture',
      'attraction',
      'shopping'
    )),
  constraint imported_places_identity_unique
    unique (installation_id, trip_id, provider, external_place_id)
);

create index imported_places_installation_trip_created_idx
  on imported_places (installation_id, trip_id, created_at);
```

This SQL is a contract illustration, not a migration created by this SDD.

### 12.2 Delete strategy

**DECISION:** Use hard deletion for this assessment. There is no audit/restore requirement, and a later re-share should be allowed to create a new relationship. Soft deletion would complicate uniqueness and hydration without a product benefit.

### 12.3 Idempotency and transaction semantics

**DECISION:** A single insert is the unit of persistence. The repository attempts the insert directly and maps the Postgres unique-constraint violation to `duplicate`. It must not implement check-then-insert as the sole protection.

**REQUIREMENT:** London validation and confident/finalized classification complete before insert. Therefore a failure cannot leave a partial imported record.

**REQUIREMENT:** Supabase access is server-only. No browser Supabase client, public table access or client-visible privileged key is required.

**REQUIREMENT:** RLS should be enabled with no direct anonymous/client policy; trusted Next.js server code owns access using server credentials. The installation constraint is additionally enforced by repository queries.

**DECISION:** For this assessment, canonical duplicate semantics mean “the same Google Place ID was already imported for the same installation and trip.” The database constraint guarantees that case. Existing seed/manual places do not have Google Place IDs, so reliable cross-source duplicate detection is not available without migrating or explicitly linking them, both of which are out of scope. Name or `mapsQuery` similarity must not be presented as canonical duplicate protection.


## 13. Installation identity model

### 13.1 Mechanism

**DECISION:** Use a server-generated UUID installation ID carried in a signed, opaque first-party cookie named `__Host-traza-installation`.

Cookie requirements:

- generated only by trusted server logic using cryptographically secure randomness;
- value contains installation UUID, issued timestamp and HMAC signature, or an equivalently authenticated opaque token;
- `Secure`;
- `HttpOnly`;
- `SameSite=Lax` initially;
- `Path=/`;
- no `Domain` attribute, as required by the `__Host-` prefix;
- long-lived but finite maximum age, recommended 400 days;
- invalid signatures are rejected rather than trusted.

### 13.2 Bootstrap lifecycle

1. A server identity helper reads and verifies the cookie.
2. If normal app navigation has no valid identity, the root flow redirects through a small server bootstrap Route Handler.
3. The bootstrap handler generates/signs the ID, sets the cookie and redirects back to the requested first-party path.
4. `page.tsx`, `/share`, hydration, finalization and deletion derive `installation_id` only from the verified cookie, never from client form input.

**DECISION:** If `/share` unexpectedly receives no cookie, it must not silently create a second identity and import into it. It redirects to a safe failed/bootstrap flow. This prevents a browser cookie-delivery difference from splitting one installed PWA into multiple database identities.

### 13.3 Limitations

**RISK:** This is an installation-scoped bearer identity, not user authentication. Anyone who obtains the cookie can act as that installation. This is accepted only for the single-user assessment scope.

**RISK:** Clearing cookies loses access to previously imported relationships even though rows remain in Supabase. Account recovery and cross-device access are explicitly out of scope.

**VALIDATION GATE:** Confirm on real Android Chrome that the installed Web Share Target POST includes the existing `SameSite=Lax` first-party cookie. If it does not, stop and revise the identity/session design; do not weaken cookie security without an explicit decision.

## 14. Web Share Target contract

### 14.1 Manifest contract

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 14.2 Installability contract

**DECISION:** Implement the manifest through the Next.js metadata route `src/app/manifest.ts` unless a verified framework constraint requires a static `public/manifest.webmanifest`.

Minimum manifest values:

| Member | Contract |
| --- | --- |
| `name` | `TRAZA · Londres 2026` |
| `short_name` | `TRAZA` |
| `start_url` | `/#days` |
| `scope` | `/` |
| `display` | `standalone` |
| `background_color` | Existing TRAZA paper/background token value |
| `theme_color` | Existing TRAZA Ink/theme value already declared in `src/app/layout.tsx:11-15` |
| `lang` | `es` |
| `icons` | At least installable 192×192 and 512×512 PNG icons plus a reviewed maskable 512×512 icon |
| `share_target` | The POST contract in section 14.1 |

Existing TRAZA brand assets in `public/brand/` and `src/app/icon.svg` are the visual source. Required raster/maskable install assets must be derived without changing the brand.

**DECISION:** Add a minimal first-party service worker for reliable Android PWA installability, without a PWA framework. It should handle registration/lifecycle only and have no fetch handler or runtime/precache behavior in this feature. Consequently `/share`, Supabase-backed routes and Google/photo requests always reach the network and are never cached by the service worker.

Likely surface: `public/sw.js` plus one small client registration component mounted by the root layout. If current target-Chrome validation proves that a service worker is unnecessary and its omission improves reliability, removing it requires an explicit recorded deviation from this SDD.

**REQUIREMENT:** Installation is served over HTTPS in Preview/production. Localhost may be used only for development diagnostics.

**REQUIREMENT:** A changed `share_target`, scope or icon set may not update an already installed Android WebAPK immediately. Acceptance testing must uninstall/reinstall TRAZA after relevant manifest changes and record the tested manifest/version.

### 14.3 Request contract

- Method: `POST` only.
- Content-Type: `multipart/form-data` only.
- Allowed fields: `title`, `text`, `url`.
- Each field is optional, but at least one non-empty field must be present.
- Maximum total request body: 16 KiB.
- Maximum `url`: 4,096 Unicode code units after trimming.
- Maximum `title`: 2,048 Unicode code units.
- Maximum `text`: 4,096 Unicode code units.
- Files are rejected.
- Duplicate field names use the first non-empty string and are logged only as a validation category, not with content.

### 14.4 Response contract

The handler always converts an accepted POST processing result into `303 See Other`:

```text
saved          → /?importResult=saved#saved
duplicate      → /?importResult=duplicate#saved
outside-scope  → /?importResult=outside-scope#saved
needs-category → /?importResult=needs-category#saved
failed         → /?importResult=failed#saved
```

Malformed requests use the same user-safe `failed` destination. Internal error details are not placed in the URL.

### 14.5 Ambiguous-category ticket

**DECISION:** Do not create a pending database row. The server sets a separate short-lived, encrypted/authenticated, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` cookie named `__Host-traza-import-ticket` containing only:

- installation binding;
- trip ID;
- provider;
- Google Place ID;
- issued/expiry timestamps;
- anti-replay nonce.

Recommended lifetime: 10 minutes. The redirect exposes only `needs-category`, not the Place ID or ticket. Finalization reads the ticket server-side, rehydrates and revalidates the place, performs the constrained insert, consumes/clears the ticket and returns a typed result.

## 15. Google URL resolution

### 15.1 Initial allow-list

Subject to the real-payload validation gate, the initial exact host/path families are:

| Host | Allowed purpose/path |
| --- | --- |
| `maps.app.goo.gl` | Google Maps application short links |
| `goo.gl` | Legacy links only when path begins `/maps/` |
| `google.com` | Paths beginning `/maps` |
| `www.google.com` | Paths beginning `/maps` |
| `maps.google.com` | Maps paths/query formats verified by fixtures |

No wildcard `*.google.com`, regional Google domain or new shortener is automatically trusted. Additions require a captured payload, explicit test fixture and allow-list review.

### 15.2 Parsing rules

1. Trim Unicode whitespace and strip surrounding share prose/punctuation without altering the URL itself.
2. Parse using the platform `URL` parser.
3. Require `https:`.
4. Reject credentials, fragments used as authority confusion, non-default ports and invalid IDNA/hostname forms.
5. Normalize host to lowercase and compare exact ASCII hostnames.
6. Prefer the explicit `url` field; then scan `text`; use `title` last.
7. Deduplicate equivalent supported URLs.
8. If multiple distinct supported place URLs remain, return `failed` rather than selecting silently.

### 15.3 Redirect protection

- Only short-link hosts are fetched for resolution.
- Redirect mode is manual.
- Maximum redirects: 3.
- Per-hop timeout: 2 seconds.
- Total resolution budget: 5 seconds.
- Validate protocol, hostname and port before the first request and after every `Location` header.
- Each intermediate host must be either an approved short-link host or an approved final Maps host.
- Do not follow redirects to IP literals, localhost, private/link-local/reserved ranges or non-HTTPS URLs.
- Do not forward cookies, authorization headers or user-controlled headers.
- Do not download page bodies to scrape content. Stop once a supported final URL is available.
- Bound response headers and abort oversized/unexpected responses.

**REQUIREMENT:** The resolver API accepts a previously validated supported Maps URL object, not an arbitrary string supplied directly to `fetch`.

**REQUIREMENT:** Logs may record outcome code, host family, redirect count, timing and a correlation ID. They must not record full shared text, query parameters, API keys, cookies or Google response bodies.

**VALIDATION GATE:** Capture real Android Google Maps shares for a business, landmark, dropped pin and short-link variant before freezing the production allow-list/parser fixtures.

## 16. Places integration

### 16.1 Layered identity resolver

1. Recover a Place ID only from URL structures proven by captured fixtures and tests.
2. Resolve an approved short URL and repeat deterministic extraction.
3. Extract title/query/coordinate context from recognized Maps formats.
4. If Place ID is still unavailable, run Text Search (New) with a London location restriction/bias and a small result limit.
5. Apply deterministic candidate matching.
6. Fetch Place Details (New) for the selected Place ID.
7. If identity is not reliable, return `failed`; `needs-category` is reserved for known identity with ambiguous category.

### 16.2 Candidate acceptance

Direct Place IDs are accepted only after Place Details succeeds. Text Search may be accepted when:

- one viable result remains after London filtering; or
- one candidate uniquely matches normalized shared title plus available location/address evidence.

If two or more candidates remain materially plausible, do not select the first result silently.

### 16.3 Field masks

Use the smallest mask needed at each step. Initial contract:

- Text Search identification: `places.id`, `places.displayName`, `places.formattedAddress`, `places.location`.
- Place Details validation/classification: `id`, `displayName`, `formattedAddress`, `addressComponents`, `location`, `primaryType`, `types`, `googleMapsUri`.
- Hydration with imagery: the prior UI fields plus `photos` only when a photo is requested.

Field-mask changes require a test and billing/policy review.

### 16.4 Normalized candidate

The Google adapter returns a provider-specific DTO. A normalization boundary converts it to an internal candidate containing validated scalar fields, never the raw response. Runtime validation must reject missing/invalid IDs, coordinates, arrays and URLs.

## 17. London validation

**DECISION:** “London” means the Greater London administrative trip scope.

**DECISION:** Final acceptance requires:

1. structured country evidence equal to Great Britain/United Kingdom; and
2. valid coordinates inside a versioned Greater London boundary polygon.

Address components such as `administrative_area_level_*` and containing areas may strengthen diagnostics and derive the displayed area, but are not the sole gate because Google component coverage can vary. Text Search location restriction reduces candidates but is not the final validation.

### 17.1 Boundary asset

Use a small, versioned, repository-owned polygon/multipolygon derived from an authoritative Greater London boundary dataset with documented source, date and license. The point-in-polygon rule must be pure and independently tested with boundary fixtures.

### 17.2 Outcomes

- Inside polygon and correct country → continue.
- Outside polygon → `outside-scope`, persist nothing.
- Missing/invalid coordinates or contradictory country data → `failed`, persist nothing.
- Boundary-edge behavior uses an explicit inclusive-edge rule and fixtures.

**RISK:** Administrative boundaries change. Store the boundary asset version in documentation/tests; do not persist Google coordinates solely to avoid future API calls.

**VALIDATION GATE:** Select and document the authoritative Greater London boundary source/license before implementing the polygon asset.

## 18. Category classification

### 18.1 Supported output

```text
food-drink     → Comer y beber
museum-culture → Cultura
attraction     → Lugares
shopping       → Compras
```

`neighbourhood` remains supported by legacy/manual data but is never returned by this classifier.

### 18.2 Strategy

Implement a pure mapping module backed by an explicit reviewed table of supported Google Places API (New) types.

Resolution algorithm:

1. If `primaryType` has an explicit mapping, return it.
2. Otherwise map all recognized entries in `types`.
3. If recognized types all resolve to one category, return it.
4. If recognized types span categories or none are recognized, return `needs-category`.
5. Never infer a category from display name, address text or free-form keyword matching.

Minimum mapping families include:

- restaurant, cafe, bakery, bar, pub → `food-drink`;
- museum, art gallery → `museum-culture`;
- explicit retail/store types → `shopping`;
- park, landmark, tourist attraction and relevant locality/neighbourhood types → `attraction`.

The implementation mapping table must use official current Google type values and dedicated fixtures; broad suffix matching such as “anything ending in `_store`” is not sufficient unless every resulting type is reviewed.

### 18.3 Tags

An optional factual type-label table may generate at most two generic localized tags, for example Restaurante, Cafetería or Tienda. Unknown types produce no tag. Editorial tags are never synthesized.

## 19. Image/photo strategy

### 19.1 Hydration boundary

Imported view-model hydration may expose a `MediaAsset` compatible object whose `src` points to a TRAZA same-origin photo route, not Google’s authenticated endpoint:

```text
SavedPlaceCard / MediaFrame
        ↓
GET /api/imported-places/{recordId}/photo
        ↓ verified installation cookie + record ownership
Supabase record → Google Place ID
        ↓
Place Details photos field
        ↓ current photo resource + attribution
Place Photos request with server credential
        ↓
stream image response to client
```

### 19.2 Requirements

- Verify the record belongs to the installation/trip before Google calls.
- Keep the API credential server-side.
- Request a bounded card-appropriate image size.
- Fetch a current photo resource name; do not store it.
- Follow Google photo redirects server-side or stream bytes without exposing the key.
- Use policy-compliant `Cache-Control`; default to `private, no-store` until policy review approves otherwise.
- Do not proxy arbitrary Google resource names or URLs supplied by the browser.
- Do not fail the place import when the photo path fails.
- Fall back to `fallbackPlaceMedia(displayName)` semantics or an equivalent transient fallback.

### 19.3 Attribution

Hydration must carry current author attribution, source link and Google attribution data into the `MediaFrame`/detail presentation. `src/components/media-frame.tsx:15-40` already has a provenance surface and should be extended only as required by policy, without redesigning the card.

If thumbnail attribution may be omitted only when a larger view exposes full attribution under current policy, the detail view must provide that larger attributed view and direct source access. Otherwise attribution remains visible on the card.

**RISK:** Hydration and photo delivery can create multiple billable calls. Use request-scoped deduplication, concurrency limits and fallbacks; do not solve cost by permanently caching prohibited data.

## 20. Existing UI integration

### 20.1 Imported view model

Define an imported presentation model compatible with the current card needs and carrying an explicit discriminator:

```text
source: imported-google
id: imported:{database-record-uuid}
recordId: database UUID
externalPlaceId: Google Place ID (server use; avoid exposing unless required)
category: persisted TRAZA category
name/area/tags/maps URI/media: transient hydrated values
```

The rendered `id` is derived from the database record UUID, not the Place ID. This prevents collisions with seed/manual IDs and remains stable across reloads.

### 20.2 Merge semantics

1. `page.tsx`/server loader obtains imported identity records for the verified installation and trip.
2. Server hydration produces transient imported view models.
3. `TripApp` receives them separately from the seeded `Trip`.
4. Client local state continues to load through `LocalTripRepository`.
5. A memoized combined collection is `[...local.places, ...importedPlaces]` unless a later approved ordering rule says otherwise.
6. `SavedView`, filter counts and action lookup use the combined collection.
7. Only `local.places` is ever supplied to `LocalTripRepository.save`.

Imported records appear after current local places in database `created_at` order. No new Guardados reorder feature is introduced.

If one imported record cannot be hydrated temporarily, the relationship remains in Supabase and must not disappear silently. Render the existing card with its persisted TRAZA category, a generic “Lugar guardado”/temporarily unavailable label, no invented area/tags/Maps link and the existing deterministic fallback. Detail may offer retry and deletion. A later navigation retries hydration. This degraded model is transient and is not saved locally.


### 20.3 Actions

- Detail: existing detail sheet with transient metadata and attribution.
- Maps: canonical validated Google Maps URI through a safe outbound helper.
- Add-to-day: current local assignment flow using stable imported view ID.
- Edit: do not open `PlaceFormSheet` for imported records.
- Delete: imported management/detail action calls server deletion and local reference cleanup.

### 20.4 Maps helper compatibility

Replace the ambiguous single-string behavior with an explicit API conceptually equivalent to:

```text
mapsDestination({ kind: "query", value: mapsQuery })
mapsDestination({ kind: "canonical-url", value: googleMapsUri })
```

- Existing seed/manual records remain `query` and produce the current search URL exactly.
- Imported canonical URLs are parsed, required to be HTTPS and restricted to approved Google Maps hosts before direct use.
- Never infer “URL or query” solely from an untrusted string prefix inside the current helper.

### 20.5 Add-to-day and cleanup

`PlaceAssignment.placeId` remains locally persisted. For imported places it stores `imported:{recordId}`. On reload the same database record recreates the same view ID.

`TripApp` action lookup must use the combined collection rather than `local.places` alone. Assignment writes remain in `LocalTripRepository`; no day-state database migration is required.

After imported deletion:

1. hard-delete the owned Supabase relationship;
2. remove the view model from client presentation;
3. remove local `PlaceAssignment` entries for its stable view ID;
4. remove local `MealSelection` references if imported restaurants can be selected for meals;
5. prune orphan imported references defensively during hydration;
6. never call a Google delete API or imply two-way synchronization.

## 21. Error/outcome model

Use one provider-independent discriminated result:

```ts
type PlaceImportOutcome =
  | { kind: "saved"; recordId: string }
  | { kind: "duplicate"; recordId?: string }
  | { kind: "outside-scope" }
  | { kind: "needs-category" }
  | { kind: "failed"; reason: ImportFailureReason };
```

`ImportFailureReason` is server/internal diagnostic data and must not be serialized into the user redirect. Suggested reasons include malformed payload, unsupported host, redirect rejected, identity ambiguous, Google timeout, Google invalid response, database unavailable and identity unavailable.

**DECISION:** Domain services return outcomes; the Route Handler adapts them to redirects, and `TripApp` adapts redirect codes to existing Spanish UI copy.

**REQUIREMENT:** Exceptions are caught at the server boundary, logged safely and converted to `failed`. Expected duplicate conflicts are not logged as application errors.

## 22. Security model

### 22.1 Trust boundaries

- Shared payload: fully untrusted.
- Redirect destinations: untrusted until allow-listed at every hop.
- Google response: external/untrusted until runtime-normalized.
- Installation cookie: trusted only after signature verification.
- Client record/category inputs: untrusted; installation/trip/provider are server-derived.
- Supabase: accessible only from trusted server modules.

### 22.2 Controls

- No `NEXT_PUBLIC_` Google or Supabase secret.
- Server-only modules for credentials and external/database clients.
- API restrictions and quota monitoring for the Google credential.
- Exact URL allow-list, HTTPS-only, no arbitrary fetch, redirect and timeout limits.
- Request body/field limits before processing.
- Runtime schemas for Google and form payloads.
- Unique database constraint and direct insert.
- Repository ownership predicates on every list/delete/photo request.
- Same-origin/CSRF protection for interactive finalization and deletion; the share endpoint accepts only its narrow manifest contract and verified installation cookie.
- Rate limits per installation and source IP for share, finalization and photo routes.
- Safe structured logs with correlation IDs and redacted payloads.
- No private booking references or confirmation codes in responses/logs.
- Security headers including a restrictive referrer policy so transient result/navigation data is not leaked cross-origin.

### 22.3 Credential restrictions

Google recommends API and application restrictions. Static IP restriction may be incompatible with dynamic Vercel egress and is an external deployment decision. At minimum, restrict the key to Places API (New), separate environments and set quotas/alerts. Do not deploy an unrestricted production key.

## 23. Testing strategy

### 23.1 Unit tests

Add deterministic tests for:

- URL extraction from `url`, `text`, `title` and mixed valid combinations;
- rejection of absent, oversized, malformed and multi-place payloads;
- exact host/path allow-list and hostname confusion cases;
- HTTPS/port/credential restrictions;
- redirect limit, timeout, host revalidation, private IP and non-HTTP rejection;
- direct Place ID parsing using captured fixtures;
- Text Search candidate acceptance and ambiguity;
- Google response runtime normalization;
- Greater London country and point-in-polygon behavior, including edges;
- every category mapping family;
- primary-type precedence, cross-category ambiguity and unmapped types;
- factual tag allow-list;
- typed outcome adapters;
- installation cookie signing, expiry and tamper rejection;
- imported view ID stability and local/remote merge without serialization.

### 23.2 Integration tests

Use mocked Google HTTP boundaries and a disposable/test Supabase database or repository adapter:

- successful share and 303 redirect;
- duplicate share, including concurrent requests;
- outside-London share with no insert;
- Google timeout/error/malformed response;
- malformed share and unsupported host;
- rejected redirect chain/SSRF attempt;
- Supabase failure with no partial state;
- ambiguous classification ticket creation;
- finalization revalidation, duplicate protection and ticket consumption;
- expired/replayed/tampered category ticket;
- imported list hydration with partial Google failure;
- photo success, attribution, unavailable-photo fallback and ownership denial;
- imported deletion and local-reference cleanup contract.

### 23.3 Regression checks

- Seed repository still yields 28 places and valid media/Maps destinations.
- Manual “Añadir lugar”, edit and delete are unchanged.
- Existing category filters and legacy `neighbourhood` data remain valid.
- Existing details and all current Maps query links remain valid.
- Local add-to-day, meal selection, ordering and persistence remain valid.
- Imported add-to-day survives reload on the same installation.
- Navigation history, `#saved`, focus and back behavior remain valid.
- Existing Storybook `SavedPlaceCard` contract remains valid.
- Responsive/reduced-motion smoke paths show no unexpected visual regressions.

### 23.4 Repository gates

At the appropriate implementation phase run, at minimum:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Run relevant existing browser smoke scripts only when their server prerequisites are active and collect their output separately from source changes.

## 24. Android acceptance plan

Use a Vercel Preview with Preview-only Google/Supabase resources or credentials. Do not use production without approval.

1. Verify manifest and service-worker installation diagnostics in Android Chrome.
2. Uninstall any prior TRAZA PWA before testing a changed `share_target`.
3. Visit Preview, bootstrap installation identity and install TRAZA.
4. Confirm TRAZA appears in the native Google Maps Share Sheet.
5. Share a real, unambiguous London place.
6. Confirm TRAZA opens in standalone display mode and Guardados is selected.
7. Confirm one imported card appears with correct name/area/category.
8. Confirm compliant image and attribution, or the existing fallback.
9. Confirm “Lugar guardado”.
10. Reload/close/reopen and confirm the imported record remains.
11. Repeat the same share and confirm no second card plus duplicate toast.
12. Share a clearly outside-Greater-London place and confirm no row plus outside toast.
13. Share a place whose type fixture produces `needs-category`; choose a category and confirm success.
14. Add the imported place to a day and verify the assigned card after reload.
15. Delete the imported place; verify database presentation and local references are removed.
16. Confirm manual Add Place still works before and after imported-place operations.
17. Record browser/Android/Google Maps versions, Preview URL/commit and results.

**VALIDATION GATE:** Real-device success is mandatory before any production deployment decision.

## 25. External prerequisites

No prerequisite is configured by this document.

### 25.1 Google Cloud

- billing-enabled Google Cloud project;
- Places API (New) enabled;
- separate restricted server credential for the intended environment;
- API quota and billing alerts;
- reviewed applicable EEA terms and attribution requirements.

Proposed server-only variable name:

- `GOOGLE_MAPS_PLATFORM_API_KEY`

### 25.2 Supabase

- Supabase project;
- reviewed SQL migration for `imported_places`;
- server-only project URL and secret/service credential;
- test/Preview data isolation;
- Vercel environment configuration.

Proposed server-only variable names:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

### 25.3 TRAZA secrets

Proposed server-only variable names:

- `TRAZA_INSTALLATION_COOKIE_SECRET`
- `TRAZA_IMPORT_TICKET_SECRET`

No secret may be committed, printed, passed to client components or included in browser-visible Google requests.

## 26. Implementation phases

### Phase 0 — baseline, branch and external prerequisites

- **Purpose:** Establish a safe execution baseline and resolve external gates.
- **Likely files:** no application files initially; provider consoles; eventual `.env.example` names only if approved.
- **Actions:** confirm feature branch, clean tracked diff, capture Android share payloads, approve boundary dataset, provision isolated Supabase/Google resources, define Preview secrets.
- **Tests:** credential smoke checks from server-only throwaway tooling; no payloads/secrets committed.
- **Acceptance:** payload fixtures and host list approved; boundary source approved; isolated projects available.
- **Stop/rollback:** stop if real payloads cannot be represented by the share contract, policy review blocks storage/display, or identity cookie is not delivered to share POST.

### Phase 1 — domain contracts and tests

- **Purpose:** Define provider-independent outcomes, imported identity/view models, London rule and category mapping.
- **Likely files:** `src/domain/models.ts`, new domain modules/tests under `src/domain/` or `src/lib/`.
- **Actions:** add discriminated outcomes, category table, polygon contract, normalization types and stable imported view-ID helper.
- **Tests:** unit tests for mapping, ambiguity, London fixtures, IDs and outcomes.
- **Acceptance:** domain tests pass without Google, Supabase or browser dependencies.
- **Stop/rollback:** revert this phase if it forces changes to seed/manual behavior or introduces Google transport concerns into UI components.

### Phase 2 — Supabase persistence boundary

- **Purpose:** Persist only imported identity and TRAZA-owned state.
- **Likely files:** new migration, server database client, imported-place repository and repository tests.
- **Actions:** create minimal table/constraints/index, server-only client, list/insert/delete methods and unique-conflict mapping.
- **Tests:** insert, concurrent duplicate, ownership-scoped list/delete and failure semantics.
- **Acceptance:** no Google display/photo columns; duplicate protected by database; no client Supabase access.
- **Stop/rollback:** roll back migration/code if RLS/server credential isolation or atomic duplicate semantics cannot be demonstrated.

### Phase 3 — Google URL and Places integration

- **Purpose:** Safely turn a captured share payload into a validated import candidate.
- **Likely files:** server URL resolver, Google client, normalization service and tests.
- **Actions:** implement exact allow-list, controlled redirect resolution, direct-ID/Text Search/Details flow, minimal field masks and runtime validation.
- **Tests:** parser, SSRF, redirect, timeout, candidate ambiguity and mocked Google responses.
- **Acceptance:** no arbitrary fetch path, key stays server-side and unreliable identity produces `failed`.
- **Stop/rollback:** stop on an unsupported real payload rather than broadening hosts or adding scraping.

### Phase 4 — Web Share Target and PWA

- **Purpose:** Make Preview installable and receive Android shares.
- **Likely files:** `src/app/manifest.ts`, install icons, `/share` Route Handler, identity bootstrap/helper, minimal service-worker registration/files if confirmed.
- **Actions:** add branded manifest metadata, POST contract, installation cookie and redirect adapter.
- **Tests:** manifest/schema checks, handler request limits, cookie tests and local install audit.
- **Acceptance:** installable Preview, valid manifest and deterministic 303 outcomes.
- **Stop/rollback:** remove/disable share registration if POST handling, cookie identity or installability fails; never ship a GET/query workaround containing shared data.

### Phase 5 — imported-place hydration into Guardados

- **Purpose:** Present remote imported records with local places without contaminating local storage.
- **Likely files:** `src/app/page.tsx`, `src/components/trip-app.tsx`, `src/components/saved-view.tsx`, imported hydration/adapter modules, relevant tests.
- **Actions:** server list/hydrate, separate prop collection, combined derived collection, stable action lookup, one-shot result toast.
- **Tests:** merge/order/filter counts, serialization guard, partial hydration failure and existing 28-place regression.
- **Acceptance:** imported card uses `SavedPlaceCard`; local storage contains no imported hydrated model.
- **Stop/rollback:** revert UI wiring if any existing local place/action changes behavior or Google content enters `traza:trip:v4`.

### Phase 6 — ambiguous category and error states

- **Purpose:** Complete the outcome state machine and human category choice.
- **Likely files:** category sheet component using existing primitives, finalization server boundary, content strings and tests.
- **Actions:** short-lived ticket cookie, four-choice sheet, revalidation, insert, toast adapters and query cleanup.
- **Tests:** ticket expiry/tampering/replay, finalize duplicate/outside/failure/success, focus and reduced motion.
- **Acceptance:** no active card before selection; no Google payload persisted as pending state.
- **Stop/rollback:** disable finalization if replay/installation binding or duplicate protection is not proven.

### Phase 7 — photo and attribution

- **Purpose:** Add policy-compliant optional Google imagery.
- **Likely files:** server photo route/service, hydration media adapter, `MediaFrame`/detail only if needed, tests.
- **Actions:** current photo lookup, ownership check, server credential use, streamed bounded response, attribution and fallback.
- **Tests:** no photo, expired photo, attribution present, denied ownership, timeout and no key leakage.
- **Acceptance:** photo names are absent from database/localStorage; fallback does not fail import.
- **Stop/rollback:** ship fallback-only imported cards if policy, attribution, cost or credential security cannot be satisfied.

### Phase 8 — regression QA

- **Purpose:** Prove current TRAZA behavior remains intact.
- **Likely files:** tests only unless a feature regression is found.
- **Actions:** run repository gates, targeted browser flows, Storybook/visual comparison and inspect diff.
- **Tests:** all unit/integration/regression checks in section 23.
- **Acceptance:** lint, typecheck, tests and build pass; no unexplained visual/behavior regressions.
- **Stop/rollback:** do not proceed to Preview while any required gate fails.

### Phase 9 — Vercel Preview and real Android validation

- **Purpose:** Validate OS integration and real provider behavior.
- **Likely files:** no code unless a documented defect is found; evidence artifacts outside source as agreed.
- **Actions:** deploy Preview with explicit approval, install/reinstall, execute section 24 and record evidence.
- **Tests:** real Google Maps shares, duplicate, outside, ambiguous, reload, assignment and deletion.
- **Acceptance:** all Android acceptance items pass on recorded versions.
- **Stop/rollback:** disable Preview share feature or return to the failed phase; production remains forbidden.

### Phase 10 — documentation and demo readiness

- **Purpose:** Make the implementation auditable for the assessment.
- **Likely files:** `docs/IMPLEMENTATION_PLAN.md`, implementation report/ADR/test evidence references, README only if setup instructions are approved.
- **Actions:** record actual architecture, deviations, provider setup names, validation results and known limits.
- **Tests:** final diff/security scan and repeat mandatory repository gates if documentation accompanies code changes.
- **Acceptance:** evidence is reproducible, secrets absent and the demo describes limits honestly.
- **Stop/rollback:** do not claim completion if Preview/Android evidence or required quality gates are missing.

## 27. Quality gates

Every implementation phase must inspect its scoped diff. Final handoff requires:

- `git diff --check` clean;
- explicit `git diff` inspection;
- `npm run lint` passes;
- `npm run typecheck` passes;
- `npm test` passes;
- `npm run build` passes;
- relevant existing smoke flows pass;
- targeted integration tests pass;
- no unexpected Guardados/navigation visual regression;
- no Google/Supabase secret in source, logs or client bundle;
- no unrestricted server-side URL fetch;
- no permanent Google photo resource names;
- no persistent Google display/photo response copied for convenience;
- no duplicate rows under concurrent insert;
- no partial record on failures;
- no modification of manual Add Place behavior;
- imported view models never serialized by `LocalTripRepository`;
- existing 28 places and Maps query links remain intact;
- real Android Preview verification passes before production consideration.

**REQUIREMENT:** A production deploy, merge, commit, push or provider change requires explicit authorization beyond this SDD.

## 28. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Android share payload differs from assumptions | Parser fails or broadens unsafely | Capture real payloads before implementation; fixture-driven allow-list |
| Share POST omits installation cookie | Split/lost identity | Real-device gate; fail/bootstrap rather than silently create another ID |
| Installation cookie is cleared/stolen | Lost access or bearer impersonation | Secure signed cookie, server scoping, acknowledge no recovery in assessment |
| Google URL resolver becomes SSRF proxy | Internal network access/data exfiltration | Exact hosts, manual redirects, IP/protocol checks, no page scraping |
| Text Search returns plausible alternatives | Wrong place saved | Deterministic match rules; fail when identity is ambiguous |
| London address components vary | False scope decisions | Country plus versioned point-in-polygon rule |
| Google type taxonomy changes | Misclassification | Explicit mapping table, unknown→needs-category, periodic review |
| Google policy disallows intended caching/display | Compliance failure | Persist Place ID only; policy gate; fallback-only photo option |
| API key leaks through photo URL/client | Cost/security exposure | Same-origin authenticated photo route and server-only key |
| Places API outage/latency | Missing cards or failed shares | Timeouts, typed failure, partial hydration fallback, no partial writes |
| Concurrent/replayed share | Duplicate rows | Database unique constraint and conflict mapping |
| Hybrid IDs leave orphan assignments | Broken local day UI | Stable imported IDs, immediate cleanup, hydration-time orphan pruning |
| Supabase service credential broad access | Database compromise | Server-only module, RLS deny client, least privilege where available |
| Hydration creates high API cost | Unreliable assessment | Minimal masks, request dedupe/concurrency limits, small imported set |
| PWA manifest update not registered | TRAZA absent from share sheet | uninstall/reinstall for Preview acceptance; document update behavior |
| Minimal service worker interferes with POST | Stale/broken imports | Do not cache/intercept `/share`, API or Google requests; keep SW minimal |

## 29. Open validation items

**VALIDATION GATE VG-1:** Capture real native Google Maps Android payloads for multiple place/link variants.

**VALIDATION GATE VG-2:** Freeze the exact URL host/path allow-list from those fixtures.

**VALIDATION GATE VG-3:** Verify `SameSite=Lax` installation cookie delivery in installed-PWA share POST.

**VALIDATION GATE VG-4:** Select and license/document the Greater London boundary dataset.

**VALIDATION GATE VG-5:** Review current Google Places API (New), EEA, attribution and caching obligations with the actual billing setup.

**VALIDATION GATE VG-6:** Confirm Google server credential restriction compatible with Vercel egress; configure quotas/alerts.

**VALIDATION GATE VG-7:** Provision isolated Supabase and Google resources and approve server-only environment names.

**VALIDATION GATE VG-8:** Confirm current Android Chrome installability requirements. Recommended implementation is a minimal manually registered service worker with no fetch caching/interception; if manifest + HTTPS already satisfies the target environment, omission may be approved to reduce lifecycle risk.

**VALIDATION GATE VG-9:** Verify Google logo and photo-author attribution layout in the current `MediaFrame`/detail surfaces.

**VALIDATION GATE VG-10:** Decide the authoritative behavior when an imported record exists but Google hydration later returns not-found/obsolete Place ID: hide with failure/fallback, offer deletion, or refresh the Place ID under Google guidance.

## 30. Assessment evidence

Retain the following engineering/product artifacts so the implementation can be explained to Lucas:

1. Original feature brief and scope constraints.
2. Technical Discovery report with repository evidence.
3. This SDD and its review history.
4. Updated `docs/IMPLEMENTATION_PLAN.md` once implementation scope is authorized.
5. Meaningful Codex prompts that changed or validated architecture, excluding secrets/private data.
6. Architecture decisions and trade-offs: hybrid persistence, installation identity, Place-ID-only persistence, deterministic London/category rules and photo boundary.
7. The decision not to implement Google Maps saved-list synchronization and the API limitation behind it.
8. Sanitized real Android share payload fixtures and parser decisions.
9. Database migration/constraint evidence without credentials.
10. Unit/integration/regression command output and test summaries.
11. Security evidence: client-bundle key check, SSRF cases, duplicate concurrency and photo-name storage check.
12. Vercel Preview URL tied to a reviewed commit, when deployment is explicitly approved.
13. Final Android screen recording showing share, success, duplicate, outside, assignment and deletion.
14. Known limitations and any deviations from this SDD, documented rather than hidden.

This evidence is an audit trail of reasoning and validation, not marketing copy.

## 31. Acceptance criteria

The feature is acceptable only when all statements below are true:

1. TRAZA installs on the target Android/Chrome version and appears in native Google Maps Share.
2. The share target uses POST multipart form data and accepts valid title/text/url combinations.
3. Unsupported/malformed hosts and redirect chains cannot trigger arbitrary server fetches.
4. Google API credentials are absent from client code, browser requests requiring the key and source control.
5. A shared place is reliably identified or fails without silently choosing an ambiguous candidate.
6. Places outside the versioned Greater London polygon are not persisted.
7. Confident types map deterministically to one of the four import categories.
8. Ambiguous types open the four-choice category sheet and create no active row before choice.
9. Supabase stores only the minimal imported identity/TRAZA state defined in section 12.
10. The database uniqueness constraint prevents duplicate rows under sequential and concurrent shares.
11. Successful import redirects to `#saved`, renders through existing `SavedPlaceCard` and shows “Lugar guardado”.
12. Duplicate, outside and failed outcomes use the exact specified existing-toast copy.
13. Google-owned fields are hydrated transiently and are absent from localStorage/Supabase persistence.
14. No expiring photo resource name is stored permanently.
15. Available photos are delivered without exposing the key and with required attribution/source access.
16. Photo failure uses the existing fallback and does not fail import.
17. Existing 28 places, category filters, details and Maps query links are unchanged.
18. Manual Add Place/edit/delete remains unchanged and browser-local.
19. Imported add-to-day persists locally across reload using a stable imported view ID.
20. Imported deletion removes the database relationship, presentation and local assignment/meal references only.
21. Required lint, typecheck, tests, build, security and regression gates pass.
22. The real Android Preview acceptance plan passes and evidence is retained.

## 32. Definition of Done

“Google Maps → TRAZA Place Import” is Done only when:

- all acceptance criteria in section 31 pass;
- all open validation gates that block implementation or production are resolved and recorded;
- implementation matches the hybrid persistence and Google-data ownership decisions in this SDD;
- required database migration and external configuration have been reviewed without exposing credentials;
- the complete diff has been inspected and contains no unrelated refactor/redesign;
- repository quality commands and targeted integration tests pass;
- Vercel Preview has been validated on a real Android device;
- assessment evidence is complete and linked from project documentation;
- known limitations are documented;
- no production deployment has occurred without explicit approval.

Until those conditions hold, the feature must be described as specified, in progress or Preview-validated—not production complete.
