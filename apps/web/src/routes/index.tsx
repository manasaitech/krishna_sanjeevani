import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { OpeningExperience } from "@/components/home/OpeningExperience";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeIntro } from "@/components/home/HomeIntro";
import { ImmerseMusicSection } from "@/components/home/ImmerseMusicSection";
import { MusicMantraStory } from "@/components/home/MusicMantraStory";
import { ExploreCardsGrid } from "@/components/home/ExploreCardsGrid";
import { FeaturePillars } from "@/components/home/FeaturePillars";
import { SpiritualVerseSection } from "@/components/home/SpiritualVerseSection";
import { BeginningPreview } from "@/components/home/BeginningPreview";
import { HomeFooter } from "@/components/home/HomeFooter";

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

// Module-scoped variable to track if the opening experience was completed during this JS application session.
// This allows the flash screen to show on page refreshes (for testing) but prevents it from showing
// when navigating back and forth between pages/routes within the single page application.
let globalOpeningFinished = false;

function HomePage() {
  const audio = useVerseAudio();
  const [openingFinished, setOpeningFinished] = useState(globalOpeningFinished);

  const handleOpeningComplete = () => {
    globalOpeningFinished = true;
    setOpeningFinished(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      {/* 1. 3-Second Cinematic Opening Experience */}
      {!openingFinished && (
        <OpeningExperience
          audio={audio}
          onComplete={handleOpeningComplete}
        />
      )}

      {/* 2. Persistent Floating Mini Verse Player (Bottom-Right) */}
      <VerseMiniPlayer audio={audio} />

      {/* 3. Expandable Sacred Verse Modal */}
      <VersePlayerModal audio={audio} />

      {/* 4. Top Navigation Bar */}
      <HomeNavbar />

      {/* 5. Main Hero Carousel */}
      <main id="main-content" className="flex-1">
        <HomeHeroCarousel />

        {/* 6. Introduction to Krishna Sanjeevani */}
        <HomeIntro />

        {/* 6b. Immerse into Divine Music Callout (Routes to Login/Register) */}
        <ImmerseMusicSection />

        {/* 7. Music + Mantra + Consciousness + Wellbeing Story */}
        <MusicMantraStory />

        {/* 8. Explore Cards Grid */}
        <ExploreCardsGrid />

        {/* 9. 5 Conceptual Pillars */}
        <FeaturePillars />

        {/* 10. Full-width Spiritual Verse Pause */}
        <SpiritualVerseSection />

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
                <strong>Application Name:</strong> <span className="text-foreground font-semibold">Krishna Sanjeevani</span>
              </p>
              <p>
                <strong>Our Purpose:</strong> Krishna Sanjeevani is a dedicated therapeutic audio streaming application. 
                We combine the therapeutic science of Indian classical ragas (Sur Sanjeevan) with sacred Sanskrit mantra recitations 
                to provide acoustic support for stress reduction, mental focus, emotional balance, sleep aid, and pregnancy care.
              </p>
              <p>
                <strong>Secure Authentication (Google OAuth):</strong> Our application supports secure registration and sign-in 
                via Google accounts. We access only your basic profile information (email and name) to create your personal listening 
                account, track your session history, maintain your favorite playlists, and ensure a seamless, high-quality audio experience.
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
