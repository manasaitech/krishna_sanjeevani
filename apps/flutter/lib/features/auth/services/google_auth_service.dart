import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/config/env_config.dart';

class GoogleAuthResult {
  final bool success;
  final bool cancelled;
  final String? idToken;
  final String? error;

  GoogleAuthResult({
    required this.success,
    this.cancelled = false,
    this.idToken,
    this.error,
  });

  factory GoogleAuthResult.ok(String idToken) {
    return GoogleAuthResult(success: true, idToken: idToken);
  }

  factory GoogleAuthResult.cancel() {
    return GoogleAuthResult(success: false, cancelled: true);
  }

  factory GoogleAuthResult.fail(String message) {
    return GoogleAuthResult(success: false, error: message);
  }
}

class GoogleAuthService {
  final GoogleSignIn _googleSignIn;
  bool _initialized = false;

  GoogleAuthService({GoogleSignIn? googleSignIn})
      : _googleSignIn = googleSignIn ?? GoogleSignIn.instance;

  Future<void> _ensureInitialized() async {
    if (_initialized) return;
    try {
      await _googleSignIn.initialize(
        serverClientId: EnvConfig.googleWebClientId,
      );
      _initialized = true;
    } catch (e) {
      debugPrint('GoogleAuthService Initialization Error: $e');
    }
  }

  Future<GoogleAuthResult> signIn() async {
    try {
      await _ensureInitialized();
      final account = await _googleSignIn.authenticate();
      final authentication = account.authentication;
      final idToken = authentication.idToken;

      if (idToken == null || idToken.isEmpty) {
        debugPrint('GoogleAuthService Error: Succeeded but returned empty ID token.');
        return GoogleAuthResult.fail(
          'Google Sign-In succeeded but no ID token was returned. Please try again.',
        );
      }

      return GoogleAuthResult.ok(idToken);
    } catch (err) {
      debugPrint('GoogleAuthService Exception: $err');
      final msg = err.toString();
      if (msg.toLowerCase().contains('cancel')) {
        return GoogleAuthResult.cancel();
      }
      return GoogleAuthResult.fail('Google Sign-In failed: $msg');
    }
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {
      // Non-fatal if offline or module uninitialized
    }
  }
}
