import { Link } from "@tanstack/react-router";

export function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

export function Logo() {
  return (
    <Link to="/" className="display-xl text-2xl leading-none">
      <span>lit</span>
      <span className="text-gradient-heat">ville</span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/event/litville-live-lagos-nights", label: "Tickets" },
  { to: "/charts", label: "Charts" },
  { to: "/community", label: "Community" },
  { to: "/organisers", label: "Organisers" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/event/litville-live-lagos-nights" className="btn-heat !px-4 !py-2.5">
          Buy tickets
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Africa-owned infrastructure for live music. Venue tickets today, livestream and broadcast
            next.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Fans</p>
          <Link to="/event/litville-live-lagos-nights" className="block text-muted-foreground hover:text-foreground">
            Upcoming shows
          </Link>
          <Link to="/charts" className="block text-muted-foreground hover:text-foreground">
            Music charts
          </Link>
          <Link to="/community" className="block text-muted-foreground hover:text-foreground">
            Ratings &amp; reviews
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Industry</p>
          <Link to="/organisers" className="block text-muted-foreground hover:text-foreground">
            Promoters &amp; organisers
          </Link>
          <Link to="/organisers" className="block text-muted-foreground hover:text-foreground">
            Artists
          </Link>
          <Link to="/livestream" className="block text-muted-foreground hover:text-foreground">
            Livestream (coming soon)
          </Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="eyebrow">Litville</p>
          <p>Lagos, Nigeria</p>
          <p>hello@litville.ng</p>
          <p className="pt-3 text-xs">Payments secured by Paystack.</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Litville. All rights reserved.
      </div>
    </footer>
  );
}
