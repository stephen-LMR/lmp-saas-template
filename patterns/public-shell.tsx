import type { ReactNode } from "react";

// Layout for pages a merchant's customers see without the staff navigation:
// the public booking page and the customer portal.
export function PublicShell({ merchantName, nav, children }: { merchantName: string; nav?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
              {merchantName.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate font-heading text-lg font-semibold">{merchantName}</span>
          </div>
          {nav}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-6 p-4 md:p-8">{children}</main>
    </div>
  );
}

// Numbered steps of a short flow, such as booking: 1 Service, 2 Time, 3 Your details.
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {steps.map((label, i) => (
        <li key={label} aria-current={i === current ? "step" : undefined} className="flex items-center gap-2">
          <span
            aria-hidden
            className={
              i <= current
                ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                : "flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
            }
          >
            {i + 1}
          </span>
          <span className={i === current ? "font-medium" : "text-muted-foreground"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
