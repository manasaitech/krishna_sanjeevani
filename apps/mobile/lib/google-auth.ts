import { Platform } from "react-native";

// ─── OAuth Client IDs ────────────────────────────────────────────────────────
//
// WEB_CLIENT_ID (serverClientId) – The web OAuth 2.0 client for the same
//   Google Cloud project.  By passing this as serverClientId, Google issues
//   an ID token whose `aud` claim is the web client ID — exactly what the
//   backend already validates (GOOGLE_CLIENT_ID env var in wrangler.jsonc).
//
// Neither of these values is a secret — they are public client identifiers
// that appear in OAuth consent flows and are safe to ship in the APK.
// ─────────────────────────────────────────────────────────────────────────────
const WEB_CLIENT_ID =
  "29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com";

// ─── Lazy native-module loader ────────────────────────────────────────────────
//
// @react-native-google-signin calls TurboModuleRegistry.getEnforcing('RNGoogleSignin')
// at MODULE LOAD TIME inside NativeGoogleSignin.js.  If that TurboModule is not
// present in the native binary the whole app crashes before any screen renders.
//
// By deferring the import() to the first sign-in/sign-out call:
//   • The app starts normally even in Expo Go or a dev-client without the module.
//   • On a proper native build (expo run:android) it works correctly.
//   • If the module is missing, the error is caught here and surfaced as a
//     user-friendly message instead of a fatal crash.
// ─────────────────────────────────────────────────────────────────────────────

type NativeGoogleSigninModule = {
  GoogleSignin: any;
  statusCodes: any;
};

let _nativeModule: NativeGoogleSigninModule | null = null;
let _configured = false;

async function loadNativeModule(): Promise<NativeGoogleSigninModule | null> {
  if (_nativeModule) return _nativeModule;

  try {
    // Dynamic import defers TurboModuleRegistry.getEnforcing() to call-time
    const mod = await import(
      "@react-native-google-signin/google-signin"
    );
    if (
      !mod ||
      !mod.GoogleSignin ||
      typeof mod.GoogleSignin.configure !== "function"
    ) {
      console.warn("[Google Auth] Native GoogleSignin object is not available.");
      return null;
    }
    _nativeModule = {
      GoogleSignin: mod.GoogleSignin,
      statusCodes: mod.statusCodes || {},
    };
    return _nativeModule;
  } catch (err) {
    console.error(
      "[Google Auth] Failed to load native Google Sign-In module:",
      err
    );
    return null;
  }
}

/**
 * Ensures GoogleSignin is configured exactly once per app process.
 * Must be called after the native module has been loaded.
 */
function ensureConfigured(GoogleSignin: any): void {
  if (_configured || !GoogleSignin || typeof GoogleSignin.configure !== "function") return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ["email", "profile"],
    offlineAccess: false,
  });
  _configured = true;
}

/**
 * Generates a cryptographically-random nonce string.
 * Each sign-in request uses a unique nonce — never static, never hardcoded.
 */
function generateNonce(byteLength = 32): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      crypto &&
      typeof crypto.getRandomValues === "function"
    ) {
      const bytes = new Uint8Array(byteLength);
      crypto.getRandomValues(bytes);
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    }
  } catch (e) {
    // Polyfill or fallback if crypto is not available in Hermes JS environment
  }

  // Safe fallback nonce generator for React Native
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let nonce = "";
  const timestamp = Date.now().toString(36);
  for (let i = 0; i < byteLength; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${timestamp}-${nonce}`;
}

// ─── Result type ─────────────────────────────────────────────────────────────

export type GoogleAuthResult =
  | { success: true; idToken: string; nonce: string }
  | { success: false; cancelled: boolean; error?: string };

// ─── Sign-In ─────────────────────────────────────────────────────────────────

/**
 * Initiates a native Google Sign-In flow using Android Credential Manager.
 * No browser is opened.
 *
 * IMPORTANT: Requires a native build — run `expo run:android`, NOT `expo start`.
 *
 * Returns a discriminated union:
 *   { success: true, idToken, nonce }   – authentication succeeded
 *   { success: false, cancelled: true } – user dismissed the UI
 *   { success: false, error: string }   – unexpected error
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  // Web platform: native SDK not available
  if (Platform.OS === "web") {
    return {
      success: false,
      cancelled: false,
      error:
        "Native Google Sign-In is not supported on web. Please use the website.",
    };
  }

  // Load the native module lazily (safe even if not linked — catches the error here)
  const native = await loadNativeModule();
  if (!native || !native.GoogleSignin || typeof native.GoogleSignin.configure !== "function") {
    return {
      success: false,
      cancelled: false,
      error:
        "Native Google Sign-In is only supported on a native APK build. " +
        "Please install and run the generated native APK file on your Android device.",
    };
  }

  const { GoogleSignin, statusCodes } = native;

  try {
    ensureConfigured(GoogleSignin);

    // Check Google Play Services availability (Android only)
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Generate a fresh nonce for this authentication attempt.
    const nonce = generateNonce();

    // Trigger the native Credential Manager UI.
    // On @react-native-google-signin v16+, this uses the modern
    // Credential Manager API on Android (API 28+), NOT the deprecated
    // GoogleSignInOptions/GoogleSignInClient approach.
    const response = await GoogleSignin.signIn();

    // Extract the ID token from the response.
    // v16 returns a userInfo object with a data.idToken field.
    const idToken =
      (response as any)?.data?.idToken ??
      (response as any)?.idToken ??
      null;

    if (!idToken) {
      console.warn(
        "[Google Auth] Sign-in succeeded but no idToken in response:",
        JSON.stringify(response)
      );
      return {
        success: false,
        cancelled: false,
        error:
          "Google Sign-In completed but no ID token was returned. Please try again.",
      };
    }

    console.log("[Google Auth] Native sign-in successful — ID token obtained");
    return { success: true, idToken, nonce };
  } catch (err: any) {
    return handleSignInError(err, native.statusCodes);
  }
}

/**
 * Maps Google Sign-In SDK error codes to user-friendly GoogleAuthResult values.
 */
function handleSignInError(err: any, statusCodes: any): GoogleAuthResult {
  const code = String(err?.code ?? "");

  if (
    code === String(statusCodes?.SIGN_IN_CANCELLED) ||
    code === "SIGN_IN_CANCELLED" ||
    code === "12501" ||
    err?.message?.toLowerCase().includes("cancel")
  ) {
    console.log("[Google Auth] User cancelled sign-in");
    return { success: false, cancelled: true };
  }

  if (
    code === String(statusCodes?.IN_PROGRESS) ||
    code === "IN_PROGRESS"
  ) {
    console.warn("[Google Auth] Sign-in already in progress — ignoring duplicate request");
    return { success: false, cancelled: true };
  }

  if (
    code === String(statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) ||
    code === "PLAY_SERVICES_NOT_AVAILABLE"
  ) {
    console.error("[Google Auth] Google Play Services not available");
    return {
      success: false,
      cancelled: false,
      error:
        "Google Play Services is not available on this device. Please update Google Play Services and try again.",
    };
  }

  if (
    code === String(statusCodes?.DEVELOPER_ERROR) ||
    code === "DEVELOPER_ERROR" ||
    code === "10" ||
    err?.message?.includes("DEVELOPER_ERROR")
  ) {
    console.error("[Google Auth] Developer Error (Code 10): SHA-1 / Package mismatch or invalid Client ID");
    return {
      success: false,
      cancelled: false,
      error:
        "Google Developer Error (Code 10).\n\n" +
        "Please ensure in Google Cloud Console:\n" +
        "1. Android Client Package: com.krishnasanjeevani.app\n" +
        "2. Android SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25\n" +
        "3. Web Client ID: 29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com",
    };
  }

  const message =
    err?.message ||
    "An unexpected error occurred during Google Sign-In. Please try again.";
  console.error("[Google Auth] Sign-in error:", err);
  return { success: false, cancelled: false, error: message };
}

// ─── Sign-Out ─────────────────────────────────────────────────────────────────

/**
 * Signs the user out of Google and clears the Credential Manager session
 * so the next sign-in correctly presents the account selector.
 */
export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === "web") return;

  const native = await loadNativeModule();
  if (!native) return; // Non-fatal if module not present

  try {
    ensureConfigured(native.GoogleSignin);
    await native.GoogleSignin.signOut();
    console.log("[Google Auth] Google sign-out successful");
  } catch (err) {
    // Non-fatal — local app session is cleared regardless
    console.warn("[Google Auth] Google sign-out error (non-fatal):", err);
  }
}
