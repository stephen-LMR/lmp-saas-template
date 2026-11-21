// Checks the live dev database from the outside, the way a stranger's browser would:
// with only the publishable key and no login. Skipped when .env.local is absent (CI).
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers }
  });

describe.skipIf(!url || !key)("row level security, as an anonymous visitor", () => {
  it("can read active services, and only active ones", async () => {
    const res = await rest("services?select=name,active&order=name");
    expect(res.status).toBe(200);
    const rows = (await res.json()) as { name: string; active: boolean }[];
    expect(rows.map(r => r.name)).toEqual(["Bath and brush", "Full groom", "Nail trim"]);
    expect(rows.every(r => r.active)).toBe(true);
  });

  it.each(["customers", "bookings", "payments", "staff"])("cannot read %s", async table => {
    const res = await rest(`${table}?select=*`);
    const body = await res.json();
    // Either refused outright or an empty list. Never a row.
    expect(res.status === 401 || res.status === 403 || (res.status === 200 && Array.isArray(body) && body.length === 0)).toBe(true);
    expect(JSON.stringify(body)).not.toContain("example.com");
  });

  it.each([
    ["services", { name: "Free groom", duration_minutes: 30, price_cents: 0 }],
    ["customers", { name: "Mallory", email: "mallory@example.com" }],
    ["staff", { name: "Mallory", email: "mallory@example.com", role: "owner" }],
    ["payments", { customer_id: "00000000-0000-4000-8003-000000000001", amount_cents: 1, kind: "full", processor: "x" }]
  ])("cannot insert into %s", async (table, row) => {
    const res = await rest(table, { method: "POST", body: JSON.stringify(row) });
    expect([401, 403]).toContain(res.status);
  });

  it("cannot change or delete a service", async () => {
    const patch = await rest("services?name=eq.Full%20groom", { method: "PATCH", body: JSON.stringify({ price_cents: 1 }) });
    expect([401, 403]).toContain(patch.status);
    const del = await rest("services?name=eq.Full%20groom", { method: "DELETE" });
    expect([401, 403]).toContain(del.status);
    const check = (await (await rest("services?select=price_cents&name=eq.Full%20groom")).json()) as { price_cents: number }[];
    expect(check).toEqual([{ price_cents: 8500 }]);
  });

  it("cannot call the private helper functions", async () => {
    const res = await rest("rpc/staff_role", { method: "POST", body: "{}" });
    expect(res.status).toBe(404);
  });
});
