import { describe, expect, it } from "vitest";
import { readSupabaseServerConfig } from "./supabase-config";

describe("readSupabaseServerConfig", () => {
  it("fails safely when SUPABASE_URL is missing", () => {
    expect(() =>
      readSupabaseServerConfig({ SUPABASE_SECRET_KEY: "do-not-leak-this-test-value" }),
    ).toThrowError("Missing required server configuration: SUPABASE_URL");
  });

  it("fails safely when SUPABASE_SECRET_KEY is missing", () => {
    expect(() => readSupabaseServerConfig({ SUPABASE_URL: "https://example.supabase.co" })).toThrowError(
      "Missing required server configuration: SUPABASE_SECRET_KEY",
    );
  });

  it("never includes a supplied secret in a configuration error", () => {
    const secret = "do-not-leak-this-test-value";

    try {
      readSupabaseServerConfig({ SUPABASE_URL: "not-a-url", SUPABASE_SECRET_KEY: secret });
      throw new Error("Expected configuration validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(secret);
    }
  });

  it("returns normalized server-only configuration", () => {
    expect(
      readSupabaseServerConfig({
        SUPABASE_URL: "https://example.supabase.co/",
        SUPABASE_SECRET_KEY: "test-secret",
      }),
    ).toEqual({ url: "https://example.supabase.co", secretKey: "test-secret" });
  });
});
