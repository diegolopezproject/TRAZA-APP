import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260904181336_cap_google_import_attempts.sql",
  ),
  "utf8",
).toLowerCase();

describe("Google import attempt quota migration contract", () => {
  it("owns separate global and installation buckets with database-enforced caps", () => {
    expect(migration).toContain("create table public.google_import_daily_usage");
    expect(migration).toContain("scope in ('global', 'installation')");
    expect(migration).toContain("attempt_count between 1 and 50");
    expect(migration).toContain("attempt_count between 1 and 10");
    expect(migration).toContain("google_import_daily_usage_global_unique");
    expect(migration).toContain("google_import_daily_usage_installation_unique");
    expect(migration).not.toContain("imported_places");
  });

  it("serializes the two checks and increments in one UTC-day RPC transaction", () => {
    const lock = migration.indexOf("pg_advisory_xact_lock");
    const limitCheck = migration.indexOf("coalesce(global_count, 0) >= 50");
    const globalIncrement = migration.indexOf("attempt_count = google_import_daily_usage.attempt_count + 1");
    const installationIncrement = migration.lastIndexOf(
      "attempt_count = google_import_daily_usage.attempt_count + 1",
    );

    expect(migration).toContain("clock_timestamp() at time zone 'utc'");
    expect(lock).toBeGreaterThan(-1);
    expect(limitCheck).toBeGreaterThan(lock);
    expect(globalIncrement).toBeGreaterThan(limitCheck);
    expect(installationIncrement).toBeGreaterThan(globalIncrement);
    expect(migration).toContain("on conflict (usage_date) where scope = 'global'");
    expect(migration).toContain(
      "on conflict (usage_date, installation_id) where scope = 'installation'",
    );
  });

  it("keeps the table and RPC server-only", () => {
    expect(migration).toContain(
      "alter table public.google_import_daily_usage enable row level security",
    );
    expect(migration).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(migration).toContain("security invoker");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain(
      "revoke execute on function public.consume_google_import_attempt(uuid)",
    );
    expect(migration).toContain(
      "grant execute on function public.consume_google_import_attempt(uuid)",
    );
    expect(migration).not.toContain("create policy");
  });
});
