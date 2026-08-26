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
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider, useApp } from "../lib/app-state";
import { Toaster } from "../components/ui/sonner";
import { queryClient } from "../router";

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
      { property: "og:description", content: "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care." },
      { name: "twitter:description", content: "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care." },
      { property: "og:image", content: "https://krishnasanjeevani.com/logo.png" },
      { name: "twitter:image", content: "https://krishnasanjeevani.com/logo.png" },
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
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RouteGuard({ children }: { children: ReactNode }) {
  const { user, authLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;

    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/vedic-science",
      "/inspiration",
      "/the-beginning",
      "/about",
      "/team",
      "/terms",
      "/privacy",
      "/discover",
    ];
    const isPublic = publicPaths.includes(location.pathname);

    if (!user && !isPublic) {
      navigate({ to: "/login" });
      return;
    }

    if (user) {
      const selectedPathway = user.profile?.category;
      if (!selectedPathway || selectedPathway === "unset") {
        if (location.pathname !== "/select-sanjeevani") {
          navigate({ to: "/select-sanjeevani" });
        }
      } else {
        if (location.pathname === "/select-sanjeevani") {
          navigate({ to: selectedPathway === "pregnancy" ? "/journey" : "/home" });
        }
      }
    }
  }, [user, authLoading, location.pathname, navigate]);

  if (authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cat-light border-t-cat" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Restoring calm...</p>
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
        <RouteGuard>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </RouteGuard>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}
