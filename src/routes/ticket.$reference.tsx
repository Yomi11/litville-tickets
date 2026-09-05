import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { confirmTicket } from "@/lib/litville.functions";
import { formatEventDate, formatEventTime, formatNaira } from "@/components/site-chrome";

export const Route = createFileRoute("/ticket/$reference")({
  head: () => ({
    meta: [
      { title: "Your Litville ticket" },
      {
        name: "description",
        content: "Order confirmation and QR ticket for your Litville show.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { reference } = Route.useParams();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ticket", reference],
    queryFn: () => confirmTicket({ data: { reference } }),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Confirming your payment…</p>
      ) : !data ? (
        <p className="text-sm text-destructive">We couldn't load that order.</p>
      ) : data.status === "paid" ? (
        <div>
          <p className="eyebrow">Payment confirmed</p>
          <h1 className="mt-3 text-4xl">
            You're in, {data.buyerName?.split(" ")[0]}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A copy of this ticket has been tied to {data.buyerEmail}. Show the QR code at the gate.
          </p>

          <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
            <div className="bg-gradient-heat px-6 py-4 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Litville ticket</p>
              <h2 className="mt-1 text-2xl">{data.eventTitle}</h2>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="eyebrow">When</dt>
                  <dd className="mt-1">
                    {data.eventStartsAt
                      ? `${formatEventDate(data.eventStartsAt)} · ${formatEventTime(data.eventStartsAt)}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Where</dt>
                  <dd className="mt-1">{data.eventVenue}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Tier &amp; zone</dt>
                  <dd className="mt-1">
                    {data.tierName}
                    {data.zoneName ? ` · ${data.zoneName}` : ""} · {data.quantity} ticket
                    {data.quantity > 1 ? "s" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Paid</dt>
                  <dd className="mt-1">
                    {formatNaira(data.amountKobo)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Ticket code</dt>
                  <dd className="mt-1 font-bold tracking-[0.2em] text-primary">{data.ticketCode}</dd>
                </div>
              </dl>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  data.ticketCode ?? data.reference,
                )}`}
                alt={`QR code for ticket ${data.ticketCode}`}
                width={200}
                height={200}
                loading="lazy"
                className="mx-auto rounded bg-foreground p-2"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/community" className="btn-heat">
              Review a show
            </Link>
            <Link to="/" className="btn-ghost-line">
              Back home
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="eyebrow">Order {data.reference}</p>
          <h1 className="mt-3 text-4xl">
            {data.status === "failed" ? "Payment not completed" : "Still processing"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {data.message ??
              "We haven't received confirmation from Paystack yet. Give it a moment and check again."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-heat" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Checking…" : "Check again"}
            </button>
            <Link to="/event/$slug" params={{ slug: "litville-live-lagos-nights" }} className="btn-ghost-line">
              Back to the event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
