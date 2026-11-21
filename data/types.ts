// Everything the screens need from wherever the records live. Two versions exist: the
// merchant's database (data/supabase.ts) and built-in demo records (data/demo.ts) used by
// tests and by previews that have no database yet. Screens never know which one they have.
import type { Booking, Customer, Payment, Service, StaffMember } from "../modules/entities";
import type { CustomerInput, ServiceInput } from "../modules/forms";

export type NewBooking = { customer_id: string; service_id: string; staff_id: string; date: string; start: string; end: string; price_cents: number };

// A problem the person can fix, shown on the form. Anything else is a real error.
export class DataProblem extends Error {
  constructor(public readonly code: "slot_taken" | "not_allowed" | "duplicate_email" | "not_found", message: string) {
    super(message);
    this.name = "DataProblem";
  }
}

export type StaffStore = {
  me: StaffMember;
  staff(): Promise<StaffMember[]>;
  services(): Promise<Service[]>;
  createService(input: ServiceInput): Promise<Service>;
  customers(): Promise<Customer[]>;
  createCustomer(input: CustomerInput): Promise<Customer>;
  bookings(filter?: { date?: string }): Promise<Booking[]>;
  createBooking(input: NewBooking): Promise<Booking>;
  payments(): Promise<Payment[]>;
};

// What an anonymous visitor to the public pages can do. Deliberately small.
export type StaffBusy = { staff_id: string; start: string; end: string };
export type PublicStore = {
  services(): Promise<Service[]>;                       // active services only
  availability(date: string): Promise<{ staff_ids: string[]; busy: StaffBusy[] }>;
  // Saves a booking with the first free staff member in the list. Throws slot_taken.
  book(input: { service: Service; date: string; start: string; end: string; name: string; email: string; staff_ids: string[] }): Promise<{ booking_id: string }>;
};
