// Turns what people type into forms into checked records. Pure functions: no database,
// no network. Every form goes through here on the server, whatever the browser sent.
import { z } from "zod";

export type FormResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> };

// "85", "85.5", "$85.00", "1,200" become cents. Anything else is null.
export function parsePrice(text: string): number | null {
  const cleaned = text.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

// US numbers typed any common way become +1XXXXXXXXXX. A number already starting with "+"
// is kept if it is a valid international number. Anything else is null.
export function normalizePhone(text: string): string | null {
  const t = text.trim();
  if (t.startsWith("+")) {
    const digits = `+${t.slice(1).replace(/[\s().-]/g, "")}`;
    return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : null;
  }
  const digits = t.replace(/\D/g, "");
  if (digits.length === 10 && /^[2-9]/.test(digits)) return `+1${digits}`;
  if (digits.length === 11 && /^1[2-9]/.test(digits)) return `+${digits}`;
  return null;
}

// "+15550100101" becomes "(555) 010-0101". Other countries are shown as stored.
export function formatPhone(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

const text = (v: FormDataEntryValue | null | undefined) => (typeof v === "string" ? v.trim() : "");
const Email = z.email().max(254);
const emailOrNull = (raw: string) => (raw === "" ? null : raw.toLowerCase());

export type ServiceInput = { name: string; description: string; category: string | null; duration_minutes: number; price_cents: number };

export function parseServiceForm(form: FormData): FormResult<ServiceInput> {
  const errors: Record<string, string> = {};
  const name = text(form.get("name"));
  const description = text(form.get("description"));
  const category = text(form.get("category"));
  const minutes = Number(text(form.get("minutes")));
  const price = parsePrice(text(form.get("price")));
  if (name.length < 1 || name.length > 80) errors.name = "Enter a name, up to 80 characters";
  if (description.length > 500) errors.description = "Keep the description under 500 characters";
  if (category.length > 40) errors.category = "Keep the category under 40 characters";
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) errors.minutes = "Enter a length from 5 to 480 minutes";
  if (price === null) errors.price = "Enter a price, like 85.00";
  if (Object.keys(errors).length > 0 || price === null) return { ok: false, errors };
  return { ok: true, data: { name, description, category: category || null, duration_minutes: minutes, price_cents: price } };
}

export type CustomerInput = { name: string; email: string | null; phone: string | null; notes: string };

export function parseCustomerForm(form: FormData): FormResult<CustomerInput> {
  const errors: Record<string, string> = {};
  const name = text(form.get("name"));
  const emailRaw = text(form.get("email"));
  const phoneRaw = text(form.get("phone"));
  const notes = text(form.get("notes"));
  const phone = phoneRaw === "" ? null : normalizePhone(phoneRaw);
  if (name.length < 1 || name.length > 80) errors.name = "Enter a name, up to 80 characters";
  if (emailRaw !== "" && !Email.safeParse(emailRaw).success) errors.email = "Enter a valid email";
  if (phoneRaw !== "" && phone === null) errors.phone = "Enter a 10-digit phone number";
  if (emailRaw === "" && phoneRaw === "") errors.email = "Enter an email or a phone number";
  if (notes.length > 2000) errors.notes = "Keep notes under 2000 characters";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email: emailOrNull(emailRaw), phone, notes } };
}

const Uuid = z.uuid();
const DateText = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)));
const TimeText = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export type PublicBookingInput = { service_id: string; date: string; time: string; name: string; email: string };

export function parsePublicBooking(form: FormData): FormResult<PublicBookingInput> {
  const errors: Record<string, string> = {};
  const service_id = text(form.get("service"));
  const date = text(form.get("date"));
  const time = text(form.get("time"));
  const name = text(form.get("name"));
  const email = text(form.get("email")).toLowerCase();
  if (!Uuid.safeParse(service_id).success) errors.service = "Choose a service";
  if (!DateText.safeParse(date).success) errors.date = "Choose a date";
  if (!TimeText.safeParse(time).success) errors.time = "Choose a time";
  if (name.length < 1 || name.length > 80) errors.name = "Enter your name";
  if (!Email.safeParse(email).success) errors.email = "Enter a valid email";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { service_id, date, time, name, email } };
}

export type StaffBookingInput = { customer_id: string; service_id: string; staff_id: string; date: string; time: string };

export function parseStaffBooking(form: FormData): FormResult<StaffBookingInput> {
  const errors: Record<string, string> = {};
  const get = (k: string) => text(form.get(k));
  if (!Uuid.safeParse(get("customer")).success) errors.customer = "Choose a customer";
  if (!Uuid.safeParse(get("service")).success) errors.service = "Choose a service";
  if (!Uuid.safeParse(get("staff")).success) errors.staff = "Choose who will do it";
  if (!DateText.safeParse(get("date")).success) errors.date = "Choose a date";
  if (!TimeText.safeParse(get("time")).success) errors.time = "Enter a start time";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { customer_id: get("customer"), service_id: get("service"), staff_id: get("staff"), date: get("date"), time: get("time") } };
}

export const isDate = (v: unknown): v is string => DateText.safeParse(v).success;
export const isTime = (v: unknown): v is string => TimeText.safeParse(v).success;
export const isUuid = (v: unknown): v is string => Uuid.safeParse(v).success;
