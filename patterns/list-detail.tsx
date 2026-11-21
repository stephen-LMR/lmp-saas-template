import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Column<Row> = { header: string; cell: (row: Row) => ReactNode };

// A list of records: a table from tablet width up, a stack of tappable cards on phones.
// The first column is the record's name and links to its detail page.
export function DataList<Row extends { id: string }>({
  rows, columns, hrefFor, label
}: { rows: Row[]; columns: [Column<Row>, ...Column<Row>[]]; hrefFor: (row: Row) => string; label: string }) {
  const [first, ...rest] = columns;
  return (
    <>
      <Card className="hidden md:block">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow>
              {columns.map(c => <TableHead key={c.header}>{c.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <Link href={hrefFor(row)} className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                    {first.cell(row)}
                  </Link>
                </TableCell>
                {rest.map(c => <TableCell key={c.header}>{c.cell(row)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ul aria-label={label} className="flex flex-col gap-3 md:hidden">
        {rows.map(row => (
          <li key={row.id}>
            <Link href={hrefFor(row)} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium">{first.cell(row)}</span>
                {rest.map(c => (
                  <span key={c.header} className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    <span className="sr-only">{c.header}: </span>
                    {c.cell(row)}
                  </span>
                ))}
              </div>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

// The detail side of list + detail: labelled facts about one record.
export function DetailCard({ title, facts, children }: { title: string; facts: { label: string; value: ReactNode }[]; children?: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-4 md:grid-cols-2">
          {facts.map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">{f.label}</dt>
              <dd className="font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
        {children}
      </CardContent>
    </Card>
  );
}
