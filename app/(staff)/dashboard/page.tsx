import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { modules } from "@/config/index";
import { businessNow, requireStaff } from "@/data/index";
import { agenda, dashboardStats } from "@/data/views";
import { BOOKING_STATUS } from "@/lib/labels";
import { formatMoney, formatTime } from "@/lib/format";
import { DashboardPanel, DashboardPanels, PanelList, StatGrid } from "@/patterns/dashboard";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const store = await requireStaff();
  const today = businessNow().date;
  const [bookings, payments, customers, services, staff] = await Promise.all([store.bookings(), store.payments(), store.customers(), store.services(), store.staff()]);
  const stats = dashboardStats(bookings, payments, customers, today);
  const upNext = agenda(bookings.filter(b => b.date === today), services, customers, staff);
  const canBook = modules.enabled.includes("booking");
  return (
    <>
      <PageHeader
        title={`Hi, ${store.me.name.split(" ")[0]}`}
        description="Here is what is happening today."
        action={canBook ? <Button asChild><Link href="/bookings/new"><Plus aria-hidden />New booking</Link></Button> : undefined}
      />
      <StatGrid stats={[
        { label: "Bookings today", value: String(stats.bookings_today), note: `${stats.still_open} not confirmed yet` },
        { label: "Payments taken", value: formatMoney(stats.paid_cents), note: "All time, tips included" },
        { label: "Customers", value: String(stats.customers) },
        { label: "No-shows", value: String(stats.no_shows_week), note: "Last 7 days" }
      ]} />
      <DashboardPanels>
        <DashboardPanel title="Today" description="Bookings in time order.">
          {upNext.length === 0 ? (
            <EmptyState title="Nothing booked today" description="New bookings show up here." />
          ) : (
            <PanelList items={upNext.map(b => ({
              id: b.id, title: b.service,
              subtitle: `${formatTime(b.start)} · ${b.customer}${b.staff ? ` with ${b.staff}` : ""}`,
              trailing: <Badge variant={BOOKING_STATUS[b.status].variant}>{BOOKING_STATUS[b.status].label}</Badge>
            }))} />
          )}
        </DashboardPanel>
      </DashboardPanels>
    </>
  );
}
