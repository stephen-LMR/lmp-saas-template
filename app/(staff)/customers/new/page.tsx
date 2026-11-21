import { requireStaff } from "@/data/index";
import { PageHeader } from "@/patterns/page-header";
import { CustomerForm } from "./form";

export const metadata = { title: "Add a customer" };

export default async function NewCustomerPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Add a customer" description="For people who book by phone or walk in." />
      <CustomerForm />
    </>
  );
}
