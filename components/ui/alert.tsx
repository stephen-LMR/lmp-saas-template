import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground [&>svg]:mt-1 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      info: "[&>svg]:text-primary",
      success: "border-success [&>svg]:text-success",
      warning: "border-warning [&>svg]:text-foreground",
      danger: "border-danger [&>svg]:text-danger"
    }
  },
  defaultVariants: { variant: "info" }
});

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };

function Alert({ className, variant = "info", children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const Icon = ICONS[variant ?? "info"];
  return (
    <div role={variant === "danger" ? "alert" : "status"} data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon aria-hidden />
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="alert-title" className={cn("font-medium", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="alert-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
