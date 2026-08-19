import { createFileRoute, Link } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import {
  kulasekharaImg,
  chaitanyaImg,
  prabhupadaImg,
  ragaMusiciansImg,
  meditationImg,
  manuscriptImg,
  soundVibrationImg,
  templeSunriseImg,
} from "@/lib/home-data";
import {
  Users,
  Linkedin,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team & Spiritual Lineage | Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Meet the spiritual lineage leaders, researchers, musicologists, and advisory council guiding the Krishna Sanjeevani therapeutic music initiative.",
      },
      { property: "og:title", content: "Our Team & Spiritual Lineage — Krishna Sanjeevani" },
      {
        property: "og:description",
        content:
          "Guiding guardians and researchers dedicated to preserving authentic Vedic acoustic therapy.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const audio = useVerseAudio();

  const spiritualGuardians = [
    {
      name: "King Kulasekhara Alvar",
      role: "9th-Century Saint-King · Author of Mukundamālā",
      image: kulasekharaImg,
      desc: "Defined Sri Krishna's holy name as the ultimate divine medicine (auṣadha) that dispels existential suffering and grants life to the three worlds.",
    },
    {
      name: "Lord Chaitanya Mahāprabhu",
      role: "15th-Century Divine Pioneer of Saṅkīrtana",
      image: chaitanyaImg,
      desc: "Inaugurated the congregational chanting of the Mahamantra as the prime benediction for human consciousness, cleansing the mirror of the heart.",
    },
    {
      name: "His Divine Grace Srila Prabhupāda",
      role: "Global Acharya of Devotional Kīrtana",
      image: prabhupadaImg,
      desc: "Brought the transcendental healing power of the Hare Krishna Mahamantra to millions worldwide, demonstrating chanting as the real spiritual medicine.",
    },
  ];

  const advisorsAndTeam = [
    {
      name: "Dr. Rajesh Sharma, MD",
      role: "Director of Integrative Oncology",
      tag: "Advisory Board",
      bio: "Physician and integrative health researcher exploring psycho-acoustic adjuncts for palliative oncology care.",
      image: meditationImg,
    },
    {
      name: "Pandit Hari Prasad",
      role: "Classical Raga Master & Sound Theorist",
      tag: "Musicology Guide",
      bio: "Over 40 years of expertise in Gāndharva modal scales, Prahara time-theory, and microtonal swara inflections.",
      image: ragaMusiciansImg,
    },
    {
      name: "Vaidya Manasvi Deshmukh",
      role: "Lead Ayurvedic Raga Chikitsa Specialist",
      tag: "Ayurvedic Researcher",
      bio: "Classical practitioner focused on mapping Dosha imbalances and Guna transformations through acoustic therapy.",
      image: manuscriptImg,
    },
    {
      name: "Ananya Kulkarni",
      role: "Platform Director & Sound Design Lead",
      tag: "Core Team",
      bio: "Audio engineer dedicated to high-fidelity circadian streaming architecture and responsive wellness interfaces.",
      image: soundVibrationImg,
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
                  src={ragaMusiciansImg}
                  alt="Indian Classical Raga Musicians"
                  className="h-full w-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold text-amber-200">
                    Indian Classical Raga Lineage
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 font-sans">
                    Guardians & Research Council
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Hero Content Below the Image */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm animate-rise">
                <Users className="h-3.5 w-3.5 text-cat" />
                <span>Guardians & Research Council</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight text-foreground leading-tight">
                Our Team & Lineage
              </h1>

              <p className="text-lg sm:text-2xl font-serif italic text-cat font-semibold">
                Honoring Our Eternal Lineage Masters and Dedicated Research Team
              </p>

              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans pt-1">
                Krishna Sanjeevani is guided by the timeless vision of eternal spiritual masters and
                brought into modern reality by dedicated physicians, musicologists, and researchers.
              </p>
            </div>
          </div>
        </section>

        {/* 1. Spiritual Roots & Guardians */}
        <section className="py-20 sm:py-28 bg-surface border-y border-border relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans block mb-2">
                Spiritual Heritage
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                Our Spiritual Roots & Guardians
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground font-sans">
                The divine preceptors whose sacred verses and life examples established the foundation
                of devotional sound healing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {spiritualGuardians.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-card bg-background border border-border p-6 sm:p-7 shadow-soft hover:shadow-lift transition-all flex flex-col items-center text-center group"
                >
                  <div className="relative h-36 w-36 rounded-full overflow-hidden border-2 border-cat/40 shadow-soft bg-surface mb-5 group-hover:scale-105 transition-transform">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-top filter brightness-[0.98]"
                    />
                  </div>

                  <h3 className="text-xl font-bold font-serif text-foreground">
                    {item.name}
                  </h3>

                  <span className="text-xs font-serif italic text-cat mt-0.5 block font-semibold">
                    {item.role}
                  </span>

                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Advisory Council & Core Team */}
        <section className="py-20 sm:py-28 bg-background relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans block mb-2">
                Executive & Research Council
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                Advisors, Physicians & Researchers
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground font-sans">
                Bridging ancient classical musicology with integrative healthcare and digital acoustics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {advisorsAndTeam.map((member, idx) => (
                <div
                  key={idx}
                  className="rounded-card bg-surface border border-border p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-border bg-background mb-4">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover filter brightness-[0.98]"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-md border border-border/80 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-cat shadow-sm">
                        {member.tag}
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-serif text-foreground">
                      {member.name}
                    </h3>

                    <span className="text-xs font-medium text-cat font-sans block mt-0.5">
                      {member.role}
                    </span>

                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed font-sans">
                      {member.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-[11px] font-semibold text-foreground/80">Connect</span>
                    <div className="flex items-center gap-2">
                      <button className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:text-cat transition-colors">
                        <Linkedin className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:text-cat transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Link
                to="/register"
                className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3.5 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
              >
                <span>Enter the Listening Sanctuary</span>
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
