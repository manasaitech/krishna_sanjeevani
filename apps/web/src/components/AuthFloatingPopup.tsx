import { useState, useEffect, useCallback } from "react";
import { useLocation } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Music, X, User } from "lucide-react";

const MESSAGES = [
  "Login / Sign Up Now",
  "Immerse into the Divine Music",
  "Explore Vedic Science",
  "Discover Your Surāwali",
  "Begin Your Healing Journey",
  "Experience Krishna Sanjeevani",
];

const HIDDEN_PATHS = ["/login", "/register"];
const SESSION_KEY = "ks_auth_popup_dismissed";
const AUTH_WELCOME_KEY = "ks_auth_welcome_shown";

export function AuthFloatingPopup() {
  const { user, isAuthenticated } = useApp();
  const { open: openAuthModal, isOpen: isModalOpen } = useAuthModal();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [messagePhase, setMessagePhase] = useState<"in" | "hold" | "out">("in");
  const [welcomeShown, setWelcomeShown] = useState(false);

  // Check if popup was dismissed this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(SESSION_KEY);
      if (dismissed === "true") setIsDismissed(true);
      const welcomeDone = sessionStorage.getItem(AUTH_WELCOME_KEY);
      if (welcomeDone === "true") setWelcomeShown(true);
    }
  }, []);

  // Show popup after a short delay
  useEffect(() => {
    if (isDismissed) return;
    if (HIDDEN_PATHS.includes(location.pathname)) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDismissed, location.pathname]);

  // Auto-dismiss welcome state for authenticated users
  useEffect(() => {
    if (!isAuthenticated || welcomeShown) return;

    const timer = setTimeout(() => {
      setWelcomeShown(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_WELCOME_KEY, "true");
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, welcomeShown]);

  // Reset dismissal state when landing on the homepage to ensure the popup is visible
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/home") {
      setIsDismissed(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, [location.pathname]);

  // Cycling messages animation
  useEffect(() => {
    if (isAuthenticated) return;
    if (!isVisible || isDismissed || isModalOpen) return;

    // Check prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let fadeInTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    let fadeOutTimer: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      setMessagePhase("in");
      fadeInTimer = setTimeout(() => {
        setMessagePhase("hold");
        holdTimer = setTimeout(() => {
          setMessagePhase("out");
          fadeOutTimer = setTimeout(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
            runCycle();
          }, 800);
        }, 2500);
      }, 700);
    };

    runCycle();

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(holdTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [isAuthenticated, isVisible, isDismissed, isModalOpen]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, []);

  const handleCTAClick = useCallback(() => {
    openAuthModal("login");
  }, [openAuthModal]);

  // Handle Escape key
  useEffect(() => {
    if (!isVisible || isDismissed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isModalOpen) {
        handleDismiss();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, isDismissed, isModalOpen, handleDismiss]);

  // Don't render on login/register pages
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  // Don't render if dismissed
  if (isDismissed) return null;

  // Don't render if modal is open
  if (isModalOpen) return null;

  // Don't render until ready
  if (!isVisible) return null;

  // Authenticated user: welcome state (auto-dismiss)
  if (isAuthenticated) {
    if (welcomeShown) return null;

    const displayName = user?.profile?.fullName?.split(" ")[0] || "back";

    return (
      <aside
        className="ks-auth-popup ks-auth-popup--welcome"
        role="complementary"
        aria-label="Welcome message"
      >
        <div className="ks-auth-popup__icon ks-auth-popup__icon--welcome">
          <User className="ks-auth-popup__icon-svg" aria-hidden="true" />
        </div>
        <span className="ks-auth-popup__welcome-text">
          ♪ Welcome{displayName !== "back" ? `, ${displayName}` : " back"}
        </span>

        <style>{popupStyles}</style>
      </aside>
    );
  }

  // Unauthenticated user: full popup
  return (
    <>
      <aside
        className="ks-auth-popup"
        role="complementary"
        aria-label="Sign in to access divine music"
      >
        {/* Close button */}
        <button
          className="ks-auth-popup__close"
          onClick={handleDismiss}
          aria-label="Dismiss sign in popup"
          title="Dismiss"
        >
          <X className="ks-auth-popup__close-icon" aria-hidden="true" />
        </button>

        {/* Music icon with breathing animation */}
        <div className="ks-auth-popup__icon">
          <Music className="ks-auth-popup__icon-svg" aria-hidden="true" />
        </div>

        {/* Heading */}
        <p className="ks-auth-popup__heading">Immerse in Divine Music</p>

        {/* CTA Button */}
        <button
          className="ks-auth-popup__cta"
          onClick={handleCTAClick}
          aria-label="Open Login or Sign Up"
        >
          Login / Sign Up
        </button>

        {/* Animated cycling message */}
        <div className="ks-auth-popup__message-area" aria-live="polite" aria-atomic="true">
          <span
            className={`ks-auth-popup__message ks-auth-popup__message--${messagePhase}`}
            key={messageIndex}
          >
            {MESSAGES[messageIndex]}
          </span>
        </div>
      </aside>

      <style>{popupStyles}</style>
    </>
  );
}

/* ────────────────────────────────────────────── */
/*  Scoped styles for the floating auth popup    */
/* ────────────────────────────────────────────── */
const popupStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Crimson+Pro:ital@1&display=swap');

  .ks-auth-popup {
    position: fixed;
    top: 88px;
    right: 24px;
    z-index: 35;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 22px 14px;
    min-width: 200px;
    max-width: 230px;
    background: rgba(255, 253, 247, 0.96);
    border: 1.5px solid rgba(201, 168, 76, 0.38);
    border-radius: 22px;
    box-shadow:
      0 8px 32px rgba(122, 30, 44, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(12px);
    animation: ks-popup-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    font-family: 'Inter', 'DM Sans', sans-serif;
  }

  .ks-auth-popup--welcome {
    flex-direction: row;
    gap: 10px;
    padding: 12px 18px;
    min-width: auto;
    max-width: 260px;
    animation: ks-popup-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Close button ── */
  .ks-auth-popup__close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: rgba(90, 74, 48, 0.45);
    cursor: pointer;
    transition: all 180ms ease;
    padding: 0;
  }
  .ks-auth-popup__close:hover {
    background: rgba(201, 168, 76, 0.12);
    color: rgba(90, 74, 48, 0.8);
  }
  .ks-auth-popup__close:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 1px;
  }
  .ks-auth-popup__close-icon {
    width: 12px;
    height: 12px;
    stroke-width: 2.5;
  }

  /* ── Music icon ── */
  .ks-auth-popup__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(122, 30, 44, 0.08), rgba(201, 168, 76, 0.12));
    border: 1.5px solid rgba(201, 168, 76, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ks-icon-breathe 4s ease-in-out infinite;
    flex-shrink: 0;
  }
  .ks-auth-popup__icon--welcome {
    width: 34px;
    height: 34px;
    animation: none;
    background: linear-gradient(135deg, rgba(201, 168, 76, 0.12), rgba(122, 30, 44, 0.06));
  }
  .ks-auth-popup__icon-svg {
    width: 18px;
    height: 18px;
    color: #7A1E2C;
    stroke-width: 1.8;
  }

  /* ── Heading ── */
  .ks-auth-popup__heading {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 13px;
    font-weight: 600;
    color: #1a3323;
    text-align: center;
    line-height: 1.3;
    margin: 0;
    letter-spacing: 0.01em;
  }

  /* ── CTA button ── */
  .ks-auth-popup__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px 16px;
    border-radius: 20px;
    border: 1.5px solid rgba(122, 30, 44, 0.25);
    background: linear-gradient(135deg, #7A1E2C, #8B2636);
    color: #faf4e6;
    font-family: 'DM Sans', 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 200ms ease;
    box-shadow: 0 2px 8px rgba(122, 30, 44, 0.18);
  }
  .ks-auth-popup__cta:hover {
    background: linear-gradient(135deg, #6B1A26, #7A1E2C);
    box-shadow: 0 4px 14px rgba(122, 30, 44, 0.25);
    transform: translateY(-1px);
  }
  .ks-auth-popup__cta:active {
    transform: scale(0.97);
  }
  .ks-auth-popup__cta:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 2px;
  }

  /* ── Welcome text ── */
  .ks-auth-popup__welcome-text {
    font-family: 'Crimson Pro', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    color: #1a3323;
    white-space: nowrap;
  }

  /* ── Animated message area ── */
  .ks-auth-popup__message-area {
    height: 18px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 2px;
  }
  .ks-auth-popup__message {
    font-family: 'Crimson Pro', Georgia, serif;
    font-size: 11.5px;
    font-style: italic;
    color: #8B6914;
    text-align: center;
    white-space: nowrap;
    display: block;
    transition: opacity 700ms ease, transform 700ms ease;
  }

  .ks-auth-popup__message--in {
    opacity: 0;
    transform: translateY(6px);
    animation: ks-msg-fade-in 700ms ease forwards;
  }
  .ks-auth-popup__message--hold {
    opacity: 1;
    transform: translateY(0);
  }
  .ks-auth-popup__message--out {
    animation: ks-msg-fade-out 800ms ease forwards;
  }

  /* ── Keyframes ── */
  @keyframes ks-popup-enter {
    from {
      opacity: 0;
      transform: translateY(-12px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes ks-icon-breathe {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(201, 168, 76, 0);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 12px 3px rgba(201, 168, 76, 0.15);
      transform: scale(1.05);
    }
  }

  @keyframes ks-msg-fade-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ks-msg-fade-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ks-auth-popup {
      animation: none;
    }
    .ks-auth-popup__icon {
      animation: none;
    }
    .ks-auth-popup__message--in,
    .ks-auth-popup__message--out {
      animation: none;
      transition: none;
    }
    .ks-auth-popup__message--in {
      opacity: 1;
      transform: none;
    }
    .ks-auth-popup__cta:hover {
      transform: none;
    }
  }

  /* ── Responsive: smaller on mobile ── */
  @media (max-width: 640px) {
    .ks-auth-popup {
      right: 12px;
      top: 76px;
      min-width: 175px;
      max-width: 200px;
      padding: 14px 16px 10px;
      border-radius: 18px;
    }
    .ks-auth-popup--welcome {
      padding: 10px 14px;
      max-width: 220px;
    }
    .ks-auth-popup__icon {
      width: 34px;
      height: 34px;
    }
    .ks-auth-popup__icon-svg {
      width: 15px;
      height: 15px;
    }
    .ks-auth-popup__heading {
      font-size: 12px;
    }
    .ks-auth-popup__cta {
      font-size: 11.5px;
      padding: 7px 14px;
    }
    .ks-auth-popup__message {
      font-size: 10.5px;
    }
  }
`;
