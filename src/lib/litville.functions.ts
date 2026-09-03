import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type EventDetail = {
  id: string;
  slug: string;
  title: string;
  headliner: string;
  supporting_acts: string | null;
  starts_at: string;
  doors_open: string | null;
  venue: string;
  city: string;
  description: string;
  capacity: number;
  tiers: {
    id: string;
    name: string;
    description: string;
    price_kobo: number;
    perks: string[];
    quantity: number;
    sold: number;
  }[];
  zones: { id: string; name: string; description: string; tier_name: string | null }[];
};

export const getFeaturedEvent = createServerFn({ method: "GET" }).handler(
  async (): Promise<EventDetail | null> => {
    const supabase = publicClient();
    const { data: event } = await supabase
      .from("events")
      .select(
        "id, slug, title, headliner, supporting_acts, starts_at, doors_open, venue, city, description, capacity",
      )
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!event) return null;
    return withRelations(supabase, event);
  },
);

export const getEventBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }): Promise<EventDetail | null> => {
    const supabase = publicClient();
    const { data: event } = await supabase
      .from("events")
      .select(
        "id, slug, title, headliner, supporting_acts, starts_at, doors_open, venue, city, description, capacity",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (!event) return null;
    return withRelations(supabase, event);
  });

async function withRelations(
  supabase: ReturnType<typeof publicClient>,
  event: Omit<EventDetail, "tiers" | "zones">,
): Promise<EventDetail> {
  const [{ data: tiers }, { data: zones }] = await Promise.all([
    supabase
      .from("ticket_tiers")
      .select("id, name, description, price_kobo, perks, quantity, sold")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("venue_zones")
      .select("id, name, description, tier_name")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
  ]);
  return { ...event, tiers: tiers ?? [], zones: zones ?? [] };
}

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, author_name, subject_type, subject_title, rating, body, created_at")
    .order("created_at", { ascending: false })
    .limit(24);
  return data ?? [];
});

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      author_name: string;
      subject_type: string;
      subject_title: string;
      rating: number;
      body: string;
    }) => ({
      author_name: String(data.author_name).trim().slice(0, 40),
      subject_type: ["show", "album", "single"].includes(data.subject_type)
        ? data.subject_type
        : "show",
      subject_title: String(data.subject_title).trim().slice(0, 120),
      rating: Math.min(5, Math.max(1, Math.round(Number(data.rating)))),
      body: String(data.body ?? "")
        .trim()
        .slice(0, 800),
    }),
  )
  .handler(async ({ data }) => {
    if (data.author_name.length < 2 || data.subject_title.length < 2) {
      return { ok: false, error: "Add your name and what you're reviewing." };
    }
    const supabase = publicClient();
    const { error } = await supabase.from("reviews").insert(data);
    if (error) return { ok: false, error: "Could not save that review. Try again." };
    return { ok: true, error: null };
  });

/* ---------------- Paystack ---------------- */

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      slug: string;
      tierId: string;
      zoneName: string | null;
      quantity: number;
      splitCount: number;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      origin: string;
    }) => ({
      slug: String(data.slug).slice(0, 120),
      tierId: String(data.tierId),
      zoneName: data.zoneName ? String(data.zoneName).slice(0, 120) : null,
      quantity: Math.min(10, Math.max(1, Math.round(Number(data.quantity) || 1))),
      splitCount: Math.min(10, Math.max(1, Math.round(Number(data.splitCount) || 1))),
      buyerName: String(data.buyerName).trim().slice(0, 80),
      buyerEmail: String(data.buyerEmail).trim().toLowerCase().slice(0, 120),
      buyerPhone: String(data.buyerPhone ?? "")
        .trim()
        .slice(0, 30),
      origin: String(data.origin).slice(0, 200),
    }),
  )
  .handler(async ({ data }) => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.buyerEmail) || data.buyerName.length < 2) {
      return { ok: false as const, error: "Enter a valid name and email address." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: event } = await supabaseAdmin
      .from("events")
      .select("id, title")
      .eq("slug", data.slug)
      .maybeSingle();
    const { data: tier } = await supabaseAdmin
      .from("ticket_tiers")
      .select("id, name, price_kobo, quantity, sold, event_id")
      .eq("id", data.tierId)
      .maybeSingle();

    if (!event || !tier || tier.event_id !== event.id) {
      return { ok: false as const, error: "That ticket is no longer available." };
    }
    if (tier.sold + data.quantity > tier.quantity) {
      return { ok: false as const, error: `Only ${tier.quantity - tier.sold} ${tier.name} tickets left.` };
    }

    const amountKobo = Number(tier.price_kobo) * data.quantity;
    const reference = `LV-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      event_id: event.id,
      tier_id: tier.id,
      zone_name: data.zoneName,
      buyer_name: data.buyerName,
      buyer_email: data.buyerEmail,
      buyer_phone: data.buyerPhone || null,
      quantity: data.quantity,
      amount_kobo: amountKobo,
      split_count: data.splitCount,
      payment_reference: reference,
      status: "pending",
    });
    if (insertError) return { ok: false as const, error: "Could not start that order." };

    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) return { ok: false as const, error: "Payments are not configured yet." };

    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.buyerEmail,
          amount: amountKobo,
          reference,
          currency: "NGN",
          callback_url: `${data.origin}/ticket/${reference}`,
          metadata: {
            event: event.title,
            tier: tier.name,
            zone: data.zoneName,
            quantity: data.quantity,
            split_count: data.splitCount,
            buyer_name: data.buyerName,
          },
        }),
      });
      const json = (await res.json()) as {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string };
      };
      if (!json.status || !json.data?.authorization_url) {
        console.error("paystack initialize failed", json.message);
        return { ok: false as const, error: "Payment provider rejected the request." };
      }
      return { ok: true as const, error: null, reference, url: json.data.authorization_url };
    } catch (err) {
      console.error("paystack initialize error", err);
      return { ok: false as const, error: "Could not reach the payment provider." };
    }
  });

export type TicketResult = {
  status: "paid" | "pending" | "failed" | "missing";
  reference: string;
  ticketCode: string | null;
  buyerName: string | null;
  buyerEmail: string | null;
  quantity: number;
  amountKobo: number;
  tierName: string | null;
  zoneName: string | null;
  eventTitle: string | null;
  eventVenue: string | null;
  eventStartsAt: string | null;
  splitCount: number;
  message?: string;
};

export const confirmTicket = createServerFn({ method: "POST" })
  .inputValidator((data: { reference: string }) => ({
    reference: String(data.reference).slice(0, 80),
  }))
  .handler(async ({ data }): Promise<TicketResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, status, ticket_code, buyer_name, buyer_email, quantity, amount_kobo, zone_name, split_count, tier_id, event_id",
      )
      .eq("payment_reference", data.reference)
      .maybeSingle();

    if (!order) {
      return {
        status: "missing",
        reference: data.reference,
        ticketCode: null,
        buyerName: null,
        buyerEmail: null,
        quantity: 0,
        amountKobo: 0,
        tierName: null,
        zoneName: null,
        eventTitle: null,
        eventVenue: null,
        eventStartsAt: null,
        splitCount: 1,
        message: "We couldn't find that order reference.",
      };
    }

    const [{ data: tier }, { data: event }] = await Promise.all([
      supabaseAdmin.from("ticket_tiers").select("id, name, sold").eq("id", order.tier_id).maybeSingle(),
      supabaseAdmin
        .from("events")
        .select("title, venue, starts_at")
        .eq("id", order.event_id)
        .maybeSingle(),
    ]);

    let status = order.status as TicketResult["status"];
    let ticketCode = order.ticket_code;
    let message: string | undefined;

    if (order.status !== "paid") {
      const secret = process.env["PAYSTACK_SECRET_KEY"];
      if (!secret) {
        message = "Payments are not configured yet.";
      } else {
        try {
          const res = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
            { headers: { Authorization: `Bearer ${secret}` } },
          );
          const json = (await res.json()) as {
            status?: boolean;
            data?: { status?: string; amount?: number };
          };
          const paystackStatus = json.data?.status;
          if (json.status && paystackStatus === "success") {
            ticketCode = `LV${data.reference.replace(/[^A-Z0-9]/g, "").slice(-8)}`;
            await supabaseAdmin
              .from("orders")
              .update({ status: "paid", ticket_code: ticketCode, paid_at: new Date().toISOString() })
              .eq("id", order.id);
            if (tier) {
              await supabaseAdmin
                .from("ticket_tiers")
                .update({ sold: tier.sold + order.quantity })
                .eq("id", tier.id);
            }
            status = "paid";
          } else if (paystackStatus === "failed" || paystackStatus === "abandoned") {
            await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
            status = "failed";
            message = "That payment did not go through.";
          } else {
            status = "pending";
            message = "Payment is still processing. Refresh in a moment.";
          }
        } catch (err) {
          console.error("paystack verify error", err);
          status = "pending";
          message = "We couldn't reach the payment provider. Refresh in a moment.";
        }
      }
    }

    return {
      status,
      reference: data.reference,
      ticketCode,
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      quantity: order.quantity,
      amountKobo: Number(order.amount_kobo),
      tierName: tier?.name ?? null,
      zoneName: order.zone_name,
      eventTitle: event?.title ?? null,
      eventVenue: event?.venue ?? null,
      eventStartsAt: event?.starts_at ?? null,
      splitCount: order.split_count,
      ...(message ? { message } : {}),
    };
  });
