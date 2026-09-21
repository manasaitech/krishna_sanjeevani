import { Link, useRouterState } from "@tanstack/react-router";
import {
  House,
  Sparkles,
  Music,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import logoWithoutText from "@/assets/logo-without-text.webp";
import { useMode, getActiveMode } from "@/core/mode";
import { emotionThemeConfig } from "@/modes/emotion-remediation/theme";
import { sanjeevaniConfigs, type CategoryId } from "@/lib/content";

export function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { category } = useApp();
  const { isEmotionMode: ctxEmotion } = useMode();
  const isEmotionMode = ctxEmotion ?? (getActiveMode() === "emotion_remediation");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeCategory = (!category || category === "unset") ? "devotional" : category;
  const activeConfig = isEmotionMode ? emotionThemeConfig : sanjeevaniConfigs[activeCategory as Exclude<CategoryId, "unset">];

  const navItems = [
    { to: "/home", label: "Home", icon: House },
    { to: "/favorites", label: "My Library", icon: Music },
  ];

  return (
    <div className="flex h-full flex-col justify-between gap-4 p-3 select-none">
      {/* Top Section: Brand & Primary Navigation */}
      <div className="space-y-4">
        {/* Brand Logo Header */}
        <Link
          to="/home"
          onClick={onNavigate}
          className="press flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 transition-all focus-visible:outline-none"
        >
          <img
            src={logoWithoutText}
            alt={`${activeConfig?.name || "Krishna Sanjeevani"} Logo`}
            className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
          />
          <div className="min-w-0">
            <span className="block truncate font-display text-[15px] font-bold text-foreground leading-snug tracking-tight">
              {activeConfig?.name || "Krishna Sanjeevani"}
            </span>
            <span className="block truncate text-[11px] font-medium text-muted-foreground">
              {activeConfig?.subtitle || "Therapeutic Sound Healing"}
            </span>
          </div>
        </Link>

        {/* Core Navigation Items */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to;
              const primaryColor = activeConfig?.theme?.primary || "#7C1C24";
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                    className={cn(
                      "press flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13.5px] font-semibold transition-all duration-200",
                      isActive
                        ? "text-white shadow-md shadow-black/10"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section: Informative Wellness Cards */}
      <div className="space-y-3 pt-2">
        {/* Your Journey Card */}
        <div className="rounded-2xl border border-border/70 bg-[#F8F5EF] p-3.5 flex items-center gap-3 shadow-xs">
          <div 
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ 
              backgroundColor: `${activeConfig?.theme?.primary || "#7C1C24"}15`,
              color: activeConfig?.theme?.primary || "#7C1C24"
            }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-bold text-foreground leading-tight">Your Journey</h4>
            <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
              {isEmotionMode
                ? "Therapeutic frequencies for emotional equilibrium & dosha balance"
                : activeCategory === "pregnancy"
                  ? "Sacred sound frequencies for a harmonious pregnancy"
                  : activeCategory === "secular"
                    ? "Circadian-aligned wellness for stress reduction & focus"
                    : "Healing through the ancient science of Raga Chikitsa"}
            </p>
          </div>
        </div>

        {/* Streaming Only Disclaimer Card */}
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
            <Headphones className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-bold text-foreground leading-tight">Streaming Only</h4>
            <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
              Sessions are guided in-app and never downloaded or shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] shrink-0 flex-col border-r border-border/60 bg-[#FAF8F5]/90 backdrop-blur-md lg:flex xl:w-[280px]">
      <SidebarBody />
    </aside>
  );
}

