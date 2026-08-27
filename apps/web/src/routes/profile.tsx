import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  FileText,
  Globe,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  Trash2,
  Play,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-state";
import { categories, sanjeevaniConfigs, type CategoryId } from "@/lib/content";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Manage your listening path, subscription, notifications, language and privacy settings.",
      },
      { property: "og:title", content: "Profile — Krishna Sanjeevani" },
      { property: "og:description", content: "Your account, path and preferences." },
    ],
  }),
  component: Profile,
});

function Row({
  icon: Icon,
  label,
  value,
  to,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  value?: string;
  to?: "/subscription" | "/category";
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cat-light text-cat">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      {value && <span className="shrink-0 text-xs text-muted-foreground mr-1">{value}</span>}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </>
  );
  const cls =
    "press flex min-h-14 w-full items-center gap-3 px-4 text-left focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none";
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function Profile() {
  const { category, setCategory, restoreSession, user, logout, lang, changeLanguage, t, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const cat = categories.find((c) => c.id === category)!;

  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleSwitchCategory = async (targetCategory: CategoryId) => {
    if (category === targetCategory) return;
    try {
      setSwitching(true);
      const res = await api.auth.updateProfile({ category: targetCategory });
      if (res.success) {
        setCategory(targetCategory);
        await restoreSession();
        toast.success(`Switched to ${sanjeevaniConfigs[targetCategory].name}`);
      } else {
        toast.error(res.message || "Failed to switch pathway.");
      }
    } catch (err) {
      toast.error("Failed to switch pathway.");
    } finally {
      setSwitching(false);
    }
  };

  // Preferences & Modals State
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const name = user?.profile?.fullName || "Guest User";
  const email = user?.email || "guest@example.com";
  const role = user?.role || "guest";
  const initial = name.charAt(0).toUpperCase();

  // Surawali Subscriptions State
  const [surawaliSubs, setSurawaliSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const { play } = useApp();

  const fetchSubs = async () => {
    if (!user) return;
    try {
      setSubsLoading(true);
      const res = await api.discover.listSubscriptions();
      if (res.success) {
        setSurawaliSubs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, [user]);

  const handleCancelSub = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to cancel your subscription to ${name}?`)) return;
    try {
      const res = await api.discover.cancelSubscription(id);
      if (res.success) {
        toast.success(`Subscription to ${name} cancelled successfully.`);
        fetchSubs();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription.");
    }
  };

  const handlePlaySub = (surawaliName: string) => {
    play({
      id: `mock_${surawaliName}`,
      title: surawaliName,
      artist: "Krishna Sanjeevani Therapeutic",
      subtitle: "Subscribed Surāwali session",
      duration: 558,
      category: "secular",
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3",
    } as any);
  };

  return (
    <AppShell>
      <div className="animate-rise mt-2 flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-soft">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-cat text-xl font-semibold text-cat-foreground uppercase">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-semibold">{name}</h1>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-1 text-[11px] font-semibold text-cat capitalize">
            <Crown className="h-3 w-3" /> {role}
          </span>
        </div>
      </div>

      <Section title="Your plan">
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <Row icon={Crown} label="Subscription" value={`${role} · monthly`} to="/subscription" />
        </div>
      </Section>

      {/* Switch Pathway Section */}
      <Section title="Switch Healing Pathway">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["devotional", "secular", "pregnancy"] as const).map((catId) => {
            const config = sanjeevaniConfigs[catId];
            const isSelected = category === catId;
            return (
              <button
                key={catId}
                disabled={switching}
                onClick={() => handleSwitchCategory(catId)}
                className={cn(
                  "press relative p-4 rounded-card border text-left bg-surface shadow-soft transition-all duration-300 flex flex-col justify-between min-h-[90px] hover:border-cat/60",
                  isSelected
                    ? "border-cat bg-cat-light/10 ring-1 ring-cat"
                    : "border-border hover:bg-secondary/40"
                )}
                style={isSelected ? ({ "--theme-color": config.theme.primary, borderColor: config.theme.primary } as any) : undefined}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display font-bold text-[10px] uppercase tracking-wider"
                      style={{ color: config.theme.primary }}
                    >
                      {config.name.split(" ")[0]}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: config.theme.primary }} />
                    )}
                  </div>
                  <h4 className="font-display font-extrabold text-[13px] text-foreground leading-snug">
                    {config.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {config.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Surawali Subscriptions Section */}
      {user && (
        <Section title={t("activeSub")}>
          {subsLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cat" />
            </div>
          ) : surawaliSubs.length === 0 ? (
            <div className="rounded-card border border-dashed border-border/80 p-8 text-center bg-surface shadow-soft space-y-2">
              <p className="text-sm font-semibold text-foreground">{t("activeSub")}</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {t("noSubs")}
              </p>
              <Link
                to="/home"
                hash="explore-surawalis"
                className="press inline-flex min-h-9 items-center rounded-btn bg-cat px-4 text-xs font-bold text-cat-foreground hover:brightness-105 mt-2"
              >
                Go to Discovery
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {surawaliSubs.map((sub) => {
                const isActive = sub.status === "active" && sub.endDate > Date.now();
                return (
                  <div
                    key={sub.id}
                    className="rounded-card border border-border bg-surface p-4 shadow-soft flex justify-between items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <span>{sub.surawaliName}</span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isActive
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {isActive ? "Active" : "Cancelled"}
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isActive
                          ? `Valid until: ${new Date(sub.endDate).toLocaleDateString()}`
                          : `Access ended: ${new Date(sub.endDate).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlaySub(sub.surawaliName)}
                        className="press h-8 px-4 rounded-btn bg-secondary text-xs font-bold hover:bg-secondary-hover flex items-center justify-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{t("play")}</span>
                      </button>
                      {isActive && (
                        <button
                          onClick={() => handleCancelSub(sub.id, sub.surawaliName)}
                          className="press h-8 px-3 rounded-btn bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 flex items-center justify-center gap-1"
                          title="Cancel Subscription"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>{t("cancelSub")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}

      <Section title={t("preferences")}>
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <div className="flex min-h-14 items-center gap-3 px-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cat-light text-cat">
              <Bell className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">{t("sessionReminders")}</span>
            <Switch defaultChecked aria-label="Session reminders" />
          </div>
          <Row
            icon={Palette}
            label={t("theme")}
            value={theme === "dark" ? "Dark" : "Light"}
            onClick={() => setShowThemeModal(true)}
          />
          <Row
            icon={Globe}
            label={t("language")}
            value={lang === "hindi" ? "हिन्दी" : lang === "sanskrit" ? "संस्कृतम्" : "English"}
            onClick={() => setShowLanguageModal(true)}
          />
        </div>
      </Section>

      <Section title={t("support")}>
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <Row icon={ShieldCheck} label={t("privacyPolicy")} />
          <Row icon={FileText} label={t("termsOfUse")} />
          <Row icon={CircleHelp} label={t("helpContact")} />
        </div>
      </Section>

      <button
        onClick={handleLogout}
        className="press mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn border border-border bg-surface text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> {t("logout")}
      </button>
      <p className="mt-6 text-center text-[12px] text-muted-foreground">Version 1.0.0</p>

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-soft animate-rise mx-4">
            <h3 className="text-lg font-bold text-[#3A3125] dark:text-neutral-100">Select Theme</h3>
            <p className="mt-1 text-xs text-muted-foreground">Choose your appearance preference</p>
            <div className="mt-4 space-y-2">
              {[
                { id: "light", label: "Light Mode" },
                { id: "dark", label: "Dark Mode" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    toggleTheme(opt.id as "light" | "dark");
                    setShowThemeModal(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-btn border p-3.5 text-left text-sm font-semibold transition-all duration-200",
                    theme === opt.id
                      ? "border-cat bg-cat-light text-cat"
                      : "border-border bg-surface hover:bg-[#FAF5EC]/40 dark:hover:bg-neutral-800/40 text-[#3A3125] dark:text-neutral-200"
                  )}
                >
                  <Palette className="h-4 w-4 shrink-0 text-cat" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowThemeModal(false)}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-btn bg-[#3A3125] text-white dark:bg-neutral-200 dark:text-neutral-900 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-soft animate-rise mx-4">
            <h3 className="text-lg font-bold text-[#3A3125] dark:text-neutral-100">Select Language</h3>
            <p className="mt-1 text-xs text-muted-foreground">Select your preferred audio & interface language</p>
            <div className="mt-4 space-y-2">
              {[
                { id: "english", label: "English (US)", sub: "English audio & text" },
                { id: "hindi", label: "हिन्दी (Hindi)", sub: "हिन्दी ऑडियो और पाठ" },
                { id: "sanskrit", label: "संस्कृतम् (Sanskrit)", sub: "संस्कृतम् मन्त्राः" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    changeLanguage(opt.id as "english" | "hindi" | "sanskrit");
                    setShowLanguageModal(false);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-btn border p-3.5 text-left transition-all duration-200",
                    lang === opt.id
                      ? "border-cat bg-cat-light text-cat"
                      : "border-border bg-surface hover:bg-[#FAF5EC]/40 dark:hover:bg-neutral-800/40 text-[#3A3125] dark:text-neutral-200"
                  )}
                >
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-btn bg-[#3A3125] text-white dark:bg-neutral-200 dark:text-neutral-900 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
