import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/livestream")({
  head: () => ({
    meta: [
      { title: "Livestream tickets — coming next | Litville" },
      {
        name: "description",
        content:
          "Phase two of Litville: buy a virtual ticket and watch the show live from anywhere, with the same checkout as a venue ticket.",
      },
      { property: "og:title", content: "Litville livestream tickets — coming next" },
      {
        property: "og:description",
        content:
          "Virtual tickets, a low-latency player and replay access for fans who can't be in the room.",
      },
    ],
  }),
  component: Livestream,
});

const steps = [
  {
    title: "One event, two tickets",
    body: "Every Litville event page will sell a venue ticket and a virtual ticket side by side, priced separately.",
  },
  {
    title: "Token-gated stream",
    body: "Buying a virtual ticket issues an access token valid only for that performance window.",
  },
  {
    title: "Built for the diaspora",
    body: "Cinematic mode on desktop, vertical mode on mobile, plus 48-hour replay where licensing allows.",
  },
];

function Livestream() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Phase two</p>
      <h1 className="mt-3 max-w-2xl text-5xl">
        The room, <span className="text-gradient-heat">wherever you are</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Sold-out shouldn't mean shut out. Livestream ticketing is next on the Litville roadmap — venue
        tickets are what you can buy today.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <section key={step.title} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl">{step.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12">
        <Link to="/event/$slug" params={{ slug: "litville-live-lagos-nights" }} className="btn-heat">
          Buy a venue ticket today
        </Link>
      </div>
    </div>
  );
}
