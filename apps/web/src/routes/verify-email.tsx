import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Mail, ArrowRight, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Email — Krishna Sanjeevani" },
      { name: "description", content: "Verify your email address to secure your account." },
    ],
  }),
  component: VerifyEmailScreen,
});

function VerifyEmailScreen() {
  const { user, restoreSession, logout } = useApp();
  const navigate = useNavigate();
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    } else if (user.authProvider === "google" || user.emailVerified === 1) {
      const selectedPathway = user.profile?.category;
      if (!selectedPathway || selectedPathway === "unset") {
        navigate({ to: "/category" });
      } else {
        navigate({ to: selectedPathway === "pregnancy" ? "/journey" : "/home" });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
    return;
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(user?.email || "", code, "verification");
      if (res.success) {
        toast.success("Email verified successfully!");
        await restoreSession();
      } else {
        toast.error(res.message || "Invalid verification code");
      }
    } catch {
      toast.error("An error occurred during verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    
    setIsResending(true);
    try {
      const res = await api.auth.resendOtp(user?.email || "", "verification");
      if (res.success) {
        toast.success("Verification code resent successfully!");
        setResendTimer(60);
      } else {
        toast.error(res.message || "Failed to resend code");
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  const codeChars = code.split("");

  return (
    <div className="ks-root">
      <div className="ks-bg" aria-hidden="true">
        <img src="/images/krishna-onboarding-bg.webp" alt="" className="ks-bg-img" />
      </div>

      <div className="ks-frame">
        <div className="ks-card">
          <div className="ks-icon-wrap">
            <Mail className="ks-card-icon" />
          </div>

          <h1 className="ks-card-title">Verify Your Email</h1>
          <p className="ks-card-subtitle">
            We have sent a 6-digit code to <strong>{user?.email}</strong>. Please enter it below to confirm your account.
          </p>

          <form onSubmit={handleVerify} className="ks-form">
            {/* Native Hidden Input Overlay */}
            <div className="relative my-4" onClick={handleBoxClick}>
              <input
                ref={inputRef}
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                disabled={loading}
                autoFocus
              />
              
              {/* Box Indicators */}
              <div className="flex justify-between gap-2">
                {Array.from({ length: 6 }).map((_, index) => {
                  const char = codeChars[index] || "";
                  const isFocused = code.length === index;
                  return (
                    <div
                      key={index}
                      className={`flex-1 aspect-square max-w-12 rounded-xl border-2 text-xl font-bold flex items-center justify-center transition-all ${
                        isFocused
                          ? "border-[#7A1E2C] bg-[#7A1E2C]/5 shadow-sm shadow-[#7A1E2C]/20"
                          : char
                          ? "border-[#8B6914] bg-[#FAF8F2]"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {char}
                      {isFocused && (
                        <span className="w-0.5 h-6 bg-[#7A1E2C] animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="ks-submit-btn"
            >
              {loading ? "Verifying..." : "Verify Code"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </button>
          </form>

          <div className="ks-actions">
            {resendTimer > 0 ? (
              <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Resend code in {resendTimer}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="ks-text-btn"
              >
                {isResending ? "Resending..." : "Resend Code"}
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="ks-text-btn ks-danger flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <style>{`
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
        .ks-frame {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .ks-card {
          width: 100%;
          max-width: 380px;
          background: rgba(255, 255, 255, 0.94);
          border: 1.5px solid rgba(201, 168, 76, 0.45);
          box-shadow: 0 8px 32px rgba(122, 30, 44, 0.15);
          border-radius: 28px;
          padding: 30px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          backdrop-filter: blur(10px);
        }
        .ks-icon-wrap {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: #FCEFF2;
          border: 1.5px solid rgba(122, 30, 44, 0.35);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .ks-card-icon {
          width: 26px; height: 26px;
          color: #7A1E2C;
        }
        .ks-card-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 24px;
          font-weight: bold;
          color: #4A0E17;
          margin: 0 0 8px 0;
          text-align: center;
        }
        .ks-card-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #5C5040;
          text-align: center;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .ks-form {
          width: 100%;
        }
        .ks-submit-btn {
          width: 100%;
          height: 46px;
          border-radius: 23px;
          background: #7A1E2C;
          color: white;
          border: 1px solid rgba(201, 168, 76, 0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(122, 30, 44, 0.3);
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease;
          margin-top: 10px;
        }
        .ks-submit-btn:hover {
          background: #61131E;
        }
        .ks-submit-btn:active {
          transform: scale(0.98);
        }
        .ks-submit-btn:disabled {
          background: rgba(122, 30, 44, 0.5);
          cursor: not-allowed;
          box-shadow: none;
        }
        .ks-actions {
          width: 100%;
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(201, 168, 76, 0.15);
          padding-top: 16px;
        }
        .ks-text-btn {
          background: none;
          border: none;
          color: #8B6914;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 180ms ease;
        }
        .ks-text-btn:hover {
          background: rgba(139, 105, 20, 0.08);
        }
        .ks-text-btn.ks-danger {
          color: #A32A3B;
        }
        .ks-text-btn.ks-danger:hover {
          background: rgba(163, 42, 59, 0.08);
        }
      `}</style>
    </div>
  );
}
