import { describe, expect, it } from "vitest";
import { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";
import { demo, DEMO_TODAY } from "../seed/demo";

describe("demo seed data", () => {
  it("every record is valid", () => {
    for (const s of demo.staff) expect(StaffMember.safeParse(s).error).toBeUndefined();
    for (const s of demo.services) expect(Service.safeParse(s).error).toBeUndefined();
    for (const c of demo.customers) expect(Customer.safeParse(c).error).toBeUndefined();
    for (const b of demo.bookings) expect(Booking.safeParse(b).error).toBeUndefined();
    for (const p of demo.payments) expect(Payment.safeParse(p).error).toBeUndefined();
  });

  it("ids are unique and every reference points at a real record", () => {
    const all = [...demo.staff, ...demo.services, ...demo.customers, ...demo.bookings, ...demo.payments].map(r => r.id);
    expect(new Set(all).size).toBe(all.length);
    const has = (list: { id: string }[], id: string | null) => id === null || list.some(r => r.id === id);
    for (const b of demo.bookings) {
      expect(has(demo.customers, b.customer_id)).toBe(true);
      expect(has(demo.services, b.service_id)).toBe(true);
      expect(has(demo.staff, b.staff_id)).toBe(true);
    }
    for (const p of demo.payments) {
      expect(has(demo.bookings, p.booking_id)).toBe(true);
      expect(has(demo.customers, p.customer_id)).toBe(true);
    }
  });

  it("no staff member is double booked", () => {
    for (const a of demo.bookings) {
      for (const b of demo.bookings) {
        if (a.id >= b.id || a.staff_id !== b.staff_id || a.date !== b.date) continue;
        expect(a.start < b.end && b.start < a.end).toBe(false);
      }
    }
  });

  it("uses only invented contact details", () => {
    for (const person of [...demo.staff, ...demo.customers]) {
      if (person.email) expect(person.email.endsWith("@example.com")).toBe(true);
      if ("phone" in person && person.phone) expect(person.phone).toMatch(/^\+1555010\d{4}$/);
    }
    expect(demo.bookings.some(b => b.date === DEMO_TODAY)).toBe(true);
  });

  it("rejects a customer with no way to reach them and a booking that ends before it starts", () => {
    expect(Customer.safeParse({ ...demo.customers[0], email: null, phone: null }).success).toBe(false);
    expect(Booking.safeParse({ ...demo.bookings[0], start: "11:00", end: "10:00" }).success).toBe(false);
    expect(Payment.safeParse({ ...demo.payments[0], card_number: "4111111111111111" }).success).toBe(false);
  });
});
