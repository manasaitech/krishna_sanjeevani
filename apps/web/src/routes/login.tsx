import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { StatusBar } from "@/components/StatusBar";
import { useApp } from "@/lib/app-state";

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

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        toast.success("Welcome to Krishna Sanjeevani!");
        navigate({ to: "/home" });
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
        navigate({ to: "/home" });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <StatusBar />
      <main className="mx-auto w-full max-w-md px-6 pb-12 flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <Link
            to="/welcome"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground shadow-soft transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="animate-rise">
          <h1 className="text-[30px] leading-[1.15] font-semibold">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your personalized therapeutic path.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 animate-rise" style={{ animationDelay: "100ms" }}>
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
                placeholder="you@example.com"
                className="w-full h-12 pl-11 pr-4 rounded-btn border border-border bg-surface text-[15px] outline-none transition-all focus:border-cat focus:ring-1 focus:ring-cat placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
            </div>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="press w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-btn bg-primary text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center animate-rise" style={{ animationDelay: "150ms" }}>
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="flex justify-center animate-rise" style={{ animationDelay: "180ms" }}>
          <div id="google-signin-btn" />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground animate-rise" style={{ animationDelay: "200ms" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-cat hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
