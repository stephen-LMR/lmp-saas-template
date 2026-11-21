// The records the first five modules keep. These are the shapes the database tables and
// forms are built from, so the rules live in one place.
import { z } from "zod";

const Id = z.uuid();
const Cents = z.number().int().nonnegative();
const LocalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const LocalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const StaffMember = z.strictObject({
  id: Id,
  name: z.string().min(1).max(80),
  email: z.email(),
  role: z.enum(["owner", "manager", "staff"]),
  active: z.boolean()
});

export const Service = z.strictObject({
  id: Id,
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  category: z.string().max(40).nullable(),
  duration_minutes: z.number().int().min(5).max(480),
  price_cents: Cents,
  active: z.boolean()
});

export const Customer = z.strictObject({
  id: Id,
  name: z.string().min(1).max(80),
  email: z.email().nullable(),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/).nullable(), // E.164
  tags: z.array(z.string().min(1).max(24)).max(10),
  notes: z.string().max(2000),
  custom: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
}).refine(c => c.email !== null || c.phone !== null, { message: "a customer needs an email or a phone" });

export const BookingStatus = z.enum(["booked", "confirmed", "completed", "cancelled", "no_show"]);

export const Booking = z.strictObject({
  id: Id,
  customer_id: Id,
  service_id: Id,
  staff_id: Id.nullable(),
  date: LocalDate,   // the business's own calendar day
  start: LocalTime,
  end: LocalTime,
  status: BookingStatus,
  price_cents: Cents // the price when it was booked; later price changes do not rewrite history
}).refine(b => b.start < b.end, { message: "start must be before end" });

// A payment never holds card data. token_ref is the processor's reference for the charge.
export const Payment = z.strictObject({
  id: Id,
  booking_id: Id.nullable(),
  customer_id: Id,
  amount_cents: Cents,
  tip_cents: Cents,
  kind: z.enum(["deposit", "full", "balance"]),
  status: z.enum(["pending", "approved", "declined", "refunded", "voided"]),
  processor: z.string().min(1),
  processor_ref: z.string().min(1).nullable()
});

export type StaffMember = z.infer<typeof StaffMember>;
export type Service = z.infer<typeof Service>;
export type Customer = z.infer<typeof Customer>;
export type Booking = z.infer<typeof Booking>;
export type Payment = z.infer<typeof Payment>;
