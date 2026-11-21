import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/index";
import { formatMoney, formatTime } from "@/lib/format";
import { AppShell } from "@/patterns/app-shell";
import { DashboardPanel, DashboardPanels, PanelList, StatGrid } from "@/patterns/dashboard";
import { PageHeader } from "@/patterns/page-header";
import { sampleAgenda, sampleServices, sampleStats } from "@/patterns/sample-data";
import { sampleNav } from "../nav";

export default function DashboardPattern() {
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/dashboard">
      <PageHeader
        title="Good morning"
        description="Here is what is happening today."
        helpHref="/help"
        action={
          <Button asChild>
            <Link href="/design/calendar"><Plus aria-hidden />New booking</Link>
          </Button>
        }
      />
      <StatGrid stats={sampleStats} />
      <DashboardPanels>
        <DashboardPanel title="Up next" description="Today's bookings">
          <PanelList
            items={sampleAgenda.map(b => ({
              id: b.id,
              title: b.title,
              subtitle: `${formatTime(b.start)} · ${b.subtitle}`,
              trailing: <Badge variant={b.status === "Unpaid" ? "warning" : "secondary"}>{b.status}</Badge>
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title="Top services" description="By sales this month">
          <PanelList
            items={sampleServices.map((s, i) => ({
              id: s.id,
              title: s.name,
              subtitle: `${24 - i * 5} bookings`,
              trailing: <span className="font-medium">{formatMoney(s.price_cents * (24 - i * 5))}</span>
            }))}
          />
        </DashboardPanel>
      </DashboardPanels>
    </AppShell>
  );
}
