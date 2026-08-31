import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260831175852_create_imported_places.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();

describe("imported_places migration contract", () => {
  it("contains the provider, category, uniqueness, index and RLS safeguards", () => {
    expect(migration).toMatch(/check\s*\(provider\s*=\s*'google'\)/);
    expect(migration).toMatch(
      /unique\s*\(installation_id,\s*trip_id,\s*provider,\s*external_place_id\)/,
    );
    expect(migration).toContain(
      "on public.imported_places (installation_id, trip_id, created_at)",
    );
    expect(migration).toContain(
      "alter table public.imported_places enable row level security",
    );

    for (const category of ["food-drink", "museum-culture", "attraction", "shopping"]) {
      expect(migration).toContain(`'${category}'`);
    }
  });

  it("denies browser roles and grants only required server operations", () => {
    expect(migration).toContain(
      "revoke all on table public.imported_places from anon, authenticated, service_role",
    );
    expect(migration).toContain(
      "grant select, insert, delete on table public.imported_places to service_role",
    );
    expect(migration).not.toContain("create policy");
  });

  it("does not persist external display or photo data", () => {
    for (const forbiddenColumn of [
      "display_name",
      "formatted_address",
      "latitude",
      "longitude",
      "primary_type",
      "google_maps_uri",
      "photo_reference",
      "photo_url",
      "photo_attribution",
    ]) {
      expect(migration).not.toContain(forbiddenColumn);
    }
  });
});
