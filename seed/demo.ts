// Demo data for previews, tests, and the walkthrough video. Invented people only:
// example.com emails and 555-01xx phone numbers, which can never reach a real person.
import type { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";

const id = (group: number, n: number) => `00000000-0000-4000-8${String(group).padStart(3, "0")}-${String(n).padStart(12, "0")}`;

export const DEMO_TODAY = "2026-11-23"; // a Monday

export const staff: StaffMember[] = [
  { id: id(1, 1), name: "Dana Whitfield", email: "dana@example.com", role: "owner", active: true },
  { id: id(1, 2), name: "Lee Tran", email: "lee@example.com", role: "staff", active: true }
];

export const services: Service[] = [
  { id: id(2, 1), name: "Full groom", description: "Bath, haircut, nails, and ears.", category: "Grooming", duration_minutes: 90, price_cents: 8500, active: true },
  { id: id(2, 2), name: "Bath and brush", description: "Wash, dry, and brush out.", category: "Grooming", duration_minutes: 45, price_cents: 4500, active: true },
  { id: id(2, 3), name: "Nail trim", description: "Quick trim and file.", category: "Add-ons", duration_minutes: 15, price_cents: 1500, active: true },
  { id: id(2, 4), name: "Puppy intro", description: "A gentle first visit.", category: "Grooming", duration_minutes: 30, price_cents: 3000, active: false }
];

export const customers: Customer[] = [
  { id: id(3, 1), name: "Maria Alvarez", email: "maria@example.com", phone: "+15550100101", tags: ["Regular"], notes: "Prefers mornings.", custom: {} },
  { id: id(3, 2), name: "James Okafor", email: "james@example.com", phone: "+15550100102", tags: ["New"], notes: "", custom: {} },
  { id: id(3, 3), name: "Priya Shah", email: "priya@example.com", phone: null, tags: ["Regular"], notes: "", custom: {} },
  { id: id(3, 4), name: "Tom Becker", email: null, phone: "+15550100104", tags: [], notes: "Call, does not use email.", custom: {} },
  { id: id(3, 5), name: "Aisha Rahman", email: "aisha@example.com", phone: "+15550100105", tags: ["Regular"], notes: "", custom: {} }
];

export const bookings: Booking[] = [
  { id: id(4, 1), customer_id: id(3, 1), service_id: id(2, 1), staff_id: id(1, 1), date: DEMO_TODAY, start: "09:00", end: "10:30", status: "confirmed", price_cents: 8500 },
  { id: id(4, 2), customer_id: id(3, 2), service_id: id(2, 2), staff_id: id(1, 1), date: DEMO_TODAY, start: "10:45", end: "11:30", status: "confirmed", price_cents: 4500 },
  { id: id(4, 3), customer_id: id(3, 3), service_id: id(2, 3), staff_id: id(1, 2), date: DEMO_TODAY, start: "13:00", end: "13:15", status: "booked", price_cents: 1500 },
  { id: id(4, 4), customer_id: id(3, 5), service_id: id(2, 1), staff_id: id(1, 2), date: DEMO_TODAY, start: "14:30", end: "16:00", status: "confirmed", price_cents: 8500 },
  { id: id(4, 5), customer_id: id(3, 1), service_id: id(2, 2), staff_id: id(1, 1), date: "2026-11-18", start: "09:00", end: "09:45", status: "completed", price_cents: 4500 },
  { id: id(4, 6), customer_id: id(3, 4), service_id: id(2, 3), staff_id: id(1, 2), date: "2026-11-19", start: "15:00", end: "15:15", status: "no_show", price_cents: 1500 }
];

export const payments: Payment[] = [
  { id: id(5, 1), booking_id: id(4, 5), customer_id: id(3, 1), amount_cents: 4500, tip_cents: 800, kind: "full", status: "approved", processor: "cardpointe", processor_ref: "demo-000001" },
  { id: id(5, 2), booking_id: id(4, 1), customer_id: id(3, 1), amount_cents: 1700, tip_cents: 0, kind: "deposit", status: "approved", processor: "cardpointe", processor_ref: "demo-000002" }
];

export const demo = { staff, services, customers, bookings, payments };
