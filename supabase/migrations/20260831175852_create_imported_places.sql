create table public.imported_places (
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
  on public.imported_places (installation_id, trip_id, created_at);

alter table public.imported_places enable row level security;

revoke all on table public.imported_places from anon, authenticated, service_role;
grant select, insert, delete on table public.imported_places to service_role;

comment on table public.imported_places is
  'Server-only imported place identities and TRAZA-owned state; no browser policies.';
