import * as React from "react";
import { cn } from "@/lib/utils";

// One labelled form row: label, control, optional help text, optional error.
function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p role="alert" data-slot="field-error" className={cn("text-sm font-medium text-danger", className)} {...props}>
      {children}
    </p>
  );
}

export { Field, FieldDescription, FieldError };
