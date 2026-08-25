import { createFileRoute } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";

import { ScienceHero } from "@/components/science/ScienceHero";
import { MusicMoreThanSound } from "@/components/science/MusicMoreThanSound";
import { GunaExplorer } from "@/components/science/GunaExplorer";
import { CultivatingSattva } from "@/components/science/CultivatingSattva";
import { ConsciousnessModulation } from "@/components/science/ConsciousnessModulation";
import { RasaLanguage } from "@/components/science/RasaLanguage";
import { EmotionWheel } from "@/components/science/EmotionWheel";
import { DoshaExplorer } from "@/components/science/DoshaExplorer";
import { BalancePrinciple } from "@/components/science/BalancePrinciple";
import { MurchanaVadin } from "@/components/science/MurchanaVadin";
import { TherapeuticFrameworkDiagram } from "@/components/science/TherapeuticFrameworkDiagram";
import { ResearchNote } from "@/components/science/ResearchNote";
import { ScienceCTA } from "@/components/science/ScienceCTA";

export const Route = createFileRoute("/vedic-science")({
  head: () => ({
    meta: [
      {
        title: "Vedic Science — The Psychology & Therapeutics of Sacred Sound | Krishna Sanjeevani",
      },
      {
        name: "description",
        content:
          "Explore the research framework connecting Indian classical music, Rasa, the Three Guṇas (Sattva, Rajas, Tamas), Ayurvedic Doṣas, and Gāndharva modal scales.",
      },
      {
        property: "og:title",
        content: "Science Behind Vedic Therapeutic Music — Krishna Sanjeevani",
      },
      {
        property: "og:description",
        content:
          "Discover how classical Indian ragas and aesthetic rasas are calibrated to cultivate Sattva, balance bodily humors, and modulate consciousness.",
      },
    ],
  }),
  component: VedicSciencePage,
});

function VedicSciencePage() {
  const audio = useVerseAudio();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      {/* Persistent Mini Verse Player (Bottom-Right) */}
      <VerseMiniPlayer audio={audio} />

      {/* Expandable Sacred Verse Modal */}
      <VersePlayerModal audio={audio} />

      {/* Navigation Bar */}
      <HomeNavbar />

      {/* Main Research Content */}
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section */}
        <ScienceHero />

        {/* 2. Music as More Than Sound */}
        <MusicMoreThanSound />

        {/* 3. The Three Guṇas (Sattva, Rajas, Tamas) */}
        <GunaExplorer />

        {/* 4. Cultivating Sattva */}
        <CultivatingSattva />

        {/* 5. Music as Modulation of Consciousness */}
        <ConsciousnessModulation />

        {/* 6. The Language of Rasa */}
        <RasaLanguage />

        {/* 7. Nine Enduring Emotional States (Bhāvas) */}
        <EmotionWheel />

        {/* 8. From Rasa to Doṣa */}
        <DoshaExplorer />

        {/* 9. Like Increases Like / Opposites Balance */}
        <BalancePrinciple />

        {/* 10. Gāndharva Architecture & Mūrcchanā / Vādin */}
        <MurchanaVadin />

        {/* 11. Complete Vedic Therapeutic Music Framework */}
        <TherapeuticFrameworkDiagram />

        {/* 12. Research Context & Epistemic Boundaries */}
        <ResearchNote />

        {/* 13. Call to Action */}
        <ScienceCTA />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
