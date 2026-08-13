import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  ListMusic,
  Music4,
  Search,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { programs, tracks } from "@/lib/content";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Operations console for content, programs, users, subscriptions and analytics.",
      },
      { property: "og:title", content: "Admin — Krishna Sanjeevani" },
      { property: "og:description", content: "Manage the therapeutic audio catalogue." },
    ],
  }),
  component: Admin,
});

const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content", label: "Content", icon: Music4 },
  { id: "programs", label: "Programs", icon: ListMusic },
  { id: "users", label: "Users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type Section = (typeof nav)[number]["id"];

const kpis = [
  { label: "Registrations", value: "12,480", delta: "+6.2% this week" },
  { label: "Active users", value: "5,214", delta: "+3.1% this week" },
  { label: "Track plays", value: "184,902", delta: "+11.4% this week" },
  { label: "Tracks live", value: "312", delta: "8 pending review" },
];

const activity = [
  { who: "Meera I.", what: "published Nivarana Healing", when: "12 min ago" },
  { who: "Ops", what: "approved 4 pregnancy month-7 sequences", when: "1 hr ago" },
  { who: "Ravi K.", what: "updated Deep Sleep Restoration program", when: "3 hrs ago" },
  { who: "Billing", what: "42 new Premium subscriptions", when: "Today" },
];

const field =
  "mt-2 min-h-11 w-full rounded-field border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-cat focus:outline-none";
const labelCls = "block text-xs font-semibold text-muted-foreground";
const card = "rounded-card border border-border bg-surface shadow-soft";

function Admin() {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const rows = tracks.filter((t) =>
    [t.title, t.raga, t.purpose].join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const paged = rows.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(rows.length / perPage));

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex">
          <Link to="/home" className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cat text-cat-foreground">
              KS
            </span>
            Krishna Sanjeevani
          </Link>
          <nav aria-label="Admin sections" className="mt-8 space-y-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                aria-current={section === n.id ? "page" : undefined}
                className={`press flex min-h-11 w-full items-center gap-3 rounded-btn px-3 text-sm font-medium ${
                  section === n.id
                    ? "bg-cat-light text-cat"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <n.icon className="h-[18px] w-[18px]" />
                {n.label}
              </button>
            ))}
          </nav>
          <p className="mt-auto text-[11px] text-muted-foreground">Ops console v1.0</p>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] leading-tight font-semibold capitalize">{section}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Therapeutic catalogue operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor="admin-search">
                Search catalogue
              </label>
              <div className="flex items-center gap-2 rounded-field border border-border bg-surface px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  id="admin-search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search tracks"
                  className="min-h-11 w-44 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cat text-sm font-semibold text-cat-foreground">
                R
              </span>
            </div>
          </header>

          <nav
            aria-label="Admin sections mobile"
            className="no-scrollbar mt-6 flex gap-2 overflow-x-auto lg:hidden"
          >
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`press min-h-11 shrink-0 rounded-btn border px-4 text-sm font-medium ${
                  section === n.id
                    ? "border-cat bg-cat text-cat-foreground"
                    : "border-border bg-surface text-muted-foreground"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className={`${card} p-5`}>
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
                <p className="mt-1 text-[11px] font-medium text-cat">{k.delta}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className={`${card} p-6`}>
              <h2 className="flex items-center gap-2 text-[17px] font-semibold">
                <Upload className="h-4 w-4 text-cat" /> Upload a track
              </h2>
              <form
                className="mt-6 grid gap-5 sm:grid-cols-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className={labelCls}>
                  Track name
                  <input className={field} placeholder="Sanjeevani Kalyani" />
                </label>
                <label className={labelCls}>
                  Raga
                  <input className={field} placeholder="Raga Kalyani" />
                </label>
                <label className={labelCls}>
                  Version
                  <input className={field} placeholder="Version II" />
                </label>
                <label className={labelCls}>
                  Duration
                  <input className={field} placeholder="19:00" />
                </label>
                <label className={labelCls}>
                  Purpose tags
                  <input className={field} placeholder="Sleep, Calm Mind" />
                </label>
                <label className={labelCls}>
                  Pregnancy month
                  <select className={field}>
                    <option>Not applicable</option>
                    {Array.from({ length: 9 }, (_, i) => (
                      <option key={i}>Month {i + 1}</option>
                    ))}
                  </select>
                </label>
                <label className={labelCls}>
                  Subscription tier
                  <select className={field}>
                    <option>Free</option>
                    <option>Premium</option>
                    <option>Family</option>
                  </select>
                </label>
                <label className={labelCls}>
                  Upload audio
                  <div className="mt-2 flex min-h-11 items-center gap-3 rounded-field border border-dashed border-border bg-background px-3.5 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" /> Choose a WAV or FLAC master
                  </div>
                </label>
                <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
                  <button className="press min-h-11 rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                    Publish
                  </button>
                  <button className="press min-h-11 rounded-btn border border-border bg-surface px-6 text-sm font-semibold">
                    Save draft
                  </button>
                </div>
              </form>
            </section>

            <section className={`${card} p-6`}>
              <h2 className="text-[17px] font-semibold">Recent activity</h2>
              <ul className="mt-5 space-y-4">
                {activity.map((a) => (
                  <li key={a.what} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cat-light text-[11px] font-semibold text-cat">
                      {a.who.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{a.who}</span> {a.what}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{a.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-border pt-5">
                <h3 className="text-sm font-semibold">Programs live</h3>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{programs.length}</p>
              </div>
            </section>
          </div>

          <section className={`${card} mt-8 overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
              <h2 className="text-[17px] font-semibold">Content library</h2>
              <div className="flex flex-wrap gap-2">
                {["All", "Devotional", "Secular", "Pregnancy", "Premium"].map((f, i) => (
                  <button
                    key={f}
                    className={`press min-h-9 rounded-btn border px-3.5 text-xs font-medium ${
                      i === 0
                        ? "border-cat bg-cat-light text-cat"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/60 text-[11px] tracking-wider text-muted-foreground uppercase">
                  <tr>
                    {["Track", "Raga", "Purpose", "Duration", "Tier", "Status"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <th scope="row" className="px-6 py-4 font-medium">
                        {t.title}
                      </th>
                      <td className="px-6 py-4 text-muted-foreground">{t.raga}</td>
                      <td className="px-6 py-4 text-muted-foreground">{t.purpose}</td>
                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {Math.round(t.duration / 60)} min
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {t.premium ? "Premium" : "Free"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-semibold text-success">
                          Live
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        No tracks match “{query}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4 text-xs text-muted-foreground">
              <span>
                Page {page} of {pages} · {rows.length} tracks
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  aria-label="Next page"
                  className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
