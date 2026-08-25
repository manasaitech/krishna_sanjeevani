import { createFileRoute } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import { Scale, Sparkles } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Terms and Conditions governing the use of the Krishna Sanjeevani therapeutic raga streaming platform.",
      },
      { property: "og:title", content: "Terms of Service — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Terms and Conditions governing the use of our therapeutic audio platform.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const audio = useVerseAudio();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      <VerseMiniPlayer audio={audio} />
      <VersePlayerModal audio={audio} />
      <HomeNavbar />

      <main id="main-content" className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm">
              <Scale className="h-3.5 w-3.5 text-cat" />
              <span>Legal Guidelines</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-lg mx-auto">
              Last updated: August 20, 2026. Please read these terms carefully before using our
              therapeutic sanctuary.
            </p>
          </div>

          {/* Legal Content Card */}
          <div className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-10 shadow-lift space-y-8 font-sans text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">1.</span> Acceptance of Terms
              </h2>
              <p>
                Welcome to Krishna Sanjeevani. By accessing or using our streaming services,
                website, and mobile application (collectively, the "Platform"), you agree to be
                bound by these Terms of Service. If you do not agree to these terms, please do not
                use the Platform.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">2.</span> Therapeutic Nature & Medical Disclaimer
              </h2>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                <strong>Important Notice:</strong> Krishna Sanjeevani offers traditional meditative,
                Vedic sound, and therapeutic classical musical compositions (Ragas) rooted in
                ancient Indian heritage. Our streams and contents are created for stress-relief,
                spiritual contemplation, emotional balance, sleep support, and general wellness.
                They do NOT constitute medical advice, diagnosis, or treatment. Always seek the
                advice of a physician or other qualified health providers with any questions
                regarding a medical condition.
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">3.</span> Account Registration & Security
              </h2>
              <p>
                To explore full-length therapeutic ragas and customize your listening experience,
                you are required to create an account. You are responsible for keeping your
                credentials confidential and for all activities that occur under your account. You
                agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">4.</span> Intellectual Property & Sacred Audio
              </h2>
              <p>
                All recordings, raga compositions, Sanskrit recitations, text, logos, custom player
                interfaces, and visual assets hosted on the Platform are protected by copyright,
                trademark, and intellectual property laws. Your registration grants you a limited,
                non-transferable, personal license to stream our therapeutic audio files for
                individual, non-commercial listening only. Any reproduction, distribution, public
                broadcasting, or commercial extraction of our audio assets is strictly prohibited.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">5.</span> Subscription Fees, Billing, & Donations
              </h2>
              <p>
                Certain premium tiers, curated listening pathways, or prenatal tracks may require
                active subscriptions or donations. All payments are processed securely through
                third-party services. Subscription renewals and cancellation terms will be detailed
                upon billing setup, and you may manage your preferences directly in your Account
                settings.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">6.</span> Prohibited Conduct
              </h2>
              <p>
                You agree not to engage in web scraping, reverse engineering, audio recording
                extraction, denial-of-service attempts, or any behaviors that undermine the
                performance, security, or spiritual integrity of the Platform.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">7.</span> Limitation of Liability
              </h2>
              <p>
                Krishna Sanjeevani is provided on an "as is" and "as available" basis. To the
                maximum extent permitted by law, we disclaim all warranties, and shall not be held
                liable for any damages, losses, or physiological/mental disturbances arising from
                your access to or reliance on the therapeutic soundtracks.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">8.</span> Modifications to Terms
              </h2>
              <p>
                We reserve the right to revise these Terms of Service at any time. When updates are
                published, the "Last updated" date at the top will be updated. Your continued use of
                the Platform after revisions implies acceptance of the new terms.
              </p>
            </section>

            <div className="border-t border-border/80 pt-6 flex items-center gap-2 text-xs text-cat font-serif italic justify-center">
              <Sparkles className="h-4 w-4 text-cat" />
              <span>Harer Nāma Harer Nāma Harer Nāmaiva Kevalam</span>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
