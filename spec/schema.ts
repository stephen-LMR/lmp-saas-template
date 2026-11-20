// COPIED FILE. Do not edit here.
// Source: lmp-builder src/spec/schema.ts at commit e5a68f43cfc6affefa7e8e256f5bf09f4077aed5.
// Only difference from the source: relative imports drop the ".js" ending, because the
// Next.js bundler (Turbopack) cannot resolve "./x.js" to "./x.ts". The shapes are identical.
// To change a shape, ask Lane E; then copy the file again and update this header.
import { z } from "zod";

// Modules the base SaaS template ships with. The spec switches them on per client.
export const ModuleKey = z.enum([
  "auth",              // logins, roles, staff and customer accounts
  "booking",           // appointments, classes, availability, reminders
  "services_catalog",  // services, durations, pricing, add-ons
  "customers_crm",     // customer records, notes, history, tags
  "payments_onetime",  // checkout, deposits, tips
  "subscriptions",     // memberships, recurring plans
  "invoicing",         // quotes, invoices, payment links
  "loyalty",           // points, rewards, punch cards (LMR, an LMP product)
  "staff_scheduling",  // staff shifts, assignment, commissions
  "notifications",     // email and SMS confirmations, reminders, campaigns
  "reporting",         // dashboards, exports
  "custom_entities"    // client-specific data objects defined in the spec
]);
export type ModuleKey = z.infer<typeof ModuleKey>;

const Field = z.object({
  name: z.string(),
  type: z.enum(["text", "number", "money", "date", "datetime", "boolean", "enum", "relation", "file"]),
  required: z.boolean(),
  notes: z.string().optional()
});

export const Spec = z.object({
  business: z.object({
    name: z.string(),
    industry: z.string(),
    website: z.string().nullable(),
    locations: z.number().int().nullable(),
    summary: z.string().describe("Two or three sentences on what the business does and what the software must fix")
  }),
  users: z.array(z.object({
    role: z.string(),
    description: z.string(),
    count_estimate: z.string().nullable()
  })),
  current_tools: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    pain_points: z.array(z.string()),
    disposition: z.enum(["replace", "keep", "integrate", "unknown"])
  })),
  modules: z.array(z.object({
    key: ModuleKey,
    reason: z.string(),
    requirements: z.array(z.string())
  })),
  custom_entities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    fields: z.array(Field)
  })),
  workflows: z.array(z.object({
    name: z.string(),
    actor: z.string(),
    trigger: z.string(),
    steps: z.array(z.string())
  })),
  integrations: z.array(z.object({
    system: z.string(),
    direction: z.enum(["read", "write", "both"]),
    purpose: z.string()
  })),
  payments: z.object({
    takes_payments: z.boolean(),
    model: z.enum(["one_time", "subscription", "deposits", "invoices", "mixed", "none"]),
    current_processor: z.string().nullable(),
    notes: z.string()
  }),
  branding: z.object({
    colors: z.array(z.string()),
    tone: z.string().nullable(),
    has_logo: z.boolean().nullable()
  }),
  out_of_template: z.array(z.string()).describe("Needs no module covers. These need a human quote."),
  open_questions: z.array(z.string()).describe("One-line questions the client must answer before build"),
  confidence: z.number().min(0).max(1)
});
export type Spec = z.infer<typeof Spec>;
