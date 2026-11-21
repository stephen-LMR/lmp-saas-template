"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/data/index";
import { DataProblem } from "@/data/types";
import { addMinutes } from "@/data/views";
import { parseCustomerForm, parseServiceForm, parseStaffBooking } from "@/modules/forms";
import { typed, type FormState } from "./state";

// Every action checks who is signed in and re-checks every field. The database checks again.

const problem = (e: unknown, values: Record<string, string>, field = "_form"): FormState => {
  if (e instanceof DataProblem) return { errors: { [e.code === "duplicate_email" ? "email" : field]: e.message }, values };
  throw e;
};

export async function addService(_prev: FormState, form: FormData): Promise<FormState> {
  const store = await requireStaff();
  const values = typed(form, ["name", "description", "category", "minutes", "price"]);
  const parsed = parseServiceForm(form);
  if (!parsed.ok) return { errors: parsed.errors, values };
  try {
    await store.createService(parsed.data);
  } catch (e) {
    return problem(e, values);
  }
  revalidatePath("/services");
  redirect("/services?added=service");
}

export async function addCustomer(_prev: FormState, form: FormData): Promise<FormState> {
  const store = await requireStaff();
  const values = typed(form, ["name", "email", "phone", "notes"]);
  const parsed = parseCustomerForm(form);
  if (!parsed.ok) return { errors: parsed.errors, values };
  let id: string;
  try {
    id = (await store.createCustomer(parsed.data)).id;
  } catch (e) {
    return problem(e, values);
  }
  revalidatePath("/customers");
  redirect(`/customers/${id}?added=customer`);
}

export async function addBooking(_prev: FormState, form: FormData): Promise<FormState> {
  const store = await requireStaff();
  const values = typed(form, ["customer", "service", "staff", "date", "time"]);
  const parsed = parseStaffBooking(form);
  if (!parsed.ok) return { errors: parsed.errors, values };
  const [services, customers, staff] = await Promise.all([store.services(), store.customers(), store.staff()]);
  const service = services.find(s => s.id === parsed.data.service_id);
  if (!service) return { errors: { service: "Choose a service" }, values };
  if (!customers.some(c => c.id === parsed.data.customer_id)) return { errors: { customer: "Choose a customer" }, values };
  if (!staff.some(s => s.id === parsed.data.staff_id && s.active)) return { errors: { staff: "Choose who will do it" }, values };
  const end = addMinutes(parsed.data.time, service.duration_minutes);
  if (!end) return { errors: { time: "That would run past midnight. Pick an earlier time." }, values };
  try {
    await store.createBooking({
      customer_id: parsed.data.customer_id, service_id: service.id, staff_id: parsed.data.staff_id,
      date: parsed.data.date, start: parsed.data.time, end, price_cents: service.price_cents
    });
  } catch (e) {
    if (e instanceof DataProblem && e.code === "slot_taken") return { errors: { time: "That person is already booked then. Pick another time or person." }, values };
    return problem(e, values);
  }
  revalidatePath("/calendar");
  redirect(`/calendar?date=${parsed.data.date}`);
}
