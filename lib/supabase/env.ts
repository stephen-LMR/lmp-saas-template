// Supabase settings come from environment variables only. One project per merchant app.
export class MissingEnvError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing environment variables: ${missing.join(", ")}`);
    this.name = "MissingEnvError";
  }
}

export type SupabaseEnv = { url: string; anonKey: string };

// The names are written out in full because Next.js only inlines NEXT_PUBLIC_ values
// in browser code when it sees the whole property access.
export function supabaseEnv(
  url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
): SupabaseEnv {
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new MissingEnvError(missing);
  return { url, anonKey };
}
