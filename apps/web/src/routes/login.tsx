import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { StatusBar } from "@/components/StatusBar";
import { useApp } from "@/lib/app-state";
import prabhupadaImg from "@/assets/prabhupada.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Sign in to resume your therapeutic raga listening journey.",
      },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const { login, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  useEffect(() => {
    if (showDedication) {
      const timer = setTimeout(() => {
        navigate({ to: "/home" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDedication, navigate]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        toast.success("Welcome to Krishna Sanjeevani!");
        setShowDedication(true);
      } else {
        toast.error(res.message);
      }
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
          client_id: "29791277131-bsaqqk5jighca3c93fud61jidb6f3l6f.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 352, logo_alignment: "center" }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back!");
        setShowDedication(true);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showDedication) {
    return (
      <div className="fixed inset-0 z-50 bg-[#160d0c] flex flex-col items-center justify-center text-[#FAF8F4] px-6 select-none animate-fade-in">
        <div className="text-center max-w-sm flex flex-col items-center gap-6">
          <div className="relative">
            {/* Outer soft glowing ring */}
            <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/5 blur-xl animate-pulse" />
            {/* Gold border frame */}
            <div className="relative h-44 w-44 rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] shadow-2xl">
              <img
                src={prabhupadaImg}
                alt="Srila Prabhupada"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
              Dedicated to
            </span>
            <h2 className="text-2xl font-serif font-semibold tracking-wide mt-1">
              His Divine Grace
            </h2>
            <h1 className="text-xl font-bold font-sans tracking-wide text-[#FAF8F4]">
              A.C. Bhaktivedanta Swami Prabhupada
            </h1>
            <p className="text-xs text-[#FAF8F4]/60 italic font-serif leading-relaxed mt-2">
              Founder-Acharya of the International Society for Krishna Consciousness
            </p>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mx-auto my-4" />
            <p className="text-[10px] uppercase font-semibold tracking-widest text-[#FAF8F4]/40">
              Krishna Sanjeevani Music Healing Research
            </p>
          </div>

          {/* Simple fading circular progress indicator */}
          <div className="mt-4 flex gap-1 items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F5F1EB] flex flex-col">
      <StatusBar />
      <main className="mx-auto w-full max-w-md px-6 pb-12 flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <Link
            to="/welcome"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] text-[#1A1A1A] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="animate-rise">
          <h1 className="text-[30px] leading-[1.15] font-semibold text-[#1A1A1A]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#7C7A85]">
            Sign in to continue your personalized therapeutic path.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 animate-rise" style={{ animationDelay: "100ms" }}>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C7A85]">
              Email Address
            </label>
            <div className="relative mt-2 flex items-center h-12 rounded-[16px] border border-[#E8E4DC] bg-white px-4">
              <Mail className="h-4 w-4 text-[#7C7A85] mr-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 h-full text-[15px] text-[#1A1A1A] outline-none placeholder:text-[#7C7A85]/50 bg-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C7A85]">
                Password
              </label>
            </div>
            <div className="relative mt-2 flex items-center h-12 rounded-[16px] border border-[#E8E4DC] bg-white px-4">
              <Lock className="h-4 w-4 text-[#7C7A85] mr-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 h-full text-[15px] text-[#1A1A1A] outline-none placeholder:text-[#7C7A85]/50 bg-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="press w-full h-13 mt-6 flex items-center justify-center gap-2 rounded-[16px] bg-[#264653] hover:bg-[#1d353f] text-[15px] font-semibold text-[#FAF8F4] shadow-soft disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex py-6 items-center animate-rise" style={{ animationDelay: "150ms" }}>
          <div className="flex-grow border-t border-[#E8E4DC]"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase text-[#7C7A85] font-semibold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-[#E8E4DC]"></div>
        </div>

        <div className="flex justify-center animate-rise" style={{ animationDelay: "180ms" }}>
          <div id="google-signin-btn" />
        </div>

        <p className="mt-8 text-center text-sm text-[#7C7A85] animate-rise" style={{ animationDelay: "200ms" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-cat hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
