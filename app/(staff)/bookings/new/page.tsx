import { businessNow, requireStaff } from "@/data/index";
import { formatDuration, formatMoney } from "@/lib/format";
import { isDate, isUuid } from "@/modules/forms";
import { PageHeader } from "@/patterns/page-header";
import { BookingForm } from "./form";

export const metadata = { title: "New booking" };

export default async function NewBookingPage({ searchParams }: { searchParams: Promise<{ date?: string; customer?: string }> }) {
  const store = await requireStaff();
  const q = await searchParams;
  const [customers, services, staff] = await Promise.all([store.customers(), store.services(), store.staff()]);
  return (
    <>
      <PageHeader title="New booking" description="For bookings taken by phone or in person. The person you pick cannot be double booked." />
      <BookingForm
        customers={customers.map(c => ({ value: c.id, label: c.name }))}
        services={services.filter(s => s.active).map(s => ({ value: s.id, label: `${s.name} (${formatDuration(s.duration_minutes)}, ${formatMoney(s.price_cents)})` }))}
        staff={staff.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))}
        defaults={{ date: isDate(q.date) ? q.date : businessNow().date, customer: isUuid(q.customer) ? q.customer : "", staff: store.me.id }}
      />
    </>
  );
}
