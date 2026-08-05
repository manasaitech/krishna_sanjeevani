import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { StatusBar } from "@/components/StatusBar";

export const Route = createFileRoute("/session-complete")({
  head: () => ({
    meta: [
      { title: "Session complete — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Rate today's session, note your mood, and close the practice gently.",
      },
      { property: "og:title", content: "Session complete — Krishna Sanjeevani" },
      { property: "og:description", content: "A gentle close to your listening session." },
    ],
  }),
  component: SessionComplete,
});

const moods = [
  { emoji: "🌤️", label: "Calmer" },
  { emoji: "😌", label: "Rested" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🌧️", label: "Heavy" },
];

function SessionComplete() {
  const [mood, setMood] = useState<string | null>("Calmer");
  const [rating, setRating] = useState(4);

  return (
    <div className="min-h-dvh bg-background">
      <StatusBar />
      <main className="mx-auto max-w-md px-6 pb-14">
        <div className="animate-rise mt-10 flex flex-col items-center text-center">
          <div className="relative grid h-28 w-28 place-items-center">
            <span className="animate-breathe absolute inset-0 rounded-full bg-cat-light" />
            <span className="relative grid h-18 w-18 place-items-center rounded-full bg-cat text-cat-foreground shadow-lift">
              <Sparkles className="h-8 w-8" strokeWidth={1.6} />
            </span>
          </div>
          <h1 className="mt-8 text-[26px] leading-tight font-semibold">Session complete</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            That's 19 minutes of steady listening. Sit quietly for a moment before you move on.
          </p>
        </div>

        <section className="animate-rise mt-10 rounded-card border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-semibold">Rate today's experience</h2>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} out of 5`}
                aria-pressed={rating === n}
                className={`press h-11 flex-1 rounded-btn border text-sm font-semibold ${
                  n <= rating
                    ? "border-cat bg-cat text-cat-foreground"
                    : "border-border bg-surface text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <h2 className="mt-7 text-sm font-semibold">How do you feel?</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                aria-pressed={mood === m.label}
                className={`press min-h-20 rounded-card border px-1 py-3 text-center ${
                  mood === m.label ? "border-cat bg-cat-light" : "border-border bg-surface"
                }`}
              >
                <span className="block text-xl" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="mt-1.5 block text-[11px] font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          <label className="mt-7 block text-sm font-semibold">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea
              rows={3}
              placeholder="Anything you noticed during the session"
              className="mt-3 w-full resize-none rounded-field border border-border bg-background p-3 text-sm font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-cat focus:outline-none"
            />
          </label>
        </section>

        <Link
          to="/home"
          className="press mt-8 flex min-h-13 items-center justify-center rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
        >
          Continue
        </Link>
      </main>
    </div>
  );
}
