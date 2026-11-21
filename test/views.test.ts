import { describe, expect, it } from "vitest";
import { nowIn } from "../data/clock";
import { addDays, addMinutes, agenda, customerRows, dashboardStats, openSlots } from "../data/views";
import { BookingSettings } from "../modules/settings";
import { demo, DEMO_TODAY } from "../seed/demo";

const settings = BookingSettings.parse({});
const [dana, lee] = demo.staff.map(s => s.id) as [string, string];

describe("customer list", () => {
  const rows = customerRows(demo.customers, demo.bookings, DEMO_TODAY);
  it("is in name order", () => expect(rows.map(r => r.name)).toEqual([...rows.map(r => r.name)].sort()));
  it("counts visits up to today and leaves out no-shows", () => {
    expect(rows.find(r => r.name === "Maria Alvarez")).toMatchObject({ visits: 2, last_visit: DEMO_TODAY });
    expect(rows.find(r => r.name === "Tom Becker")).toMatchObject({ visits: 0, last_visit: null });
  });
  it("does not count a future booking as a visit", () => {
    expect(customerRows(demo.customers, demo.bookings, "2026-11-20").find(r => r.name === "Maria Alvarez")).toMatchObject({ visits: 1, last_visit: "2026-11-18" });
  });
});

describe("agenda", () => {
  it("is in time order, names people, and hides cancelled bookings", () => {
    const today = demo.bookings.filter(b => b.date === DEMO_TODAY);
    const cancelled = { ...today[0]!, id: "x", status: "cancelled" as const, start: "08:00" };
    const rows = agenda([...today].reverse().concat(cancelled), demo.services, demo.customers, demo.staff);
    expect(rows.map(r => r.start)).toEqual(["09:00", "10:45", "13:00", "14:30"]);
    expect(rows[0]).toMatchObject({ service: "Full groom", customer: "Maria Alvarez", staff: "Dana" });
  });
});

describe("open times", () => {
  const busy = [{ staff_id: dana, start: "10:00", end: "12:00" }];
  const run = (staff_ids: string[], b = busy) =>
    openSlots({ date: DEMO_TODAY, service: { duration_minutes: 60 }, settings, staff_ids, busy: b, now: { date: DEMO_TODAY, time: "08:00" } });

  it("a time is open when anyone is free, and lists who", () => {
    const slots = run([dana, lee]);
    expect(slots.find(s => s.time === "10:00")?.staff_ids).toEqual([lee]);
    expect(slots.find(s => s.time === "13:00")?.staff_ids).toEqual([dana, lee]);
  });
  it("a time is closed when everyone is busy", () => {
    expect(run([dana]).map(s => s.time)).not.toContain("10:00");
    expect(run([dana]).map(s => s.time)).not.toContain("11:30");
  });
  it("respects the lead time", () => expect(run([dana, lee])[0]?.time).toBe("10:00"));
  it("is empty with no staff", () => expect(run([])).toEqual([]));
});

describe("time math", () => {
  it("adds minutes and stops at midnight", () => {
    expect(addMinutes("09:00", 90)).toBe("10:30");
    expect(addMinutes("23:00", 60)).toBe("23:59");
    expect(addMinutes("23:30", 60)).toBeNull();
  });
  it("adds days across months and years", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("reads the business's own clock", () => {
    const at = new Date("2026-11-23T03:30:00Z");
    expect(nowIn("America/Los_Angeles", at)).toEqual({ date: "2026-11-22", time: "19:30" });
    expect(nowIn("Asia/Tokyo", at)).toEqual({ date: "2026-11-23", time: "12:30" });
  });
});

describe("dashboard", () => {
  it("counts today and the last week", () => {
    expect(dashboardStats(demo.bookings, demo.payments, demo.customers, DEMO_TODAY)).toEqual({
      bookings_today: 4, still_open: 1, no_shows_week: 1, customers: 5, paid_cents: 4500 + 800 + 1700
    });
  });
});

describe("booking settings", () => {
  it("defaults to a real time zone and refuses a made-up one", () => {
    expect(settings.time_zone).toBe("America/New_York");
    expect(BookingSettings.safeParse({ time_zone: "Mars/Olympus" }).success).toBe(false);
  });
});
