import { Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

// Complete authentication session if redirected back to web browser
WebBrowser.maybeCompleteAuthSession();

let GoogleSignin: any = null;

// Determine environment
const isExpoGo = Constants.appOwnership === "expo";

// Only require and configure native SDK on native standalone builds
if (Platform.OS !== "web" && !isExpoGo) {
  try {
    const NativeGoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
    GoogleSignin = NativeGoogleSignin;
    GoogleSignin.configure({
      webClientId: "29791277131-bsaqqk5jighca3c93fud61jidb6f3l6f.apps.googleusercontent.com",
      offlineAccess: true,
    });
  } catch (err) {
    console.warn("Google Sign-In native module failed to load in this client.", err);
  }
}

export async function signInWithGoogle(): Promise<{ success: boolean; idToken?: string; error?: string }> {
  // If running on Web or inside Expo Go, execute a real Web-based Google OAuth flow
  if (Platform.OS === "web" || isExpoGo || !GoogleSignin) {
    try {
      // Use expo-linking which does not depend on the native ExpoCryptoAES module
      const redirectUri = Linking.createURL("redirect");

      // Google OAuth Endpoint Configuration
      const clientId = "29791277131-bsaqqk5jighca3c93fud61jidb6f3l6f.apps.googleusercontent.com";
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&nonce=${encodeURIComponent(Math.random().toString(36).substring(2))}`;

      console.log("Starting Web-based Google OAuth redirect flow with URI:", redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        // Parse ID Token from URL hash parameters
        const hash = result.url.split("#")[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const idToken = params.get("id_token");
          if (idToken) {
            return { success: true, idToken };
          }
        }
        return { success: false, error: "Failed to parse ID Token from Google's redirect response." };
      }

      if (result.type === "cancel") {
        return { success: false, error: "Sign-in cancelled by user" };
      }
      return { success: false, error: "Google OAuth page was closed without returning credentials." };
    } catch (err: any) {
      console.error("Web Google OAuth error:", err);
      // Development fallback bypass
      if (__DEV__) {
        console.warn("Web Google OAuth failed. Falling back to dev mock token.");
        return { success: true, idToken: "mock_google_id_token" };
      }
      return { success: false, error: err.message || "Google Authentication failed" };
    }
  }

  // Standalone native build execution flow
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken || userInfo.idToken;
    if (!idToken) {
      return { success: false, error: "Failed to retrieve ID token from Google Sign-In" };
    }
    return { success: true, idToken };
  } catch (err: any) {
    console.error("Google Sign-In native error:", err);
    if (err.code === "12501" || err.message?.includes("developer error") || err.message?.includes("cancel")) {
      return { success: false, error: "Sign-in cancelled by user" };
    }
    return { success: false, error: err.message || "Google Authentication failed" };
  }
}
