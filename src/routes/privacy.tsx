import { createFileRoute } from "@tanstack/react-router";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import { ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Privacy Policy detailing how Krishna Sanjeevani collects, protects, and handles your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Privacy Policy detailing our commitment to protecting your personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
              <ShieldAlert className="h-3.5 w-3.5 text-cat" />
              <span>Data Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-lg mx-auto">
              Last updated: August 20, 2026. We are committed to honoring and safeguarding your personal sanctuary and data.
            </p>
          </div>

          {/* Privacy Content Card */}
          <div className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-10 shadow-lift space-y-8 font-sans text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">1.</span> Information We Collect
              </h2>
              <p>
                To provide a personalized, calm therapeutic listening environment, we collect minimal and 
                purposeful personal information. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>
                  <strong>Account Information:</strong> Your name, email address, password, and registration 
                  preferences (e.g. category interests like sleep, focus, devotional, or pregnancy care).
                </li>
                <li>
                  <strong>Listening Behavior:</strong> Track playback history, favorite ragas, and completed 
                  sessions, which helps compile your personal wellness journey stats.
                </li>
                <li>
                  <strong>Device and Usage Info:</strong> IP address, browser type, operating system, and basic 
                  interactions to optimize audio streaming quality and prevent service abuse.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">2.</span> How We Use Your Information
              </h2>
              <p>
                We use the collected information strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Deliver uninterrupted, adaptive therapeutic audio streaming.</li>
                <li>Maintain your personal history, recently played files, and favorites.</li>
                <li>Analyze aggregate usage patterns to enhance raga quality and curate new playlists.</li>
                <li>Send account-related notifications, security updates, and voluntary spiritual newsletters.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">3.</span> Data Sharing & Third Parties
              </h2>
              <p>
                We value your trust and do not sell, rent, trade, or distribute your personal details to 
                third-party marketers. We only share information with trusted operational service providers 
                under strict privacy conditions to process secure payments (like Stripe) and maintain 
                our cloud hosting infrastructure.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">4.</span> Cookies and Tracking
              </h2>
              <p>
                We utilize essential cookies and secure local storage to keep you logged in and persist your 
                volume, player settings, and aesthetic preferences. You can disable cookies via your 
                browser settings, though some streaming features may not function properly.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">5.</span> Data Security
              </h2>
              <p>
                We implement robust security measures, including HTTPS encryption (SSL/TLS) for all data 
                transmissions, to protect your details against unauthorized access, loss, or disclosure. 
                However, please remember that no transmission method over the internet is 100% secure.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">6.</span> Your Rights & Control
              </h2>
              <p>
                You retain full control over your data. You may access, correct, or permanently delete your 
                account and personal history at any time by visiting your Profile page or contacting our support 
                team.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">7.</span> Children's Privacy
              </h2>
              <p>
                While the Platform is safe for all ages and features soothing melodies for children's sleep 
                and pregnancy care, we do not intentionally collect data from children under 13 without parental 
                consent.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                <span className="text-cat">8.</span> Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal 
                sanctuary details, please reach out to us at <a href="mailto:support@krishnasanjeevani.com" className="text-cat hover:underline">support@krishnasanjeevani.com</a>.
              </p>
            </section>

            <div className="border-t border-border/80 pt-6 flex items-center gap-2 text-xs text-cat font-serif italic justify-center">
              <Sparkles className="h-4 w-4 text-cat" />
              <span>Jīva Jāgo Jīva Jāgo Gauracānda Bole</span>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
