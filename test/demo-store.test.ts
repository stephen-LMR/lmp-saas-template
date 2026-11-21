import { beforeEach, describe, expect, it } from "vitest";
import { demoPublicStore, demoStaffByEmail, demoStaffStore, resetDemo } from "../data/demo";
import { DataProblem } from "../data/types";
import { DEMO_TODAY } from "../seed/demo";

// The demo records follow the same rules as the database, so tests and previews behave like the real app.
beforeEach(() => resetDemo());
const owner = () => demoStaffStore(demoStaffByEmail("dana@example.com")!);
const staffer = () => demoStaffStore(demoStaffByEmail("LEE@example.com ")!);

describe("demo records", () => {
  it("finds staff by email whatever the case and spaces, and nobody else", () => {
    expect(demoStaffByEmail(" Dana@Example.com")?.role).toBe("owner");
    expect(demoStaffByEmail("maria@example.com")).toBeNull();
  });

  it("only the owner or a manager can add a service", async () => {
    const input = { name: "Teeth", description: "", category: null, duration_minutes: 15, price_cents: 1000 };
    await expect(staffer().createService(input)).rejects.toMatchObject({ code: "not_allowed" });
    await owner().createService(input);
    expect((await owner().services()).some(s => s.name === "Teeth")).toBe(true);
  });

  it("refuses a second customer with the same email", async () => {
    await expect(owner().createCustomer({ name: "Other Maria", email: "maria@example.com", phone: null, notes: "" })).rejects.toBeInstanceOf(DataProblem);
  });

  it("never double books a staff member", async () => {
    const [b] = await owner().bookings({ date: DEMO_TODAY });
    const clash = { customer_id: b!.customer_id, service_id: b!.service_id, staff_id: b!.staff_id!, date: DEMO_TODAY, start: "09:30", end: "10:00", price_cents: 100 };
    await expect(owner().createBooking(clash)).rejects.toMatchObject({ code: "slot_taken" });
    await expect(owner().createBooking({ ...clash, start: "10:30", end: "10:45" })).resolves.toMatchObject({ status: "booked" });
  });

  it("a public booking takes the next free person and makes the customer once", async () => {
    const service = (await demoPublicStore.services())[0]!;
    const { staff_ids } = await demoPublicStore.availability(DEMO_TODAY);
    const args = { service, date: DEMO_TODAY, start: "09:00", end: "10:30", name: "New Person", email: "new@example.com", staff_ids };
    await demoPublicStore.book(args); // Dana is busy at 9, so Lee gets it
    await expect(demoPublicStore.book(args)).rejects.toMatchObject({ code: "slot_taken" });
    const made = (await owner().customers()).filter(c => c.email === "new@example.com");
    expect(made).toHaveLength(1);
    const lee = demoStaffByEmail("lee@example.com")!;
    expect((await owner().bookings({ date: DEMO_TODAY })).some(b => b.customer_id === made[0]!.id && b.staff_id === lee.id)).toBe(true);
  });

  it("the public page shows only active services", async () => {
    expect((await demoPublicStore.services()).every(s => s.active)).toBe(true);
    expect((await demoPublicStore.services()).some(s => s.name === "Puppy intro")).toBe(false);
  });

  it("an existing customer's name is not changed by a public booking", async () => {
    const service = (await demoPublicStore.services())[0]!;
    await demoPublicStore.book({ service, date: "2026-11-24", start: "13:00", end: "14:30", name: "Somebody Else", email: "maria@example.com", staff_ids: [demoStaffByEmail("dana@example.com")!.id] });
    expect((await owner().customers()).find(c => c.email === "maria@example.com")?.name).toBe("Maria Alvarez");
  });
});
