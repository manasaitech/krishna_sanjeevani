import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  Waves, 
  Calendar, 
  Activity, 
  ChevronRight, 
  Info, 
  Lock, 
  Compass, 
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Panel, Section } from "@/components/layout-bits";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MockPaymentModal } from "@/components/discover/MockPaymentModal";

export const Route = createFileRoute("/discover")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      search: (search.search as string) || undefined,
      tab: (search.tab as "ailments" | "pregnancy" | "corporate") || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Surāwali Discovery — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Discover therapeutic Surāwalis, pregnancy care, and corporate wellness ragas based on Vedic science.",
      },
    ],
  }),
  component: DiscoverPage,
});

// Ailment Search Aliases for fuzzy typing matches
const searchAliases: Record<string, string> = {
  "migrane": "Migraine",
  "migrain": "Migraine",
  "headache": "Migraine",
  "alziemer": "Alziemer",
  "alzheimer": "Alziemer",
  "alzheimers": "Alziemer",
  "memory": "Alziemer",
  "back apin": "Lower back apin",
  "back pain": "Lower back apin",
  "lower back": "Lower back apin",
  "sciatica": "Sciatica ", // trailing space
  "bp": "Hyper tension",
  "blood pressure": "Hyper tension",
  "hypertension": "Hyper tension",
  "sleeplessness": "Insomnia",
  "sleep": "Insomnia",
  "depression": "Depression",
  "depressed": "Depression",
  "anxiety": "Anxiety ", // trailing space
  "stress": "Anxiety ",
  "anger": "Anger",
  "cancer": "Cancer",
  "parkinson": "Parkinson",
  "parkinsons": "Parkinson",
};

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
  status: string;
  endDate: number;
}

function DiscoverPage() {
  const { user, play, tracks } = useApp();
  const navigate = useNavigate();
  const { search, tab } = Route.useSearch();

  const [activeTab, setActiveTab] = useState<"ailments" | "pregnancy" | "corporate">(tab || "ailments");
  const [loading, setLoading] = useState(true);
  
  // Data Catalog State
  const [catalog, setCatalog] = useState<{
    ailments: Ailment[];
    surawalis: Surawali[];
    timings: Timing[];
    ailmentSurawalis: AilmentSurawali[];
    pregnancyMappings: PregnancyMapping[];
    corporateRagas: CorporateRaga[];
  } | null>(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<ActiveSub[]>([]);

  // Therapeutic Ailments Filters State
  const [searchQuery, setSearchQuery] = useState(search || "");
  const [selectedAilmentId, setSelectedAilmentId] = useState("");
  const [selectedSurawaliId, setSelectedSurawaliId] = useState("");
  const [selectedTimingId, setSelectedTimingId] = useState("");

  useEffect(() => {
    if (search !== undefined) {
      setSearchQuery(search);
    }
    if (tab !== undefined) {
      setActiveTab(tab);
    }
  }, [search, tab]);

  // Pregnancy Care Filters State
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Corporate Wellness Filters State
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscribingSurawali, setSubscribingSurawali] = useState<{ id: string; name: string } | null>(null);

  // Fetch Catalog & Subscriptions
  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await api.discover.getCatalog();
      if (catRes.success) {
        setCatalog(catRes.data);
      }

      if (user) {
        const subRes = await api.discover.listSubscriptions();
        if (subRes.success) {
          setSubscriptions(subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now()));
        }
      }
    } catch (err) {
      console.error("Failed to load discover catalog", err);
      toast.error("Failed to load discovery catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Check if user is subscribed to a Surawali
  const isSubscribed = (surawaliId: string) => {
    return subscriptions.some(sub => sub.surawaliId === surawaliId);
  };

  // Helper mapping IDs to names
  const getAilmentName = (id: string) => catalog?.ailments.find(a => a.id === id)?.name || "";
  const getSurawaliName = (id: string) => catalog?.surawalis.find(s => s.id === id)?.name || "";
  const getTimingName = (id: string) => catalog?.timings.find(t => t.id === id)?.name || "";

  // Reset Tab 1 Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAilmentId("");
    setSelectedSurawaliId("");
    setSelectedTimingId("");
  };

  // Bidirectional Dynamic Filtering logic for Tab 1
  // We compute available options based on current selections
  const filteredAilments = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.ailments;

    // Search query with fuzzy alias mapping
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const alias = searchAliases[q] || Object.keys(searchAliases).find(k => q.includes(k) || k.includes(q)) ? searchAliases[Object.keys(searchAliases).find(k => q.includes(k) || k.includes(q))!] : null;
      
      list = list.filter(a => {
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesAlias = alias ? a.name.toLowerCase().includes(alias.toLowerCase()) : false;
        
        // Also match if any recommended Surāwali for this ailment matches the search query
        const hasMatchingSurawali = catalog.ailmentSurawalis.some(m => {
          if (m.ailmentId !== a.id) return false;
          const sName = getSurawaliName(m.surawaliId);
          return sName.toLowerCase().includes(q);
        });

        return matchesName || matchesAlias || hasMatchingSurawali;
      });
    }

    // Filter by selected Surawali
    if (selectedSurawaliId) {
      const mappedAilmentIds = catalog.ailmentSurawalis
        .filter(m => m.surawaliId === selectedSurawaliId)
        .map(m => m.ailmentId);
      list = list.filter(a => mappedAilmentIds.includes(a.id));
    }

    // Filter by selected Timing
    if (selectedTimingId) {
      const mappedAilmentIds = catalog.ailmentSurawalis
        .filter(m => m.timingId === selectedTimingId)
        .map(m => m.ailmentId);
      list = list.filter(a => mappedAilmentIds.includes(a.id));
    }

    return list;
  }, [catalog, searchQuery, selectedSurawaliId, selectedTimingId]);

  const filteredSurawalis = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.surawalis;

    // Filter by selected Ailment
    if (selectedAilmentId) {
      const mappedSurawaliIds = catalog.ailmentSurawalis
        .filter(m => m.ailmentId === selectedAilmentId)
        .map(m => m.surawaliId);
      list = list.filter(s => mappedSurawaliIds.includes(s.id));
    }

    // Filter by selected Timing
    if (selectedTimingId) {
      const mappedSurawaliIds = catalog.ailmentSurawalis
        .filter(m => m.timingId === selectedTimingId)
        .map(m => m.surawaliId);
      list = list.filter(s => mappedSurawaliIds.includes(s.id));
    }

    return list;
  }, [catalog, selectedAilmentId, selectedTimingId]);

  const filteredTimings = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.timings;

    // Filter by selected Ailment
    if (selectedAilmentId) {
      const mappedTimingIds = catalog.ailmentSurawalis
        .filter(m => m.ailmentId === selectedAilmentId)
        .map(m => m.timingId);
      list = list.filter(t => mappedTimingIds.includes(t.id));
    }

    // Filter by selected Surawali
    if (selectedSurawaliId) {
      const mappedTimingIds = catalog.ailmentSurawalis
        .filter(m => m.surawaliId === selectedSurawaliId)
        .map(m => m.timingId);
      list = list.filter(t => mappedTimingIds.includes(t.id));
    }

    return list;
  }, [catalog, selectedAilmentId, selectedSurawaliId]);

  // Actual mapped Ailment-Surawali recommendation pairs to render
  const matchedRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.ailmentSurawalis.filter(m => {
      const matchesSearch = searchQuery.trim() 
        ? filteredAilments.some(a => a.id === m.ailmentId) 
        : true;
      const matchesAilment = selectedAilmentId ? m.ailmentId === selectedAilmentId : true;
      const matchesSurawali = selectedSurawaliId ? m.surawaliId === selectedSurawaliId : true;
      const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

      return matchesSearch && matchesAilment && matchesSurawali && matchesTiming;
    });
  }, [catalog, filteredAilments, searchQuery, selectedAilmentId, selectedSurawaliId, selectedTimingId]);

  // Pregnancy Recommendations
  const pregnancyRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.pregnancyMappings.filter(m => m.pregnancyMonth === selectedMonth);
  }, [catalog, selectedMonth]);

  // Corporate Recommendations
  const corporateRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.corporateRagas.filter(m => 
      m.weekDay.toLowerCase() === selectedDay.toLowerCase() || 
      m.weekDay.toLowerCase() === "daily"
    );
  }, [catalog, selectedDay]);

  // Play Preview Action
  const handlePlayPreview = (surawaliName: string, subtext: string, forceSubscribed = false) => {
    toast.info(`Playing ${forceSubscribed ? "session" : "preview"} for ${surawaliName}`);
    
    if (forceSubscribed) {
      play({
        id: `mock_${surawaliName}`,
        title: surawaliName,
        artist: "Krishna Sanjeevani Therapeutic",
        subtitle: subtext,
        duration: 558,
        category: "secular",
        playlistKey: "",
        art: "/govinda-bhakta-pr-seminars-mukund.mp3"
      } as any);
      return;
    }

    // Find if we have a matching track in tracks, otherwise play the Suno track or default track
    const existingTrack = tracks.find(t => t.title.toLowerCase().includes(surawaliName.toLowerCase()));
    
    if (existingTrack) {
      play(existingTrack);
    } else {
      // Build an on-the-fly track pointing to suno audio download
      play({
        id: `mock_${surawaliName}`,
        title: surawaliName,
        artist: "Krishna Sanjeevani Therapeutic",
        subtitle: subtext,
        duration: 558,
        category: "secular",
        playlistKey: "",
        // Point to the loaded Suno MP3 at workspace root level (mapped to public)
        art: "/govinda-bhakta-pr-seminars-mukund.mp3" 
      } as any);
    }
  };

  // Subscribe Action
  const handleSubscribeClick = (surawali: Surawali) => {
    if (!user) {
      toast.error("Please login to subscribe");
      navigate({ to: "/login" });
      return;
    }
    setSubscribingSurawali(surawali);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (txnId: string) => {
    if (!subscribingSurawali) return;
    try {
      const res = await api.discover.subscribe(subscribingSurawali.id, "monthly", txnId);
      if (res.success) {
        toast.success(`Successfully subscribed to ${subscribingSurawali.name}!`);
        fetchData(); // reload active subscriptions
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create subscription in database");
    } finally {
      setPaymentModalOpen(false);
      setSubscribingSurawali(null);
    }
  };

  return (
    <AppShell title="Surāwali Discovery" subtitle="Vedic music recommendation & therapeutic subscriptions">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/60">
          <button
            onClick={() => setActiveTab("ailments")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
              activeTab === "ailments"
                ? "border-cat text-cat"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Therapeutic Ailments</span>
          </button>
          <button
            onClick={() => setActiveTab("pregnancy")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
              activeTab === "pregnancy"
                ? "border-cat text-cat"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Garv Sanjeevani</span>
          </button>
          <button
            onClick={() => setActiveTab("corporate")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
              activeTab === "corporate"
                ? "border-cat text-cat"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Arogya Sanjeevani</span>
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cat" />
          </div>
        ) : (
          <>
            {/* TAB 1: THERAPEUTIC AILMENTS */}
            {activeTab === "ailments" && (
              <div className="space-y-6">
                
                {/* Filters Panel */}
                <div className="rounded-card border border-border/60 bg-surface p-5 shadow-soft space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    
                    {/* Search query box */}
                    <div className="flex-1 w-full relative">
                      <label htmlFor="search-input" className="block text-xs font-semibold text-muted-foreground mb-1">Search Disorder / Ailment</label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Type ailment (e.g. Migraine, Back pain, Insomnia...)"
                          className="w-full min-h-10 pl-10 pr-4 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat focus-visible:ring-2 focus-visible:ring-cat/20"
                        />
                      </div>
                    </div>

                    {/* Ailment Dropdown */}
                    <div className="w-full md:w-56">
                      <label htmlFor="ailment-select" className="block text-xs font-semibold text-muted-foreground mb-1">Ailment Filter</label>
                      <select
                        id="ailment-select"
                        value={selectedAilmentId}
                        onChange={(e) => setSelectedAilmentId(e.target.value)}
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      >
                        <option value="">-- All Ailments --</option>
                        {filteredAilments.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Surawali Dropdown */}
                    <div className="w-full md:w-56">
                      <label htmlFor="surawali-select" className="block text-xs font-semibold text-muted-foreground mb-1">Surāwali Filter</label>
                      <select
                        id="surawali-select"
                        value={selectedSurawaliId}
                        onChange={(e) => setSelectedSurawaliId(e.target.value)}
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      >
                        <option value="">-- All Surāwalis --</option>
                        {filteredSurawalis.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Timing Dropdown */}
                    <div className="w-full md:w-56">
                      <label htmlFor="timing-select" className="block text-xs font-semibold text-muted-foreground mb-1">Efficacy Time</label>
                      <select
                        id="timing-select"
                        value={selectedTimingId}
                        onChange={(e) => setSelectedTimingId(e.target.value)}
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      >
                        <option value="">-- All Timings --</option>
                        {filteredTimings.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={handleResetFilters}
                      className="press min-h-10 px-4 rounded-btn border border-border text-xs font-semibold hover:bg-secondary flex items-center gap-1 w-full md:w-auto justify-center"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-semibold text-foreground">Matched Recommendations ({matchedRecommendations.length})</h3>
                    <span className="text-xs text-muted-foreground">Select cards to preview or subscribe</span>
                  </div>

                  {matchedRecommendations.length === 0 ? (
                    <div className="rounded-card border border-dashed border-border/80 p-12 text-center space-y-2">
                      <Waves className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No matches found</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">Try resetting the search filters or typing different keywords like BP, sleep, or sciatica.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {matchedRecommendations.map((rec) => {
                        const sName = getSurawaliName(rec.surawaliId);
                        const aName = getAilmentName(rec.ailmentId);
                        const tName = getTimingName(rec.timingId);
                        const subscribed = isSubscribed(rec.surawaliId);

                        return (
                          <div
                            key={rec.id}
                            className="rounded-card border border-border/60 bg-surface p-5 hover:border-cat/60 hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                  {aName}
                                </span>
                                {subscribed && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Subscribed</span>
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-display font-semibold text-lg text-foreground">{sName}</h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5 text-cat" />
                                  <span>Time: {tName}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Vedic sound frequency composition calibrated specifically to assist with the treatment of {aName.toLowerCase()} symptoms.
                              </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-3">
                              <button
                                onClick={() => handlePlayPreview(sName, `${aName} therapeutic preview`)}
                                className="press flex-1 min-h-9 rounded-btn bg-secondary text-xs font-bold hover:bg-secondary-hover flex items-center justify-center gap-1.5"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>Preview</span>
                              </button>

                              {subscribed ? (
                                <button
                                  onClick={() => handlePlayPreview(sName, `${aName} full session`, true)}
                                  className="press flex-1 min-h-9 rounded-btn bg-cat text-cat-foreground text-xs font-bold hover:brightness-105 flex items-center justify-center gap-1.5"
                                >
                                  <Waves className="h-3.5 w-3.5" />
                                  <span>Listen Full</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSubscribeClick({ id: rec.surawaliId, name: sName })}
                                  className="press flex-1 min-h-9 rounded-btn bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover flex items-center justify-center gap-1"
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  <span>Subscribe</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PREGNANCY CARE */}
            {activeTab === "pregnancy" && (
              <div className="space-y-6">
                
                {/* Month Picker Panel */}
                <div className="rounded-card border border-border/60 bg-surface p-6 shadow-soft space-y-4">
                  <h4 className="font-semibold text-foreground text-sm">Select Pregnancy Month</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const monthNum = i + 1;
                      return (
                        <button
                          key={monthNum}
                          onClick={() => setSelectedMonth(monthNum)}
                          className={`press px-4 py-2.5 rounded-btn text-sm font-semibold transition-all ${
                            selectedMonth === monthNum
                              ? "bg-cat text-cat-foreground shadow-lift"
                              : "bg-background border border-border hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          Month {monthNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Month Recommendation Details */}
                <div className="space-y-4">
                  <div className="px-1">
                    <h3 className="font-semibold text-foreground">Recommended Care for Month {selectedMonth}</h3>
                  </div>

                  {pregnancyRecommendations.map(rec => {
                    const sName = getSurawaliName(rec.surawaliId);
                    const tName = getTimingName(rec.timingId);
                    const subscribed = isSubscribed(rec.surawaliId);

                    return (
                      <div
                        key={rec.id}
                        className="rounded-card border border-border/60 bg-surface p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-600">
                              Pregnancy month {selectedMonth}
                            </span>
                            {subscribed && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Subscribed</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-semibold text-xl text-foreground">{sName}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-cat" />
                              <span>Efficacy Time: {tName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Waves className="h-4 w-4 text-cat" />
                              <span>Music Track: {rec.musicTrack}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground pt-1 leading-relaxed">
                            Specifically designed to support hormonal balance, maternal comfort, and healthy fetal cognitive development during the {selectedMonth} month of pregnancy.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handlePlayPreview(sName, `Pregnancy Month ${selectedMonth} preview`)}
                            className="press flex-1 md:flex-none min-h-10 px-5 rounded-btn bg-secondary text-xs font-bold hover:bg-secondary-hover flex items-center justify-center gap-1.5"
                          >
                            <Play className="h-4 w-4 fill-current" />
                            <span>Preview</span>
                          </button>

                          {subscribed ? (
                            <button
                              onClick={() => handlePlayPreview(sName, `Pregnancy Month ${selectedMonth} full session`, true)}
                              className="press flex-1 md:flex-none min-h-10 px-6 rounded-btn bg-cat text-cat-foreground text-xs font-bold hover:brightness-105 flex items-center justify-center gap-1.5"
                            >
                              <Waves className="h-4 w-4" />
                              <span>Listen Full</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubscribeClick({ id: rec.surawaliId, name: sName })}
                              className="press flex-1 md:flex-none min-h-10 px-6 rounded-btn bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover flex items-center justify-center gap-1"
                            >
                              <Lock className="h-3.5 w-3.5 mr-1" />
                              <span>Subscribe</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CORPORATE WELLNESS */}
            {activeTab === "corporate" && (
              <div className="space-y-6">
                
                {/* Day Selector */}
                <div className="rounded-card border border-border/60 bg-surface p-6 shadow-soft space-y-4">
                  <h4 className="font-semibold text-foreground text-sm">Select Arogya Sanjeevani Weekday</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`press px-4 py-2.5 rounded-btn text-sm font-semibold transition-all ${
                          selectedDay === day
                            ? "bg-cat text-cat-foreground shadow-lift"
                            : "bg-background border border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corporate recommendations list */}
                <div className="space-y-4">
                  <div className="px-1">
                    <h3 className="font-semibold text-foreground">Elevating Ragas for {selectedDay}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {corporateRecommendations.map(rec => {
                      const tName = getTimingName(rec.timingId);
                      
                      return (
                        <div
                          key={rec.id}
                          className="rounded-card border border-border/60 bg-surface p-5 hover:border-cat/60 hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 capitalize">
                                {rec.weekDay}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-cat" />
                                <span>{tName}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-lg text-foreground">Mood Elevating Raga: {rec.ragaName}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Professional wellness raga composition aligned to reduce stress, elevate workspace productivity, and restore mental focus.
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Preview Available</span>
                            <button
                              onClick={() => handlePlayPreview(rec.ragaName, `Corporate ${rec.ragaName} wellness stream`)}
                              className="press min-h-9 px-5 rounded-btn bg-cat text-cat-foreground text-xs font-bold hover:brightness-105 flex items-center justify-center gap-1.5"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Listen Preview</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Professional Medical Disclaimer */}
        <div className="rounded-card border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3.5 items-start mt-8">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medical Disclaimer</h4>
            <p className="text-xs text-amber-700/90 leading-relaxed">
              The Surāwali recommendation system is designed for therapeutic music listening and wellness support based on classical sound traditions. It is not a substitute for professional medical advice, diagnosis, or clinical treatment. Please consult with a physician or healthcare provider for any diagnostic or medical concerns.
            </p>
          </div>
        </div>

      </div>

      {/* Mock Payment Checkout Modal */}
      {paymentModalOpen && subscribingSurawali && (
        <MockPaymentModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSubscribingSurawali(null);
          }}
          surawaliName={subscribingSurawali.name}
          price={299}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </AppShell>
  );
}
