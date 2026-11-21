// Picks where the records come from. Demo records are used only when APP_DATA=demo is set
// on purpose; otherwise the app uses the merchant's database and stops with a clear error
// if it is not configured. An app can never fall back to demo records by accident.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { modules } from "../config/index";
import { createClient } from "../lib/supabase/server";
import type { LocalNow } from "../modules/booking/availability";
import { BookingSettings } from "../modules/settings";
import { nowIn } from "./clock";
import { DEMO_NOW, demoPublicStore, demoStaffById, demoStaffStore } from "./demo";
import { supabasePublicStore, supabaseStaffFor, supabaseStaffStore } from "./supabase";
import type { PublicStore, StaffStore } from "./types";

export const DEMO_COOKIE = "demo_staff";
export const isDemo = () => process.env.APP_DATA === "demo";

export const bookingSettings = (): BookingSettings => (modules.settings.booking as BookingSettings | undefined) ?? BookingSettings.parse({});
export const businessNow = (): LocalNow => (isDemo() ? DEMO_NOW : nowIn(bookingSettings().time_zone));

// The signed-in staff member's view of the records, or null when nobody is signed in
// (or the person signed in is not on the team).
export const staffStore = cache(async (): Promise<StaffStore | null> => {
  if (isDemo()) {
    const id = (await cookies()).get(DEMO_COOKIE)?.value;
    const me = id ? demoStaffById(id) : null;
    return me ? demoStaffStore(me) : null;
  }
  const db = await createClient();
  const me = await supabaseStaffFor(db);
  return me ? supabaseStaffStore(db, me) : null;
});

export async function requireStaff(): Promise<StaffStore> {
  const store = await staffStore();
  if (!store) redirect("/sign-in");
  return store;
}

export const publicStore = (): PublicStore => (isDemo() ? demoPublicStore : supabasePublicStore());
