# Electric London

A mobile-first editorial trip companion for London, 6–13 August 2026. The Spanish interface includes eight themed Días, activity detail, 28 real Guardados, local place/plan editors, restaurant selection, versioned persistence and Viaje logistics.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The primary design viewport is 390 × 844 px.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

With Chrome installed and the app running, `npm run test:visual` executes the mobile flow—including persistence, meals, assignments and plan movement—and refreshes `screenshots/iteration-03/`. `node scripts/audit-responsive.mjs` checks 390×844, 430×932, 768×1024 and 1440×900.

Product and interaction decisions live in `docs/`. The source JSON stays behind `SeedTripRepository`; `LocalTripRepository` is the only storage boundary. Supabase is intentionally not connected in this phase.
