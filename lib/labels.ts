// Words and badge colors for record states, in one place so every screen says the same thing.
import type { Booking, Payment } from "@/modules/entities";

type BadgeVariant = "default" | "secondary" | "accent" | "success" | "warning" | "danger" | "outline";

export const BOOKING_STATUS: Record<Booking["status"], { label: string; variant: BadgeVariant }> = {
  booked: { label: "Booked", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  completed: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "outline" },
  no_show: { label: "No-show", variant: "danger" }
};

export const PAYMENT_STATUS: Record<Payment["status"], { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Paid", variant: "success" },
  declined: { label: "Declined", variant: "danger" },
  refunded: { label: "Refunded", variant: "secondary" },
  voided: { label: "Voided", variant: "secondary" }
};

export const PAYMENT_KIND: Record<Payment["kind"], string> = { deposit: "Deposit", full: "Full payment", balance: "Balance" };
