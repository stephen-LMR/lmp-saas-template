import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/config/index";
import { formatShortDay } from "@/lib/format";
import { AppShell } from "@/patterns/app-shell";
import { DataList, DetailCard } from "@/patterns/list-detail";
import { PageHeader } from "@/patterns/page-header";
import { sampleCustomers } from "@/patterns/sample-data";
import { sampleNav } from "../nav";

export default function ListDetailPattern() {
  const selected = sampleCustomers[0]!;
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/list">
      <PageHeader
        title="Customers"
        description="Everyone who has booked with you."
        helpHref="/help"
        action={
          <Button asChild>
            <Link href="/design/form"><Plus aria-hidden />Add customer</Link>
          </Button>
        }
      />
      <form role="search" className="grid md:grid-cols-2 xl:grid-cols-3">
        <label htmlFor="customer-search" className="sr-only">Search customers</label>
        <Input id="customer-search" type="search" name="q" placeholder="Search by name, email, or phone" />
      </form>
      <DataList
        label="Customers"
        rows={sampleCustomers}
        hrefFor={() => "/design/list"}
        columns={[
          { header: "Name", cell: c => c.name },
          { header: "Email", cell: c => c.email },
          { header: "Visits", cell: c => `${c.visits} visits` },
          { header: "Last visit", cell: c => formatShortDay(c.last_visit) },
          { header: "Tag", cell: c => <Badge variant={c.tag === "New" ? "accent" : "secondary"}>{c.tag}</Badge> }
        ]}
      />
      <DetailCard
        title={selected.name}
        facts={[
          { label: "Email", value: selected.email },
          { label: "Phone", value: selected.phone },
          { label: "Visits", value: selected.visits },
          { label: "Last visit", value: formatShortDay(selected.last_visit) }
        ]}
      />
    </AppShell>
  );
}
