-- ============================================================================
-- Hotel Booking — initial schema
-- Single hotel, multiple room types, multiple physical rooms per type.
-- Guests book a ROOM TYPE for a date range; availability is derived by
-- counting active rooms of that type minus overlapping bookings.
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / DROP ... IF
-- EXISTS / ON CONFLICT / CREATE OR REPLACE), so re-running this after a
-- partial failure just picks up where it left off.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles: one row per CMS user (mirrors auth.users). Controls who can
-- manage data in the CMS. Created automatically on signup via trigger below.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- hotel_settings: single row of general hotel info shown on the frontend.
-- ----------------------------------------------------------------------------
create table if not exists hotel_settings (
  id boolean primary key default true constraint hotel_settings_singleton check (id),
  hotel_name text not null default 'My Hotel',
  description text,
  address text,
  phone text,
  email text,
  check_in_time time not null default '14:00',
  check_out_time time not null default '12:00',
  updated_at timestamptz not null default now()
);

insert into hotel_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- room_types: the "collection" managed in the CMS, e.g. Deluxe, Suite, etc.
-- ----------------------------------------------------------------------------
create table if not exists room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  max_occupancy int not null default 2 check (max_occupancy > 0),
  size_sqm numeric(6, 2),
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- rooms: individual physical rooms, each belonging to one room type.
-- ----------------------------------------------------------------------------
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references room_types (id) on delete restrict,
  room_number text not null unique,
  floor text,
  status text not null default 'active' check (status in ('active', 'maintenance', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_room_type_id_idx on rooms (room_type_id);

-- ----------------------------------------------------------------------------
-- bookings: a guest's reservation of N rooms of a given room type for a
-- date range. No specific room is assigned at booking time.
-- ----------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  room_type_id uuid not null references room_types (id) on delete restrict,
  num_rooms int not null default 1 check (num_rooms > 0),
  check_in date not null,
  check_out date not null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  num_adults int not null default 1 check (num_adults > 0),
  num_children int not null default 0 check (num_children >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  total_price numeric(10, 2) not null check (total_price >= 0),
  currency text not null default 'IDR',
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

create index if not exists bookings_room_type_id_idx on bookings (room_type_id);
create index if not exists bookings_date_range_idx on bookings (check_in, check_out);
create index if not exists bookings_status_idx on bookings (status);

-- ----------------------------------------------------------------------------
-- payments: one or more payment attempts/records per booking (Midtrans, etc).
-- ----------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  provider text not null default 'midtrans',
  provider_session_id text,
  provider_payment_id text,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'IDR',
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on payments (booking_id);

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Keep updated_at fresh on every update.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();
drop trigger if exists set_updated_at on hotel_settings;
create trigger set_updated_at before update on hotel_settings
  for each row execute function set_updated_at();
drop trigger if exists set_updated_at on room_types;
create trigger set_updated_at before update on room_types
  for each row execute function set_updated_at();
drop trigger if exists set_updated_at on rooms;
create trigger set_updated_at before update on rooms
  for each row execute function set_updated_at();
drop trigger if exists set_updated_at on bookings;
create trigger set_updated_at before update on bookings
  for each row execute function set_updated_at();
drop trigger if exists set_updated_at on payments;
create trigger set_updated_at before update on payments
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Is the current user an admin/staff CMS user? Used throughout RLS policies.
create or replace function is_cms_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

-- Available rooms of a given type for a date range (overlap-aware).
-- available = active rooms of that type - rooms already booked (pending/confirmed)
-- for any booking whose date range overlaps [p_check_in, p_check_out).
create or replace function get_available_rooms(
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date
)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::int from rooms
       where room_type_id = p_room_type_id and status = 'active')
    -
    (select coalesce(sum(num_rooms), 0)::int from bookings
       where room_type_id = p_room_type_id
         and status in ('pending', 'confirmed')
         and check_in < p_check_out
         and check_out > p_check_in);
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table profiles enable row level security;
alter table hotel_settings enable row level security;
alter table room_types enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;

-- profiles: a user can see/update their own row; CMS users can see all.
drop policy if exists "profiles_select_own_or_cms" on profiles;
create policy "profiles_select_own_or_cms" on profiles
  for select using (id = auth.uid() or is_cms_user());
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- hotel_settings: readable by anyone (frontend needs it); editable by CMS users.
drop policy if exists "hotel_settings_select_all" on hotel_settings;
create policy "hotel_settings_select_all" on hotel_settings
  for select using (true);
drop policy if exists "hotel_settings_update_cms" on hotel_settings;
create policy "hotel_settings_update_cms" on hotel_settings
  for update using (is_cms_user());

-- room_types: public sees only active types; CMS users see/manage everything.
drop policy if exists "room_types_select_active_or_cms" on room_types;
create policy "room_types_select_active_or_cms" on room_types
  for select using (is_active = true or is_cms_user());
drop policy if exists "room_types_insert_cms" on room_types;
create policy "room_types_insert_cms" on room_types
  for insert with check (is_cms_user());
drop policy if exists "room_types_update_cms" on room_types;
create policy "room_types_update_cms" on room_types
  for update using (is_cms_user());
drop policy if exists "room_types_delete_cms" on room_types;
create policy "room_types_delete_cms" on room_types
  for delete using (is_cms_user());

-- rooms: CMS-only. The public frontend never queries this table directly —
-- it calls get_available_rooms() (security definer) instead.
drop policy if exists "rooms_select_cms" on rooms;
create policy "rooms_select_cms" on rooms
  for select using (is_cms_user());
drop policy if exists "rooms_insert_cms" on rooms;
create policy "rooms_insert_cms" on rooms
  for insert with check (is_cms_user());
drop policy if exists "rooms_update_cms" on rooms;
create policy "rooms_update_cms" on rooms
  for update using (is_cms_user());
drop policy if exists "rooms_delete_cms" on rooms;
create policy "rooms_delete_cms" on rooms
  for delete using (is_cms_user());

-- bookings: CMS-only via the client. Guest bookings are created by the
-- frontend's server-side API route using the service role key (bypasses RLS),
-- so no public insert policy is needed or wanted here.
drop policy if exists "bookings_select_cms" on bookings;
create policy "bookings_select_cms" on bookings
  for select using (is_cms_user());
drop policy if exists "bookings_update_cms" on bookings;
create policy "bookings_update_cms" on bookings
  for update using (is_cms_user());

-- payments: CMS-only read. Rows are written by the server-side Midtrans
-- webhook handler using the service role key.
drop policy if exists "payments_select_cms" on payments;
create policy "payments_select_cms" on payments
  for select using (is_cms_user());

-- Let the public frontend call the availability check directly.
grant execute on function get_available_rooms(uuid, date, date) to anon, authenticated;

-- ============================================================================
-- Base table privileges
--
-- RLS policies above decide which ROWS a role can see/touch, but Postgres
-- checks the coarse-grained table privilege first — without these grants,
-- every query fails with "permission denied for table X" before RLS is ever
-- evaluated. Supabase does not grant these automatically for tables created
-- via the SQL editor, so they must be explicit. Each grant below mirrors
-- exactly what the RLS policies for that table already allow.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on hotel_settings, room_types to anon;

grant select, update on profiles to authenticated;
grant select, update on hotel_settings to authenticated;
grant select, insert, update, delete on room_types to authenticated;
grant select, insert, update, delete on rooms to authenticated;
grant select, update on bookings to authenticated;
grant select on payments to authenticated;

-- service_role is the server-only key the frontend uses (Server Actions,
-- the Midtrans notification webhook) to create bookings/payments and confirm payments. It
-- bypasses RLS, but still needs the base table grant to touch these tables
-- at all.
grant select, insert, update, delete on
  profiles, hotel_settings, room_types, rooms, bookings, payments
  to service_role;
