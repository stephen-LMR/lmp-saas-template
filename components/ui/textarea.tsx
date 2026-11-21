import * as React from "react";
import { cn } from "@/lib/utils";
import { controlBase, focusRing } from "./styles";

function Textarea({ className, rows = 4, ...props }: React.ComponentProps<"textarea">) {
  return <textarea rows={rows} data-slot="textarea" className={cn(controlBase, focusRing, className)} {...props} />;
}

export { Textarea };
