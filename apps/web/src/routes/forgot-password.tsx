import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Krishna Sanjeevani" },
      { name: "description", content: "Recover your account credentials via email verification code." },
    ],
  }),
  component: ForgotPasswordScreen,
});

function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      if (res.success) {
        toast.success("Password reset code sent to your email!");
        navigate({
          to: "/reset-password",
          search: { email },
        });
      } else {
        toast.error(res.message || "Failed to send recovery code");
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
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
            <Mail className="ks-card-icon" />
          </div>

          <h1 className="ks-card-title">Reset Password</h1>
          <p className="ks-card-subtitle">
            Enter your email address below. We'll send you a 6-digit verification code to reset your password.
          </p>

          <form onSubmit={handleSendCode} className="ks-form">
            <div className="ks-input-wrap">
              <label htmlFor="fp-email" className="ks-label">
                Email Address
              </label>
              <div className="ks-input-container">
                <Mail className="ks-input-icon" />
                <input
                  id="fp-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ks-input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ks-submit-btn">
              {loading ? "Sending Code..." : "Send Recovery Code"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </button>
          </form>

          <div className="ks-back-to-login">
            <Link to="/login" className="ks-back-link">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Sign In
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
          margin-bottom: 20px;
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
