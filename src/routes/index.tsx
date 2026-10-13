import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getFeaturedEvent, listEvents, listReviews } from "@/lib/litville.functions";
import { formatEventDate, formatEventTime, formatNaira } from "@/components/site-chrome";
import { EventCard } from "@/components/event-card";
import heroCrowd from "@/assets/hero-crowd.jpg";

const featuredQuery = queryOptions({
  queryKey: ["featured-event"],
  queryFn: () => getFeaturedEvent(),
});

const eventsQuery = queryOptions({
  queryKey: ["events", "all"],
  queryFn: () => listEvents(),
});

const reviewsQuery = queryOptions({
  queryKey: ["reviews", "home"],
  queryFn: () => listReviews(),
});

const DESCRIPTION =
  "Litville is the home of live experiences in Lagos. Buy tickets to comedy specials, concerts and curated nights out, pay securely with Paystack and get your QR ticket in seconds.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredQuery),
      context.queryClient.ensureQueryData(eventsQuery),
      context.queryClient.ensureQueryData(reviewsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Litville — The home of live experiences in Lagos" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Litville — The home of live experiences" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: event } = useSuspenseQuery(featuredQuery);
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const cheapest = event?.tiers.length
    ? Math.min(...event.tiers.map((t) => Number(t.price_kobo)))
    : null;
  const moreUpcoming = events.upcoming.filter((e) => e.id !== event?.id);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroCrowd}
          alt="Audience with hands raised under warm stage lights at a Litville event"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 overlay-fade" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:pt-40">
          <p className="eyebrow">Lagos · Comedy · Concerts · Nights out</p>
          <h1 className="mt-5 max-w-3xl text-5xl sm:text-7xl">
            The home of
            <br />
            <span className="text-gradient-heat">live experiences</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            From comedy specials to concerts and curated nights out — find what's on in Lagos,
            choose your tier and have your QR ticket in seconds.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {event ? (
              <Link to="/event/$slug" params={{ slug: event.slug }} className="btn-heat">
                Get tickets{cheapest !== null ? ` — from ${formatNaira(cheapest)}` : ""}
              </Link>
            ) : null}
            <Link to="/events" className="btn-ghost-line">
              See all events
            </Link>
          </div>
        </div>
      </section>

      {event ? (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">Up next</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
            {event.poster_url ? (
              <img
                src={event.poster_url}
                alt={`${event.title} poster`}
                loading="lazy"
                className="w-full rounded-lg border border-border object-contain shadow-heat"
              />
            ) : null}
            <div>
              <p className="eyebrow">
                {formatEventDate(event.starts_at)} · {event.venue}, {event.city}
              </p>
              <h2 className="mt-4 text-4xl sm:text-5xl">{event.title}</h2>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-primary">
                {event.headliner}
                {event.supporting_acts ? ` · ${event.supporting_acts}` : ""}
              </p>
              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                {event.doors_open ? (
                  <div>
                    <dt className="eyebrow">Arrival</dt>
                    <dd className="mt-1 text-sm">{event.doors_open}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="eyebrow">Show starts</dt>
                  <dd className="mt-1 text-sm">{formatEventTime(event.starts_at)}</dd>
                </div>
              </dl>
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
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
              <Link to="/event/$slug" params={{ slug: event.slug }} className="btn-heat mt-8">
                Choose your tickets
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {moreUpcoming.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-3xl">Also coming up</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreUpcoming.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {[
            {
              title: "Clear, upfront pricing",
              body: "Every tier and what it includes is listed before you pay. No surprises at the gate.",
            },
            {
              title: "Pay in seconds",
              body: "Card, bank transfer or USSD through Paystack, with your QR ticket issued as soon as payment is confirmed.",
            },
            {
              title: "Your voice counts",
              body: "Rate the events you attend. Honest reviews help us make every experience better than the last.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {events.past.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Past events</p>
              <h2 className="mt-3 text-4xl">Where we've been</h2>
            </div>
            <Link to="/events" hash="past" className="btn-ghost-line">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.past.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} past />
            ))}
          </div>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Reviews</p>
              <h2 className="mt-3 text-4xl">What guests are saying</h2>
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
      ) : null}

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-lg border border-border bg-gradient-heat p-10 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">Host with Litville</p>
          <h2 className="mt-4 max-w-2xl text-4xl">Have a show, a special or a night to sell?</h2>
          <p className="mt-4 max-w-xl text-sm font-medium">
            Promoters, venues and performers use Litville to sell tickets, see sales as they happen
            and check guests in at the door.
          </p>
          <Link to="/organisers" className="btn-ghost-line mt-7 !border-primary-foreground">
            Partner with us
          </Link>
        </div>
      </section>
    </div>
  );
}
