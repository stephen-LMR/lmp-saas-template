// Supabase settings come from environment variables only. One project per merchant app.
export class MissingEnvError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing environment variables: ${missing.join(", ")}`);
    this.name = "MissingEnvError";
  }
}

export type SupabaseEnv = { url: string; publishableKey: string };

// The names are written out in full because Next.js only inlines NEXT_PUBLIC_ values
// in browser code when it sees the whole property access.
export function supabaseEnv(
  url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
): SupabaseEnv {
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !publishableKey) throw new MissingEnvError(missing);
  return { url, publishableKey };
}
