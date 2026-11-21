"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDay, formatTime } from "@/lib/format";

// Day navigation for a calendar: previous day, the date, next day.
export function DayNav({ date, prevHref, nextHref }: { date: string; prevHref: string; nextHref: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2">
      <Button asChild variant="ghost" size="icon">
        <Link href={prevHref} aria-label="Previous day"><ChevronLeft aria-hidden /></Link>
      </Button>
      <h2 className="text-base font-semibold md:text-lg">{formatDay(date)}</h2>
      <Button asChild variant="ghost" size="icon">
        <Link href={nextHref} aria-label="Next day"><ChevronRight aria-hidden /></Link>
      </Button>
    </div>
  );
}

export type AgendaItem = { id: string; start: string; end: string; title: string; subtitle: string; trailing?: ReactNode };

// One day's appointments in time order.
export function DayAgenda({ items }: { items: AgendaItem[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map(item => (
        <li key={item.id} className="min-w-0">
          <Card className="flex items-center gap-3 p-4 md:gap-4">
            <div className="flex w-1/4 shrink-0 flex-col text-sm md:w-1/6">
              <span className="font-semibold">{formatTime(item.start)}</span>
              <span className="text-muted-foreground">{formatTime(item.end)}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col border-l-2 border-primary pl-4">
              <span className="truncate font-medium">{item.title}</span>
              <span className="truncate text-sm text-muted-foreground">{item.subtitle}</span>
            </div>
            {item.trailing ? <div className="shrink-0">{item.trailing}</div> : null}
          </Card>
        </li>
      ))}
    </ol>
  );
}

// Pick one option from a set of tappable tiles (a service, a time). One choice at a time.
export function ChoiceGrid({
  name, legend, options, defaultValue, columns = "times"
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; detail?: string; disabled?: boolean }[];
  defaultValue?: string;
  columns?: "times" | "cards";
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <input type="hidden" name={name} value={value} />
      <div className={cn("grid gap-2", columns === "times" ? "grid-cols-3 md:grid-cols-4 xl:grid-cols-6" : "grid-cols-1 md:grid-cols-2")}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            aria-pressed={value === o.value}
            onClick={() => setValue(o.value)}
            className={cn(
              "flex flex-col rounded-sm border border-input bg-card px-3 py-2 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:line-through",
              "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground",
              columns === "times" ? "items-center text-sm font-medium" : "items-start gap-1 text-left"
            )}
          >
            <span className="font-medium">{o.label}</span>
            {o.detail ? <span className="text-sm opacity-90">{o.detail}</span> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
