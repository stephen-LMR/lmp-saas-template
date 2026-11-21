"use server";

import { redirect } from "next/navigation";
import { bookingSettings, businessNow, publicStore } from "@/data/index";
import { DataProblem } from "@/data/types";
import { addMinutes, openSlots } from "@/data/views";
import { parsePublicBooking } from "@/modules/forms";
import { typed, type FormState } from "./state";

// A customer books from the public page. Nothing the browser sends is trusted: the service,
// the time, and who is free are all worked out again here, and the database refuses a double
// booking even if two people press Confirm at the same moment.
export async function bookVisit(_prev: FormState, form: FormData): Promise<FormState> {
  const values = typed(form, ["service", "date", "time", "name", "email"]);
  const parsed = parsePublicBooking(form);
  if (!parsed.ok) return { errors: parsed.errors, values };
  const { service_id, date, time, name, email } = parsed.data;

  const store = publicStore();
  const service = (await store.services()).find(s => s.id === service_id);
  if (!service) return { errors: { service: "That service is not available. Choose another." }, values };

  const { staff_ids, busy } = await store.availability(date);
  const slot = openSlots({ date, service, settings: bookingSettings(), staff_ids, busy, now: businessNow() }).find(s => s.time === time);
  if (!slot) return { errors: { time: "That time is no longer open. Choose another." }, values };
  const end = addMinutes(time, service.duration_minutes)!;

  try {
    await store.book({ service, date, start: time, end, name, email, staff_ids: slot.staff_ids });
  } catch (e) {
    if (e instanceof DataProblem && e.code === "slot_taken") return { errors: { time: "Someone just booked that time. Choose another." }, values };
    throw e;
  }
  redirect(`/book/done?${new URLSearchParams({ service: service.id, date, time })}`);
}
