-- Core tables for the first five modules: auth (staff), services_catalog, customers_crm,
-- booking, payments_onetime. One database per merchant app, so there is no tenant column.
-- Row level security is on for every table. The browser only ever uses the anon key;
-- the service role key stays on the server.
-- Build agent migrations go in files named custom_*.sql, never in this one.

create extension if not exists btree_gist;

create type public.staff_role as enum ('owner', 'manager', 'staff');
create type public.booking_status as enum ('booked', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.payment_kind as enum ('deposit', 'full', 'balance');
create type public.payment_status as enum ('pending', 'approved', 'declined', 'refunded', 'voided');

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (email = lower(email)),
  role public.staff_role not null default 'staff',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (email)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  category text check (char_length(category) <= 40),
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  email text check (email = lower(email)),
  phone text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  tags text[] not null default '{}' check (cardinality(tags) <= 10),
  notes text not null default '' check (char_length(notes) <= 2000),
  custom jsonb not null default '{}',
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create unique index customers_email_key on public.customers (email) where email is not null;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  staff_id uuid references public.staff (id) on delete set null,
  date date not null,              -- the business's own calendar day
  start_time time not null,
  end_time time not null,
  status public.booking_status not null default 'booked',
  price_cents integer not null check (price_cents >= 0), -- the price when it was booked
  created_at timestamptz not null default now(),
  check (start_time < end_time),
  -- The database itself refuses to double book a staff member, even if two requests race.
  constraint bookings_no_double_booking exclude using gist (
    staff_id with =,
    tsrange(date + start_time, date + end_time) with &&
  ) where (staff_id is not null and status in ('booked', 'confirmed', 'completed'))
);
create index bookings_date_idx on public.bookings (date);
create index bookings_customer_idx on public.bookings (customer_id);

-- No card data, ever. processor_ref is the processor's own reference for the charge.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  customer_id uuid not null references public.customers (id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  tip_cents integer not null default 0 check (tip_cents >= 0),
  kind public.payment_kind not null,
  status public.payment_status not null default 'pending',
  processor text not null check (char_length(processor) > 0),
  processor_ref text,
  created_at timestamptz not null default now()
);
create index payments_customer_idx on public.payments (customer_id);

-- Helpers live in a schema the API does not expose.
create schema if not exists private;

-- The signed-in user's staff role, or null if they are not active staff.
create function private.staff_role() returns public.staff_role
language sql stable security definer set search_path = '' as $$
  select s.role from public.staff s where s.user_id = (select auth.uid()) and s.active limit 1
$$;

-- The signed-in user's customer record, or null.
create function private.customer_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select c.id from public.customers c where c.user_id = (select auth.uid()) limit 1
$$;

-- Links a login to the staff or customer record with the same email, but only once the
-- email address is confirmed. An unconfirmed signup can never claim someone's record.
create function private.link_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;
  update public.staff set user_id = new.id where email = lower(new.email) and user_id is null;
  update public.customers set user_id = new.id where email = lower(new.email) and user_id is null;
  return new;
end
$$;

create trigger link_user_on_confirm
  after insert or update of email_confirmed_at on auth.users
  for each row execute function private.link_user();

revoke all on schema private from public;
revoke all on all functions in schema private from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.staff_role() to anon, authenticated;
grant execute on function private.customer_id() to authenticated;

alter table public.staff enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

-- Staff: any active staff member can see the team. Only the owner changes it.
create policy staff_read on public.staff for select to authenticated
  using (private.staff_role() is not null);
create policy staff_owner_insert on public.staff for insert to authenticated
  with check (private.staff_role() = 'owner');
create policy staff_owner_update on public.staff for update to authenticated
  using (private.staff_role() = 'owner') with check (private.staff_role() = 'owner');
create policy staff_owner_delete on public.staff for delete to authenticated
  using (private.staff_role() = 'owner');

-- Services: the public booking page shows active services. Owner and managers edit them.
create policy services_read on public.services for select to anon, authenticated
  using (active or private.staff_role() is not null);
create policy services_manage_insert on public.services for insert to authenticated
  with check (private.staff_role() in ('owner', 'manager'));
create policy services_manage_update on public.services for update to authenticated
  using (private.staff_role() in ('owner', 'manager')) with check (private.staff_role() in ('owner', 'manager'));
create policy services_manage_delete on public.services for delete to authenticated
  using (private.staff_role() in ('owner', 'manager'));

-- Customers: staff see everyone. A customer sees only their own record.
create policy customers_read on public.customers for select to authenticated
  using (private.staff_role() is not null or user_id = (select auth.uid()));
create policy customers_staff_insert on public.customers for insert to authenticated
  with check (private.staff_role() is not null);
create policy customers_staff_update on public.customers for update to authenticated
  using (private.staff_role() is not null) with check (private.staff_role() is not null);
create policy customers_manage_delete on public.customers for delete to authenticated
  using (private.staff_role() in ('owner', 'manager'));

-- Bookings: staff see and manage all. A customer sees only their own.
-- Bookings from the public page are saved by the server after it re-checks availability.
create policy bookings_read on public.bookings for select to authenticated
  using (private.staff_role() is not null or customer_id = private.customer_id());
create policy bookings_staff_insert on public.bookings for insert to authenticated
  with check (private.staff_role() is not null);
create policy bookings_staff_update on public.bookings for update to authenticated
  using (private.staff_role() is not null) with check (private.staff_role() is not null);
create policy bookings_manage_delete on public.bookings for delete to authenticated
  using (private.staff_role() in ('owner', 'manager'));

-- Payments: read only from the browser. Only the server (service role) writes them.
create policy payments_read on public.payments for select to authenticated
  using (private.staff_role() is not null or customer_id = private.customer_id());

-- Table privileges are granted by hand so nothing is exposed by default.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.services to anon;
grant select, insert, update, delete on public.staff, public.services, public.customers, public.bookings to authenticated;
grant select on public.payments to authenticated;
grant all on public.staff, public.services, public.customers, public.bookings, public.payments to service_role;
