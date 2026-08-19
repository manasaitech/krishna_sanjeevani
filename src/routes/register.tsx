import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { StatusBar } from "@/components/StatusBar";
import { useApp } from "@/lib/app-state";
import { categories } from "@/lib/content";
import prabhupadaImg from "@/assets/prabhupada.png";

export const Route = createFileRoute("/register")({
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
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("devotional");
  const [loading, setLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  const categoryRef = useRef(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    if (showDedication) {
      const timer = setTimeout(() => {
        navigate({ to: "/home" });
      }, 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [showDedication, navigate]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential, categoryRef.current);
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
          client_id: "29791277131-vmuvo1qjeurjbmh58kk4ue50r2epfi0k.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: 352, logo_alignment: "center" }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Password rules validation
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
      toast.error("Password does not meet validation rules");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName,
        email,
        password,
        category,
      });

      if (res.success) {
        toast.success("Account created successfully!");
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
      <div className="fixed inset-0 z-50 bg-[#FAF5EC] flex flex-col items-center justify-center text-[#3A3125] px-6 select-none animate-fade-in">
        <div className="text-center max-w-sm flex flex-col items-center gap-6">
          <div className="relative">
            {/* Outer soft glowing ring */}
            <div className="absolute -inset-4 rounded-full bg-[#C9A84C]/10 blur-xl animate-pulse" />
            {/* Elegant warm border frame */}
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

          {/* Simple fading circular progress indicator */}
          <div className="mt-2 flex gap-1.5 items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <StatusBar />
      <main className="mx-auto w-full max-w-md px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground shadow-soft transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="animate-rise">
          <h1 className="text-[30px] leading-[1.15] font-semibold">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to build your personal, therapeutic listening space.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 animate-rise" style={{ animationDelay: "80ms" }}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <div className="relative mt-2">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ananya Rao"
                className="w-full h-12 pl-11 pr-4 rounded-btn border border-border bg-surface text-[15px] outline-none transition-all focus:border-cat focus:ring-1 focus:ring-cat placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full h-12 pl-11 pr-4 rounded-btn border border-border bg-surface text-[15px] outline-none transition-all focus:border-cat focus:ring-1 focus:ring-cat placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 rounded-btn border border-border bg-surface text-[15px] outline-none transition-all focus:border-cat focus:ring-1 focus:ring-cat placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Password Validation Guidelines */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? "bg-green-500" : "bg-muted-foreground/45"}`} />
                <span>At least 8 chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${hasUppercase ? "bg-green-500" : "bg-muted-foreground/45"}`} />
                <span>One uppercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${hasLowercase ? "bg-green-500" : "bg-muted-foreground/45"}`} />
                <span>One lowercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${hasNumber ? "bg-green-500" : "bg-muted-foreground/45"}`} />
                <span>One number</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Choose your Path
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`press flex flex-col items-center justify-center p-3 rounded-btn border text-center transition-all ${
                    category === cat.id
                      ? "border-cat bg-cat-light text-cat font-medium"
                      : "border-border bg-surface text-muted-foreground hover:bg-muted/10"
                  }`}
                >
                  <span className="text-sm font-semibold capitalize">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="press w-full h-13 mt-6 flex items-center justify-center gap-2 rounded-btn bg-primary text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center animate-rise" style={{ animationDelay: "140ms" }}>
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="flex justify-center animate-rise" style={{ animationDelay: "160ms" }}>
          <div id="google-signup-btn" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground animate-rise" style={{ animationDelay: "180ms" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cat hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
