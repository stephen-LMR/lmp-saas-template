// Money math in whole cents. No floats are ever stored or summed.
export function assertCents(n: number, name = "amount"): void {
  if (!Number.isInteger(n) || n < 0) throw new Error(`${name} must be a whole number of cents, zero or more`);
}

// Half-up rounding to the cent, done on integers.
export function percentOf(cents: number, percent: number): number {
  assertCents(cents);
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new Error("percent must be a whole number from 0 to 100");
  return Math.floor((cents * percent + 50) / 100);
}

export type AmountDue = { total_cents: number; due_now_cents: number; due_later_cents: number };

// What a customer pays when they book, given the booking module's payment_at_booking setting.
export function amountDueAtBooking(priceCents: number, mode: "none" | "deposit" | "full", depositPercent: number): AmountDue {
  assertCents(priceCents, "price");
  const dueNow = mode === "full" ? priceCents : mode === "deposit" ? percentOf(priceCents, depositPercent) : 0;
  return { total_cents: priceCents, due_now_cents: dueNow, due_later_cents: priceCents - dueNow };
}

export function withTip(subtotalCents: number, tipPercent: number): { tip_cents: number; total_cents: number } {
  const tip = percentOf(subtotalCents, tipPercent);
  return { tip_cents: tip, total_cents: subtotalCents + tip };
}
