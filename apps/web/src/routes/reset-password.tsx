import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: typeof search.email === "string" ? search.email : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Reset Password — Krishna Sanjeevani" },
      { name: "description", content: "Reset your account password using the email verification code." },
    ],
  }),
  component: ResetPasswordScreen,
});

function ResetPasswordScreen() {
  const { email: initialEmail } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Password does not meet complexity requirements");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(email, code, newPassword);
      if (res.success) {
        toast.success("Password reset successfully! Please sign in with your new password.");
        navigate({ to: "/login" });
      } else {
        toast.error(res.message || "Failed to reset password");
      }
    } catch {
      toast.error("An error occurred during password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ks-root">
      <div className="ks-bg" aria-hidden="true">
        <img src="/images/krishna-onboarding-bg.webp" alt="" className="ks-bg-img" />
      </div>

      <div className="ks-frame">
        <div className="ks-card">
          <div className="ks-icon-wrap">
            <KeyRound className="ks-card-icon" />
          </div>

          <h1 className="ks-card-title">New Password</h1>
          <p className="ks-card-subtitle">
            Enter the 6-digit code sent to your email and choose a strong new password.
          </p>

          <form onSubmit={handleReset} className="ks-form">
            <div className="ks-input-wrap">
              <label htmlFor="rp-email" className="ks-label">
                Email Address
              </label>
              <div className="ks-input-container">
                <Mail className="ks-input-icon" />
                <input
                  id="rp-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ks-input-field"
                  disabled={loading || !!initialEmail}
                />
              </div>
            </div>

            <div className="ks-input-wrap">
              <label htmlFor="rp-code" className="ks-label">
                Verification Code
              </label>
              <div className="ks-input-container">
                <Lock className="ks-input-icon" />
                <input
                  id="rp-code"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="ks-input-field font-mono tracking-widest text-center"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="ks-input-wrap">
              <label htmlFor="rp-password" className="ks-label">
                New Password
              </label>
              <div className="ks-input-container">
                <Lock className="ks-input-icon" />
                <input
                  id="rp-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="ks-input-field"
                  disabled={loading}
                />
              </div>

              {/* Password complexity helper */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className={`text-[10px] flex items-center gap-1.5 ${hasMinLength ? "text-green-600" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-green-600" : "bg-muted-foreground"}`} />
                    At least 8 characters
                  </div>
                  <div className={`text-[10px] flex items-center gap-1.5 ${hasUppercase && hasLowercase ? "text-green-600" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase && hasLowercase ? "bg-green-600" : "bg-muted-foreground"}`} />
                    Uppercase &amp; lowercase letters
                  </div>
                  <div className={`text-[10px] flex items-center gap-1.5 ${hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? "bg-green-600" : "bg-muted-foreground"}`} />
                    At least one number
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || code.length !== 6}
              className="ks-submit-btn"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </button>
          </form>

          <div className="ks-back-to-login">
            <Link to="/forgot-password" className="ks-back-link">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Link>
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
          background: #FAF8F2;
          border: 1.5px solid rgba(201, 168, 76, 0.35);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .ks-card-icon {
          width: 24px; height: 24px;
          color: #8B6914;
        }
        .ks-card-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 24px;
          font-weight: bold;
          color: #1A3323;
          margin: 0 0 8px 0;
          text-align: center;
        }
        .ks-card-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #5C5040;
          text-align: center;
          line-height: 1.55;
          margin: 0 0 20px 0;
        }
        .ks-form {
          width: 100%;
        }
        .ks-input-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .ks-label {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          color: #1A3323;
        }
        .ks-input-container {
          position: relative;
          width: 100%;
        }
        .ks-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #6B5A3E;
        }
        .ks-input-field {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 42px;
          border-radius: 12px;
          border: 1px solid rgba(201, 168, 76, 0.25);
          background: rgba(255, 255, 255, 0.6);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #1A3323;
          box-sizing: border-box;
          transition: border-color 180ms ease, background 180ms ease;
        }
        .ks-input-field:focus {
          outline: none;
          border-color: #C9A84C;
          background: white;
        }
        .ks-submit-btn {
          width: 100%;
          height: 46px;
          border-radius: 23px;
          background: #1A3323;
          color: #F2EDE0;
          border: 1.5px solid rgba(201, 168, 76, 0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(26, 51, 35, 0.25);
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease;
          margin-top: 10px;
        }
        .ks-submit-btn:hover {
          background: #122619;
        }
        .ks-submit-btn:active {
          transform: scale(0.98);
        }
        .ks-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .ks-back-to-login {
          margin-top: 24px;
          text-align: center;
        }
        .ks-back-link {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #8B6914;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: color 180ms ease;
        }
        .ks-back-link:hover {
          color: #1A3323;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
