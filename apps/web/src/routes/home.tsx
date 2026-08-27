import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Loader2,
  Heart,
  Waves,
  Info,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  Crown,
  AlertTriangle
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { sanjeevaniConfigs, type CategoryId, type Track } from "@/lib/content";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Sanjeevani Healing" },
      {
        name: "description",
        content: "Your unified personal wellness dashboard.",
      },
    ],
  }),
  component: HomeDashboard,
});

interface Ailment {
  id: string;
  name: string;
}

interface Surawali {
  id: string;
  name: string;
}

interface Timing {
  id: string;
  name: string;
}

interface AilmentSurawali {
  id: string;
  ailmentId: string;
  surawaliId: string;
  timingId: string;
}

interface PregnancyMapping {
  id: string;
  pregnancyMonth: number;
  surawaliId: string;
  timingId: string;
  musicTrack: string;
}

interface CorporateRaga {
  id: string;
  ragaName: string;
  weekDay: string;
  timingId: string;
}

interface ActiveSub {
  id: string;
  surawaliId: string;
  surawaliName: string;
  status: string;
  endDate: number;
}

function HomeDashboard() {
  const {
    category,
    current,
    playing,
    play,
    user,
    tracks,
    lang,
    t,
  } = useApp();

  const navigate = useNavigate();

  // Redirect guest or unset users to register/login or onboarding
  const activeCategory = (!category || category === "unset") ? "devotional" : category;
  const config = sanjeevaniConfigs[activeCategory as Exclude<CategoryId, "unset">];

  // Master Data & Subscriptions
  const [catalog, setCatalog] = useState<{
    ailments: Ailment[];
    surawalis: Surawali[];
    timings: Timing[];
    ailmentSurawalis: AilmentSurawali[];
    pregnancyMappings: PregnancyMapping[];
    corporateRagas: CorporateRaga[];
  } | null>(null);

  const [subscriptions, setSubscriptions] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeChip, setActiveChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParam, setSelectedParam] = useState(""); // Ailment ID, Pregnancy Month, or Corporate Weekday
  const [selectedTimingId, setSelectedTimingId] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscribingSurawali, setSubscribingSurawali] = useState<{ id: string; name: string } | null>(null);

  const greetingName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, subRes] = await Promise.all([
          api.discover.getCatalog(),
          api.discover.listSubscriptions(),
        ]);
        if (catRes.success) setCatalog(catRes.data);
        if (subRes.success) {
          const active = subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now());
          setSubscriptions(active);
        }
      } catch (err) {
        console.error("Failed to load catalog or subscriptions", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
  }, [user]);

  // Helper resolvers
  const getSurawaliName = (id: string) => catalog?.surawalis.find(s => s.id === id)?.name || "Unknown Surawali";
  const getTimingName = (id: string) => catalog?.timings.find(t => t.id === id)?.name || "Any Time";

  // Filtered Subscriptions list for the active category
  const filteredSubscriptions = useMemo(() => {
    if (!catalog) return [];
    return subscriptions.filter(sub => {
      // Exclude Greeshma from pregnancy pathway subscriptions
      if (activeCategory === "pregnancy" && (sub.surawaliName === "Greeshma" || sub.surawaliId === "sur_b719ad07-c4a5-51db-aaa5-48027611b68d")) {
        return false;
      }
      if (activeCategory === "devotional") {
        return catalog.ailmentSurawalis.some(m => m.surawaliId === sub.surawaliId);
      } else if (activeCategory === "pregnancy") {
        return catalog.pregnancyMappings.some(m => m.surawaliId === sub.surawaliId);
      } else {
        // Corporate users do not have direct subscriptions in the seed database
        return false;
      }
    });
  }, [subscriptions, catalog, activeCategory]);

  // Dynamic filter lists for dropdowns
  const paramDropdownList = useMemo(() => {
    if (!catalog) return [];
    if (activeCategory === "devotional") {
      return catalog.ailments.map(a => ({ label: a.name, value: a.id }));
    } else if (activeCategory === "pregnancy") {
      return Array.from({ length: 9 }).map((_, i) => ({
        label: lang === "hindi" ? `माह ${i + 1}` : lang === "sanskrit" ? `मासः ${i + 1}` : `Month ${i + 1}`,
        value: String(i + 1)
      }));
    } else {
      if (lang === "hindi") {
        return [
          { label: "सोमवार", value: "Monday" },
          { label: "मंगलवार", value: "Tuesday" },
          { label: "बुधवार", value: "Wednesday" },
          { label: "गुरुवार", value: "Thursday" },
          { label: "शुक्रवार", value: "Friday" },
          { label: "शनिवार", value: "Saturday" },
          { label: "रविवार", value: "Sunday" },
        ];
      } else if (lang === "sanskrit") {
        return [
          { label: "सोमवासरः", value: "Monday" },
          { label: "मङ्गलवासरः", value: "Tuesday" },
          { label: "बुधवासरः", value: "Wednesday" },
          { label: "गुरुवासरः", value: "Thursday" },
          { label: "शुक्रवासरः", value: "Friday" },
          { label: "शनिवासरः", value: "Saturday" },
          { label: "रविवासरः", value: "Sunday" },
        ];
      }
      return [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
      ];
    }
  }, [catalog, activeCategory, lang]);

  // Filtered master recommendations for exploration
  const exploreResults = useMemo(() => {
    if (!catalog) return [];
    
    if (activeCategory === "devotional") {
      // Krishna Sanjeevani: Ailments
      return catalog.ailmentSurawalis.filter(m => {
        const sName = getSurawaliName(m.surawaliId);
        const aName = catalog.ailments.find(a => a.id === m.ailmentId)?.name || "";
        
        // Chip tag filter
        const matchesChip = activeChip === "All" || 
          (activeChip === "Disorder Relief" && ["Anxiety", "Migraine", "Hypertension", "Insomnia"].some(d => aName.includes(d))) ||
          (activeChip === "Stress Relief" && ["Stress", "Anxiety"].some(d => aName.includes(d))) ||
          (activeChip === "Focus" && ["Focus", "Concentration"].some(d => aName.includes(d))) ||
          (activeChip === "Sleep" && ["Sleep", "Insomnia"].some(d => aName.includes(d)));

        const matchesSearch = searchQuery.trim() 
          ? sName.toLowerCase().includes(searchQuery.toLowerCase()) || aName.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesParam = selectedParam ? m.ailmentId === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.surawaliId,
        title: getSurawaliName(m.surawaliId),
        purpose: catalog.ailments.find(a => a.id === m.ailmentId)?.name || "Therapeutic",
        timing: getTimingName(m.timingId),
        duration: "30 min",
        description: "Curated harmonic resonance session optimized for restorative bio-acoustic alignment.",
        type: "ailment"
      }));

    } else if (activeCategory === "pregnancy") {
      // Garbh Sanjeevani: Pregnancy Month mappings
      return catalog.pregnancyMappings.filter(m => {
        const sName = getSurawaliName(m.surawaliId);
        
        // Exclude Greeshma
        if (sName === "Greeshma" || m.surawaliId === "sur_b719ad07-c4a5-51db-aaa5-48027611b68d") {
          return false;
        }

        const matchesChip = activeChip === "All" ||
          (activeChip === "Month 1-3" && [1, 2, 3].includes(m.pregnancyMonth)) ||
          (activeChip === "Month 4-6" && [4, 5, 6].includes(m.pregnancyMonth)) ||
          (activeChip === "Month 7-9" && [7, 8, 9].includes(m.pregnancyMonth));

        const matchesSearch = searchQuery.trim() 
          ? sName.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true;

        const matchesParam = selectedParam ? String(m.pregnancyMonth) === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.surawaliId,
        title: getSurawaliName(m.surawaliId),
        purpose: `Pregnancy Care (Month ${m.pregnancyMonth})`,
        timing: getTimingName(m.timingId),
        duration: "28 min",
        description: "Delicate and calming sound therapy to support maternal comfort and healthy fetal cognitive development.",
        type: "pregnancy"
      }));

    } else {
      // Arogya Sanjeevani: Corporate Wellness Weekday Ragas
      return catalog.corporateRagas.filter(m => {
        const matchesChip = activeChip === "All" ||
          (activeChip === "Workplace Stress" && ["Monday", "Wednesday", "Friday"].includes(m.weekDay)) ||
          (activeChip === "Focus Boost" && ["Tuesday", "Thursday"].includes(m.weekDay));

        const matchesSearch = searchQuery.trim() 
          ? m.ragaName.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true;

        const matchesParam = selectedParam ? m.weekDay === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.id, // Ragas act as their own unique identity
        title: m.ragaName,
        purpose: `Workspace Wellness (${m.weekDay})`,
        timing: getTimingName(m.timingId),
        duration: "32 min",
        description: "Professional auditory composition calibrated to suppress cognitive fatigue and elevate office focus.",
        type: "corporate"
      }));
    }
  }, [catalog, activeCategory, activeChip, searchQuery, selectedParam, selectedTimingId]);

  // Paginated Explore list
  const totalPages = Math.ceil(exploreResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return exploreResults.slice(start, start + itemsPerPage);
  }, [exploreResults, currentPage]);

  const handlePlayPreview = (surawaliName: string, subtext: string, forceSubscribed = false) => {
    toast.info(`Playing ${forceSubscribed ? "session" : "preview"} for ${surawaliName}`);
    play({
      id: forceSubscribed ? `session_${surawaliName}` : `preview_${surawaliName}`,
      title: surawaliName + (forceSubscribed ? "" : " (Preview)"),
      artist: config.name,
      subtitle: subtext,
      duration: forceSubscribed ? 1800 : 90,
      category: activeCategory,
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3"
    } as any);
  };

  const handleSubscribeClick = (surawali: { id: string; name: string }) => {
    setSubscribingSurawali(surawali);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!subscribingSurawali) return;
    try {
      const txnId = `mock_txn_${Math.random().toString(36).substring(7)}`;
      const res = await api.discover.subscribe(subscribingSurawali.id, "monthly", txnId);
      if (res.success) {
        toast.success(`Successfully subscribed to ${subscribingSurawali.name}!`);
        // Reload subscriptions list
        const subRes = await api.discover.listSubscriptions();
        if (subRes.success) {
          const active = subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now());
          setSubscriptions(active);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setPaymentModalOpen(false);
      setSubscribingSurawali(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedParam("");
    setSelectedTimingId("");
    setSelectedDuration("");
    setActiveChip("All");
    setCurrentPage(1);
  };

  const localizedName = activeCategory === "devotional" 
    ? t("krishnaSanjeevani") 
    : activeCategory === "pregnancy" 
      ? t("garbhaSanjeevani") 
      : t("nirvanaSanjeevani");

  const localizedDesc = activeCategory === "devotional" 
    ? t("krishnaSanjeevaniDesc") 
    : activeCategory === "pregnancy" 
      ? t("garbhaSanjeevaniDesc") 
      : t("nirvanaSanjeevaniDesc");

  const localizedGreeting = activeCategory === "devotional" 
    ? t("krishnaSanjeevaniGreeting") 
    : activeCategory === "pregnancy" 
      ? t("garbhaSanjeevaniGreeting") 
      : t("nirvanaSanjeevaniGreeting");

  const localizedBannerText = activeCategory === "devotional" 
    ? (lang === "hindi" ? "आपकी पसंद के अनुसार चिकित्सकीय संगीत के व्यक्तिगत चक्र उपलब्ध हैं।" : lang === "sanskrit" ? "भवतः मानसिकशांतये सङ्गीतसत्राणि उपलब्धानि सन्ति।" : "Customized restorative therapy tracks aligned to your biological parameters are ready.") 
    : activeCategory === "pregnancy" 
      ? (lang === "hindi" ? "गर्भावस्था के दौरान शिशु के विकास और शांति के लिए गर्भ संस्कार मंत्र।" : lang === "sanskrit" ? "गर्भसंस्कारमन्त्राः शिशुवर्धनार्थं उपलब्धाः सन्ति।" : "Maternal sounds and development support customized to your current trimester.") 
      : (lang === "hindi" ? "तनाव मुक्ति और ध्यान केंद्रित करने के लिए विशेष संगीत।" : lang === "sanskrit" ? "उद्योगकल्याणाय चित्तस्थैर्यं एकाग्रता च वर्धयन्तु।" : "Mindful concentration triggers tailored for professional efficiency.");

  return (
    <AppShell>
      <div 
        className="space-y-8 max-w-[1600px] mx-auto pb-24"
        style={{ "--theme-color": config.theme.primary } as React.CSSProperties}
      >
        {/* Dynamic Sloka Block */}
        <div 
          className="rounded-card border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 shadow-soft"
          style={{ 
            borderColor: config.theme.primary + "20",
            background: `linear-gradient(135deg, ${config.theme.primary}05, ${config.theme.primary}0a)` 
          }}
        >
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">{t("activePathway")}</p>
            <h2 className="font-display font-bold text-2xl text-foreground" style={{ color: config.theme.primary }}>
              {localizedName}
            </h2>
            <p className="text-sm text-muted-foreground/90 max-w-xl">{localizedDesc}</p>
          </div>
          <div className="shrink-0 rounded-btn px-4 py-3 border font-display text-xs leading-normal font-semibold text-center italic text-muted-foreground/80 bg-background max-w-md" style={{ borderColor: config.theme.primary + "30" }}>
            {localizedGreeting}
          </div>
        </div>


        {/* Subscribed Surawalis Section */}
        <div id="subscribed-surawalis" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-foreground text-lg">{t("yourSubscribedSurawalis")}</h3>
            <span className="text-xs text-muted-foreground font-medium">{filteredSubscriptions.length} {t("subscriptionsActive")}</span>
          </div>

          {loading ? (
            <div className="flex min-h-[120px] items-center justify-center border border-dashed border-border rounded-card">
              <Loader2 className="h-6 w-6 animate-spin text-cat" />
            </div>
          ) : filteredSubscriptions.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
              {filteredSubscriptions.map(sub => (
                <div 
                  key={sub.id} 
                  className="press min-w-[280px] max-w-[280px] bg-surface rounded-card border border-border/60 hover:border-cat/60 hover:shadow-soft transition-all duration-300 p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                      <div className="absolute top-2.5 left-2.5 z-20 rounded bg-white/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                        {t("subscribedText")}
                      </div>
                      <div 
                        className="absolute inset-0 flex items-center justify-center text-white/90 text-2xl font-bold font-display uppercase tracking-widest z-0 bg-gradient-to-br"
                        style={{ from: config.theme.primary, to: "#2d3748" } as any}
                      >
                        {sub.surawaliName.substring(0, 2)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-[15px] truncate text-foreground">
                        {sub.surawaliName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
                        {activeCategory === "devotional" ? t("krishnaSanjeevani") : t("garbhaSanjeevani")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>30 {t("minute")}</span>
                    </div>
                    <button
                      onClick={() => handlePlayPreview(sub.surawaliName, "Subscribed active session", true)}
                      className="press h-8 w-8 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform"
                      style={{ backgroundColor: config.theme.primary }}
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border p-8 text-center bg-surface/50">
              <p className="text-sm text-muted-foreground">
                {t("surawaliJourneyStart")}
              </p>
              <button
                onClick={() => {
                  const exploreElement = document.getElementById("explore-surawalis");
                  if (exploreElement) exploreElement.scrollIntoView({ behavior: "smooth" });
                }}
                className="press mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-btn text-xs font-bold text-white transition-all"
                style={{ backgroundColor: config.theme.primary }}
              >
                <span>{t("exploreSurawalis")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Journey Progress Banner */}
        <div 
          className="rounded-card border p-4 flex items-center gap-4 transition-all duration-300 shadow-soft"
          style={{ 
            borderColor: config.theme.primary + "1f", 
            background: `${config.theme.primary}05` 
          }}
        >
          <div className="p-2 rounded-full bg-white shrink-0 shadow-sm border border-border/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ stroke: config.theme.primary }} strokeWidth="2">
              <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-foreground leading-relaxed">
            {localizedBannerText}
          </p>
        </div>

        {/* Explore / Catalog Inline section */}
        <div id="explore-surawalis" className="space-y-6 scroll-mt-20">
          <div className="px-1 space-y-1">
            <h3 className="font-semibold text-foreground text-lg">{t("exploreSurawalis")}</h3>
            <p className="text-xs text-muted-foreground">{t("discoverOtherSequences")}</p>
          </div>

          {/* Chips categories filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {config.filters.map(filterName => {
              const getFilterDisplayName = (name: string) => {
                if (name === "All") return lang === "hindi" ? "सभी" : lang === "sanskrit" ? "सर्वाणि" : "All";
                if (name === "Disorder Relief") return lang === "hindi" ? "विकार निवारण" : lang === "sanskrit" ? "व्याधिनिवारणम्" : "Disorder Relief";
                if (name === "Stress Relief") return lang === "hindi" ? "तनाव निवारण" : lang === "sanskrit" ? "तनावमुक्तिः" : "Stress Relief";
                if (name === "Focus") return lang === "hindi" ? "एकाग्रता" : lang === "sanskrit" ? "चित्तस्थैर्यम्" : "Focus";
                if (name === "Sleep") return lang === "hindi" ? "नींद" : lang === "sanskrit" ? "निद्रा" : "Sleep";
                if (name === "Month 1-3") return lang === "hindi" ? "माह १-३" : lang === "sanskrit" ? "मासः १-३" : "Month 1-3";
                if (name === "Month 4-6") return lang === "hindi" ? "माह ४-६" : lang === "sanskrit" ? "मासः ४-६" : "Month 4-6";
                if (name === "Month 7-9") return lang === "hindi" ? "माह ७-९" : lang === "sanskrit" ? "मासः ७-९" : "Month 7-9";
                return name;
              };

              return (
                <button
                  key={filterName}
                  onClick={() => {
                    setActiveChip(filterName);
                    setCurrentPage(1);
                  }}
                  className="press px-4 py-2 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer"
                  style={{
                    backgroundColor: activeChip === filterName ? config.theme.primary : "transparent",
                    color: activeChip === filterName ? "#fff" : "inherit",
                    borderColor: activeChip === filterName ? config.theme.primary : "#e2e8f0"
                  }}
                >
                  {getFilterDisplayName(filterName)}
                </button>
              );
            })}
          </div>

          {/* Detailed filters toolbar panel */}
          <div className="rounded-card border border-border/60 bg-surface p-5 shadow-soft space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              
              {/* Search bar */}
              <div className="lg:col-span-2 relative w-full">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("search")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={t("searchPlaceholder")}
                    className="w-full min-h-10 pl-9 pr-4 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat focus-visible:border-cat transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Pathway-specific dynamic dropdown selector */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {activeCategory === "devotional" ? t("disorderAilment") : activeCategory === "pregnancy" ? t("pregnancyMonth") : t("corporateDay")}
                </label>
                <select
                  value={selectedParam}
                  onChange={(e) => {
                    setSelectedParam(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                >
                  <option value="">{t("allOptions")}</option>
                  {paramDropdownList.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Best Listening Time filter */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("bestListeningTime")}</label>
                <select
                  value={selectedTimingId}
                  onChange={(e) => {
                    setSelectedTimingId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                >
                  <option value="">{t("anyTime")}</option>
                  {catalog?.timings.map(t => {
                    const getTimingDisplayName = (name: string) => {
                      if (name === "Morning") return lang === "hindi" ? "प्रातःकाल" : lang === "sanskrit" ? "प्रातःकालः" : "Morning";
                      if (name === "Afternoon") return lang === "hindi" ? "मध्याह्न" : lang === "sanskrit" ? "मध्याह्नः" : "Afternoon";
                      if (name === "Evening") return lang === "hindi" ? "सायंकाल" : lang === "sanskrit" ? "सायङ्कालः" : "Evening";
                      if (name === "Night") return lang === "hindi" ? "रात्रि" : lang === "sanskrit" ? "रात्रिः" : "Night";
                      return name;
                    };
                    return (
                      <option key={t.id} value={t.id}>{getTimingDisplayName(t.name)}</option>
                    );
                  })}
                </select>
              </div>

              {/* Reset filters button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="press w-full min-h-10 px-4 rounded-btn border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-secondary flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>{t("resetFilters")}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Results rows list */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cat" />
              </div>
            ) : exploreResults.length > 0 ? (
              paginatedResults.map(item => {
                const isSubscribed = activeCategory === "devotional" 
                  ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                  : activeCategory === "pregnancy"
                    ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                    : true; // Corporate has free preview access

                return (
                  <div 
                    key={item.id} 
                    className="rounded-card border border-border/60 bg-surface p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-soft hover:border-cat/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="h-16 w-16 rounded-xl shrink-0 flex items-center justify-center font-display text-white font-bold text-lg select-none uppercase tracking-wider"
                        style={{ backgroundColor: config.theme.primary }}
                      >
                        {item.title.substring(0, 2)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-semibold text-base text-foreground">{item.title}</h4>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {item.purpose}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{t("timing")}: {item.timing}</span>
                          </span>
                          <span>&bull;</span>
                          <span>{t("duration")}: {item.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handlePlayPreview(item.title, `Preview of ${item.title}`)}
                        className="press flex-1 md:flex-none min-h-10 px-4 rounded-btn bg-secondary text-xs font-bold hover:bg-secondary-hover flex items-center justify-center gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{t("preview")}</span>
                      </button>
                      
                      {isSubscribed ? (
                        <button
                          onClick={() => handlePlayPreview(item.title, `Full session: ${item.title}`, true)}
                          className="press flex-1 md:flex-none min-h-10 px-5 rounded-btn text-xs font-bold text-white hover:brightness-105 flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: config.theme.primary }}
                        >
                          <Waves className="h-3.5 w-3.5" />
                          <span>{t("listenNow")}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribeClick({ id: item.surawaliId, name: item.title })}
                          className="press flex-1 md:flex-none min-h-10 px-5 rounded-btn bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover flex items-center justify-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>{t("subscribe")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-card border border-border bg-surface/60 p-8 text-center shadow-soft">
                <Waves className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2 animate-pulse" />
                <p className="text-[13px] font-semibold text-foreground">{t("noMatchedSurawalis")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t("tryResetting")}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="press h-9 w-9 rounded-btn border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isSelected = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="press h-9 w-9 rounded-btn text-xs font-bold border transition-all"
                    style={{
                      backgroundColor: isSelected ? config.theme.primary : "transparent",
                      color: isSelected ? "#fff" : "inherit",
                      borderColor: isSelected ? config.theme.primary : "#e2e8f0"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="press h-9 w-9 rounded-btn border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

        {/* Bottom medical disclaimer and info */}
        <div className="rounded-card border border-amber-500/25 bg-amber-500/5 p-4 flex gap-3.5 items-start mt-8">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-amber-800">Professional Auditory Wellness Statement</h4>
            <p className="text-[11px] leading-relaxed text-amber-700/90">
              All therapeutic frequencies are sequenced based on Vedic Raga Chikitsa standards and physical acoustic measures. Auditory therapy is a safe, natural support mechanism and is not a replacement for professional clinical advice, diagnoses, or prescriptions.
            </p>
          </div>
        </div>

      </div>

      {/* Mock Subscription Payment Modal */}
      {paymentModalOpen && subscribingSurawali && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lift space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: config.theme.primary }}
              >
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-base text-foreground">Confirm Subscription</h4>
                <p className="text-xs text-muted-foreground">Premium Raga Chikitsa Sequence</p>
              </div>
            </div>

            <div className="p-4 rounded-btn border border-border/80 bg-background space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sequence:</span>
                <span className="font-bold text-foreground">{subscribingSurawali.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pathway:</span>
                <span className="font-bold text-foreground capitalize">{activeCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Tier:</span>
                <span className="font-bold text-emerald-600">₹299 / month</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSubscribingSurawali(null);
                }}
                className="press flex-1 min-h-10 px-4 rounded-btn border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="press flex-1 min-h-10 px-4 rounded-btn text-xs font-bold text-white shadow-lift"
                style={{ backgroundColor: config.theme.primary }}
              >
                Mock Success Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
