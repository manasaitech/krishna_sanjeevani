import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import {
  KULASEKHARA_VERSE,
  CHAITANYA_SIKSASTAKAM,
  PRABHUPADA_LEGACY,
  kulasekharaImg,
  chaitanyaImg,
  prabhupadaImg,
  manuscriptImg,
} from "@/lib/home-data";
import { useApp } from "@/lib/app-state";
import { BASE_URL } from "@/lib/api";
import {
  Sparkles,
  BookOpen,
  Heart,
  Music,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  ArrowRight,
  Play,
  Pause,
} from "lucide-react";

export const Route = createFileRoute("/inspiration")({
  head: () => ({
    meta: [
      { title: "Our Inspiration — Spiritual Lineage & Sacred Texts | Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Discover the divine personalities and sacred Sanskrit verses guiding Krishna Sanjeevani: King Kulasekhara Alvar, Sri Chaitanya Mahaprabhu, and Srila Prabhupada.",
      },
      { property: "og:title", content: "Our Inspiration — Krishna Sanjeevani" },
      {
        property: "og:description",
        content:
          "Rooted in Mukundamālā Stotra, Śrī Śikṣāṣṭakam, and the global kīrtana legacy of Srila Prabhupada.",
      },
    ],
  }),
  component: InspirationPage,
});

function InspirationPage() {
  const audio = useVerseAudio();
  const { play, current, playing, toggle } = useApp();
  const [showKulasekharaDetails, setShowKulasekharaDetails] = useState(true);
  const [expandedSiksastakam, setExpandedSiksastakam] = useState<number | null>(null);

  const mahamantraTrack = {
    id: "hare-krishna-mahamantra",
    title: "Hare Krishna Mahamantra",
    artist: "Srila Prabhupada Legacy",
    subtitle: "Spiritual Inspiration Track",
    duration: 168, // default duration
    category: "devotional",
    art: prabhupadaImg,
    audioUrl: "/audio/hare-krishna-mahamantra.mp3",
    raga: "Bhairavi",
    purpose: "Devotion",
    instructions: "Listen with a prayerful and calm mind.",
    frequency: "Devotional Sound Vibration",
  };

  const toggleSiksastakam = (index: number) => {
    setExpandedSiksastakam(expandedSiksastakam === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      {/* Persistent Mini Player & Modal */}
      <VerseMiniPlayer audio={audio} />
      <VersePlayerModal audio={audio} />

      {/* Top Navbar */}
      <HomeNavbar />

      <main id="main-content" className="flex-1">
        {/* Top Hero Section */}
        <section className="relative pt-32 pb-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Content */}
            <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm animate-rise">
                <Sparkles className="h-3.5 w-3.5 text-cat" />
                <span>Sacred Lineage & Ancient Texts</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight text-foreground leading-tight">
                Our Inspiration
              </h1>

              <p className="text-lg sm:text-2xl font-serif italic text-cat font-semibold">
                The Spiritual Masters, Sanskrit Manuscripts, and Sacred Mantras Guiding Krishna
                Sanjeevani
              </p>

              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans pt-1">
                Krishna Sanjeevani draws its healing philosophy from a rich historical continuum of
                devotion and sacred sound vibration — spanning 9th-century Alvar royalty,
                15th-century divine awakening, and 20th-century global kīrtana outreach.
              </p>
            </div>

            {/* 3 Prominent Lineage Cards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <a
                href="#kulasekhara"
                className="group rounded-3xl bg-surface border border-border p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col items-center text-center"
              >
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-cat/30 mb-4 bg-background group-hover:scale-105 transition-transform">
                  <img
                    src={kulasekharaImg}
                    alt="King Kulasekhara Alvar"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cat font-sans">
                  9th Century
                </span>
                <h3 className="text-lg font-bold font-serif text-foreground mt-1">
                  King Kulasekhara Alvar
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Author of Mukundamālā Stotra & The Concept of Sanjeevani
                </p>
              </a>

              <a
                href="#chaitanya"
                className="group rounded-3xl bg-surface border border-border p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col items-center text-center"
              >
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-cat/30 mb-4 bg-background group-hover:scale-105 transition-transform">
                  <img
                    src={chaitanyaImg}
                    alt="Lord Chaitanya Mahaprabhu"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cat font-sans">
                  15th Century
                </span>
                <h3 className="text-lg font-bold font-serif text-foreground mt-1">
                  Śrī Caitanya Mahāprabhu
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Śrī Śikṣāṣṭakam & The Global Chanting of the Holy Name
                </p>
              </a>

              <a
                href="#prabhupada"
                className="group rounded-3xl bg-surface border border-border p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col items-center text-center"
              >
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-cat/30 mb-4 bg-background group-hover:scale-105 transition-transform">
                  <img
                    src={prabhupadaImg}
                    alt="Srila Prabhupada"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cat font-sans">
                  20th Century
                </span>
                <h3 className="text-lg font-bold font-serif text-foreground mt-1">
                  Śrīla Prabhupāda
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Founder-Acharya of ISKCON & Pioneer of Devotional Kīrtana
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* 1. KING KULASEKHARA ALVAR */}
        <section
          id="kulasekhara"
          className="py-20 sm:py-28 bg-surface border-y border-border relative"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Portrait */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
                <div className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-3xl overflow-hidden border-2 border-cat/40 shadow-lift bg-background">
                  <img
                    src={kulasekharaImg}
                    alt="King Kulasekhara Alvar"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-4 text-white">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-amber-300 font-sans block">
                      9th Century King & Devotee
                    </span>
                    <span className="text-base font-bold font-serif">King Kulasekhara Alvar</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Historical Intro */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-3.5 py-1 text-xs font-semibold text-cat uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Foundational Origin of "Sanjeevani"</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                  King Kulasekhara Alvar
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  The great King Kulasekhara, a devoted monarch and saint of 9th-century South
                  India, defined Lord Krishna's holy name as the supreme medicine in his celebrated
                  Sanskrit masterpiece,{" "}
                  <strong className="text-foreground">Mukundamālā Stotra</strong>.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  The name <strong className="text-foreground">Krishna Sanjeevani</strong> has its
                  roots in this ancient poetry that declares sacred sound vibration as the ultimate
                  elixir capable of healing ailments of body, mind, and existential suffering.
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (audio.currentTrackId === "kulasekhara" && audio.isPlaying) {
                        audio.pause();
                      } else {
                        audio.playTrack("kulasekhara");
                      }
                    }}
                    className="press inline-flex items-center gap-2 rounded-btn bg-cat px-5 py-2.5 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
                  >
                    {audio.currentTrackId === "kulasekhara" && audio.isPlaying ? (
                      <Pause className="h-4 w-4 fill-cat-foreground" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span>Listen to Verse 24</span>
                  </button>
                  <button
                    onClick={() => audio.setIsModalOpen(true)}
                    className="press inline-flex items-center gap-2 rounded-btn border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <span>View Sacred Manuscript</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Full Width Sanskrit Verse Banner */}
            <div className="mt-14 rounded-2xl bg-background border border-cat/30 p-6 sm:p-10 shadow-soft space-y-6">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-cat font-sans font-semibold">
                  Mukundamālā Stotra · The Most Relevant Verse
                </span>
                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold leading-relaxed text-foreground whitespace-pre-line">
                  {KULASEKHARA_VERSE.sanskrit}
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-muted-foreground max-w-2xl mx-auto">
                  "{KULASEKHARA_VERSE.transliteration}"
                </p>
                <div className="pt-2">
                  <p className="text-base sm:text-lg font-serif font-bold text-cat">
                    {KULASEKHARA_VERSE.meaning}
                  </p>
                </div>
              </div>

              {/* Six Descriptions of Krishna as Auṣadha (Medicine) */}
              <div className="pt-6 border-t border-border/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cat font-sans flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Six Dimensions of Krishna as Auṣadha (Medicine)</span>
                  </h3>
                  <button
                    onClick={() => setShowKulasekharaDetails(!showKulasekharaDetails)}
                    className="text-xs text-muted-foreground hover:text-cat transition-colors flex items-center gap-1"
                  >
                    <span>{showKulasekharaDetails ? "Collapse" : "Expand"}</span>
                    {showKulasekharaDetails ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {showKulasekharaDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-soft-in">
                    {KULASEKHARA_VERSE.dimensions.map((dim, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface border border-border/80 hover:border-cat/40 transition-colors shadow-soft"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cat font-sans block">
                          0{idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-serif font-semibold text-foreground mt-1">
                          {dim.sanskrit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">
                          {dim.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. LORD CHAITANYA MAHAPRABHU */}
        <section
          id="chaitanya"
          className="py-20 sm:py-28 bg-background border-b border-border relative"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-10">
              {/* Left Column: Portrait */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-3xl overflow-hidden border-2 border-cat/40 shadow-lift bg-surface">
                  <img
                    src={chaitanyaImg}
                    alt="Lord Chaitanya Mahaprabhu"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-4 text-white">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-amber-300 font-sans block">
                      15th Century Divine Avatar
                    </span>
                    <span className="text-base font-bold font-serif">Śrī Caitanya Mahāprabhu</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-3.5 py-1 text-xs font-semibold text-cat uppercase tracking-wider">
                  <Heart className="h-3.5 w-3.5" />
                  <span>15th Century Divine Foundation</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                  Lord Chaitanya Mahāprabhu
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  The 15th-century divine incarnation who dedicated His life to spreading the
                  chanting of the Hare Krishna Mahamantra as the universal path for inner
                  purification, peace, and spiritual awakening.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  His teachings provide the spiritual foundation for Krishna Sanjeevani, where the
                  Holy Name is experienced as a healing force that bathes and refreshes body, mind,
                  and soul.
                </p>
              </div>
            </div>

            {/* Śrī Śikṣāṣṭakam Verse 1 Banner */}
            <div className="rounded-2xl bg-surface border border-border p-7 sm:p-10 shadow-lift mb-10">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-cat font-sans">
                  The First Śloka of Śrī Śikṣāṣṭakam
                </span>
                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground leading-relaxed whitespace-pre-line">
                  {CHAITANYA_SIKSASTAKAM.sanskrit}
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-muted-foreground">
                  "{CHAITANYA_SIKSASTAKAM.transliteration}"
                </p>
                
                {/* Play Button for Chaitanya Verse */}
                <div className="pt-3 flex justify-center">
                  <button
                    onClick={() => {
                      if (audio.currentTrackId === "chaitanya" && audio.isPlaying) {
                        audio.pause();
                      } else {
                        audio.playTrack("chaitanya");
                      }
                    }}
                    className="press inline-flex items-center gap-2 rounded-btn bg-cat px-6 py-2.5 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
                  >
                    {audio.currentTrackId === "chaitanya" && audio.isPlaying ? (
                      <Pause className="h-4 w-4 fill-cat-foreground" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span>Listen to Śrī Śikṣāṣṭakam</span>
                  </button>
                </div>
              </div>

              {/* 8 Expandable Line-by-Line Cards */}
              <div className="mt-10 pt-8 border-t border-border/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cat font-sans mb-4">
                  Eightfold Healing Transformation of Consciousness:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {CHAITANYA_SIKSASTAKAM.lines.map((item, idx) => {
                    const isExpanded = expandedSiksastakam === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSiksastakam(idx)}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          isExpanded
                            ? "bg-cat-light border-cat shadow-sm"
                            : "bg-background border-border/70 hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-serif font-bold text-foreground">
                            {idx + 1}. {item.term}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-cat" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">
                          {item.meaning}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SRILA PRABHUPADA */}
        <section
          id="prabhupada"
          className="py-20 sm:py-28 bg-surface border-b border-border relative"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Portrait */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-3xl overflow-hidden border-2 border-cat/40 shadow-lift bg-background">
                  <img
                    src={prabhupadaImg}
                    alt="Srila Prabhupada"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-4 text-white">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-amber-300 font-sans block">
                      Founder-Acharya of ISKCON
                    </span>
                    <span className="text-base font-bold font-serif">
                      A.C. Bhaktivedanta Swami Prabhupāda
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-3.5 py-1 text-xs font-semibold text-cat uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Global Pioneer of Devotional Kīrtana</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                  His Divine Grace Srila Prabhupāda
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed font-sans">
                  {PRABHUPADA_LEGACY.description}
                </p>

                <div className="space-y-2.5 pt-1">
                  {PRABHUPADA_LEGACY.points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-sans"
                    >
                      <CheckCircle2 className="h-4 w-4 text-cat shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Audio Component Note */}
                <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cat-light flex items-center justify-center text-cat">
                      <Music className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground font-sans block">
                        SP Hare Krishna 1st Tune
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Authentic archival recording
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (current?.id === mahamantraTrack.id) {
                        toggle();
                      } else {
                        play(mahamantraTrack);
                      }
                    }}
                    className="press inline-flex items-center gap-1.5 rounded-btn bg-cat px-4 py-2 text-xs font-semibold text-cat-foreground shadow-sm hover:brightness-105"
                  >
                    {current?.id === mahamantraTrack.id && playing ? (
                      <>
                        <Pause className="h-3 w-3 fill-cat-foreground" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-cat-foreground" />
                        <span>Play Mahamantra</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-b from-surface to-background border-t border-border text-foreground text-center relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Immerse Yourself in Sacred Sound
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-sans">
              Discover how ancient Sanskrit verses and melodic ragas harmonize consciousness in our
              listening sanctuary.
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
