"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_COOKIE, isDemo } from "@/data/index";
import { demoStaffByEmail } from "@/data/demo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { typed, type FormState } from "./state";

const Email = z.email().max(254);

// Staff sign in with a link sent to their email. The same message is shown whether or not
// the email belongs to the team, so the page cannot be used to find out who works here.
export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const values = typed(form, ["email"]);
  const email = values.email!.trim().toLowerCase();
  if (!Email.safeParse(email).success) return { errors: { email: "Enter a valid email" }, values };

  if (isDemo()) {
    const me = demoStaffByEmail(email);
    if (!me) return { errors: { email: "That email is not on the demo team" }, values };
    (await cookies()).set(DEMO_COOKIE, me.id, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: member } = await admin.from("staff").select("id").eq("email", email).eq("active", true).maybeSingle();
  if (member) {
    const h = await headers();
    const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
    const db = await createClient();
    const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true } });
    if (error) return { errors: { _form: "We could not send the link. Try again in a minute." }, values };
  }
  return { errors: {}, values, done: email };
}

export async function signOut(): Promise<void> {
  if (isDemo()) (await cookies()).delete(DEMO_COOKIE);
  else await (await createClient()).auth.signOut();
  redirect("/sign-in");
}
