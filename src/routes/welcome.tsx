import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, Chrome } from "lucide-react";
import illustration from "@/assets/welcome-illustration.jpg";
import { StatusBar } from "@/components/StatusBar";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Begin a calm listening practice. Sign in or create an account to start your therapeutic raga journey.",
      },
      { property: "og:title", content: "Welcome — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Begin a calm listening practice built on Krishna Sanjeevani ragas.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <StatusBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10">
        <div className="animate-soft-in mt-6 overflow-hidden rounded-sheet bg-cat-light">
          <img
            src={illustration}
            alt="A seated figure listening calmly to healing sound waves"
            width={1024}
            height={1024}
            className="mx-auto h-56 w-56 object-contain sm:h-64 sm:w-64"
          />
        </div>

        <div className="animate-rise mt-8">
          <h1 className="text-[30px] leading-[1.15] font-semibold">
            Healing that begins
            <br />
            with listening
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Krishna Sanjeevani ragas and surāvalis, sequenced by therapists for stress
            relief, sleep, focus, and pregnancy wellbeing.
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-10">
          <Link
            to="/category"
            className="press flex min-h-13 w-full items-center justify-center rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Continue
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/category"
              className="press flex min-h-12 items-center justify-center rounded-btn border border-border bg-surface text-sm font-semibold"
            >
              Sign in
            </Link>
            <Link
              to="/category"
              className="press flex min-h-12 items-center justify-center rounded-btn border border-border bg-surface text-sm font-semibold"
            >
              Create account
            </Link>
          </div>

          <div className="flex items-center gap-3 py-2">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/category"
            className="press flex min-h-12 w-full items-center justify-center gap-2.5 rounded-btn border border-border bg-surface text-sm font-semibold"
          >
            <Chrome className="h-4 w-4" /> Continue with Google
          </Link>
          <Link
            to="/category"
            className="press flex min-h-12 w-full items-center justify-center gap-2.5 rounded-btn border border-border bg-surface text-sm font-semibold"
          >
            <Apple className="h-4 w-4" /> Continue with Apple
          </Link>

          <p className="pt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
            By continuing you agree to our{" "}
            <span className="font-medium text-foreground underline decoration-border underline-offset-2">
              Terms
            </span>{" "}
            and{" "}
            <span className="font-medium text-foreground underline decoration-border underline-offset-2">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
