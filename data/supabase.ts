// The merchant's own database. Staff actions run as the signed-in person, so the database's
// row level security decides what they may do. Public actions run on the server with the
// secret key and return only what an anonymous visitor may see.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaffMember } from "../modules/entities";
import { createAdminClient } from "../lib/supabase/admin";
import { bookingRow, toBooking, toCustomer, toPayment, toService, toStaff } from "./rows";
import { DataProblem, type PublicStore, type StaffStore } from "./types";

type PgError = { code?: string; message: string };
const EXCLUSION = "23P01"; // the double-booking rule in the database refused the row
const UNIQUE = "23505";
const RLS = "42501";

function fail(error: PgError): never {
  if (error.code === EXCLUSION) throw new DataProblem("slot_taken", "That time was just taken");
  if (error.code === UNIQUE) throw new DataProblem("duplicate_email", "A customer with that email already exists");
  if (error.code === RLS) throw new DataProblem("not_allowed", "You do not have permission to do that");
  throw new Error(`Database error ${error.code ?? ""}: ${error.message}`);
}
function rows<T>(result: { data: unknown; error: PgError | null }, map: (r: Record<string, unknown>) => T): T[] {
  if (result.error) fail(result.error);
  return ((result.data as Record<string, unknown>[] | null) ?? []).map(map);
}
function one<T>(result: { data: unknown; error: PgError | null }, map: (r: Record<string, unknown>) => T): T {
  if (result.error) fail(result.error);
  if (!result.data) throw new DataProblem("not_allowed", "You do not have permission to do that");
  return map(result.data as Record<string, unknown>);
}

export async function supabaseStaffFor(db: SupabaseClient): Promise<StaffMember | null> {
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) return null;
  const { data } = await db.from("staff").select("*").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
  return data ? toStaff(data) : null;
}

export function supabaseStaffStore(db: SupabaseClient, me: StaffMember): StaffStore {
  return {
    me,
    staff: async () => rows(await db.from("staff").select("*").order("name"), toStaff),
    services: async () => rows(await db.from("services").select("*").order("name"), toService),
    createService: async input => one(await db.from("services").insert(input).select().maybeSingle(), toService),
    customers: async () => rows(await db.from("customers").select("*").order("name"), toCustomer),
    createCustomer: async input => one(await db.from("customers").insert(input).select().maybeSingle(), toCustomer),
    async bookings(filter) {
      let q = db.from("bookings").select("*");
      if (filter?.date) q = q.eq("date", filter.date);
      return rows(await q.order("date").order("start_time"), toBooking);
    },
    createBooking: async input => one(await db.from("bookings").insert(bookingRow(input)).select().maybeSingle(), toBooking),
    payments: async () => rows(await db.from("payments").select("*").order("created_at", { ascending: false }), toPayment)
  };
}

export function supabasePublicStore(): PublicStore {
  return {
    async services() {
      const db = createAdminClient();
      return rows(await db.from("services").select("*").eq("active", true).order("name"), toService);
    },
    async availability(date) {
      const db = createAdminClient();
      const staff = rows(await db.from("staff").select("id").eq("active", true).order("created_at"), r => r.id as string);
      const busy = rows(
        await db.from("bookings").select("staff_id,start_time,end_time").eq("date", date).in("status", ["booked", "confirmed", "completed"]).not("staff_id", "is", null),
        r => ({ staff_id: r.staff_id as string, start: String(r.start_time).slice(0, 5), end: String(r.end_time).slice(0, 5) })
      );
      return { staff_ids: staff, busy };
    },
    async book({ service, date, start, end, name, email, staff_ids }) {
      const db = createAdminClient();
      // An existing customer keeps the name on file: a stranger who knows an email cannot rename them.
      const found = await db.from("customers").select("id").eq("email", email).maybeSingle();
      if (found.error) fail(found.error);
      let customerId = (found.data as { id: string } | null)?.id;
      if (!customerId) {
        const made = await db.from("customers").insert({ name, email }).select("id").maybeSingle();
        if (made.error) fail(made.error);
        customerId = (made.data as { id: string }).id;
      }
      for (const staff_id of staff_ids) {
        const res = await db.from("bookings")
          .insert(bookingRow({ customer_id: customerId, service_id: service.id, staff_id, date, start, end, price_cents: service.price_cents }))
          .select("id").maybeSingle();
        if (!res.error) return { booking_id: (res.data as { id: string }).id };
        if (res.error.code !== EXCLUSION) fail(res.error);
      }
      throw new DataProblem("slot_taken", "That time was just taken");
    }
  };
}
