import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listReviews, submitReview } from "@/lib/litville.functions";

const reviewsQuery = queryOptions({
  queryKey: ["reviews", "all"],
  queryFn: () => listReviews(),
});

export const Route = createFileRoute("/community")({
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery),
  head: () => ({
    meta: [
      { title: "Community — rate shows, albums and singles | Litville" },
      {
        name: "description",
        content:
          "Score the shows you attended and the releases you're playing. Litville reviews are public so the next night runs better.",
      },
      { property: "og:title", content: "Litville community reviews" },
      {
        property: "og:description",
        content: "Rate Afrobeats shows, albums and singles alongside other Litville fans.",
      },
    ],
  }),
  component: Community,
});

function Community() {
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [subjectType, setSubjectType] = useState("show");
  const [subjectTitle, setSubjectTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const result = await submitReview({
      data: { author_name: authorName, subject_type: subjectType, subject_title: subjectTitle, rating, body },
    });
    setSaving(false);
    if (!result.ok) {
      setStatus(result.error ?? "Could not post that review.");
      return;
    }
    setStatus("Posted. Thanks for the take.");
    setSubjectTitle("");
    setBody("");
    await queryClient.invalidateQueries({ queryKey: ["reviews"] });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Community</p>
      <h1 className="mt-3 text-5xl">Rate the night</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Shows, album drops, singles — score them and say why. Everything here is public.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1fr]">
        <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-border bg-card p-6">
          <h2 className="text-2xl">Write a review</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="eyebrow" htmlFor="author">
                Your name
              </label>
              <input
                id="author"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="field mt-2"
                placeholder="Tomiwa A."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="eyebrow" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                  className="field mt-2"
                >
                  <option value="show">Show</option>
                  <option value="album">Album</option>
                  <option value="single">Single</option>
                </select>
              </div>
              <div>
                <label className="eyebrow" htmlFor="rating">
                  Rating
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="field mt-2"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="eyebrow" htmlFor="subject">
                What are you reviewing?
              </label>
              <input
                id="subject"
                required
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                className="field mt-2"
                placeholder="Litville Live: Lagos Nights"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="body">
                Your take
              </label>
              <textarea
                id="body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="field mt-2"
                placeholder="Sound, crowd, gate speed, set list…"
              />
            </div>
          </div>
          {status ? <p className="mt-4 text-sm text-primary">{status}</p> : null}
          <button type="submit" className="btn-heat mt-6 w-full" disabled={saving}>
            {saving ? "Posting…" : "Post review"}
          </button>
        </form>

        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-border bg-card/50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg">{review.subject_title}</h3>
                  <p className="eyebrow mt-1">{review.subject_type}</p>
                </div>
                <p className="text-sm text-primary">{"★".repeat(review.rating)}</p>
              </div>
              {review.body ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">— {review.author_name}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
