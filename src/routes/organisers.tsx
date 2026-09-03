import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/organisers")({
  head: () => ({
    meta: [
      { title: "For promoters, venues and artists | Litville" },
      {
        name: "description",
        content:
          "Sell tickets, track sales in real time, scan at the gate and get paid out after the show. Litville is building ticketing tools for Lagos promoters and artists.",
      },
      { property: "og:title", content: "Litville for promoters, venues and artists" },
      {
        property: "og:description",
        content:
          "Ticketing, gate scanning, buyer data and payouts for Lagos promoters, venues and performing artists.",
      },
    ],
  }),
  component: Organisers,
});

const tools = [
  {
    title: "Create a show in minutes",
    body: "Line-up, tiers, zones, capacity and art. Your event page is live and sellable the moment you publish.",
  },
  {
    title: "Sales you can actually see",
    body: "Live tickets sold per tier, revenue and the buyer list — instead of counting WhatsApp messages.",
  },
  {
    title: "Gate scanning",
    body: "Every ticket carries a unique QR. Gate staff scan on a phone; duplicates get flagged instantly.",
  },
  {
    title: "Payouts after the show",
    body: "Paystack handles collection and settlement, so your split lands without chasing anyone.",
  },
];

function Organisers() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">For the supply side</p>
      <h1 className="mt-3 max-w-2xl text-5xl">
        Run the show. <span className="text-gradient-heat">Keep the data.</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Litville is proving the loop on its own events first. Promoters, venues and artists who want in
        on the next wave can register interest now.
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
        <h2 className="text-2xl">Want Litville to ticket your next night?</h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Email the team with your date, venue and expected capacity and we'll come back with terms.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="mailto:promoters@litville.ng" className="btn-heat">
            Email promoters@litville.ng
          </a>
          <Link to="/event/$slug" params={{ slug: "litville-live-lagos-nights" }} className="btn-ghost-line">
            See a live event page
          </Link>
        </div>
      </div>
    </div>
  );
}
