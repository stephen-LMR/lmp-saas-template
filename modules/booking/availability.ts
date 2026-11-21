// Which start times a customer can book on one day. Pure math on the business's own clock:
// a day is "YYYY-MM-DD" and a time is "HH:MM" as the business sees it, so there is no
// time zone conversion in here to get wrong. The caller supplies "now" in the same terms.
import type { BookingSettings } from "../settings";

export type Busy = { start: string; end: string }; // an existing booking or a block on this day
export type LocalNow = { date: string; time: string };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
};
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// Whole days from a to b, both "YYYY-MM-DD". Negative when b is before a.
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

// 0 is Sunday, matching BookingSettings.business_hours.
export const dayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

export type SlotInput = {
  date: string;
  durationMinutes: number;
  settings: Pick<BookingSettings, "slot_minutes" | "lead_time_hours" | "max_advance_days" | "buffer_minutes" | "business_hours">;
  busy: Busy[];
  now: LocalNow;
};

export function availableSlots({ date, durationMinutes, settings, busy, now }: SlotInput): string[] {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) throw new Error("durationMinutes must be a positive whole number");
  const ahead = daysBetween(now.date, date);
  if (ahead < 0 || ahead > settings.max_advance_days) return [];
  const hours = settings.business_hours.find(d => d.day === dayOfWeek(date));
  if (!hours) return [];

  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  // Minutes from now until the start of the requested day, then the lead time on top.
  const earliest = toMinutes(now.time) + settings.lead_time_hours * 60 - ahead * 1440;
  const taken = busy.map(b => ({ start: toMinutes(b.start), end: toMinutes(b.end) + settings.buffer_minutes }));

  const slots: string[] = [];
  for (let start = open; start + durationMinutes <= close; start += settings.slot_minutes) {
    if (start < earliest) continue;
    const end = start + durationMinutes + settings.buffer_minutes;
    if (taken.some(t => start < t.end && t.start < end)) continue;
    slots.push(toTime(start));
  }
  return slots;
}

// The server-side check before a booking is saved: the browser's choice is never trusted.
export function isBookable(input: SlotInput & { start: string }): boolean {
  return availableSlots(input).includes(input.start);
}
