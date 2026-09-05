INSERT INTO public.ticket_tiers (event_id, name, description, price_kobo, perks, quantity, sort_order)
SELECT id, 'PREMIUM', 'Raised deck with a clear stage view and table service.', 30000000, ARRAY['Raised VIP deck','Reserved seating zone','One complimentary drink','Priority entry lane'], 100, 2 FROM public.events WHERE slug = 'litville-live-lagos-nights';

INSERT INTO public.ticket_tiers (event_id, name, description, price_kobo, perks, quantity, sort_order)
SELECT id, 'DELUXE', 'Front-of-stage tables, host service and after-show access.', 50000000, ARRAY['Front-of-stage table','Dedicated host','Bottle service credit','After-show lounge access'], 50, 3 FROM public.events WHERE slug = 'litville-live-lagos-nights';

UPDATE public.venue_zones SET tier_name = 'PREMIUM' WHERE tier_name = 'VIP' AND event_id IN (SELECT id FROM public.events WHERE slug = 'litville-live-lagos-nights');
UPDATE public.venue_zones SET tier_name = 'DELUXE' WHERE tier_name = 'VVIP' AND event_id IN (SELECT id FROM public.events WHERE slug = 'litville-live-lagos-nights');

DELETE FROM public.ticket_tiers WHERE name IN ('VIP', 'VVIP') AND event_id IN (SELECT id FROM public.events WHERE slug = 'litville-live-lagos-nights');