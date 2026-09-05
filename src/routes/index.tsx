import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getFeaturedEvent, listReviews } from "@/lib/litville.functions";
import { formatEventDate, formatEventTime, formatNaira } from "@/components/site-chrome";
import heroCrowd from "@/assets/hero-crowd.jpg";
import eventPosterAsset from "@/assets/wow-wednesdays.png.asset.json";

const eventPoster = eventPosterAsset.url;

const featuredQuery = queryOptions({
  queryKey: ["featured-event"],
  queryFn: () => getFeaturedEvent(),
});

const reviewsQuery = queryOptions({
  queryKey: ["reviews", "home"],
  queryFn: () => listReviews(),
});

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredQuery),
      context.queryClient.ensureQueryData(reviewsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Litville — Afrobeats live shows, tickets and community" },
      {
        name: "description",
        content:
          "Buy tickets to Litville-hosted live music shows in Lagos, rate the shows you attend and follow the Afrobeats charts. Payments by Paystack.",
      },
      { property: "og:title", content: "Litville — Afrobeats live shows, tickets and community" },
      {
        property: "og:description",
        content:
          "Buy tickets to Litville-hosted live music shows in Lagos, rate the shows you attend and follow the Afrobeats charts.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: event } = useSuspenseQuery(featuredQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const cheapest = event?.tiers.length
    ? Math.min(...event.tiers.map((t) => Number(t.price_kobo)))
    : null;

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroCrowd}
          alt="Crowd with hands raised under deep orange stage lights at a Litville show"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 overlay-fade" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:pt-40">
          <p className="eyebrow">Lagos · Phase one · Venue tickets</p>
          <h1 className="mt-5 max-w-3xl text-5xl sm:text-7xl">
            Own the room before
            <br />
            it <span className="text-gradient-heat">sells out</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Litville produces its own live music nights and sells the tickets directly — clear pricing,
            a zone you actually choose, and a QR ticket in seconds.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {event ? (
              <Link to="/event/$slug" params={{ slug: event.slug }} className="btn-heat">
                Get tickets{cheapest !== null ? ` — from ${formatNaira(cheapest)}` : ""}
              </Link>
            ) : null}
            <Link to="/charts" className="btn-ghost-line">
              See the charts
            </Link>
          </div>
        </div>
      </section>

      {event ? (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">The next Litville night</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
            <img
              src={eventPoster}
              alt={`${event.title} event flier`}
              loading="lazy"
              width={1170}
              height={1560}
              className="w-full rounded-lg border border-border object-contain shadow-heat"
            />
            <div>
              <p className="eyebrow">
                {formatEventDate(event.starts_at).toUpperCase().replace(", ", ",")} · {event.venue},{" "}
                {event.city}
              </p>
              <h2 className="mt-4 text-4xl sm:text-5xl">{event.title}</h2>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-primary">
                {event.headliner}
                {event.supporting_acts ? ` · ${event.supporting_acts}` : ""}
              </p>
              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow">Doors / stage</dt>
                  <dd className="mt-1 text-sm">
                    {event.doors_open ?? "—"} · on stage {formatEventTime(event.starts_at)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Capacity</dt>
                  <dd className="mt-1 text-sm">{event.capacity} guests</dd>
                </div>
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
              <ul className="mt-7 space-y-2">
                {event.tiers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                  >
                    <span className="uppercase tracking-[0.14em]">{t.name}</span>
                    <span className="text-primary">{formatNaira(Number(t.price_kobo))}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/event/$slug"
                params={{ slug: event.slug }}
                className="btn-heat mt-8"
              >
                Choose your tier
              </Link>
            </div>
          </div>
        </section>

      ) : null}

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {[
            {
              title: "Pick your spot",
              body: "Zones are mapped before you pay — barricade, mid-floor, raised deck or a table. No mystery seating.",
            },
            {
              title: "Pay in seconds",
              body: "Card, bank transfer or USSD through Paystack, with your QR ticket issued the moment payment lands.",
            },
            {
              title: "Rate what you saw",
              body: "Score the show, the sound and the gate. Reviews stay public so the next night runs better.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From the community</p>
            <h2 className="mt-3 text-4xl">Latest fan reviews</h2>
          </div>
          <Link to="/community" className="btn-ghost-line">
            Write a review
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <article key={review.id} className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-primary">{"★".repeat(review.rating)}</p>
              <h3 className="mt-3 text-lg">{review.subject_title}</h3>
              <p className="eyebrow mt-1">{review.subject_type}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <p className="mt-4 text-xs text-muted-foreground">— {review.author_name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-lg border border-border bg-gradient-heat p-10 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">Coming in phase two</p>
          <h2 className="mt-4 max-w-2xl text-4xl">
            Livestream tickets for everyone who can't be in the room
          </h2>
          <p className="mt-4 max-w-xl text-sm font-medium">
            The same event page will sell a venue ticket and a virtual ticket side by side, so the
            diaspora can buy in and artists can play to a room and a world at once.
          </p>
          <Link to="/livestream" className="btn-ghost-line mt-7 !border-primary-foreground">
            See what's next
          </Link>
        </div>
      </section>
    </div>
  );
}
