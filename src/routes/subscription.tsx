import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { comparison, plans } from "@/lib/content";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Plans — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Free, Premium, Family and clinician-supported Care plans for therapeutic raga streaming.",
      },
      { property: "og:title", content: "Plans — Krishna Sanjeevani" },
      { property: "og:description", content: "Choose the plan that fits your practice." },
    ],
  }),
  component: Subscription;
});

function Subscription() {
  const [selected, setSelected] = useState("premium");

  return (
    <AppShell title="Plans" subtitle="Cancel any time" back="/profile" mini={false}>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {plans.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              aria-pressed={active}
              className={`press animate-rise rounded-card border bg-surface p-5 text-left shadow-soft hover:shadow-lift ${
                active ? "border-cat ring-1 ring-cat" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold">{p.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
                </div>
                {p.highlight && (
                  <span className="rounded-full bg-cat-light px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-4 text-2xl font-semibold">
                {p.price}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  {p.period}
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cat" strokeWidth={2.6} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <section className="animate-rise mt-10 overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <h2 className="border-b border-border px-5 py-4 text-[15px] font-semibold">
          Compare features
        </h2>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="px-5 py-3 font-semibold">
                Feature
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Free
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Premium
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Family
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="px-5 py-3.5 font-medium">
                  {row.label}
                </th>
                {[row.free, row.premium, row.family].map((v, i) => (
                  <td key={i} className="px-3 py-3.5 text-center">
                    {v ? (
                      <Check
                        className="mx-auto h-4 w-4 text-cat"
                        strokeWidth={2.6}
                        aria-label="Included"
                      />
                    ) : (
                      <Minus
                        className="mx-auto h-4 w-4 text-muted-foreground"
                        aria-label="Not included"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button className="press mt-8 flex min-h-13 w-full items-center justify-center rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover">
        Continue with {plans.find((p) => p.id === selected)?.name}
      </button>
      <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
        Billed securely. Streaming only — sessions are never downloaded or shared.
      </p>
    </AppShell>
  );
}
