import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Loader2,
  Clock,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  Crown,
  ShieldCheck,
  Waves,
  Sun,
  Heart,
  ArrowRight,
  Quote,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { sanjeevaniConfigs, type CategoryId } from "@/lib/content";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Artwork imports for rich card rendering
import artDevotional from "@/assets/art-devotional.webp";
import artFocus from "@/assets/art-focus.webp";
import artHealing from "@/assets/art-healing.webp";
import artNature1 from "@/assets/18fc75d6-df05-469c-9855-d79c4931636d.webp";
import artNature2 from "@/assets/2978e827-6b28-45f0-bbce-575e6023a705.webp";
import artNature3 from "@/assets/3f99cd1e-9061-4ee5-a720-ba4041cfae9d.webp";
import artNature4 from "@/assets/57d4ebea-a77c-4f30-88ad-87e99aac7c1f.webp";
import artNature5 from "@/assets/70fad00b-8e20-42f8-a986-11f0bd7335f5.webp";
import artNature6 from "@/assets/8269a526-98ab-49a2-bcce-928814d51baa.webp";
import artNature7 from "@/assets/89e81ba6-b688-4575-9b1f-964ace72a456.webp";
import artNature8 from "@/assets/af091c30-50ed-4947-85f7-7be2e6a958f4.webp";
import artNature9 from "@/assets/caf22ea5-bc7e-46d8-a845-876858c2a009.webp";
import artNature10 from "@/assets/cbabb2a5-2787-4997-986f-daf7b88017ff.webp";

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

const DEFAULT_SURAWALI_CATALOG = {
  ailments: [
    { id: "ail_anxiety", name: "Anxiety & Restlessness" },
    { id: "ail_hypertension", name: "Hypertension & Blood Pressure" },
    { id: "ail_insomnia", name: "Insomnia & Sleep Disorders" },
    { id: "ail_stress", name: "Chronic Stress & Tension" },
    { id: "ail_migraine", name: "Migraine & Neurological Fatigue" },
    { id: "ail_focus", name: "Focus & Cognitive Concentration" },
    { id: "ail_depression", name: "Low Energy & Emotional Heaviness" },
  ],
  surawalis: [
    { id: "sur_kalyani", name: "Kalyani Surāwali" },
    { id: "sur_bhairavi", name: "Bhairavi Surāwali" },
    { id: "sur_yaman", name: "Yaman Surāwali" },
    { id: "sur_todi", name: "Todi Surāwali" },
    { id: "sur_bilawal", name: "Bilawal Surāwali" },
    { id: "sur_shankara", name: "Shankara Surāwali" },
  ],
  timings: [
    { id: "tim_morning", name: "Morning (07:00 - 12:00)" },
    { id: "tim_evening", name: "Evening (16:00 - 20:00)" },
    { id: "tim_night", name: "Night (20:00 - 23:00)" },
    { id: "tim_early", name: "Early Morning (04:00 - 07:00)" },
  ],
  ailmentSurawalis: [
    { id: "m_1", ailmentId: "ail_anxiety", surawaliId: "sur_kalyani", timingId: "tim_morning" },
    { id: "m_2", ailmentId: "ail_hypertension", surawaliId: "sur_kalyani", timingId: "tim_morning" },
    { id: "m_3", ailmentId: "ail_insomnia", surawaliId: "sur_bhairavi", timingId: "tim_night" },
    { id: "m_4", ailmentId: "ail_stress", surawaliId: "sur_yaman", timingId: "tim_evening" },
    { id: "m_5", ailmentId: "ail_focus", surawaliId: "sur_todi", timingId: "tim_early" },
    { id: "m_6", ailmentId: "ail_depression", surawaliId: "sur_bilawal", timingId: "tim_morning" },
    { id: "m_7", ailmentId: "ail_migraine", surawaliId: "sur_shankara", timingId: "tim_evening" },
  ],
  pregnancyMappings: [
    { id: "pm_1", pregnancyMonth: 1, surawaliId: "sur_kalyani", timingId: "tim_morning", musicTrack: "Kalyani Shanti" },
    { id: "pm_2", pregnancyMonth: 2, surawaliId: "sur_yaman", timingId: "tim_evening", musicTrack: "Yaman Garbha" },
    { id: "pm_3", pregnancyMonth: 3, surawaliId: "sur_bhairavi", timingId: "tim_night", musicTrack: "Bhairavi Sukham" },
    { id: "pm_4", pregnancyMonth: 4, surawaliId: "sur_bilawal", timingId: "tim_morning", musicTrack: "Bilawal Utsaha" },
    { id: "pm_5", pregnancyMonth: 5, surawaliId: "sur_todi", timingId: "tim_early", musicTrack: "Todi Chetana" },
    { id: "pm_6", pregnancyMonth: 6, surawaliId: "sur_kalyani", timingId: "tim_morning", musicTrack: "Kalyani Raksha" },
    { id: "pm_7", pregnancyMonth: 7, surawaliId: "sur_shankara", timingId: "tim_evening", musicTrack: "Shankara Ananda" },
    { id: "pm_8", pregnancyMonth: 8, surawaliId: "sur_yaman", timingId: "tim_evening", musicTrack: "Yaman Prasanti" },
    { id: "pm_9", pregnancyMonth: 9, surawaliId: "sur_bhairavi", timingId: "tim_night", musicTrack: "Bhairavi Janani" },
  ],
  corporateRagas: [
    { id: "cr_1", ragaName: "Monday Clarity (Raga Bilawal)", weekDay: "Monday", timingId: "tim_morning" },
    { id: "cr_2", ragaName: "Tuesday Focus (Raga Todi)", weekDay: "Tuesday", timingId: "tim_early" },
    { id: "cr_3", ragaName: "Wednesday Stress Buster (Raga Yaman)", weekDay: "Wednesday", timingId: "tim_evening" },
    { id: "cr_4", ragaName: "Thursday Flow (Raga Kalyani)", weekDay: "Thursday", timingId: "tim_morning" },
    { id: "cr_5", ragaName: "Friday Unwind (Raga Bhairavi)", weekDay: "Friday", timingId: "tim_night" },
    { id: "cr_6", ragaName: "Saturday Recharge (Raga Shankara)", weekDay: "Saturday", timingId: "tim_morning" },
    { id: "cr_7", ragaName: "Sunday Peace (Raga Bhairavi)", weekDay: "Sunday", timingId: "tim_night" },
  ]
};

// Map names to specific artwork images
function getArtworkForSurawali(title: string, index: number): string {
  const t = title.toLowerCase();
  if (t.includes("aagman") || t.includes("garbha") || t.includes("pregnancy")) return artNature3;
  if (t.includes("greeshma")) return artNature9;
  if (t.includes("nidra") || t.includes("sleep") || t.includes("insomnia")) return artNature6;
  if (t.includes("smrutigandha") || t.includes("alzheimer") || t.includes("memory")) return artNature7;
  if (t.includes("anand") || t.includes("joy")) return artNature1;
  if (t.includes("bhaas") || t.includes("clarity")) return artNature2;
  if (t.includes("dwaimadhyam")) return artNature4;
  if (t.includes("kalyani")) return artNature8;
  if (t.includes("bhairavi")) return artNature5;
  if (t.includes("yaman")) return artNature10;
  if (t.includes("todi")) return artFocus;
  if (t.includes("bilawal")) return artHealing;
  if (t.includes("shankara")) return artDevotional;
  
  const pool = [artNature1, artNature2, artNature3, artNature4, artNature5, artNature6, artNature7, artNature8, artNature9, artNature10];
  return pool[index % pool.length] ?? artNature1;
}

// Map purpose/ailment to a badge label and theme
function getBadgeInfo(purpose: string, type: string): { label: string; benefit: string } {
  const p = purpose.toUpperCase();
  if (type === "pregnancy" || p.includes("PREGNANCY") || p.includes("GARBHA")) {
    return { label: "PREGNANCY WELLNESS", benefit: "Maternal well-being" };
  }
  if (p.includes("ACIDITY") || p.includes("VOMITING") || p.includes("PITTA")) {
    return { label: "ACIDITY AND VOMITING", benefit: "Digestive health • Stress relief" };
  }
  if (p.includes("SLEEP") || p.includes("INSOMNIA")) {
    return { label: "SLEEP DISORDERS", benefit: "Better sleep • Mental relaxation" };
  }
  if (p.includes("ALZHEIMER") || p.includes("MEMORY") || p.includes("SMART")) {
    return { label: "ALZHEIMER & MEMORY", benefit: "Memory stimulation • Mental clarity" };
  }
  if (p.includes("ANXIETY") || p.includes("RESTLESSNESS")) {
    return { label: "ANXIETY RELIEF", benefit: "Calm nervous system • Emotional balance" };
  }
  if (p.includes("HYPERTENSION") || p.includes("BLOOD PRESSURE")) {
    return { label: "BLOOD PRESSURE", benefit: "Vascular relaxation • Inner stillness" };
  }
  if (p.includes("STRESS") || p.includes("TENSION")) {
    return { label: "CHRONIC STRESS", benefit: "Cortisol reduction • Physical ease" };
  }
  if (p.includes("MIGRAINE") || p.includes("FATIGUE")) {
    return { label: "NEUROLOGICAL RELIEF", benefit: "Cranial relaxation • Soothing frequency" };
  }
  if (p.includes("FOCUS") || p.includes("CONCENTRATION")) {
    return { label: "FOCUS & CLARITY", benefit: "Enhanced cognition • Sharpness" };
  }
  return { label: purpose.toUpperCase(), benefit: "Emotional balance • Vitality" };
}

export function SurawaliHome() {
  const {
    category,
    play,
    user,
  } = useApp();

  const navigate = useNavigate();

  const validCategories: CategoryId[] = ["devotional", "secular", "pregnancy"];
  const activeCategory: Exclude<CategoryId, "unset"> = (category && validCategories.includes(category as CategoryId))
    ? (category as Exclude<CategoryId, "unset">)
    : "devotional";
  const config = sanjeevaniConfigs[activeCategory] || sanjeevaniConfigs.devotional;

  // Master Data & Subscriptions
  const [catalog, setCatalog] = useState<{
    ailments: Ailment[];
    surawalis: Surawali[];
    timings: Timing[];
    ailmentSurawalis: AilmentSurawali[];
    pregnancyMappings: PregnancyMapping[];
    corporateRagas: CorporateRaga[];
  }>(DEFAULT_SURAWALI_CATALOG);

  const [subscriptions, setSubscriptions] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [activeChip, setActiveChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParam, setSelectedParam] = useState("");
  const [selectedTimingId, setSelectedTimingId] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscribingSurawali, setSubscribingSurawali] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await api.discover.getCatalog();
        if (catRes && catRes.success && catRes.data && Array.isArray(catRes.data.surawalis) && catRes.data.surawalis.length > 0) {
          setCatalog({
            ailments: Array.isArray(catRes.data.ailments) && catRes.data.ailments.length > 0 ? catRes.data.ailments : DEFAULT_SURAWALI_CATALOG.ailments,
            surawalis: catRes.data.surawalis,
            timings: Array.isArray(catRes.data.timings) && catRes.data.timings.length > 0 ? catRes.data.timings : DEFAULT_SURAWALI_CATALOG.timings,
            ailmentSurawalis: Array.isArray(catRes.data.ailmentSurawalis) && catRes.data.ailmentSurawalis.length > 0 ? catRes.data.ailmentSurawalis : DEFAULT_SURAWALI_CATALOG.ailmentSurawalis,
            pregnancyMappings: Array.isArray(catRes.data.pregnancyMappings) && catRes.data.pregnancyMappings.length > 0 ? catRes.data.pregnancyMappings : DEFAULT_SURAWALI_CATALOG.pregnancyMappings,
            corporateRagas: Array.isArray(catRes.data.corporateRagas) && catRes.data.corporateRagas.length > 0 ? catRes.data.corporateRagas : DEFAULT_SURAWALI_CATALOG.corporateRagas,
          });
        }

        if (user) {
          try {
            const subRes = await api.discover.listSubscriptions();
            if (subRes && subRes.success && Array.isArray(subRes.data)) {
              const active = subRes.data.filter((s: any) => s && s.status === "active" && Number(s.endDate) > Date.now());
              setSubscriptions(active);
            }
          } catch (e) {
            console.warn("Could not load user subscriptions", e);
          }
        }
      } catch (err) {
        console.warn("Using default Surawali catalog fallback", err);
      }
    }
    loadData();
  }, [user]);

  const getSurawaliName = (id: string) => (catalog?.surawalis || DEFAULT_SURAWALI_CATALOG.surawalis).find(s => s.id === id)?.name || "Unknown Surawali";

  // Build Filter Dropdown Options
  const paramDropdownList = useMemo(() => {
    if (activeCategory === "devotional") {
      return catalog.ailments.map((a) => ({ value: a.id, label: a.name }));
    }
    if (activeCategory === "pregnancy") {
      return [
        { value: "1", label: "Month 1 (First Trimester)" },
        { value: "2", label: "Month 2 (First Trimester)" },
        { value: "3", label: "Month 3 (First Trimester)" },
        { value: "4", label: "Month 4 (Second Trimester)" },
        { value: "5", label: "Month 5 (Second Trimester)" },
        { value: "6", label: "Month 6 (Second Trimester)" },
        { value: "7", label: "Month 7 (Third Trimester)" },
        { value: "8", label: "Month 8 (Third Trimester)" },
        { value: "9", label: "Month 9 (Third Trimester)" },
      ];
    }
    return [
      { value: "Monday", label: "Monday Clarity" },
      { value: "Tuesday", label: "Tuesday Focus" },
      { value: "Wednesday", label: "Wednesday Stress Buster" },
      { value: "Thursday", label: "Thursday Flow" },
      { value: "Friday", label: "Friday Unwind" },
      { value: "Saturday", label: "Saturday Recharge" },
      { value: "Sunday", label: "Sunday Peace" },
    ];
  }, [activeCategory, catalog.ailments]);

  // Compute Active Discovery / Explore Items
  const exploreItems = useMemo(() => {
    if (activeCategory === "devotional") {
      return catalog.ailmentSurawalis.map((m) => {
        const ailment = catalog.ailments.find((a) => a.id === m.ailmentId)?.name ?? "Vedic Raga";
        const surawali = catalog.surawalis.find((s) => s.id === m.surawaliId)?.name ?? "Surāwali";
        const timing = getTimingName(m.timingId);
        return {
          id: m.id,
          surawaliId: m.surawaliId,
          title: surawali,
          purpose: ailment,
          timing: timing,
          duration: "30 min",
          description: `Vedic frequency calibrated to support ${ailment.toLowerCase()} via physical acoustics.`,
          type: "devotional",
          paramMatch: m.ailmentId,
          timingMatch: m.timingId,
        };
      });
    }

    if (activeCategory === "pregnancy") {
      return catalog.pregnancyMappings.map((m) => {
        const surawali = catalog.surawalis.find((s) => s.id === m.surawaliId)?.name ?? "Surāwali";
        const timing = getTimingName(m.timingId);
        return {
          id: m.id,
          surawaliId: m.id,
          title: `Month ${m.pregnancyMonth}: ${m.musicTrack}`,
          purpose: `Pregnancy Care • Month ${m.pregnancyMonth}`,
          timing: timing,
          duration: "25 min",
          description: `Garbha Sanskar sound therapy formulated to nurture maternal wellbeing and fetal development in Month ${m.pregnancyMonth}.`,
          type: "pregnancy",
          paramMatch: m.pregnancyMonth.toString(),
          timingMatch: m.timingId,
        };
      });
    }

    // Corporate Mode
    return catalog.corporateRagas.map((m) => {
      const timing = getTimingName(m.timingId);
      return {
        id: m.id,
        surawaliId: m.id,
        title: m.ragaName,
        purpose: `Workplace Wellness (${m.weekDay})`,
        timing: timing,
        duration: "32 min",
        description: `Circadian-aligned auditory composition calibrated to suppress cognitive fatigue and elevate office focus on ${m.weekDay}s.`,
        type: "corporate",
        paramMatch: m.weekDay,
        timingMatch: m.timingId,
      };
    });
  }, [activeCategory, catalog]);

  // Filtered & Paginated Items
  const filteredExploreItems = useMemo(() => {
    return exploreItems.filter((item) => {
      // Keyword search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPurpose = item.purpose.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchPurpose && !matchDesc) return false;
      }

      // Chip Filter
      if (activeChip !== "All") {
        const chip = activeChip.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(chip);
        const inPurpose = item.purpose.toLowerCase().includes(chip);
        const inDesc = item.description.toLowerCase().includes(chip);
        if (!inTitle && !inPurpose && !inDesc) return false;
      }

      // Dropdown Param Filter
      if (selectedParam && item.paramMatch !== selectedParam) {
        return false;
      }

      // Dropdown Timing Filter
      if (selectedTimingId && item.timingMatch !== selectedTimingId) {
        return false;
      }

      return true;
    });
  }, [exploreItems, searchQuery, activeChip, selectedParam, selectedTimingId]);

  const totalPages = Math.max(1, Math.ceil(filteredExploreItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExploreItems.slice(start, start + itemsPerPage);
  }, [filteredExploreItems, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedParam("");
    setSelectedTimingId("");
    setActiveChip("All");
    setCurrentPage(1);
  };

  const filterPills = config.filters || [
    "All",
    "Disorder Relief",
    "Stress Relief",
    "Focus",
    "Sleep",
    "Energy",
    "Anxiety",
    "Meditation",
    "Healing",
  ];

  return (
    <AppShell>
      <div 
        className="space-y-8 max-w-[1360px] mx-auto pb-24"
        style={{ "--theme-color": currentTheme.primary } as React.CSSProperties}
      >
        {/* ── 1. ACTIVE SANJEEVANI PATHWAY HERO BANNER ── */}
        <section 
          aria-label="Active Sanjeevani Pathway"
          className={`relative overflow-hidden rounded-[24px] border ${currentTheme.heroBorder} bg-gradient-to-r ${currentTheme.heroGradient} p-6 sm:p-8 md:p-10 shadow-xs`}
        >
          {/* Subtle background glow & watermark motif */}
          <div className={`absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${currentTheme.glowColor} blur-2xl`} />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-3 max-w-xl">
              <span 
                className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: currentTheme.primary }}
              >
                ACTIVE SANJEEVANI PATHWAY
              </span>
              <h2 
                className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.15] tracking-tight"
                style={{ color: currentTheme.primaryDark }}
              >
                {config.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#3A2A1A]/90 leading-relaxed font-medium">
                {config.description}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("explore-surawalis");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ backgroundColor: currentTheme.primary }}
                  className="press inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs sm:text-[13px] font-bold shadow-md transition-all cursor-pointer hover:opacity-90"
                >
                  <span>Continue Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Sloka & Quote Card */}
            <div className="shrink-0 lg:max-w-xs xl:max-w-sm rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 p-5 shadow-2xs space-y-2 text-right">
              <p 
                className="font-serif italic text-xs sm:text-[13px] leading-snug"
                style={{ color: currentTheme.primaryDark }}
              >
                "{currentTheme.quoteTitle}"
              </p>
              <p 
                className="font-serif text-sm font-bold leading-relaxed whitespace-pre-line"
                style={{ color: currentTheme.primary }}
              >
                {currentTheme.quoteText}
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. YOUR SUBSCRIBED SURAWALIS & PROGRESS JOURNEY ── */}
        <section aria-label="Subscribed Surawalis" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Your Subscribed Surawalis
            </h3>
            <div className="flex items-center gap-3">
              <Link
                to="/subscription"
                style={{ color: currentTheme.primary }}
                className="text-xs font-bold hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-xs font-medium text-muted-foreground">
                {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? "subscription" : "subscriptions"} active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Subscribed Cards Column / Grid */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="h-48 rounded-[20px] border border-dashed border-border bg-surface flex items-center justify-center">
                  <Loader2 
                    className="h-6 w-6 animate-spin" 
                    style={{ color: currentTheme.primary }}
                  />
                </div>
              ) : filteredSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSubscriptions.map((sub, idx) => (
                    <div
                      key={sub.id}
                      onClick={() => navigate({ to: "/discover", search: { search: sub.surawaliName } })}
                      className="press group rounded-[20px] border border-border/70 bg-surface p-4 flex flex-col justify-between space-y-3.5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-3">
                        {/* Artwork Banner */}
                        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-muted">
                          <img
                            src={getArtworkForSurawali(sub.surawaliName, idx)}
                            alt={sub.surawaliName}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <div 
                            className="absolute top-2.5 left-2.5 z-10 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-xs"
                            style={{ color: currentTheme.primary }}
                          >
                            SUBSCRIBED
                          </div>
                          <div className="absolute bottom-2.5 left-3 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                              {currentTheme.subTag}
                            </p>
                            <h4 className="font-serif text-base font-bold leading-tight">
                              {sub.surawaliName}
                            </h4>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            Find balance and relief through soothing harmonic frequencies.
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="h-3.5 w-3.5" style={{ color: currentTheme.primary }} />
                          <span>30 min</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(sub.surawaliName, "Subscribed active session", true);
                          }}
                          style={{ backgroundColor: currentTheme.primary }}
                          className="press h-8 w-8 rounded-full text-white flex items-center justify-center hover:scale-105 shadow-sm transition-transform cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[180px] rounded-[20px] border border-border/80 bg-gradient-to-br from-[#FAF6F0] to-[#F5ECE0] p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-2xs">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground">Your Surawali journey starts here</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Explore curated Surawalis designed around your wellness pathway.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById("explore-surawalis");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ backgroundColor: currentTheme.primary }}
                    className="press px-4 py-2 rounded-full text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Explore Surawalis
                  </button>
                </div>
              )}
            </div>

            {/* Personalized Healing Journey Card */}
            <div className={`rounded-[20px] border border-border/70 bg-gradient-to-br ${currentTheme.cardBg} p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xs`}>
              <div 
                className="h-14 w-14 rounded-full bg-white shadow-xs border border-border/50 flex items-center justify-center"
                style={{ color: currentTheme.primary }}
              >
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 
                  className="font-serif text-base font-bold"
                  style={{ color: currentTheme.primaryDark }}
                >
                  Your healing journey is in progress
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  {config.bannerText}
                </p>
              </div>
            </div>
          </div>

          {/* Plato Quote Card */}
          <div className="rounded-2xl border border-border/60 bg-[#FDF9F3] p-4.5 flex items-center gap-3.5 shadow-2xs">
            <Quote className="h-5 w-5 shrink-0 rotate-180" style={{ color: currentTheme.primary }} />
            <p className="font-serif italic text-xs sm:text-[13px] text-foreground/85 leading-relaxed flex-1">
              "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything."
              <span 
                className="ml-2 not-italic font-sans text-[11px] font-bold"
                style={{ color: currentTheme.primary }}
              >
                — Plato
              </span>
            </p>
          </div>
        </section>

        {/* ── 3. EXPLORE SURAWALIS DISCOVERY SECTION ── */}
        <section id="explore-surawalis" aria-label="Explore Surawalis" className="space-y-5 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Explore Surawalis
              </h3>
              <p className="text-xs text-muted-foreground">
                Discover therapeutic sound sequences for your specific needs
              </p>
            </div>
            <Link
              to="/discover"
              style={{ color: currentTheme.primary }}
              className="text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Surawalis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {filterPills.map((pill) => {
              const isSelected = activeChip === pill;
              return (
                <button
                  key={pill}
                  onClick={() => {
                    setActiveChip(pill);
                    setCurrentPage(1);
                  }}
                  style={isSelected ? { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary } : {}}
                  className={`press shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all select-none cursor-pointer border ${
                    isSelected
                      ? "text-white shadow-xs"
                      : "bg-surface border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Search Field */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={config.placeholderSearch || "Search by name, tags, or benefits..."}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Disorder / Ailment Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {activeCategory === "devotional" ? "Disorder / Ailment" : activeCategory === "pregnancy" ? "Pregnancy Month" : "Corporate Day"}
                </label>
                <select
                  value={selectedParam}
                  onChange={(e) => {
                    setSelectedParam(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none cursor-pointer"
                >
                  <option value="">All Options</option>
                  {paramDropdownList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Best Listening Time & Reset Filter Button */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Best Listening Time
                </label>
                <select
                  value={selectedTimingId}
                  onChange={(e) => {
                    setSelectedTimingId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none cursor-pointer"
                >
                  <option value="">Any Time</option>
                  {catalog.timings.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedParam || selectedTimingId || activeChip !== "All") && (
              <div className="mt-4 pt-3 border-t border-border flex justify-end">
                <button
                  onClick={resetFilters}
                  className="press text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* ── 4. SURAWALI RESULT ROWS LIST ── */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="h-48 rounded-2xl border border-border bg-surface flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: currentTheme.primary }} />
              </div>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item, idx) => {
                const isSubscribed = activeCategory === "devotional" 
                  ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                  : activeCategory === "pregnancy"
                    ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                    : true;

                const badge = getBadgeInfo(item.purpose, item.type);
                const artworkUrl = getArtworkForSurawali(item.title, idx);

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate({ to: "/discover", search: { search: item.title } })}
                    className="press group rounded-2xl border border-border/80 bg-surface p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all duration-300 cursor-pointer shadow-2xs"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 bg-muted shadow-2xs relative">
                        <img
                          src={artworkUrl}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug">
                            {item.title}
                          </h4>
                          <span 
                            className="rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider"
                            style={{ backgroundColor: `${currentTheme.primary}12`, borderColor: `${currentTheme.primary}30`, color: currentTheme.primary }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Meta Chips */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" style={{ color: currentTheme.primary }} />
                            <span>{item.duration}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sun className="h-3 w-3" style={{ color: currentTheme.primary }} />
                            <span>{item.timing}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" style={{ color: currentTheme.primary }} />
                            <span>{badge.benefit}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(item.title, `Preview of ${item.title}`);
                        }}
                        className="press flex-1 md:flex-none h-9.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Preview</span>
                      </button>

                      {isSubscribed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(item.title, `Full session: ${item.title}`, true);
                          }}
                          className="press flex-1 md:flex-none h-9.5 px-5 rounded-xl bg-[#1E3A3A] hover:bg-[#142626] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Waves className="h-3.5 w-3.5" />
                          <span>Listen Now</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribeClick({ id: item.surawaliId, name: item.title });
                          }}
                          style={{ backgroundColor: currentTheme.primary }}
                          className="press flex-1 md:flex-none h-9.5 px-5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:opacity-90"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>Subscribe</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-10 text-center space-y-2 shadow-2xs">
                <p className="text-sm font-bold text-foreground">No Surāwalis match your criteria</p>
                <p className="text-xs text-muted-foreground">Try tweaking your search term or clicking Reset Filters.</p>
              </div>
            )}
          </div>

          {/* ── 5. CIRCULAR PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="press h-9 w-9 rounded-full border border-border bg-surface flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer shadow-2xs"
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
                    style={isSelected ? { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary } : {}}
                    className={`press h-9 w-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "text-white shadow-xs"
                        : "bg-surface border border-border/80 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="press h-9 w-9 rounded-full border border-border bg-surface flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer shadow-2xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* ── 6. PROFESSIONAL AUDITORY WELLNESS STATEMENT ── */}
        <section aria-label="Medical Disclaimer" className="pt-2">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-[#FAF5EC] to-[#F5ECE0] p-5 flex gap-4 items-start shadow-xs">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: currentTheme.primary }} />
            <div className="space-y-1">
              <h4 
                className="font-serif font-bold text-xs sm:text-[13px]"
                style={{ color: currentTheme.primaryDark }}
              >
                Professional Auditory Wellness Statement
              </h4>
              <p className="text-[11.5px] leading-relaxed text-[#3A2A1A]/85">
                All therapeutic frequencies are sequenced based on Vedic Raga Chikitsa standards and physical acoustic measures. Auditory therapy is a supportive wellness mechanism and is not a replacement for professional clinical advice, diagnoses, or prescriptions.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Mock Subscription Payment Modal */}
      {paymentModalOpen && subscribingSurawali && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-lift space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-full text-white flex items-center justify-center"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-foreground">Confirm Subscription</h4>
                <p className="text-xs text-muted-foreground">Premium Raga Chikitsa Sequence</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-background space-y-2.5 text-xs">
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
                className="press flex-1 h-10 rounded-xl border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                style={{ backgroundColor: currentTheme.primary }}
                className="press flex-1 h-10 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all hover:opacity-90"
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
