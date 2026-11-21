import { redirect } from "next/navigation";
import { requireStaff } from "@/data/index";
import { PageHeader } from "@/patterns/page-header";
import { ServiceForm } from "./form";

export const metadata = { title: "Add a service" };

export default async function NewServicePage() {
  const store = await requireStaff();
  if (store.me.role === "staff") redirect("/services");
  return (
    <>
      <PageHeader title="Add a service" description="Services are what customers book and pay for." />
      <ServiceForm />
    </>
  );
}
