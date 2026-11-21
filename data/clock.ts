// "Now" on the business's own clock, as the calendar day and time its staff would say.
import type { LocalNow } from "../modules/booking/availability";

export function nowIn(timeZone: string, at: Date = new Date()): LocalNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(at);
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
