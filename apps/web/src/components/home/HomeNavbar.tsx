import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import logoWithoutText from "@/assets/logo-without-text.png";
import { Menu, X, Sparkles, User, LogIn, ArrowRight } from "lucide-react";

export function HomeNavbar() {
  const { user } = useApp();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Inspiration", to: "/inspiration" },
    { label: "Vedic Science", to: "/vedic-science" },
    { label: "The Beginning", to: "/the-beginning" },
    { label: "About", to: "/about" },
    { label: "Team", to: "/team" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-surface/95 backdrop-blur-md border-b border-border/80 shadow-soft py-3"
          : "bg-background/90 backdrop-blur-sm border-b border-border/40 py-4 text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-cat/30 bg-surface flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <img
              src={logoWithoutText}
              alt="Krishna Sanjeevani"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold font-serif tracking-tight leading-none text-foreground">
              Krishna Sanjeevani
            </span>
            <span className="text-[10px] tracking-[0.16em] uppercase font-sans font-medium mt-1 text-cat">
              The Divine Therapeutic Music
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to as any}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-cat font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cat rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth CTA / Enter App Button */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to="/home"
              className="press inline-flex items-center gap-2 rounded-btn bg-cat px-5 py-2 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
            >
              <User className="h-4 w-4" />
              <span>Enter App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="press inline-flex items-center gap-1.5 rounded-btn px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="press inline-flex items-center gap-1.5 rounded-btn bg-cat px-4 py-2 text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-surface/98 backdrop-blur-xl border-b border-border px-6 py-6 shadow-2xl animate-soft-in">
          <nav className="flex flex-col gap-4 text-foreground">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-semibold py-1.5 border-b border-border/40 hover:text-cat transition-colors flex items-center justify-between ${
                    isActive ? "text-cat font-bold" : "text-foreground"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cat" />}
                </Link>
              );
            })}

            <div className="pt-4 flex flex-col gap-2.5">
              {user ? (
                <Link
                  to="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="press flex items-center justify-center gap-2 rounded-btn bg-cat py-3 text-sm font-semibold text-cat-foreground"
                >
                  <User className="h-4 w-4" />
                  <span>Enter App</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex items-center justify-center gap-2 rounded-btn border border-border bg-background py-2.5 text-sm font-medium text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Log In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex items-center justify-center gap-2 rounded-btn bg-cat py-2.5 text-sm font-semibold text-cat-foreground"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Sign Up Free</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
