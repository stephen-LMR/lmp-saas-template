import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/index";
import { AppShell } from "@/patterns/app-shell";
import { DayAgenda, DayNav } from "@/patterns/booking";
import { PageHeader } from "@/patterns/page-header";
import { SAMPLE_DATE, sampleAgenda } from "@/patterns/sample-data";
import { sampleNav } from "../nav";

export default function CalendarPattern() {
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/calendar">
      <PageHeader
        title="Calendar"
        description="Bookings for the day, in time order."
        helpHref="/help"
        action={
          <Button asChild>
            <Link href="/design/booking"><Plus aria-hidden />New booking</Link>
          </Button>
        }
      />
      <DayNav date={SAMPLE_DATE} prevHref="/design/calendar" nextHref="/design/calendar" />
      <DayAgenda
        items={sampleAgenda.map(b => ({
          ...b,
          trailing: <Badge variant={b.status === "Unpaid" ? "warning" : "secondary"}>{b.status}</Badge>
        }))}
      />
    </AppShell>
  );
}
