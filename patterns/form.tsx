import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// A form is one or more titled sections. Fields sit two across from tablet width up.
export function FormSection({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}

// The buttons at the end of a form. The primary action comes first on phones and last on wider screens.
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">{children}</div>;
}

// A settings row: what the setting is on the left, its control on the right.
export function SettingRow({ id, label, description, control }: { id: string; label: string; description: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor={id} className="font-medium">{label}</label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function SettingsGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col divide-y">{children}</CardContent>
    </Card>
  );
}
