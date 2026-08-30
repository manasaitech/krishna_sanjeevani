import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/network_providers.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../repositories/auth_repository.dart';
import '../services/google_auth_service.dart';
import '../../../core/network/api_response.dart';

class AuthState {
  final Map<String, dynamic>? user;
  final bool isAuthenticated;
  final bool authLoading;
  final String? error;

  AuthState({
    this.user,
    this.isAuthenticated = false,
    this.authLoading = true,
    this.error,
  });

  AuthState copyWith({
    Map<String, dynamic>? user,
    bool? isAuthenticated,
    bool? authLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      authLoading: authLoading ?? this.authLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final SecureStorageService _secureStorage;
  final GoogleAuthService _googleAuthService;
  final Ref _ref;

  AuthNotifier({
    required AuthRepository authRepository,
    required SecureStorageService secureStorage,
    required GoogleAuthService googleAuthService,
    required Ref ref,
  })  : _authRepository = authRepository,
        _secureStorage = secureStorage,
        _googleAuthService = googleAuthService,
        _ref = ref,
        super(AuthState());

  Map<String, String>? _extractTokens(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data['tokens'] is Map) {
        final t = data['tokens'] as Map;
        final access = t['accessToken'] ?? t['access_token'] ?? t['token'];
        final refresh = t['refreshToken'] ?? t['refresh_token'] ?? access;
        if (access is String) {
          return {
            'accessToken': access,
            'refreshToken': (refresh is String) ? refresh : access,
          };
        }
      }
      final access = data['accessToken'] ?? data['access_token'] ?? data['token'];
      final refresh = data['refreshToken'] ?? data['refresh_token'] ?? access;
      if (access is String) {
        return {
          'accessToken': access,
          'refreshToken': (refresh is String) ? refresh : access,
        };
      }
    }
    return null;
  }

  Future<void> bootstrapSession() async {
    state = state.copyWith(authLoading: true, error: null);
    try {
      await _secureStorage.init();
      final token = _secureStorage.accessToken;
      if (token == null || token.isEmpty) {
        state = state.copyWith(authLoading: false, isAuthenticated: false);
        return;
      }

      final res = await _authRepository.me();
      if (res.success && res.data != null) {
        final userData = res.data!;
        _updateUserCategory(userData);
        state = state.copyWith(
          user: userData,
          isAuthenticated: true,
          authLoading: false,
        );
      } else {
        await _secureStorage.clearTokens();
        state = state.copyWith(
          user: null,
          isAuthenticated: false,
          authLoading: false,
        );
      }
    } catch (_) {
      state = state.copyWith(
        user: null,
        isAuthenticated: false,
        authLoading: false,
      );
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(authLoading: true, error: null);
    final res = await _authRepository.login(email: email, password: password);

    if (res.success && res.data != null) {
      final tokens = _extractTokens(res.data);
      if (tokens != null) {
        Map<String, dynamic>? userData;
        if (res.data!['user'] is Map<String, dynamic>) {
          userData = res.data!['user'] as Map<String, dynamic>;
        } else {
          userData = res.data;
        }

        await _secureStorage.storeTokens(
          accessToken: tokens['accessToken']!,
          refreshToken: tokens['refreshToken']!,
        );

        _updateUserCategory(userData ?? {});
        state = state.copyWith(
          user: userData,
          isAuthenticated: true,
          authLoading: false,
          error: null,
        );
        return true;
      }
    }

    state = state.copyWith(
      authLoading: false,
      error: res.message,
      isAuthenticated: false,
    );
    return false;
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    required String category,
  }) async {
    state = state.copyWith(authLoading: true, error: null);
    final res = await _authRepository.register(
      email: email,
      password: password,
      fullName: fullName,
      category: category,
    );

    if (res.success && res.data != null) {
      final tokens = _extractTokens(res.data);
      if (tokens != null) {
        Map<String, dynamic>? userData;
        if (res.data!['user'] is Map<String, dynamic>) {
          userData = res.data!['user'] as Map<String, dynamic>;
        } else {
          userData = res.data;
        }

        await _secureStorage.storeTokens(
          accessToken: tokens['accessToken']!,
          refreshToken: tokens['refreshToken']!,
        );

        _updateUserCategory(userData ?? {});
        state = state.copyWith(
          user: userData,
          isAuthenticated: true,
          authLoading: false,
          error: null,
        );
        return true;
      }
    }

    state = state.copyWith(
      authLoading: false,
      error: res.message,
      isAuthenticated: false,
    );
    return false;
  }

  Future<bool> loginWithGoogle() async {
    state = state.copyWith(authLoading: true, error: null);
    final result = await _googleAuthService.signIn();
    if (result.cancelled) {
      debugPrint('Google Sign-In: Cancelled by user.');
      state = state.copyWith(authLoading: false);
      return false;
    }

    if (!result.success || result.idToken == null) {
      debugPrint('Google Sign-In Local Error: ${result.error}');
      state = state.copyWith(
        authLoading: false,
        error: result.error ?? 'Google Sign-In failed locally',
      );
      return false;
    }

    final res = await _authRepository.loginWithGoogle(idToken: result.idToken!);
    if (res.success && res.data != null) {
      final tokens = _extractTokens(res.data);
      if (tokens != null) {
        Map<String, dynamic>? userData;
        if (res.data!['user'] is Map<String, dynamic>) {
          userData = res.data!['user'] as Map<String, dynamic>;
        } else {
          userData = res.data;
        }

        await _secureStorage.storeTokens(
          accessToken: tokens['accessToken']!,
          refreshToken: tokens['refreshToken']!,
        );

        _updateUserCategory(userData ?? {});
        state = state.copyWith(
          user: userData,
          isAuthenticated: true,
          authLoading: false,
          error: null,
        );
        return true;
      }
    }

    debugPrint('Google Sign-In Server Verification Error: ${res.message}');
    state = state.copyWith(
      authLoading: false,
      error: res.message,
      isAuthenticated: false,
    );
    return false;
  }

  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } catch (_) {}

    await _googleAuthService.signOut();
    await _secureStorage.clearTokens();
    state = AuthState(authLoading: false, isAuthenticated: false, user: null);
  }

  void _updateUserCategory(Map<String, dynamic> userData) {
    try {
      final profile = userData['profile'];
      if (profile is Map<String, dynamic> && profile['category'] is String) {
        final catStr = profile['category'] as String;
        final match = AppCategory.values.firstWhere(
          (c) => c.name == catStr,
          orElse: () => AppCategory.devotional,
        );
        _ref.read(categoryProvider.notifier).setCategory(match, syncWithBackend: false);
      }
    } catch (_) {}
  }

  Future<ApiResponse<dynamic>> verifyOtp({
    required String email,
    required String code,
    required String purpose,
  }) async {
    return _authRepository.verifyOtp(email: email, code: code, purpose: purpose);
  }

  Future<ApiResponse<dynamic>> resendOtp({
    required String email,
    required String purpose,
  }) async {
    return _authRepository.resendOtp(email: email, purpose: purpose);
  }

  Future<ApiResponse<dynamic>> forgotPassword({
    required String email,
  }) async {
    return _authRepository.forgotPassword(email: email);
  }

  Future<ApiResponse<dynamic>> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    return _authRepository.resetPassword(
      email: email,
      code: code,
      newPassword: newPassword,
    );
  }

  Future<bool> deleteAccount() async {
    state = state.copyWith(authLoading: true, error: null);
    try {
      final res = await _authRepository.deleteAccount();
      if (res.success) {
        await _googleAuthService.signOut();
        await _secureStorage.clearTokens();
        state = AuthState(authLoading: false, isAuthenticated: false, user: null);
        return true;
      } else {
        state = state.copyWith(
          authLoading: false,
          error: res.message ?? 'Failed to delete account',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        authLoading: false,
        error: 'An unexpected error occurred during account deletion.',
      );
      return false;
    }
  }
}


final googleAuthServiceProvider = Provider<GoogleAuthService>((ref) {
  return GoogleAuthService();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(apiClient);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  final storage = ref.watch(secureStorageProvider);
  final googleAuth = ref.watch(googleAuthServiceProvider);
  final notifier = AuthNotifier(
    authRepository: repo,
    secureStorage: storage,
    googleAuthService: googleAuth,
    ref: ref,
  );
  notifier.bootstrapSession();
  return notifier;
});
