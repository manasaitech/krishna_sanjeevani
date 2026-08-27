import { createFileRoute, Link } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeIntro } from "@/components/home/HomeIntro";
import { SurawaliShowcase } from "@/components/home/SurawaliShowcase";
import { ImmerseMusicSection } from "@/components/home/ImmerseMusicSection";
import { MusicMantraStory } from "@/components/home/MusicMantraStory";
import { ExploreCardsGrid } from "@/components/home/ExploreCardsGrid";
import { FeaturePillars } from "@/components/home/FeaturePillars";
import { BeginningPreview } from "@/components/home/BeginningPreview";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useApp } from "@/lib/app-state";
import { Sparkles, Compass } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishna Sanjeevani — The Divine Therapeutic Music" },
      {
        name: "description",
        content:
          "An amalgamation of the therapeutic science known as Sur Sanjeevan and the divine power of the Hare Krishna Mahamantra, blending Indian classical music, Ayurveda, and neuroscience.",
      },
      { property: "og:title", content: "Krishna Sanjeevani — The Divine Therapeutic Music" },
      {
        property: "og:description",
        content:
          "Experience therapeutic raga streaming, Sanskrit verse recitations, and restorative soundscapes for mental stillness and spiritual wellbeing.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const audio = useVerseAudio();
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">

      {/* 2. Persistent Floating Mini Verse Player (Bottom-Right) */}
      <VerseMiniPlayer audio={audio} />

      {/* 3. Expandable Sacred Verse Modal */}
      <VersePlayerModal audio={audio} />

      {/* 4. Top Navigation Bar */}
      <HomeNavbar />

      {/* 5. Main Hero Carousel */}
      <main id="main-content" className="flex-1">
        <HomeHeroCarousel />

        {/* Personalized Sound Healing Recommendation Banner */}
        {user && (
          <section className="bg-gradient-to-br from-amber-500/5 via-cat-light/10 to-transparent border-y border-border/40 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="rounded-card border border-cat-accent/20 bg-surface/85 backdrop-blur-md p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-1 text-xs font-bold text-cat uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>Personalized Sound Healing</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                    Welcome back, {user.name}! Ready to discover your Surāwali?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Search from our catalogue of disorders, pregnancy months, and corporate wellness
                    weekdays to subscribe to your personalized therapeutic classical raga frequency
                    plan.
                  </p>
                </div>
                <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/discover"
                    className="press rounded-btn bg-cat text-cat-foreground px-6 py-3 text-sm font-bold shadow-lift hover:brightness-105 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Explore Discover Catalog</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="press rounded-btn bg-secondary border border-border text-foreground px-6 py-3 text-sm font-bold hover:bg-secondary-hover transition-all text-center"
                  >
                    <span>My Subscriptions</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}



        {/* 6a. Interactive Surāwalis Showcase */}
        <SurawaliShowcase />

        {/* 6b. Immerse into Divine Music Callout (Routes to Login/Register) */}
        <ImmerseMusicSection />

        {/* 7. Music + Mantra + Consciousness + Wellbeing Story */}
        <MusicMantraStory />

        {/* 8. Explore Cards Grid */}
        <ExploreCardsGrid />

        {/* 9. 5 Conceptual Pillars */}
        <FeaturePillars />



        {/* 11. Landmark Beginning (30 May 2026) */}
        <BeginningPreview />

        {/* 12. Application Purpose & OAuth Verification Statement */}
        <section className="py-16 border-t border-border/80 bg-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center font-sans space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
              About the Krishna Sanjeevani Application
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Application Name:</strong>{" "}
                <span className="text-foreground font-semibold">Krishna Sanjeevani</span>
              </p>
              <p>
                <strong>Our Purpose:</strong> Krishna Sanjeevani is a dedicated therapeutic audio
                streaming application. We combine the therapeutic science of Indian classical ragas
                (Sur Sanjeevan) with sacred Sanskrit mantra recitations to provide acoustic support
                for stress reduction, mental focus, emotional balance, sleep aid, and pregnancy
                care.
              </p>
              <p>
                <strong>Secure Authentication (Google OAuth):</strong> Our application supports
                secure registration and sign-in via Google accounts. We access only your basic
                profile information (email and name) to create your personal listening account,
                track your session history, maintain your favorite playlists, and ensure a seamless,
                high-quality audio experience.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 13. Footer */}
      <HomeFooter />
    </div>
  );
}
