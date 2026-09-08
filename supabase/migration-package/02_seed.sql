-- Litville — current live content (event, ticket tiers, venue zones, reviews)
-- Run after 01_schema.sql. Orders are intentionally NOT copied.

insert into public.events
  (id, slug, title, headliner, supporting_acts, starts_at, doors_open, venue, city, description, poster_url, capacity, status)
values
  ('933578a9-4531-4943-a6ba-e599ad4da07c',
   'litville-live-lagos-nights',
   'VYBES HOUSE: WOW-WEDNESDAYS',
   'A MIDWEEK RECHARGE',
   null,
   '2026-12-30 19:00:00+00',
   '7:00 PM',
   'LANDMARK VILLAGE',
   'VI LAGOS',
   'A curated midweek recharge experience built around DJ sets, artist spotlights, dance, games, entertainment and pop-up activations to a loyal, recurring community rather than a one-off event.',
   null,
   400,
   'published');

insert into public.ticket_tiers
  (id, event_id, name, description, price_kobo, perks, quantity, sold, sort_order)
values
  ('3efbe27c-bb80-406e-9ce1-35f86fe6b1ee', '933578a9-4531-4943-a6ba-e599ad4da07c',
   'General', 'Standing access to the main floor.', 1500000,
   array['Main floor standing','Access from doors open','Digital QR ticket'], 250, 0, 1),
  ('7984c2d5-b847-46e1-8175-3a75f9170792', '933578a9-4531-4943-a6ba-e599ad4da07c',
   'PREMIUM', 'Raised deck with a clear stage view and table service.', 30000000,
   array['Raised VIP deck','Reserved seating zone','One complimentary drink '], 100, 0, 2),
  ('268182cc-af3f-48c0-a4ca-7df1e47135b9', '933578a9-4531-4943-a6ba-e599ad4da07c',
   'DELUXE', 'Elevated-stage view, host service and after-show access.', 50000000,
   array['Elevated Stage-view','Dedicated host','Bottle service credit','Curate Exclusive Wednesday Offerings'], 50, 0, 3);

insert into public.venue_zones
  (id, event_id, name, description, tier_name, sort_order)
values
  ('15b3c5ea-3f8a-4f40-885b-5708daf9883b', '933578a9-4531-4943-a6ba-e599ad4da07c', 'Floor A — Stage Front', 'Closest standing block, right at the barricade.', 'General', 1),
  ('869518e2-666d-482a-86f8-45c406a3694c', '933578a9-4531-4943-a6ba-e599ad4da07c', 'Floor B — Mid', 'Centre of the floor, best sound balance.', 'General', 2),
  ('8353feb7-b49e-4d89-8deb-c04fad3e82fa', '933578a9-4531-4943-a6ba-e599ad4da07c', 'Deck Left', 'Raised deck, stage left, seated.', 'PREMIUM', 3),
  ('870beb31-d2d2-4d4e-9f9e-10e152284f1f', '933578a9-4531-4943-a6ba-e599ad4da07c', 'Deck Right', 'Raised deck, stage right, seated.', 'PREMIUM', 4),
  ('6bfd3456-7424-4346-b352-7a1d6166e915', '933578a9-4531-4943-a6ba-e599ad4da07c', 'Table Row 1', 'Front-of-stage table for up to six guests.', 'DELUXE', 5);

insert into public.reviews
  (id, author_name, subject_type, subject_title, rating, body)
values
  ('6e230b01-b230-4da4-95b8-bc38f648c7f3', 'Tomiwa A.', 'show',   'Flytime Fest — Night 3', 5, 'Sound was clean and the crowd never sat down. Gate was slow though, get there before 8.'),
  ('73f04968-c04b-46cf-8073-ae634c57535e', 'Zainab O.', 'album',  'Rave & Roses Ultra', 4, 'Grows on you. Track 6 is the one that stays.'),
  ('f2c281af-ea0c-422d-a0c5-cf15abbfb679', 'Chidi E.',  'single', 'Commas — Ayra Starr', 5, 'Still in rotation two years later. Undefeated.');
