-- schema.sql for marketplace / vehicle rental (ready for Supabase)
-- Extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- ================
-- ENUM types (idempotent via DO $$ blocks)
-- ================
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('admin','dealer','user');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'booking_status'
      and n.nspname = 'public'
  ) then
    create type public.booking_status as enum ('pending','confirmed','cancelled','completed','rejected');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'payment_status'
      and n.nspname = 'public'
  ) then
    create type public.payment_status as enum ('pending','succeeded','failed','refunded');
  end if;
end $$;

-- ================
-- Timestamp trigger helper (create or replace)
-- ================
create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ================
-- public.users
-- ================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  full_name text,
  phone text,
  role public.user_role not null default 'user',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'User accounts (admin/dealer/user). Email unique.';

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_users') then
    create trigger tr_update_timestamp_users
      before update on public.users
      for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

create index if not exists idx_users_email on public.users(email);

-- ================
-- public.locations
-- ================
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  country text,
  latitude double precision,
  longitude double precision,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.locations is 'Geographic locations for vehicles or users.';

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_locations') then
    create trigger tr_update_timestamp_locations
      before update on public.locations
      for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

create index if not exists idx_locations_name on public.locations(name);

-- ================
-- public.vehicles
-- ================
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null,
  location_id uuid,
  title text not null,
  description text,
  make text,
  model text,
  year integer,
  seats integer,
  license_plate text,
  price_per_day numeric(12,2) not null check (price_per_day >= 0),
  currency text not null default 'USD',
  is_active boolean not null default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.vehicles is 'Vehicles listed by dealers. price_per_day >= 0.';

alter table if exists public.vehicles
  add constraint fk_vehicles_dealer foreign key (dealer_id) references public.users (id) on delete cascade;

alter table if exists public.vehicles
  add constraint fk_vehicles_location foreign key (location_id) references public.locations (id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_vehicles') then
    create trigger tr_update_timestamp_vehicles
      before update on public.vehicles
      for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

create index if not exists idx_vehicles_dealer_id on public.vehicles(dealer_id);
create index if not exists idx_vehicles_location_id on public.vehicles(location_id);

-- ================
-- public.vehicle_images
-- ================
create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null,
  url text not null,
  caption text,
  is_primary boolean not null default false,
  ordering integer default 0,
  created_at timestamptz not null default now()
);

comment on table public.vehicle_images is 'Images for vehicles. One primary image per vehicle enforced by unique partial index.';

alter table if exists public.vehicle_images
  add constraint fk_vehicle_images_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

create unique index if not exists idx_vehicle_images_primary on public.vehicle_images(vehicle_id) where (is_primary);

create index if not exists idx_vehicle_images_vehicle_id on public.vehicle_images(vehicle_id);

-- ================
-- public.bookings
-- ================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null,
  renter_id uuid not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  total_price numeric(12,2) not null check (total_price >= 0),
  currency text not null default 'USD',
  status public.booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_booking_dates check (start_date < end_date)
);

comment on table public.bookings is 'Reservation requests for vehicles. start_date < end_date.';

alter table if exists public.bookings
  add constraint fk_bookings_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table if exists public.bookings
  add constraint fk_bookings_renter foreign key (renter_id) references public.users (id) on delete cascade;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_bookings') then
    create trigger tr_update_timestamp_bookings
      before update on public.bookings
      for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

create index if not exists idx_bookings_vehicle_id on public.bookings(vehicle_id);
create index if not exists idx_bookings_renter_id on public.bookings(renter_id);
create index if not exists idx_bookings_status on public.bookings(status);

-- ================
-- public.booking_status_history
-- ================
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  status public.booking_status not null,
  changed_by uuid,
  comment text,
  created_at timestamptz not null default now()
);

comment on table public.booking_status_history is 'History of status changes for bookings.';

alter table if exists public.booking_status_history
  add constraint fk_bsh_booking foreign key (booking_id) references public.bookings (id) on delete cascade;

alter table if exists public.booking_status_history
  add constraint fk_bsh_changed_by foreign key (changed_by) references public.users (id) on delete set null;

create index if not exists idx_bsh_booking_id on public.booking_status_history(booking_id);
create index if not exists idx_bsh_changed_by on public.booking_status_history(changed_by);

-- ================
-- public.rentals
-- ================
create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  vehicle_id uuid not null,
  renter_id uuid not null,
  owner_id uuid not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_rental_dates check (start_date < end_date)
);

comment on table public.rentals is 'Active or historical rental agreements (actual rentals).';

alter table if exists public.rentals
  add constraint fk_rentals_booking foreign key (booking_id) references public.bookings (id) on delete set null;

alter table if exists public.rentals
  add constraint fk_rentals_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table if exists public.rentals
  add constraint fk_rentals_renter foreign key (renter_id) references public.users (id) on delete cascade;

alter table if exists public.rentals
  add constraint fk_rentals_owner foreign key (owner_id) references public.users (id) on delete cascade;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_rentals') then
    create trigger tr_update_timestamp_rentals
      before update on public.rentals
      for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

create index if not exists idx_rentals_vehicle_id on public.rentals(vehicle_id);
create index if not exists idx_rentals_renter_id on public.rentals(renter_id);
create index if not exists idx_rentals_owner_id on public.rentals(owner_id);

-- ================
-- public.payments
-- ================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  rental_id uuid,
  payer_id uuid,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  provider text,
  status public.payment_status not null default 'pending',
  provider_response jsonb,
  created_at timestamptz not null default now()
);

comment on table public.payments is 'Payment records for bookings or rentals. amount >= 0.';

alter table if exists public.payments
  add constraint fk_payments_booking foreign key (booking_id) references public.bookings (id) on delete set null;

alter table if exists public.payments
  add constraint fk_payments_rental foreign key (rental_id) references public.rentals (id) on delete set null;

alter table if exists public.payments
  add constraint fk_payments_payer foreign key (payer_id) references public.users (id) on delete set null;

create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_rental_id on public.payments(rental_id);
create index if not exists idx_payments_payer_id on public.payments(payer_id);
create index if not exists idx_payments_status on public.payments(status);

-- ================
-- public.reviews
-- ================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null,
  user_id uuid not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

comment on table public.reviews is 'User reviews for vehicles. rating 1..5';

alter table if exists public.reviews
  add constraint fk_reviews_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table if exists public.reviews
  add constraint fk_reviews_user foreign key (user_id) references public.users (id) on delete cascade;

create index if not exists idx_reviews_vehicle_id on public.reviews(vehicle_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

-- ================
-- public.favorites
-- ================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  vehicle_id uuid not null,
  created_at timestamptz not null default now(),
  constraint uq_favorites_user_vehicle unique (user_id, vehicle_id)
);

comment on table public.favorites is 'User favorite vehicles (unique per user+vehicle).';

alter table if exists public.favorites
  add constraint fk_favorites_user foreign key (user_id) references public.users (id) on delete cascade;

alter table if exists public.favorites
  add constraint fk_favorites_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_vehicle_id on public.favorites(vehicle_id);

-- ================
-- public.notifications
-- ================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  payload jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'User notifications.';

alter table if exists public.notifications
  add constraint fk_notifications_user foreign key (user_id) references public.users (id) on delete cascade;

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_is_read on public.notifications(user_id, is_read);

-- ================
-- public.availability_blocks
-- ================
create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint chk_availability_dates check (start_date < end_date)
);

comment on table public.availability_blocks is 'Periods when a vehicle is unavailable (maintenance, owner block).';

alter table if exists public.availability_blocks
  add constraint fk_avb_vehicle foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

create index if not exists idx_availability_vehicle_id on public.availability_blocks(vehicle_id);

-- ================
-- Final: idempotent trigger creation for updated_at on tables that have updated_at
-- ================
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_locations') then
    create trigger tr_update_timestamp_locations before update on public.locations for each row execute function public.trigger_set_timestamp();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_vehicles') then
    create trigger tr_update_timestamp_vehicles before update on public.vehicles for each row execute function public.trigger_set_timestamp();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_bookings') then
    create trigger tr_update_timestamp_bookings before update on public.bookings for each row execute function public.trigger_set_timestamp();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'tr_update_timestamp_rentals') then
    create trigger tr_update_timestamp_rentals before update on public.rentals for each row execute function public.trigger_set_timestamp();
  end if;
end $$;

-- ================
-- Helpful additional indexes (optional, non-blocking)
-- ================
create index if not exists idx_vehicles_price_per_day on public.vehicles(price_per_day);
create index if not exists idx_bookings_dates on public.bookings(start_date, end_date);

-- ================
-- End of schema
-- ================
