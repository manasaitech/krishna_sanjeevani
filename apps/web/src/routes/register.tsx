/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { categories } from "@/lib/content";
import prabhupadaImg from "@/assets/prabhupada.png";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Create Account — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Sign up to begin your personalized therapeutic raga listening journey.",
      },
    ],
  }),
  component: RegisterScreen,
});

function RegisterScreen() {
  const { register, loginWithGoogle } = useApp();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("unset");
  const [loading, setLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  const categoryRef = useRef(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    if (showDedication) {
      const t = setTimeout(() => navigate({ to: redirect || "/home" }), 3000);
      return () => clearTimeout(t);
    }
    return;
  }, [showDedication, navigate, redirect]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential, categoryRef.current);
      if (res.success) {
        toast.success("Welcome to Krishna Sanjeevani!");
        setShowDedication(true);
      } else toast.error(res.message);
    } catch {
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
      }
    };
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      toast.error("Password does not meet requirements");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ fullName, email, password, category });
      if (res.success) {
        toast.success("Account created successfully!");
        setShowDedication(true);
      } else toast.error(res.message);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if ((window as any).google) (window as any).google.accounts.id.prompt();
    else toast.error("Google Sign-In is loading. Please try again.");
  };

  /* ── Dedication screen ── */
  if (showDedication) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF5EC] flex flex-col items-center justify-center text-[#3A3125] px-6 select-none">
        <div className="text-center max-w-sm flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-[#C9A84C]/10 blur-xl animate-pulse" />
            <div className="relative h-72 w-52 overflow-hidden rounded-2xl border-2 border-[#C9A84C]/30 bg-white shadow-2xl p-1">
              <img
                src={prabhupadaImg}
                alt="Srila Prabhupada"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#C9A84C] uppercase">
              Dedicated to
            </span>
            <h2 className="text-2xl font-serif font-semibold tracking-wide mt-1 text-[#3A3125]">
              His Divine Grace
            </h2>
            <h1 className="text-xl font-bold font-sans tracking-wide text-[#261E14]">
              A.C. Bhaktivedanta Swami Prabhupada
            </h1>
            <p className="text-xs text-[#5C5040] italic font-serif leading-relaxed mt-2 max-w-[280px] mx-auto">
              Founder-Acharya of the International Society for Krishna Consciousness
            </p>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent mx-auto my-4" />
            <p className="text-[9px] uppercase font-semibold tracking-widest text-[#8A7963]">
              Krishna Sanjeevani Music Healing Research
            </p>
          </div>
          <div className="mt-2 flex gap-1.5 items-center justify-center">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rg-root">
      {/* Background */}
      <div className="rg-bg" aria-hidden="true">
        <img src="/images/krishna-onboarding-bg.jpg" alt="" className="rg-bg-img" />
      </div>

      {/* Single viewport frame */}
      <div className="rg-frame">
        {/* Header */}
        <div className="rg-header">
          <div className="rg-medallion-sm">
            <img src="/images/krishna-medallion.jpg" alt="" className="rg-medallion-img" />
          </div>
          <div className="rg-heading-group">
            <h1 className="rg-title">Create Account</h1>
            <p className="rg-subtitle">Begin your healing journey</p>
          </div>
        </div>

        <div className="rg-rule-row" aria-hidden="true">
          <span className="rg-rule" />
          <span className="rg-lotus">🪷</span>
          <span className="rg-rule" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rg-form" noValidate>
          {/* Name + Email row */}
          <div className="rg-field-row">
            <div className="rg-field">
              <label className="rg-label" htmlFor="rg-name">
                Full Name
              </label>
              <div className="rg-input-wrap">
                <User className="rg-input-ico" aria-hidden="true" />
                <input
                  id="rg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ananya Rao"
                  className="rg-input"
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="rg-field">
              <label className="rg-label" htmlFor="rg-email">
                Email
              </label>
              <div className="rg-input-wrap">
                <Mail className="rg-input-ico" aria-hidden="true" />
                <input
                  id="rg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="rg-input"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="rg-field rg-field-full">
            <label className="rg-label" htmlFor="rg-password">
              Password
            </label>
            <div className="rg-input-wrap">
              <Lock className="rg-input-ico" aria-hidden="true" />
              <input
                id="rg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rg-input"
                autoComplete="new-password"
              />
            </div>
            {/* Password rules */}
            <div className="rg-rules">
              {[
                [hasMinLength, "8+ chars"],
                [hasUppercase, "Uppercase"],
                [hasLowercase, "Lowercase"],
                [hasNumber, "Number"],
              ].map(([ok, label]) => (
                <span key={label as string} className={`rg-rule-chip ${ok ? "rg-rule-ok" : ""}`}>
                  <span className="rg-rule-dot" />
                  {label as string}
                </span>
              ))}
            </div>
          </div>


          {/* Submit */}
          <button type="submit" disabled={loading} id="rg-submit-btn" className="rg-submit">
            {loading ? (
              <Loader2 className="rg-spin" aria-hidden="true" />
            ) : (
              <>
                <UserPlus className="rg-ico" aria-hidden="true" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="rg-flute" aria-hidden="true">
          <span className="rg-rule" />
          <span className="rg-flute-ico">🪈🦚</span>
          <span className="rg-rule" />
        </div>

        {/* Google social */}
        <button id="rg-google-btn" type="button" onClick={handleGoogleSignUp} className="rg-social">
          <svg className="rg-social-ico" viewBox="0 0 24 24" aria-hidden="true">
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

        {/* Sign in link */}
        <p className="rg-legal">
          Already have an account?{" "}
          <Link to="/login" className="rg-link">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Crimson+Pro:ital@1&display=swap');

        .rg-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        .rg-bg { position: absolute; inset: 0; }
        .rg-bg-img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }

        /* ── Frame ── */
        .rg-frame {
          position: relative; z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(6px, 1.3vh, 13px);
          padding: 0 20px;
          box-sizing: border-box;
          max-width: 480px;
          margin: 0 auto;
        }

        /* ── Header row: mini medallion + titles ── */
        .rg-header {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
        }
        .rg-medallion-sm {
          width: clamp(52px, 9vh, 72px);
          height: clamp(52px, 9vh, 72px);
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(201,168,76,0.6);
          box-shadow: 0 4px 16px rgba(156,118,42,0.25);
          flex-shrink: 0;
        }
        .rg-medallion-img { width:100%; height:100%; object-fit:cover; }

        .rg-heading-group { display:flex; flex-direction:column; }
        .rg-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: clamp(20px, 3.5vh, 26px);
          font-weight: 600; color: #1a3323;
          margin: 0; line-height: 1.1;
          text-shadow: 0 1px 3px rgba(255,255,255,0.4);
        }
        .rg-subtitle {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: clamp(12px, 1.8vh, 15px);
          font-style: italic; color: #8B6914; margin: 0;
        }

        /* ── Divider ── */
        .rg-rule-row { display:flex; align-items:center; gap:6px; width:100%; }
        .rg-rule { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,0.55),transparent); }
        .rg-lotus { font-size:11px; filter:saturate(0.65); }

        /* ── Form ── */
        .rg-form { width:100%; display:flex; flex-direction:column; gap:clamp(5px,1vh,10px); }

        .rg-field-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; width:100%; }
        .rg-field { display:flex; flex-direction:column; gap:3px; }
        .rg-field-full { grid-column:1/-1; }

        .rg-label {
          font-family: 'Inter', sans-serif;
          font-size: clamp(9px, 1.3vh, 11px);
          font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #5a4a30;
        }

        .rg-input-wrap { position:relative; }
        .rg-input-ico {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          width: 13px; height: 13px; color: #8a7455; stroke-width: 2;
          pointer-events: none;
        }
        .rg-input {
          width: 100%; box-sizing: border-box;
          height: clamp(36px, 5.2vh, 44px);
          padding: 0 10px 0 28px;
          border-radius: 10px;
          border: 1.5px solid rgba(201,168,76,0.45);
          background: rgba(252,250,244,0.78);
          font-family: 'Inter', sans-serif;
          font-size: clamp(12px, 1.7vh, 14px);
          color: #261e0e;
          outline: none;
          transition: border-color 180ms ease, background 180ms ease;
        }
        .rg-input::placeholder { color: rgba(90,74,48,0.45); }
        .rg-input:focus {
          border-color: rgba(201,168,76,0.85);
          background: rgba(252,250,244,0.95);
        }

        /* Password rules */
        .rg-rules {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-top: 4px;
        }
        .rg-rule-chip {
          display: flex; align-items: center; gap: 4px;
          font-family: 'Inter', sans-serif;
          font-size: clamp(9px, 1.2vh, 11px);
          color: rgba(58,44,24,0.55);
          transition: color 200ms ease;
        }
        .rg-rule-chip.rg-rule-ok { color: #2d7a3a; }
        .rg-rule-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(90,74,48,0.3);
          flex-shrink: 0;
          transition: background 200ms ease;
        }
        .rg-rule-chip.rg-rule-ok .rg-rule-dot { background: #2d7a3a; }

        /* Category picker */
        .rg-cats {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-top: 2px;
        }
        .rg-cat {
          padding: clamp(4px,0.7vh,7px) clamp(8px,1.5vw,14px);
          border-radius: 20px;
          border: 1.5px solid rgba(201,168,76,0.4);
          background: rgba(250,248,242,0.65);
          font-family: 'DM Sans','Inter',sans-serif;
          font-size: clamp(11px, 1.5vh, 13px);
          font-weight: 500; color: #3a2c18;
          cursor: pointer;
          transition: all 180ms ease;
          text-transform: capitalize;
        }
        .rg-cat:hover { background: rgba(250,248,242,0.9); }
        .rg-cat.rg-cat-active {
          background: rgba(26,51,35,0.88);
          border-color: rgba(201,168,76,0.7);
          color: #f2ede0; font-weight: 600;
        }

        /* Submit */
        .rg-submit {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; height: clamp(42px,6vh,50px);
          border-radius: 25px;
          background: #1a3323; color: #f2ede0;
          font-family: 'DM Sans','Inter',sans-serif;
          font-size: clamp(13px,1.9vh,15px); font-weight: 600;
          border: 1.5px solid rgba(201,168,76,0.45);
          box-shadow: 0 4px 18px rgba(26,51,35,0.38);
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease;
          position: relative; overflow: hidden;
        }
        .rg-submit::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg,rgba(201,168,76,0.09) 0%,transparent 50%);
          pointer-events:none;
        }
        .rg-submit:hover { background: #142b1c; }
        .rg-submit:active { transform: scale(0.97); }
        .rg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .rg-ico { width:15px; height:15px; color:#d4a84b; flex-shrink:0; stroke-width:2; }
        .rg-spin { width:18px; height:18px; color:#d4a84b; animation:rg-spin 0.8s linear infinite; }
        @keyframes rg-spin { to { transform:rotate(360deg); } }

        /* Flute divider */
        .rg-flute { display:flex; align-items:center; gap:7px; width:100%; }
        .rg-flute-ico { font-size:14px; filter:saturate(0.6); }

        /* Social */
        .rg-social {
          width:100%; height:clamp(40px,5.5vh,48px);
          border-radius:24px;
          background:rgba(250,248,242,0.82);
          border:1.5px solid rgba(201,168,76,0.42); color:#1a1208;
          font-family:'DM Sans','Inter',sans-serif;
          font-size:clamp(13px,1.8vh,14px); font-weight:600;
          display:flex; align-items:center; justify-content:center; gap:9px;
          box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer;
          transition:transform 180ms ease,background 180ms ease;
        }
        .rg-social:hover { background:rgba(250,248,242,0.95); }
        .rg-social:active { transform:scale(0.97); }
        .rg-social-ico { width:17px; height:17px; flex-shrink:0; }

        /* Legal */
        .rg-legal {
          font-family:'Inter',sans-serif;
          font-size:clamp(10px,1.4vh,12px); color:rgba(58,44,24,0.65);
          text-align:center; margin:0;
        }
        .rg-link {
          color:#1a3323; font-weight:600;
          text-decoration:underline; text-underline-offset:2px;
          text-decoration-color:rgba(201,168,76,0.6);
        }
        .rg-link:hover { color:#8B6914; }
      `}</style>
    </div>
  );
}
