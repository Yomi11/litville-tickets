# Litville migration package

Everything needed to run this app on your own database.

## Files
- `01_schema.sql` — all tables, access rules and permissions.
- `02_seed.sql` — the current event, ticket levels, venue zones and reviews. Past orders are not copied.

## Steps
1. In your own database project, open the SQL editor and run `01_schema.sql`, then `02_seed.sql`.
2. In the new Lovable project (connected to your database and to your GitHub repo), set these values:
   - `VITE_SUPABASE_URL` — your project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your public key
   - `SUPABASE_SERVICE_ROLE_KEY` — your secret service key (server side only)
   - `PAYSTACK_SECRET_KEY` — your live Paystack secret key
3. Re-upload the event flier image if it isn't already in the repo (`src/assets/`).
4. Test a real ticket purchase end to end, then publish and connect `litville.net`.

## Notes
- Orders are locked down: no public reading or writing. Checkout and ticket lookups happen through server code using the secret key only.
- Ticket prices are stored in kobo (₦15,000 = 1500000).
- If you'd rather keep ticket counters at their current values, edit the `sold` numbers in `02_seed.sql` before running it.
