// Database rows to app records and back. The database calls the booking times start_time
// and end_time and returns them with seconds ("09:00:00"); the app uses "09:00".
import type { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";

type Row = Record<string, unknown>;
const hhmm = (v: unknown) => String(v).slice(0, 5);

export const toStaff = (r: Row): StaffMember => ({ id: r.id as string, name: r.name as string, email: r.email as string, role: r.role as StaffMember["role"], active: r.active as boolean });
export const toService = (r: Row): Service => ({
  id: r.id as string, name: r.name as string, description: (r.description as string) ?? "", category: (r.category as string | null) ?? null,
  duration_minutes: r.duration_minutes as number, price_cents: r.price_cents as number, active: r.active as boolean
});
export const toCustomer = (r: Row): Customer => ({
  id: r.id as string, name: r.name as string, email: (r.email as string | null) ?? null, phone: (r.phone as string | null) ?? null,
  tags: (r.tags as string[]) ?? [], notes: (r.notes as string) ?? "", custom: (r.custom as Customer["custom"]) ?? {}
});
export const toBooking = (r: Row): Booking => ({
  id: r.id as string, customer_id: r.customer_id as string, service_id: r.service_id as string, staff_id: (r.staff_id as string | null) ?? null,
  date: r.date as string, start: hhmm(r.start_time), end: hhmm(r.end_time), status: r.status as Booking["status"], price_cents: r.price_cents as number
});
export const toPayment = (r: Row): Payment => ({
  id: r.id as string, booking_id: (r.booking_id as string | null) ?? null, customer_id: r.customer_id as string, amount_cents: r.amount_cents as number,
  tip_cents: r.tip_cents as number, kind: r.kind as Payment["kind"], status: r.status as Payment["status"], processor: r.processor as string,
  processor_ref: (r.processor_ref as string | null) ?? null
});
export const bookingRow = (b: { customer_id: string; service_id: string; staff_id: string; date: string; start: string; end: string; price_cents: number }) => ({
  customer_id: b.customer_id, service_id: b.service_id, staff_id: b.staff_id, date: b.date, start_time: b.start, end_time: b.end, price_cents: b.price_cents
});
