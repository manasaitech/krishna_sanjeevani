import { ShieldAlert, BookCheck } from "lucide-react";

export function ResearchNote() {
  return (
    <section className="py-16 bg-surface border-y border-border/70 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-background border border-border p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start gap-5">
          <div className="h-10 w-10 rounded-xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat shrink-0 mt-1">
            <BookCheck className="h-5 w-5" />
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
            <h3 className="text-base font-bold font-serif text-foreground">
              Research Context & Epistemic Boundaries
            </h3>
            <p>
              This document outlines the theoretical and philosophical framework of sound therapy as
              preserved in classical Indian knowledge traditions (including the{" "}
              <em>Caraka Saṁhitā, Suśruta Saṁhitā, Nāṭyaśāstra,</em> and Gāndharva Veda).
            </p>
            <p>
              Krishna Sanjeevani presents these historical paradigms for educational and meditative
              exploration. They are intended as an adjunct to holistic emotional wellbeing and
              contemplative balance, rather than as diagnostic or pharmacological substitutes for
              licensed clinical care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
