import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: "Charts — Apple Music, Spotify & Billboard | Litville" },
      {
        name: "description",
        content:
          "Track what Nigeria is playing: the Apple Music, Spotify and Billboard chart positions Litville fans care about.",
      },
      { property: "og:title", content: "Litville charts — what Nigeria is playing" },
      {
        property: "og:description",
        content: "Apple Music, Spotify and Billboard chart snapshots for Afrobeats listeners.",
      },
    ],
  }),
  component: Charts,
});

const charts = [
  {
    source: "Apple Music",
    scope: "Nigeria Top Songs",
    rows: [
      { title: "Higher", artist: "Burna Boy" },
      { title: "Sability", artist: "Ayra Starr" },
      { title: "Blow My Mind", artist: "Odumodublvck" },
      { title: "Ogechi", artist: "Fave" },
      { title: "Kere", artist: "Shallipopi" },
    ],
  },
  {
    source: "Spotify",
    scope: "Top 50 — Nigeria",
    rows: [
      { title: "Sability", artist: "Ayra Starr" },
      { title: "Egwu", artist: "Chike & Mohbad" },
      { title: "Higher", artist: "Burna Boy" },
      { title: "Wayo", artist: "Seyi Vibez" },
      { title: "Twe Twe", artist: "Kizz Daniel" },
    ],
  },
  {
    source: "Billboard",
    scope: "US Afrobeats Songs",
    rows: [
      { title: "Water", artist: "Tyla" },
      { title: "Higher", artist: "Burna Boy" },
      { title: "Rush", artist: "Ayra Starr" },
      { title: "Love Me JeJe", artist: "Tems" },
      { title: "Lonely at the Top", artist: "Asake" },
    ],
  },
];

function Charts() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Charts</p>
      <h1 className="mt-3 text-5xl">What Nigeria is playing</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        A weekly snapshot of the three charts that matter to Afrobeats fans, so you know who to expect
        on a Litville stage next.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {charts.map((chart) => (
          <section key={chart.source} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl">{chart.source}</h2>
            <p className="eyebrow mt-1">{chart.scope}</p>
            <ol className="mt-5 space-y-4">
              {chart.rows.map((row, i) => (
                <li key={row.title} className="flex gap-4">
                  <span className="display-xl w-6 text-xl text-primary">{i + 1}</span>
                  <span className="text-sm">
                    <span className="block">{row.title}</span>
                    <span className="block text-muted-foreground">{row.artist}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Snapshot curated by the Litville team. Live chart API feeds land alongside artist profiles.
      </p>
    </div>
  );
}
