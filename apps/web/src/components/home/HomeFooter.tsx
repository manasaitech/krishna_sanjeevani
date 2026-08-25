import { Link } from "@tanstack/react-router";
import logoWithoutText from "@/assets/logo-without-text.png";
import { Sparkles } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="bg-surface text-foreground border-t border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border/80">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-cat/30 bg-background flex items-center justify-center p-1.5 shadow-sm">
                <img
                  src={logoWithoutText}
                  alt="Krishna Sanjeevani"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold font-serif text-foreground block">
                  Krishna Sanjeevani
                </span>
                <span className="text-[10px] tracking-[0.16em] uppercase text-cat font-sans font-semibold block">
                  The Divine Therapeutic Music
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans max-w-sm">
              An amalgamation of Sur Sanjeevan and the divine Hare Krishna Mahamantra, bringing
              forward the healing heritage of Indian classical music, Ayurveda, and mantra
              meditation.
            </p>

            <div className="flex items-center gap-2 text-xs text-cat pt-1 font-serif italic">
              <Sparkles className="h-3.5 w-3.5 text-cat" />
              <span>Piba Manaḥ Śrī-Kṛṣṇa-Divyauṣadham</span>
            </div>
          </div>

          {/* Column 2: Public Navigation */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cat font-sans">
              Explore Pathways
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/inspiration"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Inspiration
                </Link>
              </li>
              <li>
                <Link
                  to="/vedic-science"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vedic Sound Science
                </Link>
              </li>
              <li>
                <Link
                  to="/the-beginning"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  A Landmark Beginning
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About the Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Team & Lineage
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Access & Authentication */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cat font-sans">
              Listening Sanctuary
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore Listening Experience
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Member Log In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Free Account
                </Link>
              </li>
            </ul>

            <div className="pt-3">
              <span className="text-[11px] text-muted-foreground block leading-tight">
                Inaugurated at ISKCON Kharghar, Navi Mumbai
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-muted-foreground font-sans">
          <p className="max-w-xl text-[11px] leading-relaxed">
            <strong>Disclaimer:</strong> Krishna Sanjeevani offers traditional meditative and
            therapeutic musical sequences rooted in classical Indian heritage. It is intended for
            relaxation, spiritual contemplation, and emotional harmony as an adjunct to holistic
            care.
          </p>

          <div className="flex flex-col items-center md:items-end gap-1.5 text-[11px] shrink-0">
            <div className="flex items-center gap-3">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <span className="text-border/60">•</span>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p>
              © {new Date().getFullYear()} Krishna Sanjeevani. All rights reserved. · Maintained by{" "}
              <a
                href="https://manasai.tech/?utm_source=chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cat hover:text-cat-accent font-medium transition-colors hover:underline decoration-cat/30 underline-offset-2"
              >
                ManasAI
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
