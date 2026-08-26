import { createFileRoute, Link } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import {
  LANDMARK_EVENT,
  inaugurationImg,
  templeSunriseImg,
  ragaMusiciansImg,
  launchImg,
} from "@/lib/home-data";
import {
  Calendar,
  MapPin,
  Award,
  Sparkles,
  Users,
  Building2,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/the-beginning")({
  head: () => ({
    meta: [
      { title: "A Landmark Beginning — Launch of Krishna Sanjeevani | 30 May 2026" },
      {
        name: "description",
        content:
          "On 30 May 2026, Hon’ble Governor of Maharashtra Shri Jishnu Dev Varma unveiled India’s first Holistic Cancer Healing Retreat and launched Krishna Sanjeevani at ISKCON Kharghar.",
      },
      { property: "og:title", content: "A Landmark Beginning — Krishna Sanjeevani" },
      {
        property: "og:description",
        content:
          "Official inauguration at ISKCON Kharghar before 200+ patients, physicians, researchers, and dignitaries.",
      },
    ],
  }),
  component: TheBeginningPage,
});

function TheBeginningPage() {
  const audio = useVerseAudio();

  const eventPillars = [
    {
      icon: Calendar,
      title: "The Occasion",
      highlight: "30 May 2026",
      desc: "A historic morning dedicated to uniting ancient Vedic sound therapy with modern holistic healthcare.",
    },
    {
      icon: Award,
      title: "The Inauguration",
      highlight: "Hon'ble Governor of Maharashtra",
      desc: "Shri Jishnu Dev Varma officially unveiled India's first Holistic Cancer Healing Retreat.",
    },
    {
      icon: Building2,
      title: "The Setting",
      highlight: "ISKCON Kharghar, Navi Mumbai",
      desc: "Held amidst the serene, spiritual campus of the Sri Sri Radha Madanmohanji Temple.",
    },
    {
      icon: Users,
      title: "The Gathering",
      highlight: "200+ Patients, Doctors & Dignitaries",
      desc: "An esteemed assembly of integrative oncologists, Ayurvedic vaidyas, and healthcare researchers.",
    },
  ];

  const galleryImages = [
    {
      src: launchImg,
      caption: "Official launching ceremony of Krishna Sanjeevani — The Divine Music Medicine",
    },
    { src: templeSunriseImg, caption: "Morning sanctum at ISKCON Kharghar campus" },
    {
      src: ragaMusiciansImg,
      caption: "Live therapeutic classical raga invocation for retreat patients",
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
                  src={inaugurationImg}
                  alt="Inauguration Ceremony at ISKCON Kharghar"
                  className="h-full w-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold text-amber-200">
                    ISKCON Kharghar · 30 May 2026
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 font-sans">
                    Historic Unveiling
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Hero Content Below the Image */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm animate-rise">
                <Sparkles className="h-3.5 w-3.5 text-cat" />
                <span>Historical Milestone</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight text-foreground leading-tight">
                A Landmark Beginning
              </h1>

              <p className="text-lg sm:text-2xl font-serif italic text-cat font-semibold">
                Inaugurated by the Hon’ble Governor of Maharashtra
              </p>

              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans pt-1">
                On 30 May 2026, Hon’ble Governor Shri Jishnu Dev Varma unveiled India’s first
                Holistic Cancer Healing Retreat and officially launched the divine music therapy
                ‘Krishna Sanjeevani’ before more than 200 patients, physicians, and dignitaries at
                ISKCON Kharghar.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3.5 text-sm sm:text-base font-semibold text-cat-foreground shadow-lift hover:brightness-105"
                >
                  <span>Experience Krishna Sanjeevani</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#gallery"
                  className="press inline-flex items-center gap-2 rounded-btn border border-border bg-surface px-6 py-3.5 text-sm sm:text-base font-semibold text-foreground hover:bg-muted transition-all shadow-soft"
                >
                  <span>View Ceremony Gallery</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Event Story & Key Pillars */}
        <section className="py-20 sm:py-28 bg-surface border-y border-border relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {eventPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-background border border-border/80 shadow-soft hover:shadow-lift transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs uppercase font-bold tracking-wider text-cat font-sans block">
                      {item.title}
                    </span>
                    <h3 className="text-lg font-bold font-serif text-foreground mt-1">
                      {item.highlight}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* In-depth Narrative Card */}
            <div className="rounded-3xl bg-background border border-border p-8 sm:p-12 shadow-soft">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-cat-light px-3.5 py-1 text-xs font-semibold text-cat uppercase tracking-wider">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>The Vision Unveiled</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-bold font-serif text-foreground">
                  Uniting Sacred Sound with Compassionate Care
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  The inaugural ceremony marked a momentous step forward in bridging traditional
                  Vedic acoustic therapies with modern supportive healthcare. The launch introduced
                  specially calibrated listening modules designed to bring mental calmness,
                  alleviate procedural anxiety, and cultivate Sattvic equilibrium for retreat
                  participants.
                </p>

                <blockquote className="border-l-2 border-cat pl-4 py-2 text-base font-serif italic text-foreground bg-cat-light/40 rounded-r-xl">
                  {LANDMARK_EVENT.quote}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Event Gallery */}
        <section id="gallery" className="py-20 bg-background relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans block mb-2">
                Visual Chronicle
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Inauguration Moments at ISKCON Kharghar
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-border bg-surface shadow-soft group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.02]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-foreground font-sans">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Link
                to="/register"
                className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3.5 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
              >
                <span>Experience Krishna Sanjeevani</span>
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
