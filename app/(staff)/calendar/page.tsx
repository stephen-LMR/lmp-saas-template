import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessNow, requireStaff } from "@/data/index";
import { addDays, agenda } from "@/data/views";
import { BOOKING_STATUS } from "@/lib/labels";
import { isDate } from "@/modules/forms";
import { DayAgenda, DayNav } from "@/patterns/booking";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";

export const metadata = { title: "Calendar" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const store = await requireStaff();
  const q = await searchParams;
  const date = isDate(q.date) ? q.date : businessNow().date;
  const [bookings, services, customers, staff] = await Promise.all([store.bookings({ date }), store.services(), store.customers(), store.staff()]);
  const rows = agenda(bookings, services, customers, staff);
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Bookings for the day, in time order."
        action={<Button asChild><Link href={`/bookings/new?date=${date}`}><Plus aria-hidden />New booking</Link></Button>}
      />
      <DayNav date={date} prevHref={`/calendar?date=${addDays(date, -1)}`} nextHref={`/calendar?date=${addDays(date, 1)}`} />
      {rows.length === 0 ? (
        <EmptyState title="No bookings this day" description="Use New booking to add one." />
      ) : (
        <DayAgenda items={rows.map(b => ({
          id: b.id, start: b.start, end: b.end, title: b.service,
          subtitle: `${b.customer}${b.staff ? ` with ${b.staff}` : ""}`,
          trailing: <Badge variant={BOOKING_STATUS[b.status].variant}>{BOOKING_STATUS[b.status].label}</Badge>
        }))} />
      )}
    </>
  );
}
