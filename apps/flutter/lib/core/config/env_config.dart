import 'package:flutter/foundation.dart';

class EnvConfig {
  static const String appName = 'Krishna Sanjeevani';
  static const String appVersion = '1.0.0';

  // Base URL configuration for production & dev
  static String get baseUrl {
    if (kDebugMode) {
      if (kIsWeb) {
        return 'http://localhost:8787/api/v1';
      }
      // For local testing on Android Emulator:
      // return 'http://10.0.2.2:8787/api/v1';
      return 'https://backend.astrosutraai.workers.dev/api/v1';
    }
    return 'https://backend.astrosutraai.workers.dev/api/v1';
  }

  // Google OAuth Credentials
  static const String googleWebClientId =
      '29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com';

  // Secure Storage Keys (Identical to React Native for session compatibility)
  static const String accessTokenKey = 'ks_mobile_access_token';
  static const String refreshTokenKey = 'ks_mobile_refresh_token';
}
