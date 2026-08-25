import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import {
  templeSunriseImg,
  inaugurationImg,
  prabhupadaImg,
  chaitanyaImg,
  meditationImg,
  soundVibrationImg,
} from "@/lib/home-data";
import {
  MapPin,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  Heart,
  Music,
} from "lucide-react";

export const Route = createFileRoute("/origin")({
  head: () => ({
    meta: [
      { title: "Origin & Spiritual Roots — ISKCON Kharghar | Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Explore the spiritual origin of Krishna Sanjeevani at ISKCON Kharghar (Sri Sri Radha Madan Mohanji Temple), its Vedic initiatives, and the official May 2026 launch.",
      },
      { property: "og:title", content: "Origin & Spiritual Roots — Krishna Sanjeevani" },
      {
        property: "og:description",
        content:
          "Rooted in ISKCON Kharghar's temple community and Vedic wisdom. Launched by the Hon'ble Governor of Maharashtra in May 2026.",
      },
    ],
  }),
  component: OriginPage,
});

function OriginPage() {
  const audio = useVerseAudio();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const galleryImages = [
    {
      src: templeSunriseImg,
      title: "Sri Sri Radha Madan Mohanji Altar",
      caption: "The beautiful main altar at ISKCON Kharghar during morning darshan.",
      source: "Official ISKCON Navi Mumbai Daily Darshan Portal",
    },
    {
      src: inaugurationImg,
      title: "Holistic Health Launch (30 May 2026)",
      caption:
        "Hon'ble Governor of Maharashtra Shri Jishnu Dev Varma launching Krishna Sanjeevani.",
      source: "Official Maharashtra Governor Media Release",
    },
    {
      src: prabhupadaImg,
      title: "Founder-Acharya Srila Prabhupada",
      caption:
        "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada who brought Vedic chanting to the world.",
      source: "ISKCON Archives",
    },
    {
      src: chaitanyaImg,
      title: "Sri Chaitanya Mahaprabhu Representation",
      caption: "The pioneer of the 16th-century congregational chanting movement (Sankirtana).",
      source: "Temple Art Collections",
    },
    {
      src: meditationImg,
      title: "Mantra Meditation & Sound Sanctuary",
      caption: "Quiet space inside the temple for prayerful chanting and auditory rejuvenation.",
      source: "ISKCON Kharghar Galleries",
    },
    {
      src: soundVibrationImg,
      title: "Vedic Science Convergence",
      caption: "Visualizing the scientific and spiritual correlation of sonic frequencies.",
      source: "Bhaktivedanta College of Vedic Education Studies",
    },
  ];

  const activeImage = (galleryImages[activeImageIdx] || galleryImages[0])!;

  const handleOpenLightbox = (idx: number) => {
    setActiveImageIdx(idx);
    setLightboxOpen(true);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const timelineSteps = [
    {
      title: "Śrī Caitanya Mahāprabhu",
      period: "15th – 16th Century",
      desc: "Inaugurated the congregational chanting movement (Sankirtana), explaining that the Holy Name of Krishna is the supreme purificatory medicine (Ceto-darpaṇa-mārjanam) for the heart.",
    },
    {
      title: "Gaudiya Vaishnava Sampradaya",
      period: "Lineage Continuity",
      desc: "Preserved the systematic science of devotional sound vibration through generations of spiritual teachers in India.",
    },
    {
      title: "Srila Bhaktisiddhanta Sarasvati",
      period: "Early 20th Century",
      desc: "Spearheaded the propagation of Vedic teachings and urged his disciples to distribute spiritual sound vibration globally.",
    },
    {
      title: "Srila Prabhupada & ISKCON",
      period: "1966 — Global Expansion",
      desc: "A.C. Bhaktivedanta Swami Prabhupada traveled west at age 69, establishing ISKCON and introducing the chanting of the Hare Krishna Mahamantra as a universal therapeutic tool for modern society.",
    },
    {
      title: "ISKCON Kharghar Temple",
      period: "2025 — Local Heritage",
      desc: "The 8-acre Sri Sri Radha Madan Mohanji Temple was inaugurated in Navi Mumbai, acting as a regional beacon of Vedic education, culture, and social welfare.",
    },
    {
      title: "Krishna Sanjeevani",
      period: "2026 — Present",
      desc: "Launched at ISKCON Kharghar, merging traditional raga chikitsa with spiritual chanting to support holistic oncology care.",
    },
  ];

  const initiatives = [
    {
      title: "Bhaktivedanta College of Vedic Education",
      desc: "Conducts regular scriptural courses (Bhagavad-gita, Upanishads) and hosts seminars connecting ancient wisdom with modern daily challenges.",
    },
    {
      title: "Bhaktivedanta Ayurvedic Healing Centre",
      desc: "Utilizes authentic Ayurvedic treatments, herbal medicine, and biological rhythm therapies to restore humors (Vata, Pitta, Kapha) and promote health.",
    },
    {
      title: "Bhaktivedanta International Guesthouse",
      desc: "Provides comfortable deluxe rooms, suite accommodations, and peaceful surroundings for pilgrims visiting Navi Mumbai.",
    },
    {
      title: "Govinda's Pure Vegetarian Restaurant",
      desc: "Serves pure lacto-vegetarian sanctified food (prasadam) prepared with standards of cleanliness and health according to scriptural guidance.",
    },
    {
      title: "Ahimsa Mechanical Elephant Initiative",
      desc: "Pioneered animal welfare in 2025 as the first religious institute in Maharashtra to use an automated mechanical elephant for temple ceremonies.",
    },
    {
      title: "Daily Darshan & Community Care",
      desc: "Gathers hundreds of citizens daily for spiritual worship, food distribution programs, and music therapy workshops.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      <VerseMiniPlayer audio={audio} />
      <VersePlayerModal audio={audio} />
      <HomeNavbar />

      <main id="main-content" className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-surface via-background to-background border-b border-border overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cat-light text-cat text-xs font-semibold font-sans tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sacred Lineage & Institutional Roots</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-foreground leading-tight">
              The Spiritual Origin
            </h1>
            <p className="text-lg sm:text-xl font-serif text-cat max-w-3xl mx-auto italic font-medium">
              ISKCON Kharghar — Sri Sri Radha Madan Mohanji Temple
            </p>

            <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift max-w-4xl mx-auto mt-10">
              <div className="aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-background">
                <img
                  src={templeSunriseImg}
                  alt="ISKCON Kharghar Temple Deities"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 text-white text-xs font-sans tracking-wide bg-black/40 px-3 py-1 rounded-full">
                Image: Sri Sri Radha Madan Mohanji Deity Altar, ISKCON Kharghar
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: About Temple */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <h2 className="text-3xl font-bold font-serif text-foreground leading-snug">
                  Sri Sri Radha Madan Mohanji Temple
                </h2>
                <div className="h-0.5 w-16 bg-cat rounded-full" />
                <p className="text-foreground/90 font-sans text-sm sm:text-base leading-relaxed">
                  Situated on an <strong>8-acre campus</strong> at the foothills of the Sahyadri
                  Hills in Kharghar, Navi Mumbai, the temple is an exquisite center of cultural and
                  Vedic education. The temple represents a harmonious blend of traditional Vedic
                  architectural details and modern structures.
                </p>
                <p className="text-foreground/90 font-sans text-sm sm:text-base leading-relaxed">
                  The new temple complex underwent its grand <em>Maha Lokarpan</em> (inauguration)
                  on
                  <strong> January 15, 2025</strong>, by the Honorable Prime Minister of India, Shri
                  Narendra Modi, marking it as a landmark sanctuary for spiritual tourism, deep
                  devotional study, and community welfare.
                </p>
              </div>
              <div className="md:col-span-5 rounded-2xl bg-surface border border-border p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-2.5 text-cat">
                  <Building className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest font-sans">
                    Campus Facilities
                  </span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-foreground/90 font-sans">
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cat mt-2 shrink-0" />
                    <span>Grand Temple Dome Sanctuary</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cat mt-2 shrink-0" />
                    <span>Glory of Maharashtra Cultural Centre</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cat mt-2 shrink-0" />
                    <span>Bhaktivedanta College of Vedic Education (BCVE)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cat mt-2 shrink-0" />
                    <span>Bhaktivedanta Ayurvedic Healing and Research Centre</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cat mt-2 shrink-0" />
                    <span>International Guest House & Govinda's Prasadam hall</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Deities */}
        <section className="py-20 bg-surface border-t border-b border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cat">
                Presiding Deities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
                Sri Sri Radha Madan Mohanji
              </h2>
            </div>
            <p className="text-foreground/90 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Lord Krishna is worshiped here in His beautiful form as <strong>Madan Mohan</strong>
              (the conqueror of Cupid's mind), standing alongside His eternal consort Srimati
              Radharani. The temple also hosts beautifully dressed altars for{" "}
              <strong>Sri Sri Gaura Nitai</strong> (Lord Chaitanya and Lord Nityananda) and{" "}
              <strong>Sri Sri Sita Rama Lakshmana Hanuman</strong>, attracting thousands of pilgrims
              for daily darshan.
            </p>
          </div>
        </section>

        {/* Section 3: Interactive Gallery */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-serif text-foreground">
                A Glimpse of ISKCON Kharghar
              </h2>
              <p className="text-muted-foreground text-sm font-sans">
                Click on any photograph to view a larger image and its official context.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenLightbox(idx)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-soft bg-surface hover:border-cat/40 hover:shadow-lift transition-all duration-300"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-background relative">
                    <img
                      src={img.src}
                      alt={img.title}
                      className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-serif font-bold text-foreground group-hover:text-cat transition-colors">
                      {img.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-sans line-clamp-1">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Lineage Timeline */}
        <section className="py-20 bg-surface border-t border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cat">
                Vedic Continuity
              </span>
              <h2 className="text-3xl font-bold font-serif text-foreground">
                Spiritual Lineage & Roots
              </h2>
              <p className="text-muted-foreground text-sm font-sans max-w-xl mx-auto mt-2">
                Tracing the historical lineage that connects the 16th-century congregational kirtan
                movement to modern sound therapy.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-cat/30 ml-4 sm:ml-6 md:ml-32 space-y-12">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative pl-6 sm:pl-8">
                  {/* Circle Indicator */}
                  <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-cat text-cat-foreground shadow-lift border border-background">
                    <span className="h-2 w-2 bg-background rounded-full" />
                  </span>

                  {/* Desktop Period Tag */}
                  <div className="hidden md:block absolute -left-[140px] top-1 w-28 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-cat">
                    {step.period}
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="md:hidden text-xs font-bold uppercase tracking-wider text-cat mb-1">
                      {step.period}
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans max-w-2xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Connection to Krishna Sanjeevani */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-cat-light text-cat mb-2">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-foreground">
              From Spiritual Tradition to Krishna Sanjeevani
            </h2>
            <div className="h-0.5 w-16 bg-cat mx-auto rounded-full" />
            <div className="text-foreground/90 font-sans text-sm sm:text-base leading-relaxed space-y-4 max-w-3xl mx-auto text-left">
              <p>
                On <strong>May 30, 2026</strong>, the{" "}
                <strong>Hon’ble Governor of Maharashtra, Shri Jishnu Dev Varma</strong>, inaugurated
                the <strong>Holistic Cancer Healing Retreat (HCHR)</strong> at the ISKCON temple
                campus in Kharghar, Navi Mumbai. Created by the{" "}
                <em>Bhaktivedanta College of Vedic Education (BCVE)</em> and the{" "}
                <em>Bhaktivedanta Ayurvedic Healing and Research Centre</em>, the retreat is
                designed to support the mental, emotional, and spiritual well-being of cancer
                patients and their families.
              </p>
              <p>
                Alongside the retreat, the Governor officially launched{" "}
                <strong>"Krishna Sanjeevani — The Divine Music Medicine"</strong>. Compositionally
                created by classical musician Shashank Katti, this therapy integrates classical
                microtonal ragas (calibrated to Ayurvedic biological rhythms) and spiritual mantra
                vibrations to cultivate Sattva, reduce systemic anxiety, and foster deep mental
                resilience for patients.
              </p>
              <p className="italic text-cat font-medium border-l-4 border-cat pl-4 mt-4 bg-cat-light/20 py-2">
                Disclaimer: Krishna Sanjeevani is a complementary holistic sound therapy designed to
                enhance emotional and somatic coping mechanisms. It operates alongside and in
                support of conventional medical oncological care, never as a replacement.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Institutions & Initiatives */}
        <section className="py-20 bg-surface border-t border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cat">
                Cultural & Medical Outreach
              </span>
              <h2 className="text-3xl font-bold font-serif text-foreground">Temple Initiatives</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-background shadow-soft space-y-3 hover:border-cat/45 hover:shadow-lift transition-all duration-300"
                >
                  <h3 className="text-base font-serif font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Location & Visit details */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-cat-light text-cat">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-foreground">Visit ISKCON Kharghar</h2>

            <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-soft text-left space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                  Official Address
                </span>
                <p className="text-sm sm:text-base font-serif font-semibold text-foreground">
                  Hare Krishna Land, Sector 23, Central Park Road, Opposite Golf Course, Kharghar,
                  Navi Mumbai, Maharashtra — 410210, India
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/80 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-cat">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
                      Morning Timings
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    4:30 AM – 1:00 PM <br />
                    (Mangala Aarti: 4:45 AM, Darshan: 7:15 AM)
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-cat">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
                      Evening Timings
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    4:15 PM – 9:00 PM <br />
                    (Gaura Aarti: 7:00 PM, Shayan Aarti: 8:30 PM)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://iskcon-navimumbai.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-2 rounded-btn bg-cat px-7 py-3 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Sources & References section */}
        <section className="py-8 bg-surface border-t border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
              Sources & References
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cat font-sans">
              <a
                href="https://iskcon-navimumbai.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                Official ISKCON Navi Mumbai Portal <ExternalLink className="h-3 w-3" />
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a
                href="https://iskcon.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                Official ISKCON Global Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-between p-4 select-none animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Top Control bar */}
          <div className="flex items-center justify-between text-white w-full max-w-5xl mx-auto py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 font-sans">
              Image {activeImageIdx + 1} of {galleryImages.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Image Slider Container */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-5xl mx-auto">
            {/* Prev Trigger */}
            <button
              onClick={handlePrev}
              className="absolute left-0 sm:left-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Visual */}
            <div
              className="relative max-h-[70vh] max-w-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage.src}
                alt={activeImage.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-lift border border-white/10"
              />
            </div>

            {/* Next Trigger */}
            <button
              onClick={handleNext}
              className="absolute right-0 sm:right-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Caption bar */}
          <div
            className="w-full max-w-3xl mx-auto bg-black/80 border border-white/10 rounded-2xl p-4 sm:p-5 text-white space-y-1 text-center mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              {activeImage.title}
            </h4>
            <p className="text-xs text-white/90 leading-relaxed font-sans">{activeImage.caption}</p>
            <span className="block text-[10px] text-white/50 tracking-wider font-sans pt-1">
              Source: {activeImage.source}
            </span>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}
