import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/organisers")({
  head: () => ({
    meta: [
      { title: "Host with Litville — for promoters, venues and performers" },
      {
        name: "description",
        content:
          "Sell tickets, track sales in real time, check guests in at the door and get paid out after the show. Partner with Litville to ticket your next event in Lagos.",
      },
      { property: "og:title", content: "Host with Litville" },
      {
        property: "og:description",
        content:
          "Ticketing, guest check-in, sales reporting and payouts for promoters, venues and performers in Lagos.",
      },
    ],
  }),
  component: Organisers,
});

const tools = [
  {
    title: "Create a show in minutes",
    body: "Line-up, ticket tiers, capacity and artwork. Your event page is ready to sell the moment it goes live.",
  },
  {
    title: "Sales you can actually see",
    body: "See tickets sold per tier, revenue and your guest list as it happens — no more counting WhatsApp messages.",
  },
  {
    title: "Smooth check-in",
    body: "Every ticket carries a unique QR code. Your team scans on a phone at the door and duplicates are flagged instantly.",
  },
  {
    title: "Payouts after the show",
    body: "Payments are collected and settled through Paystack, so your share arrives without the chase.",
  },
];

function Organisers() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Host with Litville</p>
      <h1 className="mt-3 max-w-2xl text-5xl">
        Run the show. <span className="text-gradient-heat">Keep the data.</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Comedy specials, concerts, parties and cultural nights — if it happens live, we can ticket it.
        Promoters, venues and performers can partner with Litville today.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {tools.map((tool) => (
          <section key={tool.title} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl">{tool.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tool.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-surface/50 p-8">
        <h2 className="text-2xl">Ready to ticket your next event?</h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Email abiolakolade27@gmail.com with your date, venue and expected capacity and we'll come back with terms.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="mailto:abiolakolade27@gmail.com" className="btn-heat">
            Email our partnerships team
          </a>
          <Link to="/events" className="btn-ghost-line">
            See our events
          </Link>
        </div>
      </div>
    </div>
  );
}
