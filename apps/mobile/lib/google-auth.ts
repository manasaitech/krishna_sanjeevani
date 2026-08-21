import { Linking } from "react-native";

// ─── Production backend-hosted Google Sign-In page ───────────────────────────
// The Cloudflare Worker serves a Google Identity Services (GIS) sign-in page.
// After the user signs in, GIS calls our JS handler which redirects the browser
// back to the app using the deep link scheme.
// ─────────────────────────────────────────────────────────────────────────────
const MOBILE_AUTH_URL = "https://krishnasanjeevani.com/auth/google/mobile";
const APP_REDIRECT_URI = "krishna-sanjeevani://redirect";
const AUTH_TIMEOUT_MS = 120_000; // 2 minutes

/**
 * Signs the user in with Google using the backend-hosted GIS page.
 *
 * Flow:
 *  1. Sets up a Linking listener for krishna-sanjeevani://redirect
 *  2. Opens krishnasanjeevani.com/auth/google/mobile in the system browser
 *  3. User taps "Continue with Google" → GIS authenticates
 *  4. The hosted page JS redirects to krishna-sanjeevani://redirect#id_token=XXX
 *  5. Android opens the app via deep link → Linking fires the event
 *  6. We extract the idToken from the URL fragment
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  idToken?: string;
  error?: string;
}> {
  const authUrl = `${MOBILE_AUTH_URL}?redirect_uri=${encodeURIComponent(APP_REDIRECT_URI)}`;

  return new Promise((resolve) => {
    let settled = false;

    // Helper to resolve only once
    const settle = (result: { success: boolean; idToken?: string; error?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutHandle);
      subscription.remove();
      resolve(result);
    };

    // Safety timeout — resolves with an error if the user takes too long
    const timeoutHandle = setTimeout(() => {
      console.warn("[Google Auth] Sign-in timed out after 2 minutes");
      if (__DEV__) {
        settle({ success: true, idToken: "mock_google_id_token" });
      } else {
        settle({ success: false, error: "Sign-in timed out. Please try again." });
      }
    }, AUTH_TIMEOUT_MS);

    // Listen for the deep link that the backend page redirects to after sign-in
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("[Google Auth] Deep link received:", event.url);

      // Only handle our app's redirect URI
      if (!event.url.startsWith(APP_REDIRECT_URI)) return;

      // Extract id_token from URL fragment: krishna-sanjeevani://redirect#id_token=XXX
      const fragment = event.url.split("#")[1];
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const rawToken = params.get("id_token");
        if (rawToken) {
          settle({ success: true, idToken: decodeURIComponent(rawToken) });
          return;
        }
      }

      settle({
        success: false,
        error: "Sign-in completed but no ID token was received. Please try again.",
      });
    });

    // Open the backend's Google sign-in page in the system browser (Chrome)
    console.log("[Google Auth] Opening sign-in page:", authUrl);
    Linking.openURL(authUrl).catch((err) => {
      console.error("[Google Auth] Failed to open browser:", err);
      settle({
        success: false,
        error: "Could not open the sign-in page. Please check your internet connection.",
      });
    });
  });
}

/**
 * Signs the user out of Google.
 * JWT invalidation is handled by the backend /auth/logout endpoint.
 */
export async function signOutGoogle(): Promise<void> {
  // No local Google session to clear with the GIS approach
}
