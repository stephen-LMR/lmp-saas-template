import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Calendar, CreditCard, LayoutDashboard, LogOut, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appConfig, modules, theme } from "@/config/index";
import { requireStaff } from "@/data/index";
import { signOut } from "@/lib/actions/auth";
import type { NavItem } from "@/patterns/app-shell";
import type { ModuleKey } from "@/spec/schema";
import { StaffShell } from "./shell";

export const metadata: Metadata = { robots: { index: false } };

// Navigation comes from the modules that are switched on. Nothing shows for a module that is off.
const SECTIONS: { module: ModuleKey | null; item: NavItem }[] = [
  { module: null, item: { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard aria-hidden /> } },
  { module: "booking", item: { href: "/calendar", label: "Calendar", icon: <Calendar aria-hidden /> } },
  { module: "customers_crm", item: { href: "/customers", label: "Customers", icon: <Users aria-hidden /> } },
  { module: "services_catalog", item: { href: "/services", label: "Services", icon: <Tag aria-hidden /> } },
  { module: "payments_onetime", item: { href: "/payments", label: "Payments", icon: <CreditCard aria-hidden /> } }
];

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const store = await requireStaff();
  const items = SECTIONS.filter(s => s.module === null || modules.enabled.includes(s.module)).map(s => s.item);
  const footer = (
    <form action={signOut} className="flex flex-col gap-2 border-t pt-4">
      <p className="truncate text-sm text-muted-foreground">Signed in as {store.me.name}</p>
      <Button type="submit" variant="ghost" size="sm" className="justify-start"><LogOut aria-hidden />Sign out</Button>
    </form>
  );
  return <StaffShell merchantName={appConfig.merchant_name} logoUrl={theme.logo_url} items={items} footer={footer}>{children}</StaffShell>;
}
