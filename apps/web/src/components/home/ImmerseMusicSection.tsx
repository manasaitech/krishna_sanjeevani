import { Link } from "@tanstack/react-router";
import { Sparkles, Music, ArrowRight, UserPlus, LogIn } from "lucide-react";
import krishnaLaunchImg from "@/assets/krishna-sanjeevani-launch.jpg";

export function ImmerseMusicSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-[#F5F1EB] border border-amber-900/15 shadow-lift p-8 sm:p-12 lg:p-14 text-foreground">
        {/* Ambient background glow & subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cat/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Call to Action */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/30 px-3.5 py-1 text-xs font-semibold text-cat mb-4 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cat animate-pulse" />
              <span>Sacred Therapeutic Sanctuary</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground font-serif leading-tight">
              Immerse Into the World of <span className="text-cat italic">Divine Music</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl">
              Step into an elevated auditory journey rooted in the 9th-century Mukundamālā Stotra of
              King Kulasekhara Alvar. Discover restorative classical ragas, microtonal swaras, and
              guided soundscapes designed for mental stillness, stress relief, and spiritual
              wellbeing.
            </p>

            {/* Action Buttons Routing to Login and Signup */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cat text-cat-foreground px-6 py-3 text-sm font-semibold shadow-lift hover:bg-cat/90 transition-all hover:scale-105"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Your Sanctuary</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface border border-cat/30 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all shadow-soft hover:scale-105"
              >
                <UserPlus className="h-4 w-4 text-cat" />
                <span>Create Free Account</span>
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-cat" />
                24/7 Therapeutic Audio Streaming
              </span>
              <span>•</span>
              <span>Free & Premium Raga Access</span>
            </div>
          </div>

          {/* Right Banner Image: Krishna Sanjeevani Launch Event */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-cat/30 shadow-lift group">
              <img
                src={krishnaLaunchImg}
                alt="Krishna Sanjeevani Launch Event"
                className="w-full h-auto max-h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <p className="text-xs font-serif italic text-amber-200">
                  "Piba Manaḥ Śrī-Kṛṣṇa-Divyauṣadham"
                </p>
                <p className="text-[11px] font-sans text-white/80 mt-0.5 font-medium">
                  The Sole Life-Giving Elixir for Existential Wellbeing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
