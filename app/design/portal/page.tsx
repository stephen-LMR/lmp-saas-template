import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/index";
import { formatMoney, formatShortDay, formatTime } from "@/lib/format";
import { DashboardPanel, DashboardPanels, PanelList } from "@/patterns/dashboard";
import { DetailCard } from "@/patterns/list-detail";
import { PublicShell } from "@/patterns/public-shell";
import { sampleCustomers } from "@/patterns/sample-data";

export default function CustomerPortalPattern() {
  const me = sampleCustomers[0]!;
  return (
    <PublicShell
      merchantName={appConfig.merchant_name}
      nav={<Button asChild variant="ghost" size="sm"><Link href="/design/portal">Sign out</Link></Button>}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold md:text-2xl">Hi, {me.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Your visits and details in one place.</p>
        </div>
        <Button asChild>
          <Link href="/design/booking">Book a visit</Link>
        </Button>
      </div>
      <DashboardPanels>
        <DashboardPanel title="Coming up">
          <PanelList
            items={[
              { id: "u1", title: "Full groom", subtitle: `${formatShortDay("2026-11-23")} at ${formatTime("09:00")}`, trailing: <Badge variant="success">Confirmed</Badge> },
              { id: "u2", title: "Nail trim", subtitle: `${formatShortDay("2026-12-07")} at ${formatTime("13:00")}`, trailing: <Badge>Booked</Badge> }
            ]}
          />
        </DashboardPanel>
        <DashboardPanel title="Past visits">
          <PanelList
            items={[
              { id: "p1", title: "Bath and brush", subtitle: formatShortDay("2026-11-18"), trailing: formatMoney(4500) },
              { id: "p2", title: "Full groom", subtitle: formatShortDay("2026-10-21"), trailing: formatMoney(8500) }
            ]}
          />
        </DashboardPanel>
      </DashboardPanels>
      <DetailCard title="Your details" facts={[{ label: "Email", value: me.email }, { label: "Phone", value: me.phone }]} />
    </PublicShell>
  );
}
