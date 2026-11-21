"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth";

export function SignInForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState(signIn, null);
  if (state?.done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 text-center">
        <MailCheck aria-hidden className="size-8 text-primary" />
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-muted-foreground">If {state.done} is on the team, a sign-in link is on its way. It works once and expires in an hour.</p>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.values.email}
          aria-invalid={state?.errors.email ? true : undefined} aria-describedby={state?.errors.email ? "email-error" : demo ? "email-help" : undefined} />
        <FieldError id="email-error">{state?.errors.email}</FieldError>
        {demo ? <FieldDescription id="email-help">Demo: dana@example.com (owner) or lee@example.com (staff).</FieldDescription> : null}
      </Field>
      <FormMessage>{state?.errors._form}</FormMessage>
      <Button type="submit" disabled={pending}>{demo ? "Sign in" : "Email me a sign-in link"}</Button>
    </form>
  );
}
