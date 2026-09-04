import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type GoogleImportAttemptConsumption =
  | { kind: "allowed" }
  | { kind: "exhausted" }
  | { kind: "failed" };

export interface GoogleImportAttemptDataResult {
  data: unknown;
  error: unknown;
}

export interface GoogleImportAttemptDataSource {
  consume(installationId: string): Promise<GoogleImportAttemptDataResult>;
}

export interface GoogleImportAttemptConsumer {
  consume(installationId: string): Promise<GoogleImportAttemptConsumption>;
}

export function createSupabaseGoogleImportAttemptDataSource(
  client: SupabaseClient,
): GoogleImportAttemptDataSource {
  return {
    async consume(installationId) {
      const result = await client.rpc("consume_google_import_attempt", {
        p_installation_id: installationId,
      });
      return { data: result.data, error: result.error };
    },
  };
}

export class GoogleImportAttemptLimiter implements GoogleImportAttemptConsumer {
  constructor(private readonly dataSource: GoogleImportAttemptDataSource) {}

  async consume(installationId: string): Promise<GoogleImportAttemptConsumption> {
    try {
      const result = await this.dataSource.consume(installationId);
      if (result.error || typeof result.data !== "boolean") {
        return { kind: "failed" };
      }
      return result.data ? { kind: "allowed" } : { kind: "exhausted" };
    } catch {
      return { kind: "failed" };
    }
  }
}
