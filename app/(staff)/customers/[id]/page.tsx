import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessNow, requireStaff } from "@/data/index";
import { customerRows } from "@/data/views";
import { BOOKING_STATUS } from "@/lib/labels";
import { formatMoney, formatShortDay, formatTime } from "@/lib/format";
import { formatPhone, isUuid } from "@/modules/forms";
import { DashboardPanel, PanelList } from "@/patterns/dashboard";
import { DetailCard } from "@/patterns/list-detail";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ added?: string }> }) {
  const store = await requireStaff();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [customers, bookings, services] = await Promise.all([store.customers(), store.bookings(), store.services()]);
  const row = customerRows(customers, bookings, businessNow().date).find(c => c.id === id);
  if (!row) notFound();
  const { added } = await searchParams;
  const history = bookings.filter(b => b.customer_id === id).sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
  return (
    <>
      <Button asChild variant="link" className="w-fit px-0"><Link href="/customers"><ChevronLeft aria-hidden />All customers</Link></Button>
      <PageHeader title={row.name} action={<Button asChild><Link href={`/bookings/new?customer=${row.id}`}><Plus aria-hidden />Book a visit</Link></Button>} />
      {added === "customer" ? <Alert variant="success"><AlertDescription>Customer added.</AlertDescription></Alert> : null}
      <DetailCard title="Details" facts={[
        { label: "Email", value: row.email ?? "Not given" },
        { label: "Phone", value: row.phone ? formatPhone(row.phone) : "Not given" },
        { label: "Visits", value: String(row.visits) },
        { label: "Last visit", value: row.last_visit ? formatShortDay(row.last_visit) : "None yet" },
        ...(row.tags.length ? [{ label: "Tags", value: <span className="flex flex-wrap gap-1">{row.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</span> }] : []),
        ...(row.notes ? [{ label: "Notes", value: row.notes }] : [])
      ]} />
      <DashboardPanel title="Bookings">
        {history.length === 0 ? <EmptyState title="No bookings yet" description="Bookings for this customer show up here." /> : (
          <PanelList items={history.map(b => ({
            id: b.id,
            title: services.find(s => s.id === b.service_id)?.name ?? "Service",
            subtitle: `${formatShortDay(b.date)} at ${formatTime(b.start)} · ${formatMoney(b.price_cents)}`,
            trailing: <Badge variant={BOOKING_STATUS[b.status].variant}>{BOOKING_STATUS[b.status].label}</Badge>
          }))} />
        )}
      </DashboardPanel>
    </>
  );
}
