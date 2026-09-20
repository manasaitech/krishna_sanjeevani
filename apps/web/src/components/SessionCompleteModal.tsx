import React, { useState, useEffect } from "react";
import { Sparkles, X, CheckCircle2, Loader2, HeartHandshake } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";
import { getActiveMode } from "@/core/mode";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  track?: {
    id?: string;
    title?: string;
    duration?: number;
    surawaliId?: string;
    programId?: string;
  } | null;
  durationSeconds?: number;
}

const moods = [
  { emoji: "🌤️", label: "Calmer" },
  { emoji: "😌", label: "Rested" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🌧️", label: "Heavy" },
];

export function SessionCompleteModal({
  isOpen,
  onClose,
  track,
  durationSeconds,
}: SessionCompleteModalProps) {
  const { current, user } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [mood, setMood] = useState<string>("Calmer");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Active track information fallback
  const activeTrack = track || current;

  // Calculate dynamic duration in minutes
  const totalSeconds = durationSeconds || (activeTrack?.duration ? activeTrack.duration : 18 * 60);
  const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setMood("Calmer");
      setNotes("");
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;

    setSubmitting(true);
    try {
      const mode = getActiveMode() || "surawali";
      const trackId = activeTrack?.id;
      const surawaliId = (activeTrack as any)?.surawaliId || (trackId?.startsWith("sur_") ? trackId : undefined);
      const programId = (activeTrack as any)?.programId;

      const userName = (user as any)?.name || (user as any)?.fullName || (user as any)?.email?.split("@")[0] || "Astro Sutra AI";
      const userEmail = (user as any)?.email || "admin@krishnasanjeevani.org";
      const userId = (user as any)?.id || "user_listener";
      const trackTitle = activeTrack?.title || (surawaliId ? `Surāwali ${surawaliId}` : "Therapeutic Audio");

      await api.feedback.submit({
        trackId: trackId || undefined,
        surawaliId: surawaliId || undefined,
        programId: programId || undefined,
        trackTitle,
        userName,
        userEmail,
        userId,
        mode,
        rating,
        mood,
        notes: notes.trim() || undefined,
        sessionDuration: totalSeconds,
      });

      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      console.warn("Feedback submission notice:", err);
      // Even if offline/network fails, show graceful completion so user experience is not blocked
      setSubmitted(true);
      toast.info("Thank you for sharing your experience.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[420px] rounded-2xl border border-[#B88A2A]/30 bg-surface p-4 sm:p-5 shadow-lift animate-rise">
        {/* Dismiss 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="press absolute top-3.5 right-3.5 grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          /* ── Success Confirmation Screen ── */
          <div className="py-4 flex flex-col items-center text-center space-y-3 animate-scale-up">
            <div className="relative grid h-14 w-14 place-items-center">
              <span className="animate-breathe absolute inset-0 rounded-full bg-[#F7E6E7]" />
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#7C1C24] text-white shadow-lift">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-foreground">
                Session Complete
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Thank you for sharing your experience. May the restorative frequencies bring you lasting peace and harmony.
              </p>
            </div>

            <div className="pt-2 w-full">
              <button
                type="button"
                onClick={onClose}
                className="press w-full min-h-10 rounded-full bg-[#7C1C24] hover:bg-[#65151C] text-white text-xs font-bold shadow-md shadow-[#7C1C24]/20 transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          /* ── Feedback Form Screen ── */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Header / Aura Icon */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="relative grid h-12 w-12 place-items-center mb-1.5">
                <span className="animate-breathe absolute inset-0 rounded-full bg-[#F7E6E7]" />
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#7C1C24] text-white shadow-lift">
                  <Sparkles className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
              </div>
              <h2
                id="session-complete-title"
                className="font-serif text-lg font-bold text-foreground tracking-tight"
              >
                Session complete
              </h2>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {durationMinutes} min steady listening. Sit quietly before moving on.
              </p>
            </div>

            {/* Rate Today's Experience */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rate today's experience
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} out of 5 stars`}
                    aria-pressed={rating === n}
                    className={cn(
                      "press h-8.5 flex-1 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                      n <= rating
                        ? "border-[#7C1C24] bg-[#7C1C24] text-white shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:border-[#7C1C24]/40 hover:text-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* How do you feel? (Mood) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                How do you feel?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {moods.map((m) => {
                  const isSelected = mood === m.label;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m.label)}
                      aria-pressed={isSelected}
                      className={cn(
                        "press py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                        isSelected
                          ? "border-[#7C1C24] bg-[#F7E6E7] text-[#7C1C24] font-bold shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:border-[#7C1C24]/30"
                      )}
                    >
                      <span className="text-base leading-none" aria-hidden="true">
                        {m.emoji}
                      </span>
                      <span className="text-[10px] leading-tight">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label htmlFor="session-feedback-notes" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Notes <span className="font-normal text-muted-foreground/80 normal-case">(optional)</span>
              </label>
              <textarea
                id="session-feedback-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything you noticed during the session..."
                className="w-full resize-none rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#7C1C24] focus:ring-1 focus:ring-[#7C1C24]/30 focus:outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="press flex-1 min-h-9 rounded-full border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                Maybe later
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="press flex-2 min-h-9 rounded-full bg-[#7C1C24] hover:bg-[#65151C] text-white text-xs font-bold shadow-md shadow-[#7C1C24]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SessionCompleteModal;
