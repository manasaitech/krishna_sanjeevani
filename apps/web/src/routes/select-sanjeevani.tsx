import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Loader2, Heart, Brain, Activity, Shield, Compass, Sparkle } from "lucide-react";
import { StatusBar } from "@/components/StatusBar";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { type CategoryId } from "@/lib/content";

import artDevotional from "@/assets/art-devotional.webp";
import artSecular from "@/assets/art-secular.webp";
import artPregnancy from "@/assets/art-pregnancy.webp";

export const Route = createFileRoute("/select-sanjeevani")({
  head: () => ({
    meta: [
      { title: "Choose Your Sanjeevani — Personal Healing Journey" },
      {
        name: "description",
        content:
          "Select the path that matches your journey: Krishna Sanjeevani (Devotional/Raga Chikitsa), Arogya Sanjeevani (Corporate Wellness), or Garbh Sanjeevani (Pregnancy Care).",
      },
      { property: "og:title", content: "Choose Your Sanjeevani — Personal Healing Journey" },
      {
        property: "og:description",
        content: "One larger Sanjeevani ecosystem, three tailored healing journeys.",
      },
    ],
  }),
  component: SelectSanjeevaniScreen,
});

function SelectSanjeevaniScreen() {
  const { setCategory, restoreSession } = useApp();
  const navigate = useNavigate();
  const [savingCategory, setSavingCategory] = useState<CategoryId | null>(null);

  const handleSelect = async (pathway: CategoryId) => {
    if (savingCategory) return;
    setSavingCategory(pathway);
    try {
      const res = await api.auth.updateProfile({ category: pathway });
      if (res.success) {
        setCategory(pathway);
        await restoreSession();
        toast.success(`Welcome to ${pathway === "devotional" ? "Krishna" : pathway === "secular" ? "Arogya" : "Garbh"} Sanjeevani!`);
        navigate({ to: pathway === "pregnancy" ? "/journey" : "/home" });
      } else {
        toast.error(res.message || "Failed to save pathway selection. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred while saving your pathway.");
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-x-hidden flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Mandalas / Background elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none flex items-center justify-center">
        <svg
          className="w-[900px] h-[900px] text-[#7C1C24] animate-spin"
          style={{ animationDuration: "120s" }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
        >
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="35" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="25" />
          <path d="M 50,5 A 45,45 0 0,0 50,95 A 45,45 0 0,0 50,5" />
          <path d="M 5,50 A 45,45 0 0,0 95,50 A 45,45 0 0,0 5,50" />
          <path d="M 18.2,18.2 L 81.8,81.8" />
          <path d="M 18.2,81.8 L 81.8,18.2" />
        </svg>
      </div>

      <StatusBar />

      <main className="w-full max-w-7xl relative z-10 space-y-12 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
          <div className="flex items-center justify-center gap-2 text-[#C5A880] text-xs font-bold uppercase tracking-widest font-sans">
            <Sparkle className="h-4 w-4 animate-pulse fill-current" />
            <span>Onboarding Journey</span>
            <Sparkle className="h-4 w-4 animate-pulse fill-current" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#4A0E17] leading-tight">
            Choose Your Sanjeevani
          </h1>

          <p className="text-sm sm:text-base text-[#5C5040] max-w-2xl mx-auto leading-relaxed">
            Select the path that best matches your journey. You can change your Sanjeevani later from your profile.
          </p>
        </div>

        {/* Three Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-stretch w-full px-4">
          
          {/* Card 1: Krishna Sanjeevani */}
          <div
            onClick={() => handleSelect("devotional")}
            className="flex flex-col justify-between rounded-3xl border border-[#F2D6D6] bg-gradient-to-b from-[#FFFDFD] to-[#FFF5F5] overflow-hidden shadow-soft hover:shadow-lift hover:border-[#7C1C24] transition-all duration-300 group cursor-pointer hover:scale-[1.02] flex-1"
          >
            <div>
              {/* Artwork Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#7C1C24]/10">
                <img
                  src={artDevotional}
                  alt="Krishna Sanjeevani Sound Healing"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDFD] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 bg-[#7C1C24] text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                  Spiritual Healing
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-serif text-[#7C1C24] group-hover:translate-x-1 transition-transform duration-300">
                    Krishna Sanjeevani
                  </h3>
                  <p className="text-[11px] font-bold tracking-widest text-[#7C1C24]/75 uppercase">
                    Raga Chikitsa &amp; Devotion
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#5C5040] leading-relaxed">
                  Therapeutic sound frequencies calibrated to support physical, neurological, and emotional well-being naturally through sacred ragas.
                </p>

                {/* Features */}
                <ul className="space-y-2.5 pt-2">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Relief from clinical disorders</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Compass className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Devotional Raga Chikitsa sessions</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#7C1C24]" />
                    </div>
                    <span>Rooted in ancient Vedic wisdom</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                disabled={savingCategory !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("devotional");
                }}
                className="press w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 bg-[#7C1C24] text-white hover:bg-[#66161D] cursor-pointer"
              >
                {savingCategory === "devotional" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Enter Krishna Sanjeevani</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Arogya Sanjeevani */}
          <div
            onClick={() => handleSelect("secular")}
            className="flex flex-col justify-between rounded-3xl border border-[#DDEBE4] bg-gradient-to-b from-[#FAFDFB] to-[#F4F8F6] overflow-hidden shadow-soft hover:shadow-lift hover:border-[#0F766E] transition-all duration-300 group cursor-pointer hover:scale-[1.02] flex-1"
          >
            <div>
              {/* Artwork Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#0F766E]/10">
                <img
                  src={artSecular}
                  alt="Arogya Sanjeevani Circadian Sound"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAFDFB] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 bg-[#0F766E] text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                  Wellness &amp; Productivity
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-serif text-[#0F766E] group-hover:translate-x-1 transition-transform duration-300">
                    Arogya Sanjeevani
                  </h3>
                  <p className="text-[11px] font-bold tracking-widest text-[#0F766E]/75 uppercase">
                    Focus, Stress &amp; Recovery
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#5C5040] leading-relaxed">
                  Circadian-aligned sound therapy designed to reduce workplace burnout, improve neurological focus, and build sustainable healthy routines.
                </p>

                {/* Features */}
                <ul className="space-y-2.5 pt-2">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                      <Brain className="h-3.5 w-3.5 text-[#0F766E]" />
                    </div>
                    <span>Boosts mental focus &amp; clarity</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-[#0F766E]" />
                    </div>
                    <span>Stress &amp; burnout management</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#0F766E]" />
                    </div>
                    <span>Designed for modern professional lives</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                disabled={savingCategory !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("secular");
                }}
                className="press w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 bg-[#0F766E] text-white hover:bg-[#0D635C] cursor-pointer"
              >
                {savingCategory === "secular" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Enter Arogya Sanjeevani</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Garbh Sanjeevani */}
          <div
            onClick={() => handleSelect("pregnancy")}
            className="flex flex-col justify-between rounded-3xl border border-[#FAD2E1] bg-gradient-to-b from-[#FFFDFE] to-[#FFF0F5] overflow-hidden shadow-soft hover:shadow-lift hover:border-[#D01C5C] transition-all duration-300 group cursor-pointer hover:scale-[1.02] flex-1"
          >
            <div>
              {/* Artwork Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#D01C5C]/10">
                <img
                  src={artPregnancy}
                  alt="Garbh Sanjeevani Prenatal Healing"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDFE] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 bg-[#D01C5C] text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                  Pregnancy &amp; Motherhood
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-serif text-[#D01C5C] group-hover:translate-x-1 transition-transform duration-300">
                    Garbh Sanjeevani
                  </h3>
                  <p className="text-[11px] font-bold tracking-widest text-[#D01C5C]/75 uppercase">
                    Prenatal Care &amp; Garbha Sanskar
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#5C5040] leading-relaxed">
                  Sacred sound guidance and month-wise audio tracks calibrated for a harmonious pregnancy journey and healthy fetal development.
                </p>

                {/* Features */}
                <ul className="space-y-2.5 pt-2">
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <Heart className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Supports healthy fetal progress</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Gentle mother-baby bonding sounds</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs sm:text-sm text-[#3A2C18]">
                    <div className="h-5 w-5 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#D01C5C]" />
                    </div>
                    <span>Month-wise guided developmental tips</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                disabled={savingCategory !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("pregnancy");
                }}
                className="press w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 bg-[#D01C5C] text-white hover:bg-[#A90F43] cursor-pointer"
              >
                {savingCategory === "pregnancy" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Enter Garbh Sanjeevani</span>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
