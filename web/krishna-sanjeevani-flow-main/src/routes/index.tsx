import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoWithoutText from "@/assets/logo-without-text.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishna Sanjeevani — Therapeutic Raga Streaming" },
      {
        name: "description",
        content:
          "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
      },
      { property: "og:title", content: "Krishna Sanjeevani — Therapeutic Raga Streaming" },
      {
        property: "og:description",
        content:
          "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const a = window.setTimeout(() => setLeaving(true), 1900);
    const b = window.setTimeout(() => navigate({ to: "/welcome" }), 2400);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [navigate]);

  return (
    <div
      className={`grid min-h-dvh place-items-center bg-background px-8 transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="animate-breathe absolute inset-0 rounded-full bg-cat-light" />
          <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-lift border border-border/40 bg-surface flex items-center justify-center p-2.5 z-10">
            <img
              src={logoWithoutText}
              alt="Krishna Sanjeevani Logo"
              className="h-full w-full object-contain animate-rise"
            />
          </div>
        </div>
        <h1 className="animate-rise mt-8 text-[28px] leading-tight font-semibold">
          Krishna Sanjeevani
        </h1>
        <p className="animate-soft-in mt-2 text-[13px] tracking-[0.16em] text-muted-foreground uppercase">
          Therapeutic Raga Streaming
        </p>
        <div className="mt-12 flex items-center gap-1.5" role="status" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-cat"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
