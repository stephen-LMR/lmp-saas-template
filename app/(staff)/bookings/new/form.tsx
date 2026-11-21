"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { addBooking } from "@/lib/actions/staff";
import { FormActions, FormSection } from "@/patterns/form";

type Option = { value: string; label: string };

export function BookingForm({ customers, services, staff, defaults }: { customers: Option[]; services: Option[]; staff: Option[]; defaults: Record<string, string> }) {
  const [state, action, pending] = useActionState(addBooking, null);
  const e = state?.errors ?? {};
  const v = state?.values ?? defaults;
  const props = (id: string) => ({ id, name: id, defaultValue: v[id], "aria-invalid": e[id] ? (true as const) : undefined, "aria-describedby": e[id] ? `${id}-error` : undefined });
  const select = (id: string, label: string, options: Option[], placeholder: string) => (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect {...props(id)} required>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </NativeSelect>
      <FieldError id={`${id}-error`}>{e[id]}</FieldError>
    </Field>
  );
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormSection title="Booking">
        {select("customer", "Customer", customers, "Choose a customer")}
        {select("service", "Service", services, "Choose a service")}
        {select("staff", "With", staff, "Choose who will do it")}
        <Field>
          <Label htmlFor="date">Date</Label>
          <Input {...props("date")} type="date" required />
          <FieldError id="date-error">{e.date}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="time">Start time</Label>
          <Input {...props("time")} type="time" step={300} required />
          <FieldError id="time-error">{e.time}</FieldError>
        </Field>
      </FormSection>
      <FormMessage>{e._form}</FormMessage>
      <FormActions>
        <Button asChild variant="outline"><Link href="/calendar">Cancel</Link></Button>
        <Button type="submit" disabled={pending}>Save booking</Button>
      </FormActions>
    </form>
  );
}
