// Settings schema for each module. The pipeline sends settings as an opaque record
// (ModuleConfig in contracts/template.ts); the template validates them here.
// Every schema is strict (unknown keys are rejected, so a typo cannot be silently ignored)
// and every field has a default (so "{}" is a valid, sensible configuration).
import { z } from "zod";

const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "use 24-hour HH:MM");

export const AuthSettings = z.strictObject({
  staff_sign_in: z.enum(["magic_link", "password"]).default("magic_link"),
  customer_accounts: z.boolean().default(true), // customers can sign in to see their bookings
  staff_roles: z.array(z.enum(["owner", "manager", "staff"])).min(1).default(["owner", "manager", "staff"])
}).refine(s => s.staff_roles.includes("owner"), { message: "staff_roles must include owner" });

export const ServicesCatalogSettings = z.strictObject({
  categories_enabled: z.boolean().default(true),
  add_ons_enabled: z.boolean().default(false),
  show_prices_publicly: z.boolean().default(true)
});

export const DayHours = z.strictObject({
  day: z.number().int().min(0).max(6), // 0 is Sunday
  open: Time,
  close: Time
}).refine(d => d.open < d.close, { message: "open must be before close" });
export type DayHours = z.infer<typeof DayHours>;

const WEEKDAYS_9_TO_5: DayHours[] = [1, 2, 3, 4, 5].map(day => ({ day, open: "09:00", close: "17:00" }));

export const BookingSettings = z.strictObject({
  slot_minutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30), z.literal(60)]).default(30),
  lead_time_hours: z.number().int().min(0).max(168).default(2),      // how soon before a visit a customer can book
  max_advance_days: z.number().int().min(1).max(365).default(60),    // how far ahead a customer can book
  buffer_minutes: z.number().int().min(0).max(120).default(0),       // gap kept after each booking
  allow_customer_cancel: z.boolean().default(true),
  cancel_cutoff_hours: z.number().int().min(0).max(168).default(24),
  business_hours: z.array(DayHours).max(7).default(WEEKDAYS_9_TO_5), // a day that is not listed is closed
  payment_at_booking: z.enum(["none", "deposit", "full"]).default("none"),
  deposit_percent: z.number().int().min(1).max(100).default(20)
}).refine(s => new Set(s.business_hours.map(d => d.day)).size === s.business_hours.length, { message: "business_hours lists a day twice" });

export const CustomerField = z.strictObject({
  key: z.string().regex(/^[a-z][a-z0-9_]{0,30}$/, "lowercase letters, digits, and underscores"),
  label: z.string().min(1).max(40),
  type: z.enum(["text", "number", "date", "boolean"])
});

export const CustomersCrmSettings = z.strictObject({
  notes_enabled: z.boolean().default(true),
  tags_enabled: z.boolean().default(true),
  custom_fields: z.array(CustomerField).max(10).default([])
}).refine(s => new Set(s.custom_fields.map(f => f.key)).size === s.custom_fields.length, { message: "custom_fields has a duplicate key" });

export const PaymentsOnetimeSettings = z.strictObject({
  tips_enabled: z.boolean().default(false),
  tip_percent_options: z.array(z.number().int().min(1).max(100)).min(1).max(4).default([15, 18, 20]),
  email_receipts: z.boolean().default(true)
});

export type AuthSettings = z.infer<typeof AuthSettings>;
export type ServicesCatalogSettings = z.infer<typeof ServicesCatalogSettings>;
export type BookingSettings = z.infer<typeof BookingSettings>;
export type CustomersCrmSettings = z.infer<typeof CustomersCrmSettings>;
export type PaymentsOnetimeSettings = z.infer<typeof PaymentsOnetimeSettings>;
