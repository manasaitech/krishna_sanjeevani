import { useEffect, useState, useRef } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import type { VerseAudioState } from "@/lib/use-verse-audio";

import bgImg from "@/assets/flash-bg.webp";
import kulashekaraImg from "@/assets/kulashekara-cutout.webp";
import prabhupadaImg from "@/assets/prabhupada.webp";
import goswamiImg from "@/assets/goswami.webp";
import logoWithoutText from "@/assets/logo-without-text.webp";

interface OpeningExperienceProps {
  audio?: VerseAudioState | undefined;
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "King Kulasekhara Alvar",
    role: "Inspiration of Mukundamālā Stotra",
    image: kulashekaraImg,
    isCircular: false,
  },
  {
    title: "Srila Prabhupada",
    role: "Founder-Acharya of ISKCON",
    image: prabhupadaImg,
    isCircular: false,
  },
  {
    title: "HH Gopal Krishna Goswami Maharaj",
    role: "Beloved Disciple of Srila Prabhupada & Visionary Leader",
    image: goswamiImg,
    isCircular: true,
  },
];

export function OpeningExperience({ audio, onComplete }: OpeningExperienceProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const dismiss = () => {
    if (isDismissing || isDismissed) return;
    
    // Start audio playback on user interaction / dismissal
    if (audio) {
      audio.play();
    }

    setIsDismissing(true);
    setTimeout(() => {
      setIsDismissed(true);
      onCompleteRef.current();
    }, 600);
  };

  useEffect(() => {
    // Slide 1 -> Slide 2 at 2.2s
    const t1 = setTimeout(() => {
      setCurrentSlide(1);
    }, 2200);

    // Slide 2 -> Slide 3 at 4.4s
    const t2 = setTimeout(() => {
      setCurrentSlide(2);
    }, 4400);

    // Automatically transition to landing page at 6.6s
    const t3 = setTimeout(() => {
      dismiss();
    }, 6600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (isDismissed) return null;

  const currentData = SLIDES[currentSlide] ?? SLIDES[0];

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center overflow-hidden transition-all duration-600 ease-out select-none cursor-pointer ${
        isDismissing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#FAF5EC",
      }}
      role="region"
      aria-label="Opening Dedication Splash Screen"
    >
      {/* Top Action: Enter Website Button */}
      <div className="absolute top-5 right-5 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-amber-900/15 px-4 py-1.5 text-xs font-semibold text-[#4D0F1B] hover:bg-white transition-all shadow-sm cursor-pointer"
        >
          <span>Enter Website</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#C9A84C]" />
        </button>
      </div>

      {/* 1. Top Header */}
      <div className="pt-8 sm:pt-10 flex flex-col items-center z-10 animate-fade-in">
        <img
          src={logoWithoutText}
          alt="Krishna Sanjeevani Logo"
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-sm"
        />
        <div className="flex items-center gap-2.5 mt-2.5">
          <div className="h-px w-9 bg-[#C9A84C]/50" />
          <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.25em] uppercase text-[#4D0F1B] font-sans">
            KRISHNA SANJEEVANI
          </span>
          <div className="h-px w-9 bg-[#C9A84C]/50" />
        </div>
      </div>

      {/* 2. Central Character with Breathing Aura Ring */}
      <div className="relative flex-1 w-full flex items-center justify-center max-h-[50vh] sm:max-h-[55vh] z-10 px-4">
        {/* Breathing Gold Aura */}
        <div className="absolute h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-[#C9A84C]/15 blur-xl animate-pulse pointer-events-none" />

        {/* Slides switcher */}
        <div className="relative h-full w-full flex items-center justify-center">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.title}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {slide.isCircular ? (
                  <div className="h-48 w-48 sm:h-60 sm:w-60 rounded-full border-4 border-[#C9A84C] bg-white overflow-hidden shadow-2xl flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full max-h-[42vh] sm:max-h-[48vh] flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="max-h-full max-w-[85vw] sm:max-w-md object-contain drop-shadow-md"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Dedication Details */}
      <div className="pb-8 sm:pb-10 w-full max-w-lg px-6 flex flex-col items-center text-center z-10">
        <span className="text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-sans">
          DEDICATED TO
        </span>
        <h2 className="mt-1.5 text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#4D0F1B] tracking-tight transition-all duration-500">
          {currentData.title}
        </h2>
        <div className="h-px w-16 bg-[#C9A84C]/50 my-2.5" />
        <p className="text-xs sm:text-sm italic font-serif text-[#8A7963] max-w-md transition-all duration-500">
          {currentData.role}
        </p>

        {/* Slide progress indicators & Tap anywhere hint */}
        <div className="flex items-center gap-1.5 mt-4">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-6 bg-[#C9A84C]"
                  : "w-1.5 bg-[#C9A84C]/30 hover:bg-[#C9A84C]/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#4D0F1B]/70 font-medium">
          <Volume2 className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span>Click anywhere to enter & start listening</span>
        </div>
      </div>
    </div>
  );
}
