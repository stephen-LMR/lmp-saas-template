import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appConfig } from "@/config/index";
import { formatDay, formatDuration, formatMoney, formatTime } from "@/lib/format";
import { ChoiceGrid } from "@/patterns/booking";
import { PublicShell, Steps } from "@/patterns/public-shell";
import { SAMPLE_DATE, sampleServices, sampleTakenTimes, sampleTimes } from "@/patterns/sample-data";

export default function PublicBookingPattern() {
  const services = sampleServices.filter(s => s.active);
  return (
    <PublicShell merchantName={appConfig.merchant_name}>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">Book a visit</h1>
        <Steps steps={["Service", "Time", "Your details"]} current={1} />
      </div>
      <form className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <ChoiceGrid
                name="service"
                legend="Choose a service"
                columns="cards"
                defaultValue={services[0]!.id}
                options={services.map(s => ({
                  value: s.id,
                  label: s.name,
                  detail: `${formatDuration(s.minutes)} · ${formatMoney(s.price_cents)}`
                }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4 pt-4 md:pt-6">
              <Field className="md:w-1/2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={SAMPLE_DATE} />
              </Field>
              <ChoiceGrid
                name="time"
                legend={`Times on ${formatDay(SAMPLE_DATE)}`}
                defaultValue="14:00"
                options={sampleTimes.map(t => ({ value: t, label: formatTime(t), disabled: sampleTakenTimes.includes(t) }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-4 pt-4 md:grid-cols-2 md:pt-6">
              <Field>
                <Label htmlFor="customer-name">Your name</Label>
                <Input id="customer-name" name="name" autoComplete="name" required />
              </Field>
              <Field>
                <Label htmlFor="customer-email">Email</Label>
                <Input id="customer-email" name="email" type="email" autoComplete="email" required />
              </Field>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Your booking</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Service</dt>
                <dd className="font-medium">{services[0]!.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">When</dt>
                <dd className="text-right font-medium">{formatDay(SAMPLE_DATE)}, {formatTime("14:00")}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-semibold">{formatMoney(services[0]!.price_cents)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="w-full">Confirm booking</Button>
          </CardContent>
        </Card>
      </form>
    </PublicShell>
  );
}
