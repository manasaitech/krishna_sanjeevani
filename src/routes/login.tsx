/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Music, Headphones, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign In — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Therapeutic ragas & surāvalis, sequenced by therapists for stress relief, sleep, focus, and pregnancy wellbeing.",
      },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const { loginWithGoogle } = useApp();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [_googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        toast.success("Welcome to Krishna Sanjeevani!");
        navigate({ to: redirect || "/home" });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
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

  const handleGoogleSignIn = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In is loading. Please try again.");
    }
  };

  const handleAppleSignIn = () => {
    toast.info("Apple Sign-In coming soon.");
  };

  const waveHeights = [0.35, 0.6, 0.9, 1, 0.75, 0.55, 1, 0.85, 0.45];

  return (
    <div className="ks-root">
      {/* Background fills entire viewport */}
      <div className="ks-bg" aria-hidden="true">
        <img src="/images/krishna-onboarding-bg.webp" alt="" className="ks-bg-img" />
      </div>

      {/* Single viewport frame — no scroll */}
      <div className="ks-frame">
        {/* Medallion */}
        <div className="ks-medallion-wrap">
          <div className="ks-ring ks-ring-3" />
          <div className="ks-ring ks-ring-2" />
          <div className="ks-ring ks-ring-1" />
          <div className="ks-medallion-inner">
            <img
              src="/images/krishna-medallion.webp"
              alt="Krishna medallion"
              className="ks-medallion-img"
            />
          </div>
          <div className="ks-badge">
            <Headphones className="ks-badge-icon" />
          </div>
        </div>

        {/* Audio wave */}
        <div className="ks-wave" aria-hidden="true">
          {waveHeights.map((h, i) => (
            <span
              key={i}
              className="ks-bar"
              style={{ animationDelay: `${i * 0.12}s`, "--wh": h } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Title */}
        <h1 className="ks-title">Krishna Sanjeevani</h1>
        <p className="ks-subtitle">Healing Through Divine Sound</p>
        <div className="ks-rule-row" aria-hidden="true">
          <span className="ks-rule" />
          <span className="ks-lotus">🪷</span>
          <span className="ks-rule" />
        </div>

        {/* Description */}
        <p className="ks-desc">
          Therapeutic ragas &amp; surāvalis, sequenced by therapists for stress relief, sleep,
          focus, and pregnancy wellbeing.
        </p>

        {/* CTA */}
        <Link
          to="/register"
          search={{ redirect }}
          id="ks-get-started-btn"
          className="ks-primary"
          aria-label="Get Started"
        >
          <Music className="ks-ico" aria-hidden="true" />
          <span>Get Started</span>
        </Link>

        <div className="ks-pair">
          <Link
            to="/login"
            search={{ redirect }}
            id="ks-sign-in-btn"
            className="ks-secondary"
            aria-label="Sign in"
          >
            <User className="ks-ico-sm" aria-hidden="true" />
            <span>Sign in</span>
          </Link>
          <Link
            to="/register"
            search={{ redirect }}
            id="ks-create-account-btn"
            className="ks-secondary"
            aria-label="Create account"
          >
            <UserPlus className="ks-ico-sm" aria-hidden="true" />
            <span>Create account</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="ks-flute" aria-hidden="true">
          <span className="ks-rule" />
          <span className="ks-flute-ico">🪈🦚</span>
          <span className="ks-rule" />
        </div>

        {/* Social */}
        <button
          id="ks-google-btn"
          type="button"
          onClick={handleGoogleSignIn}
          className="ks-social"
          aria-label="Continue with Google"
        >
          <svg className="ks-social-ico" viewBox="0 0 24 24" aria-hidden="true">
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

        <button
          id="ks-apple-btn"
          type="button"
          onClick={handleAppleSignIn}
          className="ks-social"
          aria-label="Continue with Apple"
        >
          <svg className="ks-social-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              fill="#1a1208"
            />
          </svg>
          <span>Continue with Apple</span>
        </button>

        {/* Legal */}
        <p className="ks-legal">
          By continuing you agree to our{" "}
          <Link to="/terms" className="ks-link">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="ks-link">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Crimson+Pro:ital@1&display=swap');

        /* Lock to exactly one viewport — no scroll */
        .ks-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        .ks-bg {
          position: absolute;
          inset: 0;
        }
        .ks-bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        /* Centre column — shrinks to fit available height */
        .ks-frame {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(5px, 1.2vh, 12px);
          padding: 0 20px;
          box-sizing: border-box;
          max-width: 400px;
          margin: 0 auto;
        }

        /* ── Medallion ── */
        .ks-medallion-wrap {
          position: relative;
          width: clamp(110px, 18vh, 160px);
          height: clamp(110px, 18vh, 160px);
          flex-shrink: 0;
        }
        .ks-ring { position:absolute; border-radius:50%; pointer-events:none; }
        .ks-ring-1 { inset:0;     border:1.5px solid rgba(201,168,76,0.7); }
        .ks-ring-2 { inset:-6px;  border:1px   solid rgba(201,168,76,0.35); }
        .ks-ring-3 { inset:-12px; border:1px   solid rgba(201,168,76,0.18); }

        .ks-medallion-inner {
          position:absolute; inset:4px;
          border-radius:50%; overflow:hidden;
          background:#faf4e6;
          box-shadow:0 6px 24px rgba(156,118,42,0.28),0 2px 8px rgba(0,0,0,0.1);
        }
        .ks-medallion-img { width:100%; height:100%; object-fit:cover; border-radius:50%; }

        .ks-badge {
          position:absolute; top:-3px; right:-8px;
          width:32px; height:32px; border-radius:50%;
          background:rgba(250,248,244,0.95);
          border:1.5px solid rgba(201,168,76,0.55);
          box-shadow:0 2px 8px rgba(0,0,0,0.12);
          display:flex; align-items:center; justify-content:center;
        }
        .ks-badge-icon { width:15px; height:15px; color:#6b5a3e; stroke-width:1.8; }

        /* ── Wave ── */
        .ks-wave { display:flex; align-items:center; gap:2.5px; height:18px; }
        .ks-bar {
          display:inline-block; width:2.5px; border-radius:3px;
          background:#8B6914; opacity:0.65;
          animation:ks-wave 1.4s ease-in-out infinite;
          height:calc(var(--wh,0.5)*16px); transform-origin:center;
        }
        @keyframes ks-wave {
          0%,100% { transform:scaleY(0.3); opacity:0.45; }
          50%      { transform:scaleY(1.1); opacity:0.8; }
        }

        /* ── Brand ── */
        .ks-title {
          font-family:'Cinzel',Georgia,serif;
          font-size:clamp(22px,4vh,30px);
          font-weight:600; color:#1a3323;
          letter-spacing:0.01em; line-height:1.1; margin:0;
          text-shadow:0 1px 3px rgba(255,255,255,0.4);
          text-align:center;
        }
        .ks-subtitle {
          font-family:'Crimson Pro',Georgia,serif;
          font-size:clamp(13px,2vh,16px);
          font-style:italic; color:#8B6914;
          margin:0; letter-spacing:0.02em;
        }
        .ks-rule-row { display:flex; align-items:center; gap:6px; width:180px; }
        .ks-rule { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,0.65),transparent); }
        .ks-lotus { font-size:12px; filter:saturate(0.65); }

        /* ── Description ── */
        .ks-desc {
          font-family:'Inter',sans-serif;
          font-size:clamp(12px,1.7vh,13.5px); color:#3a2c18;
          text-align:center; line-height:1.55;
          max-width:290px; margin:0; opacity:0.88;
        }

        /* ── Primary button ── */
        .ks-primary {
          display:flex; align-items:center; justify-content:center; gap:7px;
          width:100%; max-width:340px; height:clamp(44px,6.5vh,52px);
          border-radius:26px; background:#1a3323; color:#f2ede0;
          font-family:'DM Sans','Inter',sans-serif;
          font-size:clamp(14px,2vh,15px); font-weight:600;
          text-decoration:none;
          border:1.5px solid rgba(201,168,76,0.45);
          box-shadow:0 4px 18px rgba(26,51,35,0.38);
          position:relative; overflow:hidden;
          transition:transform 180ms ease,background 180ms ease;
        }
        .ks-primary::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(201,168,76,0.09) 0%,transparent 50%);
          pointer-events:none;
        }
        .ks-primary:hover { background:#142b1c; }
        .ks-primary:active { transform:scale(0.97); }
        .ks-ico { width:16px; height:16px; color:#d4a84b; flex-shrink:0; stroke-width:2; }

        /* ── Secondary pair ── */
        .ks-pair { display:flex; gap:9px; width:100%; max-width:340px; }
        .ks-secondary {
          flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
          height:clamp(40px,5.5vh,46px); border-radius:23px;
          background:rgba(250,248,242,0.72);
          border:1.5px solid rgba(201,168,76,0.48); color:#261e0e;
          font-family:'DM Sans','Inter',sans-serif;
          font-size:clamp(12.5px,1.8vh,14px); font-weight:500;
          text-decoration:none;
          box-shadow:0 2px 6px rgba(0,0,0,0.07);
          transition:transform 180ms ease,background 180ms ease;
          white-space:nowrap;
        }
        .ks-secondary:hover { background:rgba(250,248,242,0.9); }
        .ks-secondary:active { transform:scale(0.97); }
        .ks-ico-sm { width:13px; height:13px; color:#6b5a3e; stroke-width:2; flex-shrink:0; }

        /* ── Flute divider ── */
        .ks-flute { display:flex; align-items:center; gap:7px; width:100%; max-width:340px; }
        .ks-flute-ico { font-size:15px; filter:saturate(0.6); }

        /* ── Social buttons ── */
        .ks-social {
          width:100%; max-width:340px; height:clamp(42px,5.8vh,50px);
          border-radius:25px;
          background:rgba(250,248,242,0.82);
          border:1.5px solid rgba(201,168,76,0.42); color:#1a1208;
          font-family:'DM Sans','Inter',sans-serif;
          font-size:clamp(13px,1.9vh,15px); font-weight:600;
          display:flex; align-items:center; justify-content:center; gap:9px;
          box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer;
          transition:transform 180ms ease,background 180ms ease;
        }
        .ks-social:hover { background:rgba(250,248,242,0.95); }
        .ks-social:active { transform:scale(0.97); }
        .ks-social-ico { width:18px; height:18px; flex-shrink:0; }

        /* ── Legal ── */
        .ks-legal {
          font-family:'Inter',sans-serif;
          font-size:clamp(10px,1.4vh,11.5px); color:rgba(58,44,24,0.62);
          text-align:center; line-height:1.5; max-width:270px; margin:0;
        }
        .ks-link {
          color:rgba(58,44,24,0.82);
          text-decoration:underline; text-underline-offset:2px;
          text-decoration-color:rgba(201,168,76,0.6); font-weight:500;
        }
        .ks-link:hover { color:#1a3323; }
      `}</style>
    </div>
  );
}
