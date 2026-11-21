"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group inline-flex h-6 w-12 shrink-0 items-center rounded-full bg-input p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-checked:bg-primary",
        focusRing,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-card shadow-sm transition-transform group-aria-checked:translate-x-6" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
