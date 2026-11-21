"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const overlay = "fixed inset-0 z-40 bg-neutral-950/50 state-open:animate-in state-open:fade-in-0 state-closed:animate-out state-closed:fade-out-0";
const closeButton = cn("absolute top-3 right-3 rounded-sm p-2 text-muted-foreground hover:bg-muted hover:text-foreground", focusRing);

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlay} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed inset-x-4 top-1/2 z-50 flex max-h-dvh -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4 text-card-foreground shadow-lg state-open:animate-in state-open:fade-in-0 state-closed:animate-out state-closed:fade-out-0 md:inset-x-auto md:left-1/2 md:w-1/2 md:-translate-x-1/2 md:p-6 xl:w-1/3",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={closeButton}>
          <X aria-hidden className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1 pr-8", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 md:flex-row md:justify-end", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

// A panel that slides over from the left. Used for the navigation on phones.
function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlay} />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-3/4 flex-col gap-4 overflow-y-auto border-r bg-card p-4 text-card-foreground shadow-lg state-open:animate-in state-open:slide-in-from-left state-closed:animate-out state-closed:slide-out-to-left md:w-1/3",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={closeButton}>
          <X aria-hidden className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Dialog as Sheet, DialogClose as SheetClose, SheetContent, DialogDescription as SheetDescription,
  DialogTitle as SheetTitle, DialogTrigger as SheetTrigger
};
