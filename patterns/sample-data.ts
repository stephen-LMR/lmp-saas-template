// Demo data for the pattern screens and visual baselines. Never real customer data.
export const SAMPLE_DATE = "2026-11-23";

export const sampleStats = [
  { label: "Bookings today", value: "8", note: "2 still open" },
  { label: "Sales this week", value: "$2,340.00", note: "Up from $1,980.00" },
  { label: "New customers", value: "5", note: "This week" },
  { label: "No-shows", value: "1", note: "This week" }
];

export const sampleServices = [
  { id: "svc-1", name: "Full groom", minutes: 90, price_cents: 8500, active: true },
  { id: "svc-2", name: "Bath and brush", minutes: 45, price_cents: 4500, active: true },
  { id: "svc-3", name: "Nail trim", minutes: 15, price_cents: 1500, active: true },
  { id: "svc-4", name: "Puppy intro", minutes: 30, price_cents: 3000, active: false }
];

export const sampleCustomers = [
  { id: "cus-1", name: "Maria Alvarez", email: "maria@example.com", phone: "(555) 010-0101", visits: 12, last_visit: "2026-11-18", tag: "Regular" },
  { id: "cus-2", name: "James Okafor", email: "james@example.com", phone: "(555) 010-0102", visits: 3, last_visit: "2026-11-12", tag: "New" },
  { id: "cus-3", name: "Priya Shah", email: "priya@example.com", phone: "(555) 010-0103", visits: 27, last_visit: "2026-11-20", tag: "Regular" },
  { id: "cus-4", name: "Tom Becker", email: "tom@example.com", phone: "(555) 010-0104", visits: 1, last_visit: "2026-10-30", tag: "New" },
  { id: "cus-5", name: "Aisha Rahman", email: "aisha@example.com", phone: "(555) 010-0105", visits: 8, last_visit: "2026-11-09", tag: "Regular" }
];

export const sampleAgenda = [
  { id: "bk-1", start: "09:00", end: "10:30", title: "Full groom", subtitle: "Maria Alvarez with Dana", status: "Confirmed" },
  { id: "bk-2", start: "10:45", end: "11:30", title: "Bath and brush", subtitle: "James Okafor with Dana", status: "Confirmed" },
  { id: "bk-3", start: "13:00", end: "13:15", title: "Nail trim", subtitle: "Priya Shah with Lee", status: "Unpaid" },
  { id: "bk-4", start: "14:30", end: "16:00", title: "Full groom", subtitle: "Aisha Rahman with Lee", status: "Confirmed" }
];

export const sampleTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
export const sampleTakenTimes = ["09:00", "10:30", "13:00"];
