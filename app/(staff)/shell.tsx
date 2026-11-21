"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/patterns/app-shell";

// The staff layout. Marks the navigation link for the section the person is in.
export function StaffShell({ merchantName, logoUrl, items, footer, children }: { merchantName: string; logoUrl: string | null; items: NavItem[]; footer: ReactNode; children: ReactNode }) {
  const path = usePathname();
  const current = items.find(i => path === i.href || path.startsWith(`${i.href}/`))?.href ?? "";
  return <AppShell merchantName={merchantName} logoUrl={logoUrl} items={items} current={current} footer={footer}>{children}</AppShell>;
}
