import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/litville.functions";
import { EventCard } from "@/components/event-card";

const eventsQuery = queryOptions({
  queryKey: ["events", "all"],
  queryFn: () => listEvents(),
});

export const Route = createFileRoute("/events")({
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  head: () => ({
    meta: [
      { title: "Events in Lagos — comedy, concerts and nights out | Litville" },
      {
        name: "description",
        content:
          "Browse upcoming Litville events in Lagos and buy tickets securely with Paystack. Comedy specials, concerts and curated nights out.",
      },
      { property: "og:title", content: "Upcoming events | Litville" },
      {
        property: "og:description",
        content:
          "Comedy specials, concerts and curated nights out in Lagos. Get your tickets on Litville.",
      },
    ],
  }),
  component: Events,
});

function Events() {
  const { data } = useSuspenseQuery(eventsQuery);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Events</p>
      <h1 className="mt-3 text-5xl">What's on</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Every event listed here is ticketed directly by Litville. Choose your tier, pay securely and
        your QR ticket arrives in seconds.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl">Upcoming</h2>
        {data.upcoming.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            New dates are on the way. Check back soon, or{" "}
            <Link to="/organisers" className="text-primary underline-offset-4 hover:underline">
              host your event with us
            </Link>
            .
          </div>
        )}
      </section>

      {data.past.length > 0 ? (
        <section id="past" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl">Past events</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Were you there? Leave a review and tell us how the night went.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.past.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
