import { Calendar, CreditCard, LayoutDashboard, Settings, Tag, Users } from "lucide-react";
import type { NavItem } from "@/patterns/app-shell";

// Navigation used by the sample screens. Real apps build this list from the enabled modules.
export const sampleNav: NavItem[] = [
  { href: "/design/dashboard", label: "Dashboard", icon: <LayoutDashboard aria-hidden /> },
  { href: "/design/calendar", label: "Calendar", icon: <Calendar aria-hidden /> },
  { href: "/design/list", label: "Customers", icon: <Users aria-hidden /> },
  { href: "/design/form", label: "Services", icon: <Tag aria-hidden /> },
  { href: "/design/states", label: "Payments", icon: <CreditCard aria-hidden /> },
  { href: "/design/settings", label: "Settings", icon: <Settings aria-hidden /> }
];
