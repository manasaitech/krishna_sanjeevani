import { createFileRoute, Link } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import { templeSunriseImg, meditationImg } from "@/lib/home-data";
import { Music2, HeartPulse, Brain, Compass, ArrowRight, Globe2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — The Vision & Philosophy | Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Learn about Krishna Sanjeevani, the divine therapeutic music platform bridging ancient Indian classical raga science, Ayurveda, and mantra meditation.",
      },
      { property: "og:title", content: "About Krishna Sanjeevani" },
      {
        property: "og:description",
        content:
          "Dedicated to delivering authentic therapeutic soundscapes for emotional wellness, prenatal harmony, and restorative peace.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const audio = useVerseAudio();

  const values = [
    {
      icon: Music2,
      title: "Authentic Classical Heritage",
      desc: "Rooted in authentic microtonal swaras, Praharas (circadian time-theory), and the Gandharva Veda modal systems.",
    },
    {
      icon: HeartPulse,
      title: "Ayurvedic Raga Chikitsa",
      desc: "Calibrated to cultivate Sattva and balance the somatic humors (Vata, Pitta, Kapha) through the power of opposing Rasas.",
    },
    {
      icon: Brain,
      title: "Psycho-Acoustic Harmony",
      desc: "Designed to support neuro-vegetative balance, soothe stress responses, and facilitate restorative deep sleep.",
    },
    {
      icon: Globe2,
      title: "Universal Spiritual Healing",
      desc: "Freely accessible to all individuals across all backgrounds, transcending geographical and cultural boundaries.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      <VerseMiniPlayer audio={audio} />
      <VersePlayerModal audio={audio} />
      <HomeNavbar />

      <main id="main-content" className="flex-1">
        {/* Top Hero Section: Image First, Content Below */}
        <section className="relative pt-24 pb-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 1. Hero Image at the Top */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift bg-surface max-w-5xl mx-auto mb-10 group">
              <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-background">
                <img
                  src={templeSunriseImg}
                  alt="Ancient Vedic Temple at Golden Sunrise"
                  className="h-full w-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold text-amber-200">
                    Ancient Spiritual Tradition
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 font-sans">
                    Quiet Luxury Acoustic Sanctuary
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Hero Content Below the Image */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm animate-rise">
                <Compass className="h-3.5 w-3.5 text-cat" />
                <span>Platform Vision & Purpose</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight text-foreground leading-tight">
                About Krishna Sanjeevani
              </h1>

              <p className="text-lg sm:text-2xl font-serif italic text-cat font-semibold">
                The Divine Therapeutic Music Platform
              </p>

              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans pt-1">
                An institutional initiative dedicated to preserving, structuring, and broadcasting
                scientifically calibrated Indian classical raga therapy and devotional mantra
                meditation for global physical and psychological wellbeing.
              </p>

              <div className="pt-4 flex justify-center">
                <Link
                  to="/register"
                  className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3.5 text-sm sm:text-base font-semibold text-cat-foreground shadow-lift hover:brightness-105"
                >
                  <span>Enter the Sound Sanctuary</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Narrative */}
        <section className="py-20 sm:py-28 bg-surface border-y border-border relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans block">
                  Our Foundation
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                  An Amalgamation of Science & Sacred Sound
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  Krishna Sanjeevani is built upon the synergy of two profound traditions: the
                  classical therapeutic science of{" "}
                  <strong className="text-foreground">Sur Sanjeevan</strong> and the transcendental
                  potency of the{" "}
                  <strong className="text-foreground">Hare Krishna Mahamantra</strong>.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  Recognizing that music is a potent mental-somatic regulator, our platform curates
                  listening journeys calibrated to natural circadian timeframes (Praharas), prenatal
                  developmental stages, and emotional equilibrium.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-border shadow-lift aspect-[4/3]">
                  <img
                    src={meditationImg}
                    alt="Meditation & Wellbeing"
                    className="h-full w-full object-cover filter brightness-[0.98]"
                  />
                </div>
              </div>
            </div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {values.map((v, idx) => {
                const Icon = v.icon;
                return (
                  <div
                    key={idx}
                    className="p-7 rounded-2xl bg-background border border-border shadow-soft hover:shadow-lift transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-sans">
                      {v.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-surface to-background border-t border-border text-foreground text-center relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Enter Your Listening Sanctuary
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-sans">
              Discover day-and-night raga streams, pregnancy wellness pathways, and deep meditation
              tracks.
            </p>
            <div className="pt-4">
              <Link
                to="/register"
                className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3.5 text-sm sm:text-base font-semibold text-cat-foreground shadow-lift hover:brightness-105"
              >
                <span>Enter the Sound Sanctuary</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
