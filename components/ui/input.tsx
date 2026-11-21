import * as React from "react";
import { cn } from "@/lib/utils";
import { controlBase, focusRing } from "./styles";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(controlBase, focusRing, className)} {...props} />;
}

export { Input };
