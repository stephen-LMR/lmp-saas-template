import type { Metadata } from "next";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appConfig, modules, theme } from "@/config/index";
import { bookingSettings, businessNow, publicStore } from "@/data/index";
import { addDays, openSlots } from "@/data/views";
import { formatDay, formatDuration, formatMoney, formatTime } from "@/lib/format";
import { isDate } from "@/modules/forms";
import type { ServicesCatalogSettings } from "@/modules/settings";
import { PublicShell, Steps } from "@/patterns/public-shell";
import { EmptyState } from "@/patterns/states";
import { notFound } from "next/navigation";
import { BookingDetails } from "./form";

export const metadata: Metadata = { title: "Book a visit" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; date?: string }> }) {
  if (!modules.enabled.includes("booking")) notFound();
  const q = await searchParams;
  const store = publicStore();
  const services = await store.services();
  const now = businessNow();
  const settings = bookingSettings();
  const showPrices = (modules.settings.services_catalog as ServicesCatalogSettings | undefined)?.show_prices_publicly ?? true;
  const lastDay = addDays(now.date, settings.max_advance_days);
  const date = isDate(q.date) && q.date >= now.date && q.date <= lastDay ? q.date : now.date;
  const service = services.find(s => s.id === q.service) ?? services[0];

  const shell = (children: React.ReactNode) => (
    <PublicShell merchantName={appConfig.merchant_name} logoUrl={theme.logo_url}>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">Book a visit</h1>
        <Steps steps={["Service and day", "Time", "Your details"]} current={1} />
      </div>
      {children}
    </PublicShell>
  );
  if (!service) return shell(<EmptyState icon={CalendarX} title="Online booking is not open yet" description="Please call us to book." />);

  const { staff_ids, busy } = await store.availability(date);
  const slots = openSlots({ date, service, settings, staff_ids, busy, now });
  return shell(
    <>
      {/* Step 1 works without JavaScript: it reloads the page with the chosen service and day. */}
      <form method="get" className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-4 md:pt-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">Choose a service</legend>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {services.map(s => (
                  <label key={s.id} className="flex cursor-pointer items-start gap-3 rounded-sm border border-input bg-card p-3 has-checked:border-primary has-checked:bg-muted">
                    <input type="radio" name="service" value={s.id} defaultChecked={s.id === service.id} className="mt-1 accent-primary" />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-sm text-muted-foreground">{formatDuration(s.duration_minutes)}{showPrices ? ` · ${formatMoney(s.price_cents)}` : ""}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field className="md:w-1/2">
              <Label htmlFor="date">Day</Label>
              <Input id="date" name="date" type="date" min={now.date} max={lastDay} defaultValue={date} />
            </Field>
            <Button type="submit" variant="outline" className="w-full md:w-fit">Show open times</Button>
          </CardContent>
        </Card>
      </form>
      {slots.length === 0 ? (
        <EmptyState icon={CalendarX} title={`No open times on ${formatDay(date)}`} description="Try another day." />
      ) : (
        <BookingDetails
          serviceId={service.id}
          date={date}
          dayLabel={formatDay(date)}
          times={slots.map(s => ({ value: s.time, label: formatTime(s.time) }))}
          summary={showPrices ? { service: service.name, price: formatMoney(service.price_cents) } : null}
        />
      )}
    </>
  );
}
