// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Home Page (Skeleton)
// This page renders when APP_MODE=emotion_remediation.
// The actual content, cards, and data will be plugged in later.
// ─────────────────────────────────────────────────────────────

import { Heart, Sparkles, Brain, Shield, ArrowRight } from "lucide-react";

const emotionCategories = [
  { id: "anxiety", label: "Anxiety", icon: Brain, color: "#7C3AED" },
  { id: "stress", label: "Stress", icon: Shield, color: "#0EA5E9" },
  { id: "grief", label: "Grief", icon: Heart, color: "#EC4899" },
  { id: "anger", label: "Anger", icon: Sparkles, color: "#F59E0B" },
  { id: "loneliness", label: "Loneliness", icon: Heart, color: "#8B5CF6" },
  { id: "overwhelm", label: "Overwhelm", icon: Brain, color: "#10B981" },
];

export function EmotionHome() {
  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase backdrop-blur-sm">
            Emotion Remediation
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Your Path to Emotional Wellness
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Personalized remediation pathways designed to help you understand,
            process, and heal emotional challenges through guided techniques.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Emotion Categories */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-xl font-bold text-[#1E1B4B]">
          Explore by Emotion
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select an emotion to discover personalized remediation content.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {emotionCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#5B21B6]/30 hover:shadow-md"
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <span className="text-sm font-semibold text-[#1E1B4B]">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Start */}
      <div className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-2xl border border-[#5B21B6]/20 bg-gradient-to-r from-[#5B21B6]/5 to-[#7C3AED]/5 p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1E1B4B]">
                Ready to begin your journey?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Take a brief emotional wellness assessment to receive
                personalized remediation recommendations.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#5B21B6] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4C1D95]">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder Content Area */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-xl font-bold text-[#1E1B4B]">
          Recommended for You
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Content will be populated based on your emotional wellness profile.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-[#5B21B6]/10 to-[#7C3AED]/10" />
              <h3 className="mt-4 text-sm font-semibold text-[#1E1B4B]">
                Coming Soon
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Emotion-specific remediation content will appear here once
                configured.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
