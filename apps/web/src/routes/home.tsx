import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Sparkles, Loader2, Heart, Waves, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Chip, Panel, Rail, Section } from "@/components/layout-bits";
import { ContinueCard, ProgramCard, TrackCard, TrackRow, TrackTile } from "@/components/cards";
import { useApp } from "@/lib/app-state";
import { categories, purposes, type Track, type CategoryId } from "@/lib/content";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your therapeutic listening home: recommended surāvalis, continue listening, stress relief, focus, sleep and pregnancy programs.",
      },
      { property: "og:title", content: "Home — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Recommended ragas, therapeutic programs, and your listening history.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const {
    category,
    setCategory,
    current,
    play,
    continueListeningList,
    user,
    loading,
    tracks,
    programs,
  } = useApp();

  const [purpose, setPurpose] = useState<string | null>(null);

  const catTracks = useMemo(
    () => tracks.filter((t) => t.category === category),
    [category, tracks],
  );

  const filtered = useMemo(() => {
    if (!purpose) return catTracks;
    return catTracks.filter((t) => {
      const matchesTag = t.purposeTags?.some(
        (tag: any) => tag.name && tag.name.toLowerCase().trim() === purpose.toLowerCase().trim()
      );
      const matchesFallback = t.purpose && t.purpose.toLowerCase().trim() === purpose.toLowerCase().trim();
      return matchesTag || matchesFallback;
    });
  }, [purpose, catTracks]);

  const featured = catTracks[0] ?? tracks[0];

  const catPrograms = useMemo(
    () => programs.filter((p) => p.category === category),
    [category, programs],
  );

  const byPurpose = (p: string) => {
    return tracks.filter((t) => {
      const matchesTag = t.purposeTags?.some(
        (tag: any) => tag.name && tag.name.toLowerCase().trim() === p.toLowerCase().trim()
      );
      const matchesFallback = t.purpose && t.purpose.toLowerCase().trim() === p.toLowerCase().trim();
      return matchesTag || matchesFallback;
    });
  };

  const premiumTracks = useMemo(
    () => tracks.filter((t) => t.premium),
    [tracks],
  );

  const recentlyAdded = useMemo(
    () => tracks.slice(-4).reverse(),
    [tracks],
  );

  const handlePurposeClick = (p: string | null) => {
    setPurpose(p);
    const el = document.getElementById("recommended-sessions");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cat" />
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell>
      {/* Hero Section: Pregnancy Specific vs. General */}
      {category === "pregnancy" ? (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-card bg-gradient-to-r from-rose-100 via-rose-50 to-amber-50 p-6 md:p-8 border border-rose-200/50 shadow-soft">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-200/60 px-3 py-1 text-[10px] font-semibold tracking-wider text-rose-800 uppercase">
                  <Sparkles className="h-3 w-3" /> Gestational Stage
                </span>
                <h1 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">
                  Welcome, {user?.profile?.fullName || "Vasudha"}
                </h1>
                <p className="font-serif italic text-rose-700 text-base font-semibold">
                  Gestational Week 24, Day 3
                </p>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed pt-1">
                  Healthy womb development through circadian acoustic frequencies. Today is an ideal day to balance your Doshas with Bhairavi and Yaman Surāvalis.
                </p>
              </div>

              {/* Daily Progress Card */}
              <div className="w-full md:w-80 rounded-2xl bg-white/80 backdrop-blur-md p-5 border border-rose-200/40 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>Daily Progress</span>
                    <span className="text-rose-700 font-mono">15 min / 30 min completed</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Target: 30m</span>
                  <span className="flex items-center gap-1 font-medium text-rose-700">
                    <Waves className="h-3 w-3 animate-pulse" /> Circadian wave active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Streams Grid */}
          <Section title="Recommended Womb Care Streams" hint="Circadian-aligned auditory paths">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Midnight Ragas",
                  description: "Circadian calming waves to soothe maternal sleep cycles and optimize gestational rest.",
                  ragaList: "Raga Yaman, Bhairavi",
                  purpose: "Deep Rest & Calm",
                  trackId: tracks.find(t => t.category === 'pregnancy' && (t.raga?.includes('Yaman') || t.title.includes('Yaman')))?.id || tracks.find(t => t.category === 'pregnancy')?.id || tracks[0]?.id
                },
                {
                  title: "Evening Suravali",
                  description: "Circadian transition frequencies designed to pacify Pitta and bring emotional stability.",
                  ragaList: "Raga Kalyani, Bhairav",
                  purpose: "Dosha Balancing",
                  trackId: tracks.find(t => t.category === 'pregnancy' && (t.raga?.includes('Kalyani') || t.title.includes('Kalyani')))?.id || tracks.find(t => t.category === 'pregnancy')?.id || tracks[0]?.id
                }
              ].map((stream) => {
                const tr = tracks.find(t => t.id === stream.trackId) || featured;
                return (
                  <div
                    key={stream.title}
                    className="group relative overflow-hidden rounded-card bg-surface border border-border p-5 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[9px] font-bold text-rose-800 uppercase">
                          {stream.purpose}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {stream.ragaList}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-800 transition-colors">
                        {stream.title}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {stream.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground italic">
                        Circadian aligned
                      </span>
                      <button
                        onClick={() => tr && play(tr)}
                        className="press inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-800 text-white px-4 text-xs font-semibold hover:bg-rose-900 cursor-pointer"
                      >
                        <Play className="h-3 w-3" fill="currentColor" /> Play stream
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      ) : featured ? (
        <section className="animate-rise grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-card shadow-lift">
            <img
              src={featured.art}
              alt={`Artwork for ${featured.title}`}
              width={1600}
              height={800}
              className="h-[260px] w-full object-cover md:h-[320px] xl:h-[380px]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-foreground/80 via-foreground/45 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 md:p-10">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
                <Sparkles className="h-3 w-3" /> Today's session
              </span>
              <div>
                <h2 className="font-display text-[26px] leading-tight font-semibold text-background md:text-[38px] xl:text-[44px]">
                  {featured.title}
                </h2>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-background/85 md:text-[15px]">
                  {featured.raga} · {featured.purpose} — {featured.frequency}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => play(featured)}
                  className="press inline-flex min-h-12 items-center gap-2 rounded-btn bg-background px-6 text-[14px] font-semibold text-foreground hover:bg-background/90 cursor-pointer"
                >
                  <Play className="h-4 w-4" fill="currentColor" /> Begin session
                </button>
                <Link
                  to="/player"
                  className="press inline-flex min-h-12 items-center rounded-btn border border-background/40 px-6 text-[14px] font-semibold text-background hover:bg-background/10"
                >
                  Listening guidance
                </Link>
              </div>
            </div>
          </div>

          <Panel title="Your practice" className="flex flex-col justify-between">
            <div className="space-y-5">
              {[
                { label: "Sessions this week", value: "5 of 7" },
                { label: "Total listening", value: "6h 12m" },
                { label: "Current theme", value: category },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] text-muted-foreground">{s.label}</span>
                  <span className="font-display text-[17px] font-semibold capitalize">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-cat-light p-4">
              <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
                Now in your queue
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed">
                {(current ?? featured)?.title || "No track playing"} — {(current ?? featured)?.instructions || "Choose a track to begin"}
              </p>
            </div>
          </Panel>
        </section>
      ) : (
        <section className="animate-rise bg-surface border border-border rounded-card p-8 text-center shadow-soft">
          <Sparkles className="mx-auto h-12 w-12 text-cat mb-4" />
          <h2 className="text-xl font-semibold">Welcome to Krishna Sanjeevani</h2>
          {user?.role === "admin" || user?.role === "super_admin" ? (
            <>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Get started by adding therapeutic tracks and wellness programs via the Admin Panel, or switch your category/theme.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link to="/admin" className="press inline-flex min-h-11 items-center rounded-btn bg-cat text-cat-foreground px-6 text-[14px] font-semibold">
                  Go to Admin Panel
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Your personalized therapeutic listening space is ready. Choose a theme below or select a purpose to begin your wellness journey.
            </p>
          )}
        </section>
      )}

      {tracks.length > 0 && (
        <>
          {/* Continue Listening */}
          <Section title="Continue listening" hint="Picks up where you paused">
            {continueListeningList.length ? (
              <Rail>
                {continueListeningList.map((item, i) => (
                  <ContinueCard
                    key={`${item.track.id}-${i}`}
                    track={item.track}
                    progress={item.progressPercentage}
                    programId={item.programId || undefined}
                  />
                ))}
              </Rail>
            ) : (
              <div className="rounded-card border border-border/80 bg-surface/50 p-4 text-center">
                <p className="text-[12px] text-muted-foreground italic">
                  Start listening to discover your personalized recommendations.
                </p>
              </div>
            )}
          </Section>

          {/* Explore Themes (Category Cards from Browse Page) */}
          <Section title="Explore by Theme" hint="Category-adaptive therapeutic soundscapes">
            <div className="grid gap-4 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id as CategoryId)}
                  aria-pressed={category === c.id}
                  className={`press group relative overflow-hidden rounded-card text-left shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift cursor-pointer ${
                    category === c.id ? "ring-2 ring-cat" : ""
                  }`}
                >
                  <img
                    src={c.art}
                    alt=""
                    className="h-36 w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.04] md:h-44"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block font-display text-[17px] font-semibold text-background">
                      {c.name}
                    </span>
                    <span className="mt-1 block text-[12px] text-background/80">
                      {c.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* Explore by Surāwalis */}
          <Section title="Explore by Surāwalis" hint="Vedic acoustic frequencies for target healing">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                {
                  name: "Kalyani Surāwali",
                  description: "For Anxiety relief, Hypertension, and focus.",
                  searchKey: "Kalyani",
                  image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400"
                },
                {
                  name: "Bhairavi Surāwali",
                  description: "For Insomnia, deep sleep, and meditation.",
                  searchKey: "Bhairavi",
                  image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=400"
                },
                {
                  name: "Yaman Surāwali",
                  description: "For stress relief and evening relaxation.",
                  searchKey: "Yaman",
                  image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400"
                },
                {
                  name: "Todi Surāwali",
                  description: "For focus, concentration, and morning energy.",
                  searchKey: "Todi",
                  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400"
                }
              ].map((s) => (
                <Link
                  key={s.name}
                  to="/discover"
                  search={{ search: s.searchKey }}
                  className="press group relative overflow-hidden rounded-card text-left shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift cursor-pointer bg-surface border border-border/40"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-28 w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.04]"
                  />
                  <div className="p-4 space-y-1">
                    <span className="block font-display text-[15px] font-semibold text-foreground group-hover:text-cat transition-colors">
                      {s.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-normal">
                      {s.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          {/* Recommended / Sessions Grid (from Browse Page) */}
          <div id="recommended-sessions" className="scroll-mt-20">
            <div className="no-scrollbar -mx-5 mt-12 flex gap-2.5 overflow-x-auto px-5 md:-mx-8 md:px-8">
              <Chip active={purpose === null} onClick={() => handlePurposeClick(null)}>
                All purposes
              </Chip>
              {purposes.map((p) => (
                <Chip key={p} active={purpose === p} onClick={() => handlePurposeClick(p)}>
                  {p}
                </Chip>
              ))}
            </div>

            <Section
              title={purpose ? `Sessions for ${purpose.toLowerCase()}` : "Recommended for you"}
              hint={`${filtered.length} sessions`}
              className="mt-6"
            >
              {filtered.length === 0 ? (
                <div className="rounded-card border border-border bg-surface/60 p-8 text-center shadow-soft">
                  <Waves className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-[13px] font-semibold text-foreground">Nothing sequenced yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    We haven't sequenced a surāvali for this purpose in this theme. Try another filter.
                  </p>
                </div>
              ) : (
                <CardGrid>
                  {filtered.map((t) => (
                    <TrackTile key={t.id} track={t} />
                  ))}
                </CardGrid>
              )}
            </Section>
          </div>

          {/* Popular Tracks */}
          {tracks.length > 3 && (
            <Section title="Popular today" hint="Across all listeners">
              <Rail>
                {tracks.slice(3, 10).map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </Rail>
            </Section>
          )}

          {/* Explore by Purpose Rails */}
          {["Stress Relief", "Focus", "Sleep"].map((p) => (
            <Section
              key={p}
              title={p}
              hint={`${byPurpose(p).length} sessions`}
              onClick={() => handlePurposeClick(p)}
            >
              <Rail>
                {(byPurpose(p).length ? byPurpose(p) : tracks.slice(0, 4)).map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </Rail>
            </Section>
          ))}

          {/* Premium Sequences */}
          {premiumTracks.length > 0 && (
            <Section title="Premium sequences" hint="Exclusive healing ragas">
              <Rail>
                {premiumTracks.map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </Rail>
            </Section>
          )}

          {/* Recently Added */}
          {recentlyAdded.length > 0 && (
            <Section title="Recently added" hint="New therapeutic additions">
              <Rail>
                {recentlyAdded.map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </Rail>
            </Section>
          )}
        </>
      )}

      {/* Programs Sections */}
      {programs.length > 0 && (
        <>
          {/* Programs in this theme (from Browse page) */}
          <Section title="Programs in this theme" hint={`${catPrograms.length} programs`}>
            {catPrograms.length === 0 ? (
              <div className="rounded-card border border-border/80 bg-surface/50 p-4 text-center">
                <p className="text-[12px] text-muted-foreground italic">
                  Programs will appear here when available.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {catPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} wide />
                ))}
              </div>
            )}
          </Section>

          {/* Corporate wellness programs (Secular category) */}
          <Section title="Corporate wellness" hint="Secular sequences for teams">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {programs
                .filter((p) => p.category === "secular")
                .map((p) => (
                  <ProgramCard key={p.id} program={p} wide />
                ))}
            </div>
          </Section>

          {/* Pregnancy programs */}
          <Section title="Pregnancy programs" hint="Open dashboard" href="/journey">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {programs
                .filter((p) => p.category === "pregnancy")
                .map((p) => (
                  <ProgramCard key={p.id} program={p} wide />
                ))}
            </div>
          </Section>

          {/* Trending programs */}
          <Section title="Trending programs">
            <Rail>
              {(catPrograms.length ? catPrograms : programs).map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </Rail>
          </Section>
        </>
      )}

      {/* Recently Played */}
      {tracks.length > 0 && (
        <Section title="Recently played" href="/recent">
          <div className="rounded-card border border-border bg-surface/60 p-2 md:p-3">
            {tracks.slice(0, 6).map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} />
            ))}
          </div>
        </Section>
      )}
    </AppShell>
  );
}
