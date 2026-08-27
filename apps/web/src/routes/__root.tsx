import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { OpeningExperience } from "../components/home/OpeningExperience";
import { useVerseAudio } from "../lib/use-verse-audio";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider, useApp } from "../lib/app-state";
import { Toaster } from "../components/ui/sonner";
import { queryClient } from "../router";
import { AuthModalProvider } from "../hooks/useAuthModal";
import { AuthFloatingPopup } from "../components/AuthFloatingPopup";
import { AuthModal } from "../components/AuthModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-6xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-lg font-semibold">This page has drifted away</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The screen you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/home"
          className="press mt-8 inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold">This screen didn't load</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nothing was lost. Take a breath and try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="press inline-flex min-h-11 items-center rounded-btn border border-border bg-surface px-6 text-sm font-semibold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Krishna Sanjeevani — Therapeutic Raga Streaming" },
      {
        name: "description",
        content:
          "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
      },
      { name: "theme-color", content: "#F8F6F2" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Krishna Sanjeevani — Therapeutic Raga Streaming" },
      { name: "twitter:title", content: "Krishna Sanjeevani — Therapeutic Raga Streaming" },
      {
        property: "og:description",
        content:
          "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
      },
      {
        name: "twitter:description",
        content:
          "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
      },
      { property: "og:image", content: "https://krishnasanjeevani.com/logo.webp" },
      { name: "twitter:image", content: "https://krishnasanjeevani.com/logo.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-category="devotional">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/vedic-science",
  "/inspiration",
  "/the-beginning",
  "/origin",
  "/about",
  "/team",
  "/terms",
  "/privacy",
];

function RouteGuard({ children }: { children: ReactNode }) {
  const { user, authLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const audio = useVerseAudio();

  const [isSplashActive, setIsSplashActive] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("opening_experience_dismissed") !== "true";
    }
    return true;
  });

  const isPublic = publicPaths.includes(location.pathname);

  useEffect(() => {
    if (isSplashActive) return;
    console.log("RouteGuard user state:", user);
    if (authLoading) return;

    if (!user && !isPublic) {
      const redirectUrl = location.pathname + location.search;
      navigate({
        to: "/login",
        search: { redirect: redirectUrl },
      });
      return;
    }

    if (user) {
      const isUnverified = user.emailVerified === 0;
      if (isUnverified) {
        if (location.pathname !== "/verify-email") {
          navigate({ to: "/verify-email" });
          return;
        }
      } else {
        if (location.pathname === "/verify-email") {
          const selectedPathway = user.profile?.category;
          if (!selectedPathway || selectedPathway === "unset") {
            navigate({ to: "/category" });
          } else {
            navigate({ to: selectedPathway === "pregnancy" ? "/journey" : "/home" });
          }
          return;
        }

        const selectedPathway = user.profile?.category;
        if (!selectedPathway || selectedPathway === "unset") {
          if (location.pathname !== "/category") {
            navigate({ to: "/category" });
          }
        } else {
          if (location.pathname === "/category") {
            navigate({ to: selectedPathway === "pregnancy" ? "/journey" : "/home" });
          }
        }
      }
    }
  }, [user, authLoading, location.pathname, navigate]);

  if (isSplashActive) {
    return (
      <OpeningExperience
        audio={audio}
        onComplete={() => setIsSplashActive(false)}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cat-light border-t-cat" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Restoring calm...
          </p>
        </div>
      </div>
    );
  }

  if (!user && !isPublic) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cat-light border-t-cat" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthModalProvider>
          <RouteGuard>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </RouteGuard>
          <AuthFloatingPopup />
          <AuthModal />
          <Toaster />
        </AuthModalProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
