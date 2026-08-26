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
  Activity,
  Brain,
  Heart,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-state";
import { categories, sanjeevaniConfigs, type CategoryId } from "@/lib/content";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
}: {
  icon: any;
  label: string;
  value?: string;
  to?: "/subscription" | "/select-sanjeevani";
}) {
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cat-light text-cat">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      {value && <span className="shrink-0 text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </>
  );
  const cls =
    "press flex min-h-14 w-full items-center gap-3 px-4 text-left focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none";
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button className={cls}>{inner}</button>
  );
}

function Profile() {
  const { category, setCategory, restoreSession, user, logout } = useApp();
  const navigate = useNavigate();
  const cat = categories.find((c) => c.id === category)!;

  const [switching, setSwitching] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<CategoryId | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleConfirmSwitch = async () => {
    if (!pendingCategory) return;
    try {
      setSwitching(true);
      const res = await api.auth.updateProfile({ category: pendingCategory });
      if (res.success) {
        setCategory(pendingCategory);
        await restoreSession();
        toast.success(`Switched to ${sanjeevaniConfigs[pendingCategory].name}`);
        setIsChangeModalOpen(false);
        setPendingCategory(null);
        navigate({ to: pendingCategory === "pregnancy" ? "/journey" : "/home" });
      } else {
        toast.error(res.message || "Failed to switch pathway.");
      }
    } catch (err) {
      toast.error("Failed to switch pathway.");
    } finally {
      setSwitching(false);
    }
  };

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

      {/* My Sanjeevani Section */}
      <Section title="My Sanjeevani">
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-cat uppercase">
              Current Experience
            </span>
            <h3 className="font-display font-extrabold text-base text-foreground leading-snug">
              {sanjeevaniConfigs[category as Exclude<CategoryId, "unset">]?.name || "None Selected"}
            </h3>
            <p className="text-xs text-[#5C5040]">
              {sanjeevaniConfigs[category as Exclude<CategoryId, "unset">]?.subtitle}
            </p>
          </div>
          <button
            onClick={() => setIsChangeModalOpen(true)}
            className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-cat px-6 text-sm font-semibold text-cat-foreground hover:brightness-105 cursor-pointer"
          >
            Change Experience
          </button>
        </div>
      </Section>

      {/* Surawali Subscriptions Section */}
      {user && (
        <Section title="My Therapeutic Surāwalis">
          {subsLoading ? (
            <div className="rounded-card border border-border bg-surface p-6 flex justify-center shadow-soft">
              <Loader2 className="h-5 w-5 animate-spin text-cat" />
            </div>
          ) : surawaliSubs.length === 0 ? (
            <div className="rounded-card border border-dashed border-border/80 p-8 text-center bg-surface shadow-soft space-y-2">
              <p className="text-sm font-semibold text-foreground">No subscribed Surāwalis</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Explore clinical disorders and subscribe to specific Vedic sound formulas.
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
                        <span>Play</span>
                      </button>
                      {isActive && (
                        <button
                          onClick={() => handleCancelSub(sub.id, sub.surawaliName)}
                          className="press h-8 px-3 rounded-btn bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 flex items-center justify-center gap-1"
                          title="Cancel Subscription"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Cancel</span>
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

      <Section title="Preferences">
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <div className="flex min-h-14 items-center gap-3 px-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cat-light text-cat">
              <Bell className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">Session reminders</span>
            <Switch defaultChecked aria-label="Session reminders" />
          </div>
          <Row icon={Palette} label="Theme" value="Light" />
          <Row icon={Globe} label="Language" value="English" />
        </div>
      </Section>

      <Section title="Support">
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <Row icon={ShieldCheck} label="Privacy policy" />
          <Row icon={FileText} label="Terms of use" />
          <Row icon={CircleHelp} label="Help & contact" />
        </div>
      </Section>

      <button
        onClick={handleLogout}
        className="press mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn border border-border bg-surface text-sm font-semibold text-destructive cursor-pointer"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
      <p className="mt-6 text-center text-[12px] text-muted-foreground">Version 1.0.0</p>

      <Dialog open={isChangeModalOpen} onOpenChange={(open) => {
        setIsChangeModalOpen(open);
        if (!open) setPendingCategory(null);
      }}>
        <DialogContent className="sm:max-w-2xl bg-[#FAF8F5] border border-border rounded-3xl p-6 shadow-lift">
          <DialogHeader className="text-center sm:text-left space-y-2">
            <DialogTitle className="text-2xl font-bold font-serif text-[#4A0E17]">
              {pendingCategory ? "Confirm Experience Switch" : "Choose Your Sanjeevani"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5C5040]">
              {pendingCategory 
                ? `Are you sure you want to switch to ${sanjeevaniConfigs[pendingCategory]?.name}?` 
                : "Select the personal journey that best matches your spiritual, health, or maternity path."
              }
            </DialogDescription>
          </DialogHeader>

          {pendingCategory ? (
            <div className="space-y-6 py-4">
              <div className="rounded-2xl border border-border p-4 bg-white/70 space-y-3">
                <h4 className="font-bold text-sm text-[#3A2C18] uppercase tracking-wider">
                  What will change:
                </h4>
                <p className="text-xs sm:text-sm text-[#5C5040] leading-relaxed">
                  Your website layout, color scheme, recommendations, and available content will adapt to reflect the <strong>{sanjeevaniConfigs[pendingCategory]?.name}</strong> experience.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => setPendingCategory(null)}
                  className="press min-h-10 px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={switching}
                  onClick={handleConfirmSwitch}
                  className="press min-h-10 px-6 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: sanjeevaniConfigs[pendingCategory]?.theme.primary }}
                >
                  {switching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Switch Experience</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              {(["devotional", "secular", "pregnancy"] as const).map((catId) => {
                const config = sanjeevaniConfigs[catId];
                const isSelected = category === catId;
                const IconComponent = catId === "devotional" ? Compass : catId === "secular" ? Brain : Heart;

                return (
                  <button
                    key={catId}
                    disabled={switching}
                    onClick={() => {
                      if (isSelected) {
                        toast.info(`You are already in ${config.name} mode.`);
                        return;
                      }
                      setPendingCategory(catId);
                    }}
                    className={cn(
                      "press relative p-4 rounded-2xl border text-left bg-white shadow-soft transition-all duration-300 flex flex-col justify-between min-h-[140px] hover:border-cat/60 cursor-pointer",
                      isSelected
                        ? "border-cat bg-cat-light/10 ring-2 ring-cat"
                        : "border-border hover:bg-secondary/40"
                    )}
                    style={isSelected ? ({ "--theme-color": config.theme.primary, borderColor: config.theme.primary } as any) : undefined}
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-display font-bold text-[9px] uppercase tracking-wider"
                          style={{ color: config.theme.primary }}
                        >
                          {config.name.split(" ")[0]}
                        </span>
                        <IconComponent className="h-4 w-4 shrink-0" style={{ color: config.theme.primary }} />
                      </div>
                      <h4 className="font-display font-extrabold text-sm text-[#3A2C18] leading-tight">
                        {config.name}
                      </h4>
                      <p className="text-[10px] text-[#5C5040] line-clamp-3 leading-relaxed">
                        {config.subtitle} — {config.description.split(".")[0]}.
                      </p>
                    </div>

                    {isSelected && (
                      <span className="mt-3 inline-flex self-start rounded-full bg-cat-light px-2 py-0.5 text-[9px] font-bold text-cat uppercase tracking-widest">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
