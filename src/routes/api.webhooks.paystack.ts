import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack calls this URL directly from its servers when a charge succeeds,
// whether or not the buyer's browser ever returns to litville.net. It backs
// up the browser-based check that already runs on /ticket/$reference.
export const Route = createFileRoute("/api/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) {
          console.error("paystack webhook: PAYSTACK_SECRET_KEY not configured");
          return new Response("Not configured", { status: 500 });
        }

        // Paystack signs the raw body with the secret key (HMAC SHA512).
        // Verify before trusting anything in the payload.
        const rawBody = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
        const sigBuffer = Buffer.from(signature, "utf8");
        const expectedBuffer = Buffer.from(expected, "utf8");
        const isValid =
          sigBuffer.length === expectedBuffer.length && timingSafeEqual(sigBuffer, expectedBuffer);

        if (!isValid) {
          console.error("paystack webhook: invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { event?: string; data?: { reference?: string } };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        if (event.event === "charge.success" && event.data?.reference) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const reference = event.data.reference;

            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, status, tier_id, quantity")
              .eq("payment_reference", reference)
              .maybeSingle();

            if (order && order.status !== "paid") {
              const ticketCode = `LV${reference.replace(/[^A-Z0-9]/g, "").slice(-8)}`;

              // Only flips the order if it isn't already paid, so the sold
              // count is never incremented twice for the same payment.
              const { data: updated } = await supabaseAdmin
                .from("orders")
                .update({ status: "paid", ticket_code: ticketCode, paid_at: new Date().toISOString() })
                .eq("id", order.id)
                .neq("status", "paid")
                .select("id");

              if (updated && updated.length > 0) {
                const { data: tier } = await supabaseAdmin
                  .from("ticket_tiers")
                  .select("id, sold")
                  .eq("id", order.tier_id)
                  .maybeSingle();

                if (tier) {
                  await supabaseAdmin
                    .from("ticket_tiers")
                    .update({ sold: tier.sold + order.quantity })
                    .eq("id", tier.id);
                }
              }
            }
          } catch (err) {
            // Still acknowledge below; the ticket page check is the fallback.
            console.error("paystack webhook: failed to process charge.success", err);
          }
        }

        // Always acknowledge so Paystack doesn't keep retrying.
        return new Response("ok", { status: 200 });
      },
    },
  },
});
