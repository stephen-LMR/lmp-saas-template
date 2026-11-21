import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessNow, requireStaff } from "@/data/index";
import { customerRows } from "@/data/views";
import { formatShortDay } from "@/lib/format";
import { formatPhone } from "@/modules/forms";
import { DataList } from "@/patterns/list-detail";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const store = await requireStaff();
  const { q = "" } = await searchParams;
  const term = q.trim().toLowerCase().slice(0, 80);
  const digits = term.replace(/\D/g, "");
  const [customers, bookings] = await Promise.all([store.customers(), store.bookings()]);
  const rows = customerRows(customers, bookings, businessNow().date).filter(c =>
    !term || c.name.toLowerCase().includes(term) || (c.email ?? "").includes(term) || (digits.length >= 3 && (c.phone ?? "").includes(digits))
  );
  return (
    <>
      <PageHeader title="Customers" description="Everyone who has booked with you."
        action={<Button asChild><Link href="/customers/new"><Plus aria-hidden />Add customer</Link></Button>} />
      <form role="search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">Search customers</label>
        <Input id="q" name="q" type="search" placeholder="Search by name, email, or phone" defaultValue={q} />
        <Button type="submit" variant="outline"><Search aria-hidden />Search</Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title={term ? "No customers match" : "No customers yet"} description={term ? "Try a different name, email, or phone." : "Customers are added when they book, or you can add one."} />
      ) : (
        <DataList label="Customers" rows={rows} hrefFor={c => `/customers/${c.id}`} columns={[
          { header: "Name", cell: c => c.name },
          { header: "Contact", cell: c => c.email ?? (c.phone ? formatPhone(c.phone) : "") },
          { header: "Visits", cell: c => `${c.visits} ${c.visits === 1 ? "visit" : "visits"}` },
          { header: "Last visit", cell: c => (c.last_visit ? formatShortDay(c.last_visit) : "None yet") },
          { header: "Tags", cell: c => c.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>) }
        ]} />
      )}
    </>
  );
}
