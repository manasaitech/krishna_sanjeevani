import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Baby,
  Briefcase,
  Flower,
  Sparkles,
  Activity,
  Flower2,
  Shield,
  Brain,
  Users,
  Music,
  Heart,
  BookOpen,
  Loader2,
} from "lucide-react";
import { StatusBar } from "@/components/StatusBar";
import { categories, type CategoryId } from "@/lib/content";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/category")({
  head: () => ({
    meta: [
      { title: "Choose your path — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Devotional, secular and corporate, or pregnancy wellness — choose the path that shapes your recommendations.",
      },
      { property: "og:title", content: "Choose your path — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "One app, three gentle paths: devotional, secular, and pregnancy wellness.",
      },
    ],
  }),
  component: CategoryScreen,
});

function CategoryScreen() {
  const { category, setCategory, restoreSession, user } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CategoryId | "unset">("unset");
  const [saving, setSaving] = useState(false);

  // Initialize selected category if user already has one
  useEffect(() => {
    if (user?.profile?.category && user.profile.category !== "unset") {
      setSelected(user.profile.category as CategoryId);
    }
  }, [user]);

  const handleContinue = async () => {
    if (selected === "unset") return;
    setSaving(true);
    try {
      const res = await api.auth.updateProfile({ category: selected });
      if (res.success) {
        setCategory(selected);
        await restoreSession();
        // Redirect to dashboard
        navigate({ to: selected === "pregnancy" ? "/journey" : "/home" });
      } else {
        toast.error(res.message || "Failed to save pathway selection. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred while saving your pathway.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background mandala overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
        <svg
          className="w-[800px] h-[800px] text-[#7C1C24]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="25" />
          <path d="M 50,5 A 45,45 0 0,0 50,95 A 45,45 0 0,0 50,5" />
          <path d="M 5,50 A 45,45 0 0,0 95,50 A 45,45 0 0,0 5,50" />
          <path d="M 18.2,18.2 L 81.8,81.8" />
          <path d="M 18.2,81.8 L 81.8,18.2" />
        </svg>
      </div>

      <StatusBar />

      <main className="w-full max-w-6xl relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#C5A880] text-xs font-bold uppercase tracking-widest font-sans">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Choose Your Healing Journey</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#4A0E17] leading-tight">
            Choose Your Healing Journey
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the wellness pathway that best matches your needs. You can explore a personalized experience designed specifically for your selected journey.
          </p>
        </div>

        {/* Three Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch">
          
          {/* Card 1: Krishna Sanjeevani */}
          <div
            onClick={() => setSelected("devotional")}
            className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all duration-300 group cursor-pointer ${
              selected === "devotional"
                ? "border-[#7C1C24] bg-gradient-to-b from-[#FFF0F0] to-[#FDF0F0] ring-4 ring-[#7C1C24]/10 scale-[1.02]"
                : "border-[#F2D6D6] bg-gradient-to-b from-[#FFF5F5] to-[#FDF4F4] opacity-80 hover:opacity-100 shadow-soft hover:shadow-lift"
            }`}
          >
            <div>
              {/* SVG Illustration at top */}
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#7C1C24]/10 blur-xl scale-110" />
                <svg
                  className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#F5D6D6]"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <path d="M 15,50 C 15,35 25,25 35,30 C 28,38 25,48 27,58 C 18,55 15,45 15,50 Z" opacity="0.8" />
                  <path d="M 18,65 C 10,55 15,40 25,42 C 22,48 24,56 28,62 C 22,65 18,60 18,65 Z" opacity="0.6" />
                  <path d="M 85,50 C 85,35 75,25 65,30 C 72,38 75,48 73,58 C 82,55 85,45 85,50 Z" opacity="0.8" />
                  <path d="M 82,65 C 90,55 85,40 75,42 C 78,48 76,56 72,62 C 78,65 82,60 82,65 Z" opacity="0.6" />
                </svg>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A72C38] to-[#5A1218] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                  <svg className="w-full h-full text-white/25 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
                  </svg>
                  <Flower className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Typography Hierarchy */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold font-serif text-[#7C1C24]">
                  Krishna Sanjeevani
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#7C1C24]/85 uppercase">
                  <span>DISORDER & AILMENT RELIEF</span>
                </div>
                {/* Subtle Ornamental line */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-[1px] w-12 bg-[#7C1C24]/20" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#7C1C24]/40" />
                  <div className="h-[1px] w-12 bg-[#7C1C24]/20" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                Therapeutic sound frequencies calibrated to support physical and neurological conditions naturally through Raga Chikitsa.
              </p>

              {/* Benefits List */}
              <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5 text-[#7C1C24]" />
                  </div>
                  <span>Targeted relief for various ailments</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                    <Flower2 className="h-3.5 w-3.5 text-[#7C1C24]" />
                  </div>
                  <span>Non-invasive & natural support</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#7C1C24]/10 flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5 text-[#7C1C24]" />
                  </div>
                  <span>Rooted in ancient Indian wisdom</span>
                </li>
              </ul>
            </div>

            <div className={`w-full py-3 px-6 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 ${
              selected === "devotional"
                ? "bg-[#7C1C24] text-white"
                : "bg-white border border-[#7C1C24]/20 text-[#7C1C24] hover:bg-[#7C1C24] hover:text-white"
            }`}>
              <span>{selected === "devotional" ? "Selected Pathway" : "Select Krishna Sanjeevani"}</span>
            </div>
          </div>

          {/* Card 2: Arogya Sanjeevani */}
          <div
            onClick={() => setSelected("secular")}
            className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all duration-300 group cursor-pointer ${
              selected === "secular"
                ? "border-[#1C5D4B] bg-gradient-to-b from-[#EBF5F1] to-[#E3EFEA] ring-4 ring-[#1C5D4B]/10 scale-[1.02]"
                : "border-[#DDEBE4] bg-gradient-to-b from-[#F4F8F6] to-[#ECF2EF] opacity-80 hover:opacity-100 shadow-soft hover:shadow-lift"
            }`}
          >
            <div>
              {/* SVG Illustration at top */}
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#1C5D4B]/10 blur-xl scale-110" />
                <svg
                  className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#DDEBE4]"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <path d="M 22,30 C 15,35 15,48 20,55 C 23,48 27,45 25,38 Z" opacity="0.8" />
                  <path d="M 15,48 C 8,53 10,65 18,68 C 18,60 21,55 21,50 Z" opacity="0.6" />
                  <path d="M 78,30 C 85,35 85,48 80,55 C 77,48 73,45 75,38 Z" opacity="0.8" />
                  <path d="M 85,48 C 92,53 90,65 82,68 C 82,60 79,55 79,50 Z" opacity="0.6" />
                </svg>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#247D64] to-[#124335] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                  <svg className="w-full h-full text-white/20 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>
                  <Briefcase className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Typography Hierarchy */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold font-serif text-[#1C5D4B]">
                  Arogya Sanjeevani
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#1C5D4B]/85 uppercase">
                  <span>CORPORATE WELLNESS & PRODUCTIVITY</span>
                </div>
                {/* Subtle Ornamental line */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-[1px] w-12 bg-[#1C5D4B]/20" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#1C5D4B]/40" />
                  <div className="h-[1px] w-12 bg-[#1C5D4B]/20" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                Circadian-aligned sound therapy designed to reduce stress, boost focus, and enhance well-being in the workplace.
              </p>

              {/* Benefits List */}
              <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                    <Brain className="h-3.5 w-3.5 text-[#1C5D4B]" />
                  </div>
                  <span>Enhances focus & mental clarity</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5 text-[#1C5D4B]" />
                  </div>
                  <span>Reduces stress & burnout</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#1C5D4B]/10 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-[#1C5D4B]" />
                  </div>
                  <span>Improves team well-being</span>
                </li>
              </ul>
            </div>

            <div className={`w-full py-3 px-6 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 ${
              selected === "secular"
                ? "bg-[#1C5D4B] text-white"
                : "bg-white border border-[#1C5D4B]/20 text-[#1C5D4B] hover:bg-[#1C5D4B] hover:text-white"
            }`}>
              <span>{selected === "secular" ? "Selected Pathway" : "Select Arogya Sanjeevani"}</span>
            </div>
          </div>

          {/* Card 3: Garbh Sanjeevani */}
          <div
            onClick={() => setSelected("pregnancy")}
            className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all duration-300 group cursor-pointer ${
              selected === "pregnancy"
                ? "border-[#D01C5C] bg-gradient-to-b from-[#F2EBF7] to-[#EBE2F3] ring-4 ring-[#D01C5C]/10 scale-[1.02]"
                : "border-[#FAD2E1] bg-gradient-to-b from-[#FFF0F5] to-[#FDF2F4] opacity-80 hover:opacity-100 shadow-soft hover:shadow-lift"
            }`}
          >
            <div>
              {/* SVG Illustration at top */}
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#D01C5C]/10 blur-xl scale-110" />
                <svg
                  className="absolute w-[160px] h-[160px] pointer-events-none select-none text-[#FAD2E1]"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <path d="M 16,28 C 12,25 10,32 15,35 C 13,38 18,40 20,35 C 22,30 20,30 16,28 Z" opacity="0.7" />
                  <path d="M 84,28 C 88,25 90,32 85,35 C 87,38 82,40 80,35 C 78,30 80,30 84,28 Z" opacity="0.7" />
                  <path d="M 22,70 C 26,62 38,62 40,70 C 35,74 28,74 22,70 Z" opacity="0.5" />
                  <path d="M 78,70 C 74,62 62,62 60,70 C 65,74 72,74 78,70 Z" opacity="0.5" />
                </svg>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8A57AA] to-[#4E2A66] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                  <svg className="w-full h-full text-white/20 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <Baby className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Typography Hierarchy */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold font-serif text-[#D01C5C]">
                  Garbh Sanjeevani
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-[#D01C5C]/85 uppercase">
                  <span>PREGNANCY CARE (GARBHA SANSKAR)</span>
                </div>
                {/* Subtle Ornamental line */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-[1px] w-12 bg-[#D01C5C]/20" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#D01C5C]/40" />
                  <div className="h-[1px] w-12 bg-[#D01C5C]/20" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-6">
                Sacred sound guidance for a harmonious pregnancy journey and positive fetal development based on Garbha Sanskar.
              </p>

              {/* Benefits List */}
              <ul className="space-y-3.5 mb-8 max-w-[260px] mx-auto">
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                    <Music className="h-3.5 w-3.5 text-[#D01C5C]" />
                  </div>
                  <span>Supports fetal development</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                    <Heart className="h-3.5 w-3.5 text-[#D01C5C]" />
                  </div>
                  <span>Promotes emotional balance</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-[#D01C5C]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-[#D01C5C]" />
                  </div>
                  <span>Guided by Garbha Sanskar wisdom</span>
                </li>
              </ul>
            </div>

            <div className={`w-full py-3 px-6 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all text-center flex items-center justify-center gap-2 ${
              selected === "pregnancy"
                ? "bg-[#D01C5C] text-white"
                : "bg-white border border-[#D01C5C]/20 text-[#D01C5C] hover:bg-[#D01C5C] hover:text-white"
            }`}>
              <span>{selected === "pregnancy" ? "Selected Pathway" : "Select Garbh Sanjeevani"}</span>
            </div>
          </div>

        </div>

        {/* Continue Action Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleContinue}
            disabled={saving || selected === "unset"}
            className={`press flex min-h-13 w-full max-w-md items-center justify-center gap-2 rounded-full px-8 text-sm sm:text-base font-bold shadow-soft transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
              selected === "unset"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[#264653] hover:bg-[#1d353f] text-white"
            }`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>
                  {selected === "unset"
                    ? "Select Your Pathway"
                    : `Continue with ${
                        selected === "devotional"
                          ? "Krishna Sanjeevani"
                          : selected === "secular"
                          ? "Arogya Sanjeevani"
                          : "Garbh Sanjeevani"
                      }`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
