import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { OpeningExperience } from "@/components/home/OpeningExperience";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeIntro } from "@/components/home/HomeIntro";
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

function HomePage() {
  const audio = useVerseAudio();
  const [openingFinished, setOpeningFinished] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      {/* 1. 3-Second Cinematic Opening Experience */}
      {!openingFinished && (
        <OpeningExperience
          audio={audio}
          onComplete={() => setOpeningFinished(true)}
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
      </main>

      {/* 13. Footer */}
      <HomeFooter />
    </div>
  );
}
