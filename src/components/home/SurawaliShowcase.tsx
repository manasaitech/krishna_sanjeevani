/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import {
  Activity,
  Baby,
  Briefcase,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Flower2,
  Heart,
  Shield,
  Users,
  Brain,
  BookOpen,
  Music,
} from "lucide-react";
import { api } from "@/lib/api";

export function SurawaliShowcase() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<any>(null);

  const handleCardClick = (tabId: "ailments" | "pregnancy" | "corporate") => {
    if (isAuthenticated) {
      navigate({
        to: "/discover",
        search: { tab: tabId },
      });
    } else {
      navigate({
        to: "/login",
        search: { redirect: `/discover?tab=${tabId}` },
      });
    }
  };

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await api.discover.getCatalog();
        if (res.success && res.data) {
          setCatalog(res.data);
        }
      } catch (err) {
        console.error("Failed to load discover catalog for homepage showcase", err);
      }
    }
    fetchCatalog();
  }, []);

  const cards = [
    {
      name: "Kalyani Surāwali",
      subtitle: "Raga Kalyani (Greeshma)",
      description:
        "A gentle acoustic experience traditionally associated with calmness, balance, and focused listening.",
      searchKey: "Greeshma",
      image:
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Morning / Daytime",
      defaultAilments: ["Anxiety", "Hypertension", "Stress", "Lack of focus"],
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      name: "Bhairavi Surāwali",
      subtitle: "Raga Bhairavi (Nidra Mohini)",
      description:
        "A deeply calming Surāwali suited for relaxation, introspection, and peaceful listening.",
      searchKey: "Nidra mohini",
      image:
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Evening / Before sleep",
      defaultAilments: ["Insomnia", "Sleep difficulties", "Mental fatigue", "Stress"],
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      name: "Yaman Surāwali",
      subtitle: "Raga Yaman (Anand Mohini)",
      description:
        "A serene and uplifting Surāwali designed for relaxation, emotional balance, and peaceful listening.",
      searchKey: "Anand mohini",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Evening",
      defaultAilments: ["Stress", "Anxiety", "Mental fatigue", "Restlessness"],
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      name: "Todi Surāwali",
      subtitle: "Raga Todi (Prabhaati)",
      description:
        "A focused and contemplative Surāwali suited for attentive listening and a calm start to the day.",
      searchKey: "Prabhaati",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Morning",
      defaultAilments: ["Lack of concentration", "Mental fatigue", "Stress"],
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  ];

  // Helper function to map dynamic catalog data to the card
  const getMappedCardData = (card: (typeof cards)[0]) => {
    if (!catalog) {
      return {
        ...card,
        timingText: card.defaultTiming,
        mappedAilments: card.defaultAilments,
        hasMore: 0,
      };
    }

    // Find the Surawali record in the dynamic database
    const sRecord = catalog.surawalis?.find((s: any) =>
      s.name.toLowerCase().includes(card.searchKey.toLowerCase()),
    );

    if (!sRecord) {
      return {
        ...card,
        timingText: card.defaultTiming,
        mappedAilments: card.defaultAilments,
        hasMore: 0,
      };
    }

    // Get all ailment relationships for this Surawali
    const mappings =
      catalog.ailmentSurawalis?.filter((m: any) => m.surawaliId === sRecord.id) || [];

    // Map to unique ailment names
    const ailmentNames: string[] = [];
    mappings.forEach((m: any) => {
      const aRecord = catalog.ailments?.find((a: any) => a.id === m.ailmentId);
      // Exclude generic placeholders like "Name of Disorder"
      if (
        aRecord &&
        aRecord.name &&
        aRecord.name.toLowerCase() !== "name of disorder" &&
        !ailmentNames.includes(aRecord.name)
      ) {
        ailmentNames.push(aRecord.name);
      }
    });

    // Determine timing
    let timingText = card.defaultTiming;
    if (mappings.length > 0) {
      const tRecord = catalog.timings?.find((t: any) => t.id === mappings[0].timingId);
      if (tRecord && tRecord.name && tRecord.name.toLowerCase() !== "prescribed time") {
        timingText = tRecord.name;
      }
    }

    // Slice for card space layout limit (max 4 ailments) and compute "+X more"
    const limit = 4;
    const displayed = ailmentNames.length > 0 ? ailmentNames.slice(0, limit) : card.defaultAilments;
    const hasMore = ailmentNames.length > limit ? ailmentNames.length - limit : 0;

    return {
      ...card,
      timingText: timingText,
      mappedAilments: displayed,
      hasMore: hasMore,
    };
  };

  return (
    <div
      id="surawalis"
      className="border-t border-border/80 bg-gradient-to-b from-surface to-background relative overflow-hidden"
    >
      {/* ── PART 1: EXPLORE BY SURĀWALIS (VISUAL CARDS + ALIGNED AILMENTS) ── */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cat" />
              <span>Vedic Sound Therapy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
              Explore by Surāwalis
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md md:text-right font-sans">
            Vedic acoustic frequencies for targeted wellness
          </p>
        </div>

        {/* 4 Equal-height Horizontal Cards: Flex scroll on mobile, Grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-6 md:pb-0">
          {cards.map((rawCard, idx) => {
            const card = getMappedCardData(rawCard);
            return (
              <Link
                key={idx}
                to="/discover"
                search={{ search: card.searchKey }}
                className="snap-center shrink-0 w-[290px] md:w-auto press group relative rounded-3xl overflow-hidden border border-border/60 bg-surface shadow-soft hover:shadow-lift hover:border-cat/40 transition-all duration-300 flex flex-col justify-between cursor-pointer h-auto md:h-full"
              >
                {/* Image & Timing Overlay */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent pointer-events-none" />

                  {/* Subtle Efficacy Time */}
                  <div className="absolute bottom-3.5 left-4 z-10 flex items-center gap-1 text-[10px] font-semibold text-foreground/80 font-sans">
                    <Clock className="h-3 w-3 text-cat" />
                    <span>Rec: {card.timingText}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-serif text-foreground group-hover:text-cat transition-colors leading-tight">
                      {card.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>

                  {/* Associated Ailments Area */}
                  <div className="space-y-1.5 border-t border-border/60 pt-3 flex-1 flex flex-col justify-end">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-sans">
                      Associated with:
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {card.mappedAilments.map((ail, aIdx) => (
                        <span
                          key={aIdx}
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${card.badgeColor}`}
                        >
                          {ail}
                        </span>
                      ))}
                      {card.hasMore > 0 && (
                        <span className="inline-flex items-center rounded-full bg-secondary border border-border px-2 py-0.5 text-[9px] font-bold text-muted-foreground font-sans">
                          +{card.hasMore} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── PART 2: THERAPEUTIC CORE PATHWAYS (3 CARDS SIDE-BY-SIDE) ── */}
      <section className="py-20 sm:py-24 border-t border-border/60 bg-gradient-to-b from-[#FAF8F5] to-[#F5F2EB] relative overflow-hidden">
        {/* Absolute-positioned spiritual/wellness background elements */}
        <div className="absolute top-10 left-10 text-[#C5A880]/15 select-none pointer-events-none">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2v20M2 12h20M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" />
            <circle cx="12" cy="12" r="6" />
          </svg>
        </div>
        <div className="absolute top-20 right-16 text-[#C5A880]/15 select-none pointer-events-none">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        {/* Center large faint mandala */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C5A880]/5 select-none pointer-events-none">
          <svg
            width="600"
            height="600"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.15"
          >
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="35" />
            <circle cx="50" cy="50" r="25" />
            <path d="M 50,5 A 45,45 0 0,0 50,95 A 45,45 0 0,0 50,5" />
            <path d="M 5,50 A 45,45 0 0,0 95,50 A 45,45 0 0,0 5,50" />
            <path d="M 18.2,18.2 L 81.8,81.8" />
            <path d="M 18.2,81.8 L 81.8,18.2" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#C5A880] text-xs font-bold uppercase tracking-widest font-sans">
              <Sparkles className="h-3 w-3" />
              <span>SELECT HEALING PATHWAY</span>
              <Sparkles className="h-3 w-3" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#4A0E17] leading-tight">
              Choose Your Healing Journey
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Each pathway is a sacred blend of sound therapy and ancient wisdom, crafted to support
              your unique well-being.
            </p>
          </div>

          {/* Three Large Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch">
            {/* Card 1: Krishna Sanjeevani */}
            <div
              onClick={() => handleCardClick("ailments")}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-[#F2D6D6] bg-gradient-to-b from-[#FFF5F5] to-[#FDF4F4] shadow-soft hover:shadow-lift transition-all duration-300 group cursor-pointer"
            >
              <div>
                {/* SVG Illustration at top */}
                <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#7C1C24]/10 blur-xl scale-110" />
                  <svg
                    className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#F5D6D6]"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path
                      d="M 15,50 C 15,35 25,25 35,30 C 28,38 25,48 27,58 C 18,55 15,45 15,50 Z"
                      opacity="0.8"
                    />
                    <path
                      d="M 18,65 C 10,55 15,40 25,42 C 22,48 24,56 28,62 C 22,65 18,60 18,65 Z"
                      opacity="0.6"
                    />
                    <path
                      d="M 85,50 C 85,35 75,25 65,30 C 72,38 75,48 73,58 C 82,55 85,45 85,50 Z"
                      opacity="0.8"
                    />
                    <path
                      d="M 82,65 C 90,55 85,40 75,42 C 78,48 76,56 72,62 C 78,65 82,60 82,65 Z"
                      opacity="0.6"
                    />
                  </svg>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A72C38] to-[#5A1218] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                    <svg
                      className="w-full h-full text-white/25 absolute inset-0"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="5 5"
                      />
                      <path
                        d="M 25,75 Q 35,70 50,75 T 75,75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                      <path
                        d="M 30,80 Q 40,77 50,80 T 70,80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.3"
                      />
                    </svg>
                    <svg
                      className="w-20 h-20 text-white relative z-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="6" r="2.5" className="fill-white/10" />
                      <path d="M12,8.5 L12,17 M12,10 L7,13 M12,10 L17,13 M12,17 L9,22 M12,17 L15,22" />
                      <circle
                        cx="12"
                        cy="11.5"
                        r="1.5"
                        className="fill-red-300 stroke-red-200 animate-ping"
                      />
                      <circle cx="12" cy="11.5" r="1" className="fill-white stroke-none" />
                      <path d="M 8,11.5 C 6,10 6,13 8,11.5" stroke="#FFAAAA" strokeWidth="1" />
                      <path d="M 16,11.5 C 18,10 18,13 16,11.5" stroke="#FFAAAA" strokeWidth="1" />
                      <path d="M 7,16 C 5,14 5,18 7,16" stroke="#FFAAAA" strokeWidth="0.8" />
                      <path d="M 17,16 C 19,14 19,18 17,16" stroke="#FFAAAA" strokeWidth="0.8" />
                    </svg>
                  </div>
                </div>

                {/* Typography Hierarchy */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold font-serif text-[#7C1C24] group-hover:scale-[1.01] transition-transform duration-300">
                    Krishna Sanjeevani
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#7C1C24]/85 uppercase">
                    <span>DISORDER & AILMENT RELIEF</span>
                  </div>
                  {/* Subtle Ornamental line */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="h-[1px] w-12 bg-[#7C1C24]/20" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#7C1C24]/40" />
                    <div className="h-[1px] w-12 bg-[#7C1C24]/20" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                  Therapeutic sound frequencies calibrated to support physical and neurological
                  conditions naturally through Raga Chikitsa.
                </p>

                {/* Benefits List */}
                <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Targeted relief for various ailments</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Flower2 className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Non-invasive & natural support</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Rooted in ancient Indian wisdom</span>
                  </li>
                </ul>
              </div>

              {/* Action button */}
              <div className="w-full press py-3.5 px-6 rounded-full bg-[#7C1C24] hover:bg-[#68141B] text-white text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 group/btn cursor-pointer">
                <span>Explore Krishna Sanjeevani</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Arogya Sanjeevani */}
            <div
              onClick={() => handleCardClick("corporate")}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-[#DDEBE4] bg-gradient-to-b from-[#F4F8F6] to-[#ECF2EF] shadow-soft hover:shadow-lift transition-all duration-300 group cursor-pointer"
            >
              <div>
                {/* SVG Illustration at top */}
                <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#1C5D4B]/10 blur-xl scale-110" />
                  <svg
                    className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#DDEBE4]"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path d="M 22,30 C 15,35 15,48 20,55 C 23,48 27,45 25,38 Z" opacity="0.8" />
                    <path d="M 15,48 C 8,53 10,65 18,68 C 18,60 21,55 21,50 Z" opacity="0.6" />
                    <path d="M 78,30 C 85,35 85,48 80,55 C 77,48 73,45 75,38 Z" opacity="0.8" />
                    <path d="M 85,48 C 92,53 90,65 82,68 C 82,60 79,55 79,50 Z" opacity="0.6" />
                  </svg>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#247D64] to-[#124335] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                    <svg
                      className="w-full h-full text-white/20 absolute inset-0"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <path d="M 30,72 Q 50,65 70,72 T 30,72" fill="currentColor" opacity="0.15" />
                    </svg>
                    <svg
                      className="w-18 h-18 text-white relative z-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="5.5" r="2" className="fill-white/10" />
                      <path d="M12,7.5 L12,16" />
                      <path d="M6,16 C7,12.5 10,11.5 12,11.5 C14,11.5 17,12.5 18,16" />
                      <path d="M4,19.5 C8,19.5 9,16.5 12,16.5 C15,16.5 16,19.5 20,19.5" />
                      <path d="M6,18 C9,18 10,19.5 12,19.5 C14,19.5 15,18 18,18" />
                      <circle
                        cx="12"
                        cy="11"
                        r="1"
                        className="fill-emerald-200 stroke-none animate-pulse"
                      />
                      <circle
                        cx="12"
                        cy="5.5"
                        r="3.5"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                      />
                    </svg>
                  </div>
                </div>

                {/* Typography Hierarchy */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold font-serif text-[#1C5D4B] group-hover:scale-[1.01] transition-transform duration-300">
                    Arogya Sanjeevani
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#1C5D4B]/85 uppercase">
                    <span>CORPORATE WELLNESS & PRODUCTIVITY</span>
                  </div>
                  {/* Subtle Ornamental line */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="h-[1px] w-12 bg-[#1C5D4B]/20" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#1C5D4B]/40" />
                    <div className="h-[1px] w-12 bg-[#1C5D4B]/20" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                  Circadian-aligned sound therapy designed to reduce stress, boost focus, and
                  enhance well-being in the workplace.
                </p>

                {/* Benefits List */}
                <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                      <Brain className="h-3.5 w-3.5 text-[#1C5D4B]" />
                    </div>
                    <span>Enhances focus & mental clarity</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#1C5D4B]" />
                    </div>
                    <span>Reduces stress & burnout</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                      <Users className="h-3.5 w-3.5 text-[#1C5D4B]" />
                    </div>
                    <span>Improves team well-being</span>
                  </li>
                </ul>
              </div>

              {/* Action button */}
              <div className="w-full press py-3.5 px-6 rounded-full bg-[#1C5D4B] hover:bg-[#154638] text-white text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 group/btn cursor-pointer">
                <span>Explore Arogya Sanjeevani</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Garbh Sanjeevani */}
            <div
              onClick={() => handleCardClick("pregnancy")}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-[#ECE6F5] bg-gradient-to-b from-[#F8F6FB] to-[#F0ECF6] shadow-soft hover:shadow-lift transition-all duration-300 group md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none cursor-pointer"
            >
              <div>
                {/* SVG Illustration at top */}
                <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#D01C5C]/10 blur-xl scale-110" />
                  <svg
                    className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#ECE6F5]"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path
                      d="M 16,28 C 12,25 10,32 15,35 C 13,38 18,40 20,35 C 22,30 20,30 16,28 Z"
                      opacity="0.7"
                    />
                    <path
                      d="M 84,28 C 88,25 90,32 85,35 C 87,38 82,40 80,35 C 78,30 80,30 84,28 Z"
                      opacity="0.7"
                    />
                    <path d="M 22,70 C 26,62 38,62 40,70 C 35,74 28,74 22,70 Z" opacity="0.5" />
                    <path d="M 78,70 C 74,62 62,62 60,70 C 65,74 72,74 78,70 Z" opacity="0.5" />
                  </svg>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8A57AA] to-[#4E2A66] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                    <svg
                      className="w-full h-full text-white/20 absolute inset-0"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <path
                        d="M 20,50 A 30,30 0 0,0 80,50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.2"
                      />
                    </svg>
                    <svg
                      className="w-18 h-18 text-white relative z-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="13" cy="4.5" r="1.8" className="fill-white/10" />
                      <path d="M12.5,6.3 C11.5,8 10,11 10,14 C10,17 11.5,19 12.5,20.5" />
                      <path d="M13,6.3 C14.5,7.5 15,9 14.5,10" />
                      <path d="M14.5,10 C16.5,11.5 17,14 15.5,16.5 C14.5,18 13.5,18.5 12.5,20.5" />
                      <path d="M13.5,9 C12.5,10 11.5,12.5 12,14.5 C12.5,16 14.2,16 14.8,14.8" />
                      <path
                        d="M14.5,13.5 C14.2,13 13.5,13.3 13.5,13.7 C13.5,14 14.2,14.4 14.5,14.6 C14.8,14.4 15.5,14 15.5,13.7 C15.5,13.3 14.8,13 14.5,13.5 Z"
                        fill="rgba(253,244,255,0.85)"
                        stroke="none"
                        className="animate-pulse"
                      />
                      <circle cx="18" cy="10" r="0.5" className="fill-purple-200 stroke-none" />
                      <circle
                        cx="17.5"
                        cy="15"
                        r="0.7"
                        className="fill-purple-200 stroke-none animate-ping"
                      />
                    </svg>
                  </div>
                </div>

                {/* Typography Hierarchy */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold font-serif text-[#D01C5C] group-hover:scale-[1.01] transition-transform duration-300">
                    Garbh Sanjeevani
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#D01C5C]/85 uppercase">
                    <span>PREGNANCY CARE (GARBHA SANSKAR)</span>
                  </div>
                  {/* Subtle Ornamental line */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="h-[1px] w-12 bg-[#D01C5C]/20" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#D01C5C]/40" />
                    <div className="h-[1px] w-12 bg-[#D01C5C]/20" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                  Sacred sound guidance for a harmonious pregnancy journey and positive fetal
                  development.
                </p>

                {/* Benefits List */}
                <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <Music className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Supports fetal development</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <Heart className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Promotes emotional balance</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Guided by Garbha Sanskar wisdom</span>
                  </li>
                </ul>
              </div>

              {/* Action button */}
              <div className="w-full press py-3.5 px-6 rounded-full bg-[#D01C5C] hover:bg-[#A90F43] text-white text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 group/btn cursor-pointer">
                <span>Explore Garbh Sanjeevani</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Bottom Note/Music Banner */}
          <div className="mt-16 flex justify-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#4A0E17] text-xs sm:text-sm font-medium shadow-sm max-w-xl text-center sm:text-left">
              <div className="h-7 w-7 rounded-full bg-[#C5A880]/25 flex items-center justify-center shrink-0">
                <Music className="h-4 w-4 text-[#4A0E17]" />
              </div>
              <span>
                All sound frequencies are based on Raga Chikitsa and personalized for your
                well-being.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
