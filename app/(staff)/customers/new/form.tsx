"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCustomer } from "@/lib/actions/staff";
import { FormActions, FormSection } from "@/patterns/form";

export function CustomerForm() {
  const [state, action, pending] = useActionState(addCustomer, null);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const props = (id: string) => ({ id, name: id, defaultValue: v[id], "aria-invalid": e[id] ? (true as const) : undefined, "aria-describedby": e[id] ? `${id}-error` : undefined });
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormSection title="Contact" description="An email or a phone number is needed.">
        <Field className="md:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input {...props("name")} autoComplete="off" maxLength={80} required />
          <FieldError id="name-error">{e.name}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input {...props("email")} type="email" autoComplete="off" />
          <FieldError id="email-error">{e.email}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="phone">Phone</Label>
          <Input {...props("phone")} type="tel" inputMode="tel" autoComplete="off" />
          <FieldError id="phone-error">{e.phone}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea {...props("notes")} rows={3} maxLength={2000} />
          <FieldError id="notes-error">{e.notes}</FieldError>
        </Field>
      </FormSection>
      <FormMessage>{e._form}</FormMessage>
      <FormActions>
        <Button asChild variant="outline"><Link href="/customers">Cancel</Link></Button>
        <Button type="submit" disabled={pending}>Save customer</Button>
      </FormActions>
    </form>
  );
}
