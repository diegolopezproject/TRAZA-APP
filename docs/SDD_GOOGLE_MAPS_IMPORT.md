# SDD — Google Maps → TRAZA Place Import

## 1. Document status

| Field | Final value |
| --- | --- |
| Feature | Google Maps → TRAZA Place Import |
| Role | Final system contract: what must be true |
| Status | Implemented and validated for assessment |
| Feature branch | `feat/google-maps-traza-import` |
| Validated implementation | `08a45eeabb854bed0b2f50f59b3514ca366de8fb` |
| Baseline | `7266d2fa38297a2296f1bbbf3ac43b262d016055` |
| Primary platform | Installed TRAZA PWA on Android, invoked from native Google Maps |
| Trip | `london-2026`, including legitimate day trips outside Greater London |
| Durable imported-place store | Supabase Postgres, server-side only |

This document replaces the original proposed SDD as the authoritative contract for the implemented assessment build. Historical phase evidence remains linked rather than being rewritten as if the first plan were perfect.

## 2. Problem and final direction

TRAZA already managed a London trip through Días, Guardados and Viaje. Seed and manually created places were browser-local. A place viewed in native Google Maps could not enter TRAZA through Android Share, receive a reliable Google identity, survive reload through a server-backed relationship or participate safely in the existing Guardados and day-planning flows.

The initial hypothesis was direct synchronization with a user's personal Google Maps saved lists. Technical discovery rejected it for this assessment: supported Google Maps Platform surfaces expose place search/details and ways to open Maps, but no reasonable public contract was identified for reading a consumer's personal saved lists or subscribing to their saved-list changes. Google Data Portability, scraping and browser automation were not acceptable substitutes.

Final interaction:

```text
Google Maps on Android
  → native Share
  → installed TRAZA Web Share Target
  → trusted Next.js server boundary
  → Google Places API (New)
  → canonical Google Place ID
  → minimal Supabase relationship
  → transient Google hydration
  → Guardados / Add to day
```

Provider references: [Places API (New)](https://developers.google.com/maps/documentation/places/web-service), [Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id), [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) and [Place Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos).

## 3. Goals and non-goals

Goals:

1. Register the installed Android PWA as a share destination for Google Maps text/URL shares.
2. Resolve a Maps place without becoming an arbitrary URL fetcher or scraping Google pages.
3. Establish a canonical Google Place ID, or fail rather than choose an ambiguous result.
4. Classify into one of four TRAZA categories, asking the user when classification is ambiguous.
5. Persist only the imported relationship and TRAZA-owned category in Supabase.
6. Hydrate current Google display content transiently on the server.
7. Reuse the existing cards, details, toast, assignment flow and visual system.
8. Preserve local-first behavior for existing/manual places.
9. Support stable reload, duplicate handling, imported deletion and add-to-day placement.
10. Produce automatic, provider, Supabase, Vercel Preview and physical Android evidence.

Non-goals:

- Direct/two-way synchronization with Google Maps personal saved lists.
- Google Data Portability, scraping, reverse engineering or arbitrary website fetching.
- Supabase Auth, accounts, cross-device sync or recovery after cookie clearing.
- Migrating seed/manual places, assignments, plans, meals or transfers to Supabase.
- Cross-source deduplication by name or URL similarity.
- Replacing `LocalTripRepository`, offline importing or desktop share-target parity.
- Redesigning Journey/Días, Guardados, Viaje, navigation, `SavedPlaceCard` or TRAZA's visual language.
- Editing Google-owned metadata, collaboration or production-scale synchronization.
- A Production deployment as part of this assessment closeout.

## 4. Final decisions and evolved assumptions

| Topic | Original assumption | Final decision |
| --- | --- | --- |
| Ingestion | Direct personal saved-list sync | Rejected after discovery; Android Share is the supported action. |
| Geographic scope | Outside Greater London was rejected | London is context, not a persistence boundary; day trips are allowed. Invalid/unknown geography still fails safely. |
| Short links | Every valid `maps.app.goo.gl` token would resolve server-to-server | Real Vercel behavior showed valid Android links can return 404 without `Location`; a tightly scoped title/text fallback is allowed only after validating the Maps source. |
| Google content | Candidate details might be stored | Place ID is the durable Google identity; display, Maps URI, type and photo fields are transient. |
| Presentation ID | Provider ID could be used in local state | `imported:{record UUID}` gives each Supabase relationship a stable reload identity. |
| Day placement | Persistence tests were sufficient | Android exposed a renderer composition defect; all five intentions are now explicitly mapped and component-tested. |
| Photos | Imported places used fallback media | Current Google photo/author attribution is transient; photo failure falls back without failing import. |

The authoritative Greater London dataset and tests remain evidence of the original deterministic scope work. They are not a product rejection gate in the final flow.

## 5. TRAZA context and final user flow

TRAZA remains hybrid by design:

```text
Repository seed + manual browser places        Google imported relationships
                  │                                      │
       LocalTripRepository/localStorage             Supabase Postgres
                  │                                      │
                  │                             server-side Places hydration
                  └──────────────────┬───────────────────┘
                                     ▼
                         combined Place[] presentation
                                     ▼
                        existing Guardados / day UI
```

- `03_SEED_DATA.json` and `SeedTripRepository` remain the source for the original trip.
- `LocalTripRepository` remains the local boundary for manual places and planning state.
- Imported Google models never enter `LocalTripState.places`.
- The server loads/hydrates a separate imported collection; `TripApp` merges only for rendering and lookup.
- Journey/Días, Guardados and Viaje remain distinct. Anchors, intentions and nearby options keep their semantics.

Final flow:

1. A normal visit bootstraps a signed installation identity.
2. The user installs TRAZA from an HTTPS Vercel Preview.
3. Google Maps on Android sends `POST multipart/form-data` to `/share` with available `title`, `text` and `url`.
4. TRAZA verifies identity/body and extracts one supported Maps URL.
5. The server resolves an approved short link or uses the safe fallback allowed for a validated source.
6. Places API establishes a canonical Place ID; ambiguous identity fails.
7. Details are normalized, geography evaluated and category classified.
8. A confident category is inserted. An ambiguous category gets a signed temporary ticket and four-choice sheet.
9. A closed `303` result lands on Guardados; shared/provider details never enter the URL.
10. The page hydrates current Google content and renders the existing card. The user can open details/Maps, add to a day or delete.

## 6. Android Web Share Target

The App Router manifest registers `/share` as `POST multipart/form-data` and maps only `title`, `text` and `url`; files are not accepted. The request body is limited to 16 KiB. Unknown fields, non-string values, invalid multipart data and oversized input fail closed. Repeated fields keep the first non-empty value.

The PWA uses the existing TRAZA identity, standalone display and 192/512/maskable PNG icons. `public/sw.js` handles install/activate only: it has no fetch handler, cache or interception of `/share`, Supabase routes or Google requests. Relevant manifest changes require Android uninstall/reinstall because an installed WebAPK can retain an older share-target contract.

If `/share` lacks a valid installation cookie, it follows the safe bootstrap/failure route and does not silently import into a second identity.

## 7. Share, URL and Google Places boundary

### Share parsing

- Inputs are provider-independent `title`, `text` and `url` strings.
- Limits: 2,048 characters for title; 4,096 for text and URL.
- Exactly one canonical supported Maps URL must be present across the fields.
- Hosts and path/query families are allow-listed in `src/server/google-maps-url.ts`.
- HTTP, credentials, ports, localhost, IP literals, deceptive hosts and non-Google sources are rejected.

### Short links and real-device fallback

- Only approved Google short-link hosts are fetched.
- Redirects are manual; every destination is revalidated.
- Maximum redirects: 3. Per-hop timeout: 2 seconds. Total budget: 5 seconds.
- Requests omit credentials/cookies/authorization, use `no-store`, and never inspect bodies.
- Final Maps pages are not fetched or scraped.

After the source URL is established as supported Maps, `missing-location`, redirect-limit, timeout or transport failures may derive a query from sanitized title/text. URLs, common share boilerplate and duplicate whitespace are removed and output is bounded to 256 characters. This fallback is forbidden for rejected redirects, unsupported sources and unsafe URLs.

### Canonical identity

- Documented `api=1&query_place_id=...` uses that Place ID directly.
- Recognized place/search context uses Text Search (New), at most five candidates and deterministic selection.
- A defensible unique match continues; material ambiguity returns `failed / identity-ambiguous`.
- The first plausible result is never accepted just because it ranks first.
- Place Details must return the same Place ID requested.

Google requests are server-side with minimal field masks and a four-second default timeout. The key is supplied through `X-Goog-Api-Key`, not client code or photo URLs. Transport uses `credentials: omit`, `redirect: error` and `cache: no-store`. External JSON is runtime-validated before entering domain contracts.

## 8. Geography and category

Phase 3C added a repository-owned polygon derived from the Greater London Authority dataset and a pure country/point-in-polygon evaluator. See [GREATER_LONDON_BOUNDARY_SOURCE.md](./GREATER_LONDON_BOUNDARY_SOURCE.md).

**Final decision:** `inside` and `outside` both continue to classification and persistence. `invalid-or-unknown` fails because the candidate cannot be trusted. There is no `outside-scope` user result or toast in the final flow.

**Known implementation consideration:** Text Search still sends the original Greater London rectangle as `locationRestriction`. This is identity-search configuration, not the later persistence rule, but it can limit resolution of an outside-London day trip that depends on text fallback. Direct documented Place-ID flows are not rejected by the scope evaluator. Removing/broadening this restriction needs an authorized behavior change and real-provider regression testing; this docs-only closeout does not change it.

The importer emits only `food-drink`, `museum-culture`, `attraction` and `shopping`. An explicit Google-type mapping decides confident cases. Unknown or cross-category mappings return `needs-category`; the sheet offers Comer y beber, Cultura, Lugares and Compras. No active row exists before a valid choice. Factual tags come only from reviewed type-to-label maps; the importer invents no editorial claims.

## 9. Installation identity and temporary tickets

`__Host-traza-installation` contains a server-generated UUID and timestamp authenticated with HMAC. It is `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, has no `Domain`, and lasts at most 400 days. It is an installation-scoped bearer identity, not account authentication. Clearing it loses access to that installation's rows; account/cross-device recovery is out of scope.

`__Host-traza-import-ticket` is HMAC-authenticated, bound to installation, `london-2026`, provider `google`, Place ID, timestamps and nonce, and expires after ten minutes. Finalization re-fetches Details, validates identity and geography, requires same origin, consumes the ticket and inserts.

## 10. Supabase ownership and persistence

`public.imported_places` stores only:

- internal record UUID;
- installation UUID;
- trip ID;
- provider (`google`);
- canonical Google Place ID;
- TRAZA category;
- creation/update timestamps.

It does not store display name, address, coordinates, country, Google types, Maps URI, photo resource name/URI, author attribution or provider payloads.

Canonical duplicate identity is `(installation_id, trip_id, provider, external_place_id)`. PostgreSQL uniqueness is authoritative; error `23505` maps to `duplicate`. RLS is enabled. `anon` and `authenticated` have no policy or table grant. The server role has only `SELECT`, `INSERT` and `DELETE`; browser code never creates a Supabase client.

## 11. Imported-place lifecycle

### Stable identity and hydration

Each Supabase row becomes `imported:{record UUID}`. This reload-stable value is the only imported-place ID stored in local assignments or meal references.

On server load, Place Details supplies current name, address, types, Maps URI and photo metadata. Hydration failures are isolated per relationship. A failed item remains visible as “Lugar guardado” with deterministic TRAZA fallback media and can still be deleted.

### Duplicate and delete

Re-sharing the same Place ID for the same installation/trip creates no row and shows “Ya tienes guardado este sitio”. Seed/manual similarity is not canonical duplication.

Imported delete requires same origin, verified installation, valid record UUID and a repository delete scoped by record + installation + trip. It hard-deletes only that relationship, then removes local assignments/meals for its stable ID. It never calls a Google delete API. Manual deletion remains local and unchanged.

### Add to day

The existing local assignment flow stores five distinct `section + level` intentions:

| UI choice | Section | Level | Itinerary destination |
| --- | --- | --- | --- |
| Mañana | `morning` | `intention` | Mañana |
| Mediodía / tarde | `afternoon` | `intention` | Mediodía / tarde |
| Noche | `evening` | `intention` | Noche |
| Opciones cercanas | `anytime` | `nearby-option` | Flexible/nearby area |
| Decidir después | `anytime` | `intention` | Flexible area, with distinct intention semantics |

Both imported and local places use this mapping and survive reload. Rendered-component regression verifies temporal items are composed inside their chosen section rather than the flexible area.

## 12. Photos and attribution

- Place Details requests `photos`; only complete validated records are considered.
- The first valid provider-ranked photo is requested up to 1200 × 1200 with `skipHttpRedirect=true`.
- The key stays in a server header. The ephemeral HTTPS `photoUri` is host-restricted.
- Photo resource name, URI, dimensions and author data are not persisted by TRAZA.
- Google media shows visible `Google Maps` attribution linked to its individual source photo.
- When provided and space permits, avatar, author name and profile link accompany the image. Compact thumbnails retain Google attribution and expose the fully attributed detail.
- Missing/malformed photo, timeout, provider error or unsafe URI uses `fallbackPlaceMedia`. Photo failure never fails the import.

## 13. Outcomes and errors

| Result | Persistence | Guardados behavior |
| --- | --- | --- |
| `saved` | One relationship inserted | Hydrated card and toast “Lugar guardado” |
| `duplicate` | No new row | Toast “Ya tienes guardado este sitio” |
| `needs-category` | No row until valid choice | Existing-style category sheet; then terminal result |
| `failed` | No partial row | Toast “No hemos podido guardar este sitio. Inténtalo de nuevo.” |

Failures include malformed/oversized input, unsupported or multiple sources, unsafe redirect, insufficient fallback, ambiguous identity, provider timeout/failure, invalid provider data/geography, missing installation identity, rejected/expired ticket and persistence failure.

Only closed result codes enter the redirect URL. `TripApp` consumes `importResult` once, preserves `#saved`, removes the query value through history replacement and does not repeat the toast on reload.

## 14. Security boundaries

- Treat share bodies, redirects, Google JSON, cookies, route IDs and category input as untrusted.
- Keep Google/Supabase credentials server-only; no secret variable uses `NEXT_PUBLIC_`.
- Fetch exact allowed Google hosts only; do not proxy arbitrary URLs or scrape pages.
- Revalidate every redirect and canonical outbound Maps/photo URI.
- Bound bodies, fields, queries, candidate counts, redirects and timeouts.
- Require same-origin finalization/deletion and derive ownership from verified server state.
- Keep RLS closed to browser roles and scope list/delete by installation + trip.
- Do not log/reflect shared payloads, provider responses, tickets, cookies or secrets.
- Do not persist Google display/photo content as application data.
- Keep private booking references and confirmation codes out of this public feature evidence.

## 15. Environment contract

Allowed public variable names:

- `GOOGLE_MAPS_PLATFORM_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `TRAZA_INSTALLATION_COOKIE_SECRET`
- `TRAZA_IMPORT_TICKET_SECRET`

Values exist only in local/Vercel environment configuration. `SUPABASE_URL` must be HTTPS; signing secrets are strong and independent; `.env.local`, cookie values, provider/Vercel tokens and credentials are never committed or copied into docs. Preview is the assessment target. Production promotion requires separate approval.

## 16. Test and validation contract

The offline suite covers geometry/scope/category, stable IDs/hybrid merge, migration/repository/ownership, share/SSRF/redirects, Place ID/Text Search/ambiguity, provider validation/photos, orchestration/outside continuation, cookies/tickets, HTTP routes, degraded hydration/attribution, result consumption, UI reuse, deletion cleanup and rendered placement for all five intentions.

Final gates:

- 346/346 automated tests PASS;
- lint PASS;
- TypeScript typecheck PASS;
- production build PASS;
- `git diff --check` PASS;
- public documentation security scan clean.

Physical/external acceptance:

- Android installed PWA appears in native Google Maps Share and opens Guardados;
- real Google import, Supabase persistence and reload PASS;
- duplicate/delete checked against Supabase;
- add-to-day placement physically rechecked after the renderer fix;
- Google photo, Google Maps attribution and author attribution validated;
- feature-branch Vercel Preview tied to the final implementation validated.

Evidence: [Phase 2](./GOOGLE_MAPS_IMPORT_PHASE_2_VALIDATION.md), [Phase 3A](./PHASE_3A_GOOGLE_MAPS_READINESS.md), [Phase 3D](./PHASE_3D_REAL_GOOGLE_VALIDATION.md), [Phase 4](./PHASE_4_ANDROID_SHARE_TARGET.md), [Phases 5–6](./PHASE_5_6_END_TO_END_IMPORT.md), [Phase 7/final QA](./PHASE_7_PHOTOS_ATTRIBUTION_QA.md).

## 17. Acceptance criteria

1. TRAZA installs and appears in Google Maps Share on the target Android/Chrome environment.
2. `/share` accepts only the bounded multipart contract and returns closed `303` outcomes.
3. Unsafe sources/redirects cannot cause arbitrary fetches.
4. Canonical Place ID is established or identity fails as ambiguous.
5. Outside-London geography is not rejected; invalid/unknown geography fails safely.
6. Classification yields one of four categories or an authenticated temporary choice.
7. Supabase stores minimal state and enforces canonical duplicates.
8. Google display/photo data remains transient; photo failure never fails import.
9. Imported records use stable `imported:{record UUID}` IDs.
10. Existing Guardados/detail/toast/assignment patterns and manual behavior remain intact.
11. Imported deletion is ownership-scoped and cleans only its local references.
12. All five day intentions retain semantics and survive reload.
13. Automated gates, provider/Supabase checks, Preview and Android acceptance pass.
14. No secrets, private booking data or environment values enter public source/docs.

## 18. Known production-readiness considerations

- Installation identity is not an account; cookie clearing loses access and there is no cross-device recovery.
- The current Text Search Greater London restriction can constrain some outside-London fallback resolutions.
- Place IDs can change; a production lifecycle should refresh long-lived IDs per Google's guidance.
- Per-load hydration has API cost/latency implications at larger scale.
- Quotas, billing, EEA terms, key restrictions and alerts remain deployment-owner responsibilities.
- Android share field splits may change; fixtures and physical acceptance should be repeated after platform changes.
- Cross-source duplicate detection is intentionally absent.
- No Production deployment or `main` merge belongs to this assessment result.

## 19. Definition of done

The feature is implemented and Preview/Android validated for assessment when the acceptance criteria and gates above pass, the linked evidence remains traceable, and no unrelated behavior/schema/UI work is included. It is not represented as a production-scale account synchronization system.
