"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addService } from "@/lib/actions/staff";
import { FormActions, FormSection } from "@/patterns/form";

const invalid = (e?: string) => (e ? { "aria-invalid": true as const } : {});

export function ServiceForm() {
  const [state, action, pending] = useActionState(addService, null);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const described = (id: string, help?: boolean) => [e[id] ? `${id}-error` : null, help ? `${id}-help` : null].filter(Boolean).join(" ") || undefined;
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormSection title="Details" description="Shown to customers on your booking page.">
        <Field>
          <Label htmlFor="name">Service name</Label>
          <Input id="name" name="name" required maxLength={80} defaultValue={v.name} {...invalid(e.name)} aria-describedby={described("name")} />
          <FieldError id="name-error">{e.name}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="category">Category (optional)</Label>
          <Input id="category" name="category" maxLength={40} defaultValue={v.category} {...invalid(e.category)} aria-describedby={described("category")} />
          <FieldError id="category-error">{e.category}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" name="description" rows={3} maxLength={500} defaultValue={v.description} {...invalid(e.description)} aria-describedby={described("description", true)} />
          <FieldDescription id="description-help">One or two sentences is plenty.</FieldDescription>
          <FieldError id="description-error">{e.description}</FieldError>
        </Field>
      </FormSection>
      <FormSection title="Time and price">
        <Field>
          <Label htmlFor="minutes">Length in minutes</Label>
          <Input id="minutes" name="minutes" type="number" inputMode="numeric" min={5} max={480} required defaultValue={v.minutes} {...invalid(e.minutes)} aria-describedby={described("minutes")} />
          <FieldError id="minutes-error">{e.minutes}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" inputMode="decimal" placeholder="85.00" required defaultValue={v.price} {...invalid(e.price)} aria-describedby={described("price")} />
          <FieldError id="price-error">{e.price}</FieldError>
        </Field>
      </FormSection>
      <FormMessage>{e._form}</FormMessage>
      <FormActions>
        <Button asChild variant="outline"><Link href="/services">Cancel</Link></Button>
        <Button type="submit" disabled={pending}>Save service</Button>
      </FormActions>
    </form>
  );
}
