// Display helpers. Money is always held in cents and only formatted at the edge.
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const day = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export const formatMoney = (cents: number) => usd.format(cents / 100);

// "2026-11-23" becomes "Monday, November 23". Dates without a time are treated as calendar days.
export const formatDay = (isoDate: string) => day.format(new Date(`${isoDate}T00:00:00Z`));
export const formatShortDay = (isoDate: string) => shortDay.format(new Date(`${isoDate}T00:00:00Z`));

// "14:30" becomes "2:30 PM".
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : minutes % 60 === 0 ? `${minutes / 60} hr` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join("");
