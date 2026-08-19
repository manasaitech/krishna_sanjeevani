import { Link } from "@tanstack/react-router";
import { LANDMARK_EVENT, inaugurationImg } from "@/lib/home-data";
import { Calendar, MapPin, Award, ArrowRight } from "lucide-react";

export function BeginningPreview() {
  return (
    <section id="the-beginning" className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-surface border border-border p-8 sm:p-12 lg:p-14 shadow-lift relative overflow-hidden">
          {/* Subtle Background Accent Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cat-light/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cat-light border border-cat/25 px-3.5 py-1 text-xs font-semibold text-cat uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  {LANDMARK_EVENT.date}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3.5 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-cat" />
                  {LANDMARK_EVENT.location}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground leading-tight">
                A Landmark Beginning
              </h2>

              <p className="text-base sm:text-lg font-serif italic text-cat font-medium">
                {LANDMARK_EVENT.title}
              </p>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
                {LANDMARK_EVENT.description}
              </p>

              <blockquote className="border-l-2 border-cat pl-4 py-1 text-sm font-serif italic text-foreground/80 bg-cat-light/30 rounded-r-xl">
                {LANDMARK_EVENT.quote}
              </blockquote>

              <div className="pt-2">
                <Link
                  to="/the-beginning"
                  className="press inline-flex items-center gap-2 rounded-btn bg-cat px-6 py-3 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
                >
                  <span>Read the Full Story</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Image Feature Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-lift bg-background aspect-[4/3] group">
                <img
                  src={inaugurationImg}
                  alt="Inauguration Ceremony"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-surface/95 backdrop-blur-md rounded-xl border border-border text-foreground shadow-soft">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cat">
                    <Award className="h-4 w-4 text-cat" />
                    <span>Holistic Cancer Healing Retreat Launch</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ISKCON Kharghar · May 30, 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
