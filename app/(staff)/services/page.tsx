import Link from "next/link";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/data/index";
import { formatDuration, formatMoney } from "@/lib/format";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Services" };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ added?: string }> }) {
  const store = await requireStaff();
  const services = await store.services();
  const canManage = store.me.role !== "staff";
  const { added } = await searchParams;
  const add = canManage ? <Button asChild><Link href="/services/new"><Plus aria-hidden />Add service</Link></Button> : undefined;
  return (
    <>
      <PageHeader title="Services" description="What customers can book, how long it takes, and what it costs." action={add} />
      {added === "service" ? <Alert variant="success"><AlertDescription>Service added. It shows on your booking page now.</AlertDescription></Alert> : null}
      {services.length === 0 ? (
        <EmptyState title="No services yet" description={canManage ? "Add your first service so customers can book it." : "The owner or a manager adds services."} />
      ) : (
        <Card>
          <Table aria-label="Services">
            <TableHeader>
              <TableRow><TableHead>Service</TableHead><TableHead>Length</TableHead><TableHead>Price</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {services.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2 font-medium">{s.name}{s.active ? null : <Badge variant="outline">Hidden</Badge>}</span>
                      {s.category ? <span className="text-xs text-muted-foreground">{s.category}</span> : null}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDuration(s.duration_minutes)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatMoney(s.price_cents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
