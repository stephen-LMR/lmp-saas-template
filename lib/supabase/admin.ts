// Server-only database access with the secret key, for the few things an anonymous visitor
// triggers (seeing open times, making a booking). Never import this from browser code.
import { createClient } from "@supabase/supabase-js";
import { MissingEnvError, supabaseEnv } from "./env";

export function createAdminClient() {
  const { url } = supabaseEnv();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new MissingEnvError(["SUPABASE_SECRET_KEY"]);
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
