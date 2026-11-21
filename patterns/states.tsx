import type { ReactNode } from "react";
import { CircleAlert, Inbox, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// The empty, loading, and error states every list and form uses (docs/DESIGN.md).

function StateFrame({ children, role }: { children: ReactNode; role?: "status" | "alert" }) {
  return (
    <div role={role} className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-card p-8 text-center">
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox, title, description, action
}: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <StateFrame>
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Icon aria-hidden className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </StateFrame>
  );
}

export function ErrorState({
  title = "Something went wrong", description = "Please try again. If it keeps happening, contact us.", action
}: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <StateFrame role="alert">
      <div className="rounded-full bg-muted p-3 text-danger">
        <CircleAlert aria-hidden className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </StateFrame>
  );
}

export function LoadingState({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
