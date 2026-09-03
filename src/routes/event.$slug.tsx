import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getEventBySlug, startCheckout } from "@/lib/litville.functions";
import { formatEventDate, formatEventTime, formatNaira } from "@/components/site-chrome";
import eventPoster from "@/assets/event-poster.jpg";

const eventQuery = (slug: string) =>
  queryOptions({
    queryKey: ["event", slug],
    queryFn: () => getEventBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/event/$slug")({
  loader: async ({ context, params }) => {
    const event = await context.queryClient.ensureQueryData(eventQuery(params.slug));
    if (!event) throw notFound();
    return { title: event.title, venue: event.venue, city: event.city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event unavailable — Litville" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — tickets | Litville`;
    const description = `Buy venue tickets for ${loaderData.title} at ${loaderData.venue}, ${loaderData.city}. Pick your zone, split the cost and pay securely with Paystack.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: EventPage,
});

function EventPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: event } = useSuspenseQuery(eventQuery(slug));

  const [tierId, setTierId] = useState(event?.tiers[0]?.id ?? "");
  const [zoneName, setZoneName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [splitCount, setSplitCount] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tier = useMemo(
    () => event?.tiers.find((t) => t.id === tierId) ?? event?.tiers[0],
    [event, tierId],
  );
  const zones = useMemo(
    () => (event?.zones ?? []).filter((z) => !z.tier_name || z.tier_name === tier?.name),
    [event, tier],
  );

  if (!event || !tier) return null;

  const total = Number(tier.price_kobo) * quantity;
  const remaining = tier.quantity - tier.sold;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await startCheckout({
        data: {
          slug,
          tierId: tier!.id,
          zoneName,
          quantity,
          splitCount,
          buyerName,
          buyerEmail,
          buyerPhone,
          origin: window.location.origin,
        },
      });
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      navigate({ to: "/ticket/$reference", params: { reference: result.reference } });
    } catch {
      setError("Something went wrong starting that payment. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="eyebrow">
            {formatEventDate(event.starts_at)} · {event.venue}, {event.city}
          </p>
          <h1 className="mt-4 text-5xl sm:text-6xl">{event.title}</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-primary">
            {event.headliner}
            {event.supporting_acts ? ` · ${event.supporting_acts}` : ""}
          </p>
          <img
            src={eventPoster}
            alt={`${event.headliner} on stage`}
            loading="lazy"
            width={1024}
            height={1280}
            className="mt-8 aspect-[4/3] w-full rounded-lg border border-border object-cover"
          />
          <p className="mt-7 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

          <h2 className="mt-12 text-2xl">Ticket tiers</h2>
          <div className="mt-4 space-y-3">
            {event.tiers.map((t) => {
              const selected = t.id === tier.id;
              const left = t.quantity - t.sold;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setTierId(t.id);
                    setZoneName(null);
                  }}
                  disabled={left <= 0}
                  className={`w-full rounded-lg border p-5 text-left transition-colors ${
                    selected ? "border-primary bg-card" : "border-border bg-card/40 hover:border-primary/60"
                  } disabled:opacity-40`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-xl">{t.name}</h3>
                    <span className="text-lg font-bold text-primary">
                      {formatNaira(Number(t.price_kobo))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {t.perks.map((perk) => (
                      <li
                        key={perk}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {left > 0 ? `${left} left` : "Sold out"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleCheckout}
          className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24"
        >
          <p className="eyebrow">Checkout</p>
          <h2 className="mt-2 text-2xl">{tier.name} ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNaira(Number(tier.price_kobo))} each · {remaining} available
          </p>

          {zones.length > 0 ? (
            <div className="mt-6">
              <label className="eyebrow" htmlFor="zone">
                Pick your zone
              </label>
              <select
                id="zone"
                className="field mt-2"
                value={zoneName ?? ""}
                onChange={(e) => setZoneName(e.target.value || null)}
              >
                <option value="">No preference</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} — {z.description}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow" htmlFor="qty">
                Tickets
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                max={Math.min(10, Math.max(1, remaining))}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="field mt-2"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="split">
                Splitting between
              </label>
              <input
                id="split"
                type="number"
                min={1}
                max={10}
                value={splitCount}
                onChange={(e) => setSplitCount(Number(e.target.value))}
                className="field mt-2"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="eyebrow" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="field mt-2"
                placeholder="Ada Nwosu"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="email">
                Email for your ticket
              </label>
              <input
                id="email"
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="field mt-2"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="phone">
                Phone (optional)
              </label>
              <input
                id="phone"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="field mt-2"
                placeholder="080..."
              />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-primary">{formatNaira(total)}</span>
            </div>
            {splitCount > 1 ? (
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Each of {splitCount} people</span>
                <span>{formatNaira(Math.ceil(total / splitCount))}</span>
              </div>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          <button type="submit" className="btn-heat mt-6 w-full" disabled={submitting || remaining <= 0}>
            {submitting ? "Redirecting to Paystack…" : "Pay with Paystack"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Card, bank transfer or USSD. Your QR ticket appears right after payment.
          </p>
        </form>
      </div>
    </div>
  );
}
