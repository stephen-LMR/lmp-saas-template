// Shapes the screens show, worked out from the records. Pure functions, shared by both stores.
import { availableSlots, type LocalNow } from "../modules/booking/availability";
import type { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";
import type { BookingSettings } from "../modules/settings";
import type { StaffBusy } from "./types";

const COUNTS_AS_VISIT = new Set(["completed", "confirmed", "booked"]);
export const HOLDS_A_SLOT = new Set(["booked", "confirmed", "completed"]);

export type CustomerRow = Customer & { visits: number; last_visit: string | null };

// Visits are bookings up to and including today that were not cancelled or missed.
export function customerRows(customers: Customer[], bookings: Booking[], today: string): CustomerRow[] {
  return customers
    .map(c => {
      const mine = bookings.filter(b => b.customer_id === c.id && COUNTS_AS_VISIT.has(b.status) && b.date <= today);
      const last = mine.map(b => b.date).sort().at(-1) ?? null;
      return { ...c, visits: mine.length, last_visit: last };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type AgendaRow = { id: string; start: string; end: string; service: string; customer: string; staff: string | null; status: Booking["status"] };

export function agenda(bookings: Booking[], services: Service[], customers: Customer[], staff: StaffMember[]): AgendaRow[] {
  const name = <T extends { id: string; name: string }>(list: T[], id: string | null) => list.find(x => x.id === id)?.name ?? null;
  return bookings
    .filter(b => b.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start))
    .map(b => ({
      id: b.id, start: b.start, end: b.end, status: b.status,
      service: name(services, b.service_id) ?? "Service", customer: name(customers, b.customer_id) ?? "Customer",
      staff: name(staff, b.staff_id)?.split(" ")[0] ?? null
    }));
}

export function addMinutes(time: string, minutes: number): string | null {
  const [h, m] = time.split(":").map(Number) as [number, number];
  const total = h * 60 + m + minutes;
  if (total > 24 * 60) return null;
  if (total === 24 * 60) return "23:59";
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

export type OpenSlot = { time: string; staff_ids: string[] }; // who is free at that time, in team order

// A time is open if at least one staff member is free for the whole service.
export function openSlots(input: {
  date: string; service: Pick<Service, "duration_minutes">; settings: BookingSettings; staff_ids: string[]; busy: StaffBusy[]; now: LocalNow;
}): OpenSlot[] {
  const byTime = new Map<string, string[]>();
  for (const staffId of input.staff_ids) {
    const slots = availableSlots({
      date: input.date, durationMinutes: input.service.duration_minutes, settings: input.settings, now: input.now,
      busy: input.busy.filter(b => b.staff_id === staffId)
    });
    for (const t of slots) byTime.set(t, [...(byTime.get(t) ?? []), staffId]);
  }
  return [...byTime.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([time, staff_ids]) => ({ time, staff_ids }));
}

export function dashboardStats(bookings: Booking[], payments: Payment[], customers: Customer[], today: string) {
  const todays = bookings.filter(b => b.date === today && b.status !== "cancelled");
  const weekAgo = addDays(today, -6);
  const thisWeek = bookings.filter(b => b.date >= weekAgo && b.date <= today);
  const paid = payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount_cents + p.tip_cents, 0);
  return {
    bookings_today: todays.length,
    still_open: todays.filter(b => b.status === "booked").length,
    no_shows_week: thisWeek.filter(b => b.status === "no_show").length,
    customers: customers.length,
    paid_cents: paid
  };
}

export function overlaps(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return a.start < b.end && b.start < a.end;
}
