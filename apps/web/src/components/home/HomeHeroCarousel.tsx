import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { HERO_SLIDES } from "@/lib/home-data";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Sparkles } from "lucide-react";

export function HomeHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeSlide = HERO_SLIDES[current];

  return (
    <section
      id="top"
      className="relative h-[560px] sm:h-[620px] lg:h-[680px] w-full flex items-center justify-center overflow-hidden bg-stone-950 text-white"
      role="banner"
      aria-label="Hero Carousel"
    >
      {/* Background Slides with High Image Visibility & Luminous Color */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 scale-105" : "opacity-0 z-0 scale-100"
            }`}
            style={{
              transition: "opacity 1000ms ease-in-out, transform 3500ms ease-out",
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover filter brightness-[0.93] contrast-[1.04] saturate-[1.03]"
              style={{ objectPosition: slide.objectPosition || "center" }}
            />
            {/* Gentle Light Scrim to Preserve Rich Artwork Visibility While Maintaining Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/35" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        );
      })}

      {/* Decorative Top and Bottom Borders */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/15 z-20" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/15 z-20" />

      {/* Direct Text Overlay with Enhanced Text-Shadow Protection */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center pt-6">
        {/* Category / Subtitle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/30 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200 shadow-md mb-4 animate-rise">
          <Sparkles className="h-3 w-3 text-amber-200" />
          <span>{activeSlide.badge}</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-[1.15] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] max-w-3xl">
          {activeSlide.title}
        </h1>

        <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg font-serif italic text-amber-200 font-medium tracking-wide max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
          {activeSlide.subtitle}
        </p>

        <p className="mt-3.5 text-xs sm:text-sm md:text-base text-stone-100 leading-relaxed font-sans max-w-2xl drop-shadow-[0_1px_5px_rgba(0,0,0,0.85)] font-normal">
          {activeSlide.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to={activeSlide.primaryCtaLink as any}
            className="press inline-flex items-center gap-2 rounded-btn bg-cat hover:bg-cat/90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lift transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{activeSlide.primaryCtaText}</span>
          </Link>

          <Link
            to={activeSlide.secondaryCtaLink as any}
            className="press inline-flex items-center gap-2 rounded-btn border border-white/35 bg-black/40 backdrop-blur-md px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-black/60 hover:border-white/50 transition-all shadow-md"
          >
            <span>{activeSlide.secondaryCtaText}</span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-200" />
          </Link>
        </div>

        {/* Slide Indicators & Controls */}
        <div
          className="mt-8 sm:mt-10 flex items-center gap-4 z-30"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            onClick={prevSlide}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/50 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/40 transition-all shadow-lift"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/25 shadow-soft">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? "w-6 bg-amber-300" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/50 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/40 transition-all shadow-lift"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
