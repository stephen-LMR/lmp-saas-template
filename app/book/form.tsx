"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookVisit } from "@/lib/actions/public";
import { ChoiceGrid } from "@/patterns/booking";

// Step 2 and 3 of booking: pick a time, then say who you are.
export function BookingDetails({ serviceId, date, dayLabel, times, summary }: {
  serviceId: string; date: string; dayLabel: string; times: { value: string; label: string }[]; summary: { service: string; price: string } | null;
}) {
  const [state, action, pending] = useActionState(bookVisit, null);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const props = (id: string) => ({ id, name: id, defaultValue: v[id], "aria-invalid": e[id] ? (true as const) : undefined, "aria-describedby": e[id] ? `${id}-error` : undefined });
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="service" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <Card>
        <CardContent className="flex flex-col gap-2 pt-4 md:pt-6">
          {/* Re-keyed when the day changes so a time picked for another day is cleared. */}
          <ChoiceGrid key={date} name="time" legend={`Times on ${dayLabel}`} defaultValue={v.time} options={times} />
          <FieldError id="time-error">{e.time ?? e.service ?? e.date}</FieldError>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field>
            <Label htmlFor="name">Your name</Label>
            <Input {...props("name")} autoComplete="name" maxLength={80} required />
            <FieldError id="name-error">{e.name}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input {...props("email")} type="email" autoComplete="email" required />
            <FieldError id="email-error">{e.email}</FieldError>
          </Field>
        </CardContent>
      </Card>
      {summary ? (
        <p className="text-sm text-muted-foreground">{summary.service}, {summary.price}. Pay at your visit.</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full md:w-fit">Confirm booking</Button>
    </form>
  );
}
