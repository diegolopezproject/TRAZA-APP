# Phase 3A — Google Maps parsing and mocked Places readiness

## Scope proven

Phase 3A accepts the provider-independent `title` / `text` / `url` share shape, extracts one exact allow-listed Google Maps HTTPS URL, resolves approved short-link redirects through an injected transport, derives documented Maps place/search context, and exposes mocked Places API (New) Text Search and Place Details contracts.

The three observed Android copied-link fixtures are parser-only public fixtures:

- `https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac`
- `https://maps.app.goo.gl/LQMKg8hE9XopoSa68`
- `https://maps.app.goo.gl/NjSorR34a7x1QLqV8?g_st=ac`

They are not evidence of the exact Android `title` / `text` / `url` field split. They were not fetched during implementation or tests.

## Security boundary

Only the exact SDD hosts and reviewed path/query families are accepted. Every redirect is revalidated before another transport call. The resolver uses manual redirects, a three-hop maximum, per-hop and total time budgets, no credentials, no forwarded cookies or authorization, and exposes no response body to its resolution logic.

String validation cannot fully prevent DNS rebinding. Phase 3A mitigates this by never resolving or fetching arbitrary hosts: the remotely fetched set is limited to exact Google-owned short-link hosts, and final Maps hosts are not fetched by the resolver. No DNS or networking dependency was added.

## External readiness still pending

- No real Google Maps short-link resolution has been tested.
- No real Places API request or credential has been used.
- The exact installed Android Web Share Target payload split remains unvalidated.
- Phase 3B must provide orchestration and error mapping without weakening these boundaries.
- PWA, `/share`, persistence orchestration and Guardados integration remain later phases.
