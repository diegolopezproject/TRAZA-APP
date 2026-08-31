import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createSupabaseImportedPlaceDataSource,
  ImportedPlaceRepository,
} from "./imported-place-repository";
import {
  readSupabaseServerConfig,
  type SupabaseServerEnvironment,
} from "./supabase-config";

export function createSupabaseServerClient(
  environment: SupabaseServerEnvironment = process.env,
): SupabaseClient {
  const config = readSupabaseServerConfig(environment);

  return createClient(config.url, config.secretKey, {
    db: { schema: "public" },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createImportedPlaceRepository(
  environment: SupabaseServerEnvironment = process.env,
): ImportedPlaceRepository {
  const client = createSupabaseServerClient(environment);
  return new ImportedPlaceRepository(createSupabaseImportedPlaceDataSource(client));
}
