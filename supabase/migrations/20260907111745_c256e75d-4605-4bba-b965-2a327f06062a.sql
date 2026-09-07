DROP POLICY IF EXISTS orders_public_read ON public.orders;
DROP POLICY IF EXISTS orders_public_create ON public.orders;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.orders FROM authenticated;
GRANT ALL ON public.orders TO service_role;