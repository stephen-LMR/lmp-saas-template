// Built-in demo records, held in memory. Used by tests and by previews with no database.
// It follows the same rules as the database: roles, one booking per staff member at a time,
// one customer per email. Restarting the app puts everything back.
import { randomUUID } from "node:crypto";
import type { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";
import { demo, DEMO_TODAY } from "../seed/demo";
import { DataProblem, type PublicStore, type StaffStore } from "./types";
import { HOLDS_A_SLOT, overlaps } from "./views";

type Db = { staff: StaffMember[]; services: Service[]; customers: Customer[]; bookings: Booking[]; payments: Payment[] };
const fresh = (): Db => structuredClone(demo);
// Kept on globalThis so every part of the running app shares one copy.
const holder = globalThis as unknown as { __demoDb?: Db };
const db = (): Db => (holder.__demoDb ??= fresh());
export const resetDemo = () => { holder.__demoDb = fresh(); };

export const DEMO_NOW = { date: DEMO_TODAY, time: "08:00" };
export const demoStaffByEmail = (email: string) => db().staff.find(s => s.active && s.email === email.trim().toLowerCase()) ?? null;
export const demoStaffById = (id: string) => db().staff.find(s => s.active && s.id === id) ?? null;

function insertBooking(b: Omit<Booking, "id" | "status">): Booking {
  const clash = db().bookings.some(x => x.staff_id === b.staff_id && x.date === b.date && HOLDS_A_SLOT.has(x.status) && overlaps(x, b));
  if (clash) throw new DataProblem("slot_taken", "That time was just taken");
  const row: Booking = { ...b, id: randomUUID(), status: "booked" };
  db().bookings.push(row);
  return row;
}

export function demoStaffStore(me: StaffMember): StaffStore {
  const canManage = me.role === "owner" || me.role === "manager";
  return {
    me,
    staff: async () => structuredClone(db().staff),
    services: async () => structuredClone(db().services),
    async createService(input) {
      if (!canManage) throw new DataProblem("not_allowed", "Only the owner or a manager can add services");
      const row: Service = { ...input, id: randomUUID(), active: true };
      db().services.push(row);
      return row;
    },
    customers: async () => structuredClone(db().customers),
    async createCustomer(input) {
      if (input.email && db().customers.some(c => c.email === input.email)) throw new DataProblem("duplicate_email", "A customer with that email already exists");
      const row: Customer = { id: randomUUID(), name: input.name, email: input.email, phone: input.phone, notes: input.notes, tags: [], custom: {} };
      db().customers.push(row);
      return row;
    },
    bookings: async filter => structuredClone(db().bookings.filter(b => !filter?.date || b.date === filter.date)),
    createBooking: async input => insertBooking(input),
    payments: async () => structuredClone(db().payments)
  };
}

export const demoPublicStore: PublicStore = {
  services: async () => structuredClone(db().services.filter(s => s.active)),
  async availability(date) {
    return {
      staff_ids: db().staff.filter(s => s.active).map(s => s.id),
      busy: db().bookings.filter(b => b.date === date && b.staff_id && HOLDS_A_SLOT.has(b.status)).map(b => ({ staff_id: b.staff_id!, start: b.start, end: b.end }))
    };
  },
  async book({ service, date, start, end, name, email, staff_ids }) {
    let customer = db().customers.find(c => c.email === email);
    for (const staff_id of staff_ids) {
      try {
        if (!customer) {
          customer = { id: randomUUID(), name, email, phone: null, tags: [], notes: "", custom: {} };
          db().customers.push(customer);
        }
        const row = insertBooking({ customer_id: customer.id, service_id: service.id, staff_id, date, start, end, price_cents: service.price_cents });
        return { booking_id: row.id };
      } catch (e) {
        if (!(e instanceof DataProblem && e.code === "slot_taken")) throw e;
      }
    }
    throw new DataProblem("slot_taken", "That time was just taken");
  }
};
