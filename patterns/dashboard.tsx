import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Stat = { label: string; value: string; note?: string };

// The row of headline numbers at the top of a dashboard.
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map(s => (
        <Card key={s.label} className="flex flex-col gap-1 p-4">
          <dt className="text-sm text-muted-foreground">{s.label}</dt>
          <dd className="font-heading text-xl font-semibold">{s.value}</dd>
          {s.note ? <dd className="text-xs text-muted-foreground">{s.note}</dd> : null}
        </Card>
      ))}
    </dl>
  );
}

// A titled panel on a dashboard. Panels sit two across on wide screens.
export function DashboardPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DashboardPanels({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{children}</div>;
}

// A plain list of rows inside a panel: main text, secondary text, and something on the right.
export function PanelList({ items }: { items: { id: string; title: string; subtitle: string; trailing?: ReactNode }[] }) {
  return (
    <ul className="flex flex-col divide-y">
      {items.map(item => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{item.title}</span>
            <span className="truncate text-sm text-muted-foreground">{item.subtitle}</span>
          </div>
          {item.trailing ? <div className="shrink-0 text-sm">{item.trailing}</div> : null}
        </li>
      ))}
    </ul>
  );
}
