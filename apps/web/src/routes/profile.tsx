import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-state";
import { categories } from "@/lib/content";

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
  icon: typeof Bell;
  label: string;
  value?: string;
  to?: "/subscription" | "/category" | "/admin";
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
  const { category, user, logout } = useApp();
  const navigate = useNavigate();
  const cat = categories.find((c) => c.id === category)!;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/welcome" });
  };

  const name = user?.profile?.fullName || "Guest User";
  const email = user?.email || "guest@example.com";
  const role = user?.role || "guest";
  const initial = name.charAt(0).toUpperCase();

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
          <Row icon={Sparkles} label="Listening path" value={cat.name} to="/category" />
        </div>
      </Section>

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
          <Row icon={LayoutDashboard} label="Admin dashboard" to="/admin" />
        </div>
      </Section>

      <button
        onClick={handleLogout}
        className="press mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn border border-border bg-surface text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
      <p className="mt-6 text-center text-[12px] text-muted-foreground">Version 1.0.0</p>
    </AppShell>
  );
}
