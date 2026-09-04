create table public.google_import_daily_usage (
  usage_date date not null,
  scope text not null,
  installation_id uuid,
  attempt_count integer not null,
  updated_at timestamptz not null default now(),

  constraint google_import_daily_usage_scope_check
    check (scope in ('global', 'installation')),
  constraint google_import_daily_usage_bucket_check
    check (
      (scope = 'global' and installation_id is null and attempt_count between 1 and 50)
      or
      (scope = 'installation' and installation_id is not null and attempt_count between 1 and 10)
    )
);

create unique index google_import_daily_usage_global_unique
  on public.google_import_daily_usage (usage_date)
  where scope = 'global';

create unique index google_import_daily_usage_installation_unique
  on public.google_import_daily_usage (usage_date, installation_id)
  where scope = 'installation';

alter table public.google_import_daily_usage enable row level security;

revoke all on table public.google_import_daily_usage
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.google_import_daily_usage
  to service_role;

create function public.consume_google_import_attempt(p_installation_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  usage_day date := (pg_catalog.clock_timestamp() at time zone 'utc')::date;
  installation_count integer;
  global_count integer;
begin
  if p_installation_id is null then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('traza:google-import:' || usage_day::text, 0)
  );

  select attempt_count
    into global_count
    from public.google_import_daily_usage
    where usage_date = usage_day
      and scope = 'global';

  select attempt_count
    into installation_count
    from public.google_import_daily_usage
    where usage_date = usage_day
      and scope = 'installation'
      and installation_id = p_installation_id;

  if coalesce(global_count, 0) >= 50
    or coalesce(installation_count, 0) >= 10 then
    return false;
  end if;

  insert into public.google_import_daily_usage (
    usage_date,
    scope,
    installation_id,
    attempt_count
  ) values (
    usage_day,
    'global',
    null,
    1
  )
  on conflict (usage_date) where scope = 'global'
  do update set
    attempt_count = google_import_daily_usage.attempt_count + 1,
    updated_at = pg_catalog.clock_timestamp();

  insert into public.google_import_daily_usage (
    usage_date,
    scope,
    installation_id,
    attempt_count
  ) values (
    usage_day,
    'installation',
    p_installation_id,
    1
  )
  on conflict (usage_date, installation_id) where scope = 'installation'
  do update set
    attempt_count = google_import_daily_usage.attempt_count + 1,
    updated_at = pg_catalog.clock_timestamp();

  return true;
end;
$$;

revoke execute on function public.consume_google_import_attempt(uuid)
  from public, anon, authenticated;
grant execute on function public.consume_google_import_attempt(uuid)
  to service_role;

comment on table public.google_import_daily_usage is
  'Server-only tester/demo cost-safety guard for daily Google import attempts.';

comment on function public.consume_google_import_attempt(uuid) is
  'Atomically consumes tester/demo Google import capacity for one installation and UTC day.';
