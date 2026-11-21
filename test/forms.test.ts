import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone, parseCustomerForm, parsePrice, parsePublicBooking, parseServiceForm, parseStaffBooking } from "../modules/forms";

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const UUID = "00000000-0000-4000-8002-000000000001";

describe("prices", () => {
  it.each([["85", 8500], ["85.5", 8550], ["$85.00", 8500], ["1,200", 120000], [" 0.99 ", 99], ["0", 0]])("%s is %i cents", (t, c) => expect(parsePrice(t)).toBe(c));
  it.each(["", "abc", "-5", "85.999", "1e3", "$", "12.3.4", "9999999"])("refuses %j", t => expect(parsePrice(t)).toBeNull());
});

describe("phones", () => {
  it.each([["(555) 010-0101", "+15550100101"], ["555.010.0101", "+15550100101"], ["1 555 010 0101", "+15550100101"], ["+44 20 7946 0958", "+442079460958"]])("%s becomes %s", (t, e) => expect(normalizePhone(t)).toBe(e));
  it.each(["123", "055 010 0101", "+0123456789", "phone", "555-0101"])("refuses %j", t => expect(normalizePhone(t)).toBeNull());
  it("shows US numbers the usual way and others as stored", () => {
    expect(formatPhone("+15550100101")).toBe("(555) 010-0101");
    expect(formatPhone("+442079460958")).toBe("+442079460958");
  });
});

describe("service form", () => {
  it("accepts a good service", () => {
    expect(parseServiceForm(fd({ name: " Full groom ", description: "", category: "", minutes: "90", price: "85" }))).toEqual({
      ok: true, data: { name: "Full groom", description: "", category: null, duration_minutes: 90, price_cents: 8500 }
    });
  });
  it("names every problem at once", () => {
    const r = parseServiceForm(fd({ name: "", minutes: "3", price: "free" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["minutes", "name", "price"]);
  });
  it("refuses a length that is not a whole number", () => {
    const r = parseServiceForm(fd({ name: "A", minutes: "30.5", price: "1" }));
    expect(r.ok).toBe(false);
  });
});

describe("customer form", () => {
  it("lowercases the email and stores the phone in one format", () => {
    expect(parseCustomerForm(fd({ name: "Ann", email: "ANN@Example.com", phone: "555 010 0199", notes: "" }))).toEqual({
      ok: true, data: { name: "Ann", email: "ann@example.com", phone: "+15550100199", notes: "" }
    });
  });
  it("needs an email or a phone", () => {
    const r = parseCustomerForm(fd({ name: "Ann", email: "", phone: "" }));
    expect(r).toEqual({ ok: false, errors: { email: "Enter an email or a phone number" } });
  });
  it("refuses a bad email and a bad phone", () => {
    const r = parseCustomerForm(fd({ name: "Ann", email: "ann@", phone: "12" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "phone"]);
  });
});

describe("booking forms", () => {
  it("accepts a public booking", () => {
    const r = parsePublicBooking(fd({ service: UUID, date: "2026-11-23", time: "10:00", name: "Ann", email: "Ann@Example.com" }));
    expect(r).toEqual({ ok: true, data: { service_id: UUID, date: "2026-11-23", time: "10:00", name: "Ann", email: "ann@example.com" } });
  });
  it.each([
    ["service", { service: "../etc" }], ["date", { date: "2026-13-40" }], ["time", { time: "25:00" }], ["time", { time: "" }], ["email", { email: "nope" }], ["name", { name: "" }]
  ])("refuses a bad %s", (field, bad) => {
    const r = parsePublicBooking(fd({ service: UUID, date: "2026-11-23", time: "10:00", name: "Ann", email: "a@example.com", ...bad }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[field]).toBeTruthy();
  });
  it("needs every field for a staff booking", () => {
    const r = parseStaffBooking(fd({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["customer", "date", "service", "staff", "time"]);
  });
});
