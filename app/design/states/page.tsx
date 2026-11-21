import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/index";
import { AppShell } from "@/patterns/app-shell";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/patterns/states";
import { sampleNav } from "../nav";

export default function StatesPattern() {
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/states">
      <PageHeader title="Payments" description="Empty, loading, and error states." helpHref="/help" />
      <EmptyState
        icon={CreditCard}
        title="No payments yet"
        description="Payments show up here after your first paid booking."
        action={<Button asChild><Link href="/design/calendar">Create a booking</Link></Button>}
      />
      <LoadingState label="Loading payments" />
      <ErrorState
        title="We could not load payments"
        action={<Button asChild variant="outline"><Link href="/design/states">Try again</Link></Button>}
      />
    </AppShell>
  );
}
