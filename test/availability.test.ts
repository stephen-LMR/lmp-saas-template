import { describe, expect, it } from "vitest";
import { availableSlots, dayOfWeek, daysBetween, isBookable, type SlotInput } from "../modules/booking/availability";
import { BookingSettings } from "../modules/settings";

const settings = BookingSettings.parse({});
const MONDAY = "2026-11-23";
const input = (over: Partial<SlotInput> = {}): SlotInput => ({
  date: MONDAY, durationMinutes: 60, settings, busy: [], now: { date: "2026-11-20", time: "12:00" }, ...over
});

describe("availableSlots", () => {
  it("offers every slot that fits inside business hours", () => {
    const slots = availableSlots(input());
    expect(slots[0]).toBe("09:00");
    expect(slots.at(-1)).toBe("16:00"); // a 60 minute visit must end by 17:00
    expect(slots).toHaveLength(15);
  });

  it("offers nothing on a closed day", () => {
    expect(dayOfWeek("2026-11-22")).toBe(0);
    expect(availableSlots(input({ date: "2026-11-22" }))).toEqual([]);
  });

  it("removes slots that overlap an existing booking", () => {
    const slots = availableSlots(input({ busy: [{ start: "10:00", end: "11:00" }] }));
    expect(slots).not.toContain("09:30");
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("10:30");
    expect(slots).toContain("09:00");
    expect(slots).toContain("11:00");
  });

  it("keeps the buffer free after a booking, on both sides", () => {
    const withBuffer = { ...settings, buffer_minutes: 15 };
    const slots = availableSlots(input({ settings: withBuffer, busy: [{ start: "10:00", end: "11:00" }] }));
    expect(slots).not.toContain("11:00"); // the earlier booking's buffer runs to 11:15
    expect(slots).toContain("11:30");
    expect(slots).not.toContain("09:00"); // this visit plus its own buffer would run to 10:15
    expect(slots).toContain("16:00"); // the buffer after the last visit may run past closing
  });

  it("respects the lead time on the same day", () => {
    const slots = availableSlots(input({ now: { date: MONDAY, time: "09:10" } }));
    expect(slots[0]).toBe("11:30"); // 09:10 plus 2 hours is 11:10, next slot is 11:30
  });

  it("respects the lead time across midnight", () => {
    const long = { ...settings, lead_time_hours: 12 };
    const slots = availableSlots(input({ settings: long, now: { date: "2026-11-22", time: "22:00" } }));
    expect(slots[0]).toBe("10:00"); // 22:00 Sunday plus 12 hours is 10:00 Monday
  });

  it("offers nothing in the past or beyond the booking window", () => {
    expect(availableSlots(input({ now: { date: "2026-11-24", time: "08:00" } }))).toEqual([]);
    expect(daysBetween("2026-09-01", MONDAY)).toBe(83);
    expect(availableSlots(input({ now: { date: "2026-09-01", time: "08:00" } }))).toEqual([]);
  });

  it("offers nothing when the visit is longer than the day", () => {
    expect(availableSlots(input({ durationMinutes: 600 }))).toEqual([]);
  });

  it("rejects a nonsense duration", () => {
    expect(() => availableSlots(input({ durationMinutes: 0 }))).toThrow();
    expect(() => availableSlots(input({ durationMinutes: 22.5 }))).toThrow();
  });
});

describe("isBookable", () => {
  it("accepts an open slot and refuses a taken or off-grid one", () => {
    const busy = [{ start: "10:00", end: "11:00" }];
    expect(isBookable({ ...input({ busy }), start: "11:00" })).toBe(true);
    expect(isBookable({ ...input({ busy }), start: "10:30" })).toBe(false);
    expect(isBookable({ ...input({ busy }), start: "11:07" })).toBe(false);
    expect(isBookable({ ...input({ busy }), start: "23:00" })).toBe(false);
  });
});
