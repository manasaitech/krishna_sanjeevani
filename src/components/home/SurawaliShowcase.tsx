import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Activity, 
  Baby, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

export function SurawaliShowcase() {
  const [activeTab, setActiveTab] = useState<"ailments" | "pregnancy" | "corporate">("ailments");
  const [catalog, setCatalog] = useState<any>(null);

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
      description: "A gentle acoustic experience traditionally associated with calmness, balance, and focused listening.",
      searchKey: "Greeshma",
      image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Morning / Daytime",
      defaultAilments: ["Anxiety", "Hypertension", "Stress", "Lack of focus"],
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      name: "Bhairavi Surāwali",
      subtitle: "Raga Bhairavi (Nidra Mohini)",
      description: "A deeply calming Surāwali suited for relaxation, introspection, and peaceful listening.",
      searchKey: "Nidra mohini",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Evening / Before sleep",
      defaultAilments: ["Insomnia", "Sleep difficulties", "Mental fatigue", "Stress"],
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      name: "Yaman Surāwali",
      subtitle: "Raga Yaman (Anand Mohini)",
      description: "A serene and uplifting Surāwali designed for relaxation, emotional balance, and peaceful listening.",
      searchKey: "Anand mohini",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Evening",
      defaultAilments: ["Stress", "Anxiety", "Mental fatigue", "Restlessness"],
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      name: "Todi Surāwali",
      subtitle: "Raga Todi (Prabhaati)",
      description: "A focused and contemplative Surāwali suited for attentive listening and a calm start to the day.",
      searchKey: "Prabhaati",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
      defaultTiming: "Morning",
      defaultAilments: ["Lack of concentration", "Mental fatigue", "Stress"],
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  ];

  // Helper function to map dynamic catalog data to the card
  const getMappedCardData = (card: typeof cards[0]) => {
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
      s.name.toLowerCase().includes(card.searchKey.toLowerCase())
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
    const mappings = catalog.ailmentSurawalis?.filter((m: any) => m.surawaliId === sRecord.id) || [];

    // Map to unique ailment names
    const ailmentNames: string[] = [];
    mappings.forEach((m: any) => {
      const aRecord = catalog.ailments?.find((a: any) => a.id === m.ailmentId);
      // Exclude generic placeholders like "Name of Disorder"
      if (aRecord && aRecord.name && aRecord.name.toLowerCase() !== "name of disorder" && !ailmentNames.includes(aRecord.name)) {
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

  const tabs = [
    {
      id: "ailments" as const,
      label: "Disorder & Ailment Relief",
      icon: Activity,
      colorClass: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      description: "Sound frequency compositions calibrated for physical and neurological conditions. These streams act as non-invasive supportive therapy based on Raga Chikitsa.",
    },
    {
      id: "pregnancy" as const,
      label: "Pregnancy Care (Garbha Sanskar)",
      icon: Baby,
      colorClass: "text-pink-600 bg-pink-500/10 border-pink-500/20",
      description: "Month-by-month acoustic guidance calibrated to support maternal hormonal equilibrium, reduce stress, and enhance healthy fetal cognitive development.",
    },
    {
      id: "corporate" as const,
      label: "Corporate Wellness & Productivity",
      icon: Briefcase,
      colorClass: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      description: "Circadian-aligned ragas designed to lower stress levels, enhance workspace focus, and restore mental clarity during the workweek.",
    },
  ];

  const highlights = {
    ailments: [
      {
        name: "Nidra Mohini",
        condition: "Insomnia & Sleeplessness",
        timing: "Before Sleep",
        desc: "A soothing frequency sequence that slows brainwave activity, guiding the nervous system into restorative deep sleep states.",
      },
      {
        name: "Smrutigandha",
        condition: "Alzheimer's & Dementia",
        timing: "Any Time",
        desc: "Calibrated microtones designed to stimulate neural plasticity and enhance cognitive focus and recall.",
      },
      {
        name: "Greeshma",
        condition: "Anxiety, Stress & Fear",
        timing: "Any Time",
        desc: "A stabilizing, grounded sonic vibration that pacifies elevated Vata, reducing mental restlessness and tension.",
      },
      {
        name: "Pad Dukh Harini",
        condition: "Lower Back & Joint Pain",
        timing: "4:00 AM - 6:00 AM",
        desc: "Deep resonance compositions to aid early morning joint stiffness and support physical recovery.",
      },
    ],
    pregnancy: [
      {
        name: "Santul (Month 2)",
        condition: "Hormonal Balance",
        timing: "6:00 AM - 9:00 AM",
        desc: "Supports early maternal adjustment, calming morning nausea and promoting metabolic balance.",
      },
      {
        name: "Marut (Month 3)",
        condition: "Physical Grounding",
        timing: "6:00 AM - 8:00 AM",
        desc: "Nurturing morning vibrations helping ease fatigue and fostering early fetal cellular development.",
      },
      {
        name: "Dwaimadhyam (Month 4)",
        condition: "Emotional Stability",
        timing: "After Lunch",
        desc: "Pacifies midday stress hormones, establishing positive emotional connections between mother and child.",
      },
      {
        name: "Karnawati (Month 7)",
        condition: "Fetal Sensory Stimulus",
        timing: "Any Time",
        desc: "Targeted auditory frequencies optimized for developing fetal hearing and sensory processing.",
      },
    ],
    corporate: [
      {
        name: "Madhuprabhat",
        condition: "Monday morning focus",
        timing: "6:00 AM - 8:00 AM",
        desc: "An energizing, clarifying raga to start the work week with high focus, productivity, and mental readiness.",
      },
      {
        name: "Ahir Bhairav",
        condition: "Tuesday calm & clarity",
        timing: "6:00 AM - 8:00 AM",
        desc: "A balancing, serene melody that anchors thoughts, keeping workspace stress from accumulating early in the week.",
      },
      {
        name: "Madhmaad Sarang",
        condition: "Friday stress release",
        timing: "6:00 AM - 8:00 AM",
        desc: "A light, uplifting frequency to clear accumulated professional fatigue and prepare the mind for peaceful rest.",
      },
      {
        name: "Mishra Bhairavi",
        condition: "Daily evening transition",
        timing: "6:00 PM - 11:00 PM",
        desc: "Ideal for listening during the commute back home or before bed to dissolve work stress and transition into a peaceful evening.",
      },
    ],
  };

  const activeTabDetails = tabs.find((t) => t.id === activeTab)!;

  return (
    <div id="surawalis" className="border-t border-border/80 bg-gradient-to-b from-surface to-background relative overflow-hidden">
      
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

      {/* ── PART 2: THERAPEUTIC CORE PATHWAYS (3 TABS) ── */}
      <section className="py-20 sm:py-24 border-t border-border/60 bg-surface/30 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-foreground">
              Therapeutic Core Pathways
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-sans leading-relaxed">
              Vedic raga sound therapy structured across three core areas of life: ailments recovery, month-by-month pregnancy care, and weekly corporate focus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Interactive Tab Navigation */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2">
                Select Healing Pathway
              </div>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 press cursor-pointer ${
                      isSelected
                        ? "bg-surface border-cat/60 shadow-lift ring-2 ring-cat/10"
                        : "bg-surface/50 border-border/80 hover:bg-surface hover:border-border"
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected ? tab.colorClass : "bg-secondary border-border text-muted-foreground"
                    }`}>
                       <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className={`text-sm font-bold font-serif transition-colors ${
                        isSelected ? "text-cat font-semibold" : "text-foreground"
                      }`}>
                        {tab.label}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Tab Content Details */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-border/60 bg-surface p-6 sm:p-8 shadow-lift space-y-6">
                
                {/* Description and Badge Header */}
                <div className="space-y-3 pb-6 border-b border-border/60">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider border ${activeTabDetails.colorClass}`}>
                      <Sparkles className="h-3 w-3" />
                      {activeTabDetails.label}
                    </span>
                    <Link
                      to="/discover"
                      search={{ tab: activeTab }}
                      className="text-xs font-bold text-cat hover:underline inline-flex items-center gap-1 group"
                    >
                      <span>Explore full catalogue</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeTabDetails.description}
                  </p>
                </div>

                {/* Surawali Grid */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Featured Frequencies
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlights[activeTab].map((item, idx) => (
                      <div
                        key={idx}
                        className="group rounded-2xl bg-background border border-border/80 p-5 hover:border-cat/40 hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-display font-bold text-base text-foreground group-hover:text-cat transition-colors">
                              {item.name}
                            </h4>
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <Clock className="h-3 w-3 text-cat animate-breathe" />
                              <span>{item.timing}</span>
                            </span>
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-cat font-sans">
                            Target: {item.condition}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Banner */}
                <div className="rounded-2xl bg-gradient-to-br from-cat-light/40 via-cat-light/10 to-transparent border border-cat-accent/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-bold text-sm text-foreground">
                      Ready to begin your healing journey?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      Subscribe to unlock all full-length {activeTabDetails.label.toLowerCase()} compositions.
                    </p>
                  </div>
                  
                  <Link
                    to="/discover"
                    search={{ tab: activeTab }}
                    className="press rounded-btn bg-cat text-cat-foreground px-5 py-2.5 text-xs font-bold shadow-soft hover:brightness-105 transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Get My Surāwali Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
