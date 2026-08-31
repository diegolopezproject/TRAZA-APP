export type SupabaseServerEnvironment = Readonly<Record<string, string | undefined>>;

type SupabaseEnvironmentVariable = "SUPABASE_URL" | "SUPABASE_SECRET_KEY";

export interface SupabaseServerConfig {
  url: string;
  secretKey: string;
}

function requiredValue(
  environment: SupabaseServerEnvironment,
  name: SupabaseEnvironmentVariable,
): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }

  return value;
}

export function readSupabaseServerConfig(
  environment: SupabaseServerEnvironment = process.env,
): SupabaseServerConfig {
  const url = requiredValue(environment, "SUPABASE_URL");
  const secretKey = requiredValue(environment, "SUPABASE_SECRET_KEY");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid server configuration: SUPABASE_URL");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Invalid server configuration: SUPABASE_URL");
  }

  return { url: parsedUrl.toString().replace(/\/$/, ""), secretKey };
}
