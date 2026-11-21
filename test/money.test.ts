import { describe, expect, it } from "vitest";
import { amountDueAtBooking, percentOf, withTip } from "../modules/payments/money";

describe("money", () => {
  it("rounds half up to the cent", () => {
    expect(percentOf(8500, 20)).toBe(1700);
    expect(percentOf(999, 15)).toBe(150);  // 149.85
    expect(percentOf(1, 50)).toBe(1);      // 0.5
    expect(percentOf(1, 49)).toBe(0);      // 0.49
    expect(percentOf(0, 20)).toBe(0);
  });

  it("splits a booking into due now and due later, always adding up", () => {
    expect(amountDueAtBooking(8500, "none", 20)).toEqual({ total_cents: 8500, due_now_cents: 0, due_later_cents: 8500 });
    expect(amountDueAtBooking(8500, "deposit", 20)).toEqual({ total_cents: 8500, due_now_cents: 1700, due_later_cents: 6800 });
    expect(amountDueAtBooking(8500, "full", 20)).toEqual({ total_cents: 8500, due_now_cents: 8500, due_later_cents: 0 });
    for (const price of [1, 33, 999, 12345]) {
      for (const pct of [1, 33, 50, 99, 100]) {
        const d = amountDueAtBooking(price, "deposit", pct);
        expect(d.due_now_cents + d.due_later_cents).toBe(price);
      }
    }
  });

  it("adds a tip", () => {
    expect(withTip(4500, 18)).toEqual({ tip_cents: 810, total_cents: 5310 });
  });

  it("refuses fractions of a cent, negatives, and bad percents", () => {
    expect(() => percentOf(10.5, 20)).toThrow();
    expect(() => percentOf(-1, 20)).toThrow();
    expect(() => percentOf(100, 101)).toThrow();
    expect(() => amountDueAtBooking(85.0001, "full", 20)).toThrow();
  });
});
