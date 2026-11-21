import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/data/index";
import { PAYMENT_KIND, PAYMENT_STATUS } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { DataList } from "@/patterns/list-detail";
import { PageHeader } from "@/patterns/page-header";
import { EmptyState } from "@/patterns/states";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const store = await requireStaff();
  const [payments, customers] = await Promise.all([store.payments(), store.customers()]);
  const rows = payments.map(p => ({ ...p, customer: customers.find(c => c.id === p.customer_id)?.name ?? "Customer" }));
  return (
    <>
      <PageHeader title="Payments" description="Every payment taken in the app. Card details are never stored here." />
      <Alert>
        <AlertTitle>Card payments are not switched on yet</AlertTitle>
        <AlertDescription>Taking cards starts once your payment account is connected. Until then this page shows payment records only.</AlertDescription>
      </Alert>
      {rows.length === 0 ? (
        <EmptyState title="No payments yet" description="Payments show up here after your first paid booking." />
      ) : (
        <DataList label="Payments" rows={rows} hrefFor={p => `/customers/${p.customer_id}`} columns={[
          { header: "Customer", cell: p => p.customer },
          { header: "Amount", cell: p => formatMoney(p.amount_cents + p.tip_cents) },
          { header: "Tip", cell: p => (p.tip_cents ? formatMoney(p.tip_cents) : "None") },
          { header: "Type", cell: p => PAYMENT_KIND[p.kind] },
          { header: "Status", cell: p => <Badge variant={PAYMENT_STATUS[p.status].variant}>{PAYMENT_STATUS[p.status].label}</Badge> }
        ]} />
      )}
    </>
  );
}
