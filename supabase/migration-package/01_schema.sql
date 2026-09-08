-- Litville — consolidated schema for a fresh Supabase project
-- Run this first, in the SQL editor of the target project.

-- ---------------------------------------------------------------- helpers
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- ---------------------------------------------------------------- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  headliner text not null,
  supporting_acts text,
  starts_at timestamptz not null,
  doors_open text,
  venue text not null,
  city text not null default 'Lagos',
  description text not null default '',
  poster_url text,
  capacity integer not null default 400,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

grant select on public.events to anon, authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;

create policy events_public_read on public.events
  for select using (status = 'published');

-- ---------------------------------------------------------------- ticket tiers
create table public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_kobo bigint not null,
  perks text[] not null default '{}'::text[],
  quantity integer not null default 100,
  sold integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.ticket_tiers to anon, authenticated;
grant all on public.ticket_tiers to service_role;
alter table public.ticket_tiers enable row level security;

create policy tiers_public_read on public.ticket_tiers
  for select using (true);

-- ---------------------------------------------------------------- venue zones
create table public.venue_zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text not null default '',
  tier_name text,
  sort_order integer not null default 0
);

grant select on public.venue_zones to anon, authenticated;
grant all on public.venue_zones to service_role;
alter table public.venue_zones enable row level security;

create policy zones_public_read on public.venue_zones
  for select using (true);

-- ---------------------------------------------------------------- orders
-- No public access at all: buyer details, payment references and ticket codes
-- are only reachable through server-side code using the service role key.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  tier_id uuid not null references public.ticket_tiers(id),
  zone_name text,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity integer not null default 1,
  amount_kobo bigint not null,
  split_count integer not null default 1,
  payment_reference text not null unique,
  status text not null default 'pending',
  ticket_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

revoke all on public.orders from anon, authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
-- intentionally no policies for anon/authenticated

-- ---------------------------------------------------------------- reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  subject_type text not null default 'show',
  subject_title text not null,
  rating integer not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

grant select, insert on public.reviews to anon, authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create policy reviews_public_read on public.reviews
  for select using (true);

create policy reviews_public_create on public.reviews
  for insert with check (
    rating between 1 and 5
    and char_length(author_name) between 2 and 40
  );
