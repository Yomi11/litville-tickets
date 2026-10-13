import { Link } from "@tanstack/react-router";
import type { EventSummary } from "@/lib/litville.functions";
import { formatEventDate } from "@/components/site-chrome";

export function EventCard({ event, past = false }: { event: EventSummary; past?: boolean }) {
  return (
    <Link
      to="/event/$slug"
      params={{ slug: event.slug }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={`${event.title} poster`}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              past ? "opacity-70 grayscale-[35%]" : ""
            }`}
          />
        ) : null}
        {past ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Past event
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <p className="eyebrow">{formatEventDate(event.starts_at)}</p>
        <h3 className="mt-2 text-xl leading-tight">{event.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {event.venue}, {event.city}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {past ? "View event" : "Get tickets →"}
        </p>
      </div>
    </Link>
  );
}
