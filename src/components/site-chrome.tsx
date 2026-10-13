import { Link } from "@tanstack/react-router";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Lagos is UTC+1 year-round; shift manually so server and browser agree exactly.
function lagosDate(iso: string) {
  return new Date(new Date(iso).getTime() + 60 * 60 * 1000);
}

// An event counts as "past" once this many hours have gone by since it started,
// so tickets stay on sale through the night of the show.
export const PAST_AFTER_HOURS = 6;

export function isPastEvent(startsAt: string) {
  return new Date(startsAt).getTime() < Date.now() - PAST_AFTER_HOURS * 60 * 60 * 1000;
}

export function formatNaira(kobo: number) {
  const naira = Math.round(kobo / 100);
  const grouped = String(naira).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${grouped}`;
}

export function formatEventDate(iso: string) {
  const d = lagosDate(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatEventTime(iso: string) {
  const d = lagosDate(iso);
  const hours24 = d.getUTCHours();
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hour12}:${minutes} ${hours24 < 12 ? "AM" : "PM"}`;
}

export function Logo() {
  return (
    <Link to="/" aria-label="Litville home" className="inline-block">
      <img
        src="/brand/litville-wordmark-dark.png"
        alt="Litville"
        width={732}
        height={416}
        className="h-10 w-auto sm:h-12"
      />
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/community", label: "Reviews" },
  { to: "/charts", label: "Charts" },
  { to: "/organisers", label: "Host with us" },
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
        <Link to="/events" className="btn-heat !px-4 !py-2.5">
          Get tickets
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
            The home of live experiences in Lagos — comedy, concerts and nights worth leaving the
            house for.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Explore</p>
          <Link to="/events" className="block text-muted-foreground hover:text-foreground">
            Upcoming events
          </Link>
          <Link to="/events" hash="past" className="block text-muted-foreground hover:text-foreground">
            Past events
          </Link>
          <Link to="/charts" className="block text-muted-foreground hover:text-foreground">
            Music charts
          </Link>
          <Link to="/community" className="block text-muted-foreground hover:text-foreground">
            Ratings &amp; reviews
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Partners</p>
          <Link to="/organisers" className="block text-muted-foreground hover:text-foreground">
            Promoters &amp; organisers
          </Link>
          <Link to="/organisers" className="block text-muted-foreground hover:text-foreground">
            Venues &amp; performers
          </Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="eyebrow">Litville</p>
          <p>Lagos, Nigeria</p>
          <a href="mailto:support.creativeagent@gmail.com" className="block hover:text-foreground">
            support.creativeagent@gmail.com
          </a>
          <p className="pt-3 text-xs">Payments secured by Paystack.</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Litville. All rights reserved.
      </div>
    </footer>
  );
}
