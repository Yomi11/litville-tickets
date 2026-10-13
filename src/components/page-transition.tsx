import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

// How long the loading screen stays up when moving between pages, even if the
// next page is ready sooner. Gives navigation a deliberate, branded feel.
const MIN_VISIBLE_MS = 900;
const FADE_MS = 250;

export function PageTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden");
  const startedAt = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const unsubStart = router.subscribe("onBeforeNavigate", (event) => {
      // Only for real page changes — not the first load, hash jumps or filters.
      if (!event.fromLocation || !event.pathChanged) return;
      clearTimers();
      startedAt.current = Date.now();
      setPhase("visible");
      // Safety net: never leave the screen covered if a page fails to resolve.
      timers.current.push(window.setTimeout(() => setPhase("hidden"), 6000));
    });

    const unsubDone = router.subscribe("onResolved", () => {
      if (!startedAt.current) return;
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));
      startedAt.current = 0;
      clearTimers();
      timers.current.push(
        window.setTimeout(() => {
          setPhase("leaving");
          timers.current.push(window.setTimeout(() => setPhase("hidden"), FADE_MS));
        }, wait),
      );
    });

    return () => {
      unsubStart();
      unsubDone();
      clearTimers();
    };
  }, [router]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-250 ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="display-xl animate-pulse text-4xl leading-none motion-reduce:animate-none">
        <span>lit</span>
        <span className="text-gradient-heat">ville</span>
      </div>
      <div className="mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-border">
        <div className="page-transition-bar h-full w-1/3 rounded-full bg-gradient-heat" />
      </div>
    </div>
  );
}
