import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/lib/app-state";
import { useAuthModal } from "@/hooks/useAuthModal";
import { categories } from "@/lib/content";
import { X, Mail, Lock, User, UserPlus, Loader2, Music, Headphones } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = "29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com";

export function AuthModal() {
  const { isOpen, activeTab, close, setTab } = useAuthModal();
  const { login, loginWithGoogle, register } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCategory, setRegCategory] = useState("devotional");

  const [loading, setLoading] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef(regCategory);

  useEffect(() => {
    categoryRef.current = regCategory;
  }, [regCategory]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLoginEmail("");
      setLoginPassword("");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegCategory("devotional");
      setLoading(false);
    }
  }, [isOpen]);

  // Google OAuth setup
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
      }
    };

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [isOpen]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(
        response.credential,
        activeTab === "signup" ? categoryRef.current : undefined,
      );
      if (res.success) {
        toast.success("Welcome to Krishna Sanjeevani!");
        close();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In is loading. Please try again.");
    }
  }, []);

  // Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        toast.success("Welcome back to Krishna Sanjeevani!");
        close();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Register submit
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regCategory) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      toast.error("Password does not meet requirements");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        category: regCategory,
      });
      if (res.success) {
        toast.success("Account created successfully!");
        close();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Focus the close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = modal.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Click overlay to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      close();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="ks-modal-overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ks-modal-title"
        className="ks-modal"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          className="ks-modal__close"
          onClick={close}
          aria-label="Close authentication modal"
        >
          <X className="ks-modal__close-icon" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="ks-modal__header">
          <div className="ks-modal__medallion">
            <img src="/images/krishna-medallion.jpg" alt="" className="ks-modal__medallion-img" />
            <div className="ks-modal__badge">
              <Headphones className="ks-modal__badge-icon" aria-hidden="true" />
            </div>
          </div>
          <h2 id="ks-modal-title" className="ks-modal__title">
            Krishna Sanjeevani
          </h2>
          <p className="ks-modal__subtitle">Healing Through Divine Sound</p>
          <div className="ks-modal__rule-row" aria-hidden="true">
            <span className="ks-modal__rule" />
            <span className="ks-modal__lotus">🪷</span>
            <span className="ks-modal__rule" />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="ks-modal__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "login"}
            className={`ks-modal__tab ${activeTab === "login" ? "ks-modal__tab--active" : ""}`}
            onClick={() => setTab("login")}
          >
            <User className="ks-modal__tab-icon" aria-hidden="true" />
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "signup"}
            className={`ks-modal__tab ${activeTab === "signup" ? "ks-modal__tab--active" : ""}`}
            onClick={() => setTab("signup")}
          >
            <UserPlus className="ks-modal__tab-icon" aria-hidden="true" />
            Create Account
          </button>
        </div>

        {/* Tab content */}
        <div className="ks-modal__body" role="tabpanel">
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="ks-modal__form" noValidate>
              <div className="ks-modal__field">
                <label className="ks-modal__label" htmlFor="ks-modal-email">
                  Email
                </label>
                <div className="ks-modal__input-wrap">
                  <Mail className="ks-modal__input-ico" aria-hidden="true" />
                  <input
                    id="ks-modal-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="ks-modal__input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="ks-modal__field">
                <label className="ks-modal__label" htmlFor="ks-modal-password">
                  Password
                </label>
                <div className="ks-modal__input-wrap">
                  <Lock className="ks-modal__input-ico" aria-hidden="true" />
                  <input
                    id="ks-modal-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ks-modal__input"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="ks-modal__submit">
                {loading ? (
                  <Loader2 className="ks-modal__spinner" aria-hidden="true" />
                ) : (
                  <>
                    <Music className="ks-modal__submit-ico" aria-hidden="true" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="ks-modal__form" noValidate>
              <div className="ks-modal__field-row">
                <div className="ks-modal__field">
                  <label className="ks-modal__label" htmlFor="ks-modal-reg-name">
                    Full Name
                  </label>
                  <div className="ks-modal__input-wrap">
                    <User className="ks-modal__input-ico" aria-hidden="true" />
                    <input
                      id="ks-modal-reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ananya Rao"
                      className="ks-modal__input"
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="ks-modal__field">
                  <label className="ks-modal__label" htmlFor="ks-modal-reg-email">
                    Email
                  </label>
                  <div className="ks-modal__input-wrap">
                    <Mail className="ks-modal__input-ico" aria-hidden="true" />
                    <input
                      id="ks-modal-reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ananya@example.com"
                      className="ks-modal__input"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="ks-modal__field">
                <label className="ks-modal__label" htmlFor="ks-modal-reg-password">
                  Password
                </label>
                <div className="ks-modal__input-wrap">
                  <Lock className="ks-modal__input-ico" aria-hidden="true" />
                  <input
                    id="ks-modal-reg-password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ks-modal__input"
                    autoComplete="new-password"
                  />
                </div>
                <div className="ks-modal__pw-rules">
                  {[
                    [hasMinLength, "8+ chars"],
                    [hasUppercase, "Uppercase"],
                    [hasLowercase, "Lowercase"],
                    [hasNumber, "Number"],
                  ].map(([ok, label]) => (
                    <span
                      key={label as string}
                      className={`ks-modal__pw-chip ${ok ? "ks-modal__pw-chip--ok" : ""}`}
                    >
                      <span className="ks-modal__pw-dot" />
                      {label as string}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ks-modal__field">
                <label className="ks-modal__label">Choose your Path</label>
                <div className="ks-modal__cats">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRegCategory(cat.id)}
                      className={`ks-modal__cat ${regCategory === cat.id ? "ks-modal__cat--active" : ""}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="ks-modal__submit">
                {loading ? (
                  <Loader2 className="ks-modal__spinner" aria-hidden="true" />
                ) : (
                  <>
                    <UserPlus className="ks-modal__submit-ico" aria-hidden="true" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="ks-modal__divider" aria-hidden="true">
            <span className="ks-modal__rule" />
            <span className="ks-modal__divider-ico">🪈🦚</span>
            <span className="ks-modal__rule" />
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="ks-modal__social"
            aria-label="Continue with Google"
          >
            <svg className="ks-modal__social-ico" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Apple sign-in */}
          <button
            type="button"
            onClick={() => toast.info("Apple Sign-In coming soon.")}
            className="ks-modal__social"
            aria-label="Continue with Apple"
          >
            <svg className="ks-modal__social-ico" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                fill="#1a1208"
              />
            </svg>
            <span>Continue with Apple</span>
          </button>

          {/* Legal */}
          <p className="ks-modal__legal">
            By continuing you agree to our{" "}
            <a href="/terms" className="ks-modal__link">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="ks-modal__link">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <style>{modalStyles}</style>
    </>
  );
}

/* ────────────────────────────────────────────── */
/*  Scoped styles for the auth modal             */
/* ────────────────────────────────────────────── */
const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Crimson+Pro:ital@1&display=swap');

  /* ── Overlay ── */
  .ks-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 49;
    background: rgba(26, 18, 8, 0.45);
    backdrop-filter: blur(4px);
    animation: ks-overlay-in 0.3s ease both;
  }

  /* ── Modal container ── */
  .ks-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    width: calc(100vw - 32px);
    max-width: 420px;
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
    background: rgba(252, 250, 244, 0.98);
    border: 1.5px solid rgba(201, 168, 76, 0.4);
    border-radius: 24px;
    box-shadow:
      0 24px 80px rgba(26, 18, 8, 0.22),
      0 4px 16px rgba(122, 30, 44, 0.06);
    padding: 28px 28px 22px;
    font-family: 'Inter', 'DM Sans', sans-serif;
    animation: ks-modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Close ── */
  .ks-modal__close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(201, 168, 76, 0.3);
    background: rgba(250, 248, 242, 0.8);
    color: rgba(90, 74, 48, 0.6);
    cursor: pointer;
    transition: all 180ms ease;
    padding: 0;
    z-index: 1;
  }
  .ks-modal__close:hover {
    background: rgba(250, 248, 242, 1);
    color: rgba(90, 74, 48, 0.9);
    border-color: rgba(201, 168, 76, 0.55);
  }
  .ks-modal__close:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 2px;
  }
  .ks-modal__close-icon {
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }

  /* ── Header ── */
  .ks-modal__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
  }

  .ks-modal__medallion {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
  }
  .ks-modal__medallion-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid rgba(201, 168, 76, 0.5);
    box-shadow: 0 4px 16px rgba(156, 118, 42, 0.2);
  }
  .ks-modal__badge {
    position: absolute;
    top: -2px;
    right: -6px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(250, 248, 244, 0.95);
    border: 1.5px solid rgba(201, 168, 76, 0.5);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ks-modal__badge-icon {
    width: 12px;
    height: 12px;
    color: #6b5a3e;
    stroke-width: 1.8;
  }

  .ks-modal__title {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 20px;
    font-weight: 600;
    color: #1a3323;
    margin: 0;
    text-align: center;
    line-height: 1.2;
    letter-spacing: 0.01em;
  }
  .ks-modal__subtitle {
    font-family: 'Crimson Pro', Georgia, serif;
    font-size: 13px;
    font-style: italic;
    color: #8B6914;
    margin: 0;
    letter-spacing: 0.02em;
  }
  .ks-modal__rule-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 160px;
  }
  .ks-modal__rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.55), transparent);
  }
  .ks-modal__lotus {
    font-size: 11px;
    filter: saturate(0.65);
  }

  /* ── Tabs ── */
  .ks-modal__tabs {
    display: flex;
    gap: 4px;
    background: rgba(201, 168, 76, 0.08);
    border-radius: 14px;
    padding: 3px;
    margin-bottom: 16px;
  }
  .ks-modal__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 9px 12px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: 'DM Sans', 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(58, 44, 24, 0.55);
    cursor: pointer;
    transition: all 200ms ease;
  }
  .ks-modal__tab--active {
    background: rgba(250, 248, 242, 0.95);
    color: #1a3323;
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
  .ks-modal__tab:hover:not(.ks-modal__tab--active) {
    color: rgba(58, 44, 24, 0.8);
  }
  .ks-modal__tab:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 1px;
  }
  .ks-modal__tab-icon {
    width: 14px;
    height: 14px;
    stroke-width: 2;
  }

  /* ── Body ── */
  .ks-modal__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Form ── */
  .ks-modal__form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ks-modal__field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .ks-modal__field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ks-modal__label {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a4a30;
  }
  .ks-modal__input-wrap {
    position: relative;
  }
  .ks-modal__input-ico {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: #8a7455;
    stroke-width: 2;
    pointer-events: none;
  }
  .ks-modal__input {
    width: 100%;
    box-sizing: border-box;
    height: 42px;
    padding: 0 12px 0 30px;
    border-radius: 12px;
    border: 1.5px solid rgba(201, 168, 76, 0.4);
    background: rgba(252, 250, 244, 0.75);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: #261e0e;
    outline: none;
    transition: border-color 180ms ease, background 180ms ease;
  }
  .ks-modal__input::placeholder {
    color: rgba(90, 74, 48, 0.4);
  }
  .ks-modal__input:focus {
    border-color: rgba(201, 168, 76, 0.8);
    background: rgba(252, 250, 244, 0.95);
  }

  /* ── Password rules ── */
  .ks-modal__pw-rules {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 3px;
  }
  .ks-modal__pw-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    color: rgba(58, 44, 24, 0.5);
    transition: color 200ms ease;
  }
  .ks-modal__pw-chip--ok {
    color: #2d7a3a;
  }
  .ks-modal__pw-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(90, 74, 48, 0.25);
    flex-shrink: 0;
    transition: background 200ms ease;
  }
  .ks-modal__pw-chip--ok .ks-modal__pw-dot {
    background: #2d7a3a;
  }

  /* ── Category picker ── */
  .ks-modal__cats {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .ks-modal__cat {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid rgba(201, 168, 76, 0.35);
    background: rgba(250, 248, 242, 0.6);
    font-family: 'DM Sans', 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #3a2c18;
    cursor: pointer;
    transition: all 180ms ease;
    text-transform: capitalize;
  }
  .ks-modal__cat:hover {
    background: rgba(250, 248, 242, 0.9);
  }
  .ks-modal__cat--active {
    background: rgba(26, 51, 35, 0.88);
    border-color: rgba(201, 168, 76, 0.65);
    color: #f2ede0;
    font-weight: 600;
  }
  .ks-modal__cat:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 1px;
  }

  /* ── Submit ── */
  .ks-modal__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    height: 46px;
    border-radius: 23px;
    background: #1a3323;
    color: #f2ede0;
    font-family: 'DM Sans', 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: 1.5px solid rgba(201, 168, 76, 0.45);
    box-shadow: 0 4px 18px rgba(26, 51, 35, 0.35);
    cursor: pointer;
    transition: transform 180ms ease, background 180ms ease;
    position: relative;
    overflow: hidden;
  }
  .ks-modal__submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(201, 168, 76, 0.09) 0%, transparent 50%);
    pointer-events: none;
  }
  .ks-modal__submit:hover {
    background: #142b1c;
  }
  .ks-modal__submit:active {
    transform: scale(0.97);
  }
  .ks-modal__submit:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .ks-modal__submit:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 2px;
  }
  .ks-modal__submit-ico {
    width: 15px;
    height: 15px;
    color: #d4a84b;
    flex-shrink: 0;
    stroke-width: 2;
  }
  .ks-modal__spinner {
    width: 18px;
    height: 18px;
    color: #d4a84b;
    animation: ks-modal-spin 0.8s linear infinite;
  }

  /* ── Divider ── */
  .ks-modal__divider {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 2px 0;
  }
  .ks-modal__divider-ico {
    font-size: 14px;
    filter: saturate(0.6);
  }

  /* ── Social buttons ── */
  .ks-modal__social {
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: rgba(250, 248, 242, 0.8);
    border: 1.5px solid rgba(201, 168, 76, 0.38);
    color: #1a1208;
    font-family: 'DM Sans', 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 180ms ease, background 180ms ease;
  }
  .ks-modal__social:hover {
    background: rgba(250, 248, 242, 0.95);
  }
  .ks-modal__social:active {
    transform: scale(0.97);
  }
  .ks-modal__social:focus-visible {
    outline: 2px solid rgba(201, 168, 76, 0.7);
    outline-offset: 2px;
  }
  .ks-modal__social-ico {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  /* ── Legal ── */
  .ks-modal__legal {
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    color: rgba(58, 44, 24, 0.55);
    text-align: center;
    line-height: 1.5;
    margin: 4px 0 0;
  }
  .ks-modal__link {
    color: rgba(58, 44, 24, 0.75);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: rgba(201, 168, 76, 0.5);
    font-weight: 500;
  }
  .ks-modal__link:hover {
    color: #1a3323;
  }

  /* ── Keyframes ── */
  @keyframes ks-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes ks-modal-in {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  @keyframes ks-modal-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ks-modal-overlay,
    .ks-modal {
      animation: none;
    }
    .ks-modal__submit:active,
    .ks-modal__social:active {
      transform: none;
    }
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .ks-modal {
      padding: 22px 18px 18px;
      border-radius: 20px;
    }
    .ks-modal__medallion {
      width: 56px;
      height: 56px;
    }
    .ks-modal__title {
      font-size: 18px;
    }
    .ks-modal__field-row {
      grid-template-columns: 1fr;
    }
    .ks-modal__input {
      height: 40px;
      font-size: 13px;
    }
    .ks-modal__submit {
      height: 44px;
      font-size: 13px;
    }
    .ks-modal__social {
      height: 42px;
      font-size: 12.5px;
    }
  }

  /* Hide scrollbar on modal */
  .ks-modal::-webkit-scrollbar {
    width: 4px;
  }
  .ks-modal::-webkit-scrollbar-track {
    background: transparent;
  }
  .ks-modal::-webkit-scrollbar-thumb {
    background: rgba(201, 168, 76, 0.3);
    border-radius: 4px;
  }
`;
