import { useEffect, useState, useRef } from "react";
import bgImg from "@/assets/flash-bg.webp";
import kulashekaraHeroImg from "@/assets/kulashekara-cutout.webp";
import logoWithoutText from "@/assets/logo-without-text.webp";
import type { VerseAudioState } from "@/lib/use-verse-audio";

interface OpeningExperienceProps {
  audio: VerseAudioState;
  onComplete: () => void;
}

export function OpeningExperience({ audio, onComplete }: OpeningExperienceProps) {
  const [animateStage, setAnimateStage] = useState<0 | 1 | 2>(0);
  const [isInteracted, setIsInteracted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Dynamically load elegant classic serif fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);

    // Entrance Animation Sequence
    // 1. Mount immediately shows the background landscape.
    // 2. At 450ms, King Kulasekhara's transparent PNG pops in.
    const t1 = setTimeout(() => {
      setAnimateStage(1);
    }, 450);

    // 3. At 1250ms, the headers, titles, dividers, button, and footer fade in.
    const t2 = setTimeout(() => {
      setAnimateStage(2);
    }, 1250);

    return () => {
      document.head.removeChild(link);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleInteraction = () => {
    if (isFadingOut || isInteracted) return;

    // Directly trigger audio playback within the user interaction context (browser unlock)
    try {
      audio.play();
    } catch (err) {
      console.warn("Audio playback initialization failed:", err);
    }

    // Set dismissed state in session storage so it is not shown again in this session
    sessionStorage.setItem("opening_experience_dismissed", "true");

    // Trigger visual interaction animations
    setIsInteracted(true);

    // Wait a brief moment for the button illumination / glow expansion, then fade out
    setTimeout(() => {
      setIsFadingOut(true);
    }, 200);

    // Completely unmount after visual transition completes
    setTimeout(() => {
      setIsDismissed(true);
      onCompleteRef.current();
    }, 1150); // 200ms delay + 950ms fade out transition
  };

  if (isDismissed) return null;

  return (
    <div
      onClick={handleInteraction}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-10 px-6 overflow-hidden select-none cursor-pointer transition-all duration-[950ms] ease-in-out ${
        isFadingOut ? "opacity-0 scale-[1.015] pointer-events-none" : "opacity-100 scale-100"
      }`}
      role="button"
      aria-label="Enter Krishna Sanjeevani Application"
    >
      {/* Styles for breathing animations and fonts */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(197, 160, 89, 0.2);
            border-color: rgba(197, 160, 89, 0.45);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 25px rgba(197, 160, 89, 0.5);
            border-color: rgba(197, 160, 89, 0.75);
          }
        }
        .font-cinzel {
          font-family: 'Cinzel', Georgia, serif;
        }
        .font-lora {
          font-family: 'Lora', Georgia, serif;
        }
      `,
        }}
      />

      {/* 1. Full Bleed Background Landscape (Always Visible) */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bgImg})` }}
      />

      {/* 2. Top Gold Lotus Logo and Header */}
      <div
        className={`flex flex-col items-center gap-1.5 z-10 pointer-events-none mt-4 transition-all duration-[1000ms] ${
          animateStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {/* Actual platform logo */}
        <img
          src={logoWithoutText}
          alt="Krishna Sanjeevani Logo"
          className="h-8 sm:h-10 object-contain drop-shadow-sm select-none pointer-events-none"
        />

        {/* Title with Gold Lines and Dots */}
        <div className="flex items-center gap-3 sm:gap-4 text-[#C5A059] mt-1.5">
          <div className="flex items-center">
            <div className="h-[3px] w-[3px] rounded-full bg-[#C5A059]" />
            <div className="h-[0.5px] w-6 sm:w-12 bg-[#C5A059]/60" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#4D0F1B] font-sans">
            Krishna Sanjeevani
          </span>
          <div className="flex items-center">
            <div className="h-[0.5px] w-6 sm:w-12 bg-[#C5A059]/60" />
            <div className="h-[3px] w-[3px] rounded-full bg-[#C5A059]" />
          </div>
        </div>
      </div>

      {/* 3. Central Character Placement overlaying background sun/mandala */}
      <div className="relative flex flex-col items-center justify-center flex-1 w-full max-h-[48vh] mt-2 mb-2 z-10">
        {/* Dynamic expanding aura ring on interaction */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.18)_0%,transparent_70%)] blur-md pointer-events-none z-0 transition-all duration-[900ms] ${
            isInteracted ? "scale-[1.55] opacity-0" : "scale-100 opacity-100"
          }`}
          style={{ width: "300px", height: "300px" }}
        />

        {/* Character Portrait (Pops in at Stage 1) */}
        <div
          className={`relative z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
            animateStage >= 1
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-6"
          }`}
        >
          <img
            src={kulashekaraHeroImg}
            alt="King Kulasekhara Alvar"
            className="h-[34vh] sm:h-[42vh] max-h-[360px] object-contain drop-shadow-[0_12px_24px_rgba(77,15,27,0.1)]"
          />
        </div>
      </div>

      {/* 4. Text, Divider and CTA Section (at the bottom half) */}
      <div className="flex flex-col items-center w-full max-w-lg text-center gap-6 z-10">
        {/* Main Text Content (Fades in at Stage 2) */}
        <div
          className={`flex flex-col items-center text-center gap-1 sm:gap-1.5 px-4 pointer-events-none transition-all duration-[1000ms] ${
            animateStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="text-sm sm:text-base font-lora italic text-[#4D0F1B] tracking-wide">
            Immerse into the world of
          </span>
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-cinzel font-bold text-[#4D0F1B] tracking-wider uppercase leading-tight">
            Divine Therapeutic Music
          </h1>

          {/* Decorative Gold Diamond Divider */}
          <div className="flex items-center justify-center text-[#C5A059] mt-2 opacity-70">
            <div className="h-[0.5px] w-6 bg-[#C5A059]" />
            <svg viewBox="0 0 100 100" className="w-3 h-3 mx-1.5 fill-current">
              <path d="M50 20 C45 35 30 45 10 50 C30 55 45 65 50 80 C55 65 70 55 90 50 C70 45 55 35 50 20 Z" />
            </svg>
            <div className="h-[0.5px] w-6 bg-[#C5A059]" />
          </div>
        </div>

        {/* CTA Button and Footer texts (Fades in at Stage 2) */}
        <div
          className={`flex flex-col items-center gap-4.5 w-full max-w-xs mb-4 transition-all duration-[1000ms] ${
            animateStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            className={`px-12 py-3 rounded-full bg-[#4D0F1B] text-[#FAF8F4] font-cinzel tracking-widest text-[11px] uppercase font-semibold border border-[#C5A059]/80 shadow-md transition-all duration-300 ${
              isInteracted
                ? "bg-[#6B1B29] border-[#faf8f4] scale-95 shadow-[0_0_20px_rgba(250,248,244,0.5)] brightness-110"
                : "hover:scale-[1.025]"
            }`}
            style={{ animation: isInteracted ? "none" : "breathing 3.5s ease-in-out infinite" }}
            onClick={(e) => {
              // Let click bubble to container context for immediate audio release
              e.stopPropagation();
              handleInteraction();
            }}
          >
            Click Here
          </button>

          <div className="text-center flex flex-col items-center gap-1.5 mt-1">
            <p className="text-[10px] sm:text-[11px] text-[#7C7A85] font-lora italic tracking-wide">
              Tap anywhere to begin your sacred journey
            </p>

            {/* Subtle gold decoration divider */}
            <div className="flex items-center justify-center text-[#C5A059] opacity-55 mt-0.5">
              <div className="h-[0.5px] w-4 bg-[#C5A059]" />
              <svg viewBox="0 0 4 4" className="w-1 h-1 text-[#C5A059] mx-1.5 fill-current">
                <circle cx="2" cy="2" r="1.5" />
              </svg>
              <div className="h-[0.5px] w-4 bg-[#C5A059]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
