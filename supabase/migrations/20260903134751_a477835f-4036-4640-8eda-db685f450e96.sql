CREATE TABLE public.events (
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
  capacity int not null default 400,
  status text not null default 'published',
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (status = 'published');

CREATE TABLE public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_kobo bigint not null,
  perks text[] not null default '{}',
  quantity int not null default 100,
  sold int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.ticket_tiers TO anon;
GRANT SELECT ON public.ticket_tiers TO authenticated;
GRANT ALL ON public.ticket_tiers TO service_role;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiers_public_read" ON public.ticket_tiers FOR SELECT USING (true);

CREATE TABLE public.venue_zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text not null default '',
  tier_name text,
  sort_order int not null default 0
);
GRANT SELECT ON public.venue_zones TO anon;
GRANT SELECT ON public.venue_zones TO authenticated;
GRANT ALL ON public.venue_zones TO service_role;
ALTER TABLE public.venue_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zones_public_read" ON public.venue_zones FOR SELECT USING (true);

CREATE TABLE public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tier_id uuid not null references public.ticket_tiers(id) on delete restrict,
  zone_name text,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity int not null default 1,
  amount_kobo bigint not null,
  split_count int not null default 1,
  payment_reference text not null unique,
  status text not null default 'pending',
  ticket_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_public_read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_public_create" ON public.orders FOR INSERT WITH CHECK (status = 'pending');

CREATE TABLE public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  subject_type text not null default 'show',
  subject_title text not null,
  rating int not null,
  body text not null default '',
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_public_create" ON public.reviews FOR INSERT WITH CHECK (rating BETWEEN 1 AND 5 AND char_length(author_name) BETWEEN 2 AND 40);

INSERT INTO public.events (slug, title, headliner, supporting_acts, starts_at, doors_open, venue, city, description, capacity)
VALUES (
  'litville-live-lagos-nights',
  'Litville Live: Lagos Nights',
  'Odumodublvck',
  'Fave, Shallipopi, DJ Lambo',
  '2026-12-19 20:00:00+01',
  '7:00 PM',
  'Muri Okunola Park',
  'Lagos',
  'The first Litville-hosted showcase. One night, one stage, the sound of new Lagos. Intimate 400-capacity production with a full live band, curated sound design and a late DJ set to close.',
  400
);

INSERT INTO public.ticket_tiers (event_id, name, description, price_kobo, perks, quantity, sort_order)
SELECT id, 'General', 'Standing access to the main floor.', 1500000, ARRAY['Main floor standing','Access from doors open','Digital QR ticket'], 250, 1 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.ticket_tiers (event_id, name, description, price_kobo, perks, quantity, sort_order)
SELECT id, 'VIP', 'Raised deck with a clear stage view and table service.', 4000000, ARRAY['Raised VIP deck','Reserved seating zone','One complimentary drink','Priority entry lane'], 100, 2 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.ticket_tiers (event_id, name, description, price_kobo, perks, quantity, sort_order)
SELECT id, 'VVIP', 'Front-of-stage tables, host service and after-show access.', 9000000, ARRAY['Front-of-stage table','Dedicated host','Bottle service credit','After-show lounge access'], 50, 3 FROM public.events WHERE slug = 'litville-live-lagos-nights';

INSERT INTO public.venue_zones (event_id, name, description, tier_name, sort_order)
SELECT id, 'Floor A — Stage Front', 'Closest standing block, right at the barricade.', 'General', 1 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.venue_zones (event_id, name, description, tier_name, sort_order)
SELECT id, 'Floor B — Mid', 'Centre of the floor, best sound balance.', 'General', 2 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.venue_zones (event_id, name, description, tier_name, sort_order)
SELECT id, 'Deck Left', 'Raised deck, stage left, seated.', 'VIP', 3 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.venue_zones (event_id, name, description, tier_name, sort_order)
SELECT id, 'Deck Right', 'Raised deck, stage right, seated.', 'VIP', 4 FROM public.events WHERE slug = 'litville-live-lagos-nights';
INSERT INTO public.venue_zones (event_id, name, description, tier_name, sort_order)
SELECT id, 'Table Row 1', 'Front-of-stage table for up to six guests.', 'VVIP', 5 FROM public.events WHERE slug = 'litville-live-lagos-nights';

INSERT INTO public.reviews (author_name, subject_type, subject_title, rating, body) VALUES
('Tomiwa A.', 'show', 'Flytime Fest — Night 3', 5, 'Sound was clean and the crowd never sat down. Gate was slow though, get there before 8.'),
('Zainab O.', 'album', 'Rave & Roses Ultra', 4, 'Grows on you. Track 6 is the one that stays.'),
('Chidi E.', 'single', 'Commas — Ayra Starr', 5, 'Still in rotation two years later. Undefeated.');