import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishna_sanjeevani/core/network/api_client.dart';
import 'package:krishna_sanjeevani/core/network/api_response.dart';
import 'package:krishna_sanjeevani/core/providers/network_providers.dart';
import 'package:krishna_sanjeevani/features/auth/providers/auth_provider.dart';
import 'package:krishna_sanjeevani/features/auth/repositories/auth_repository.dart';
import 'package:krishna_sanjeevani/features/auth/services/google_auth_service.dart';
import '../../core/network/auth_interceptor_test.dart';

class MockAuthRepository extends AuthRepository {
  MockAuthRepository(MemoryStorage storage) : super(ApiClient(secureStorage: storage));

  bool shouldLoginSucceed = true;

  @override
  Future<ApiResponse<Map<String, dynamic>>> me() async {
    if (shouldLoginSucceed) {
      return ApiResponse(
        success: true,
        message: 'Success',
        data: {
          'id': 'user_1',
          'email': 'bhakta@example.com',
          'profile': {'fullName': 'Bhakta', 'category': 'devotional'}
        },
      );
    }
    return ApiResponse.error('Unauthorized', errorName: 'UnauthorizedError');
  }

  @override
  Future<ApiResponse<Map<String, dynamic>>> login({
    required String email,
    required String password,
  }) async {
    if (shouldLoginSucceed && email == 'bhakta@example.com' && password == 'password') {
      return ApiResponse(
        success: true,
        message: 'Login successful',
        data: {
          'tokens': {
            'accessToken': 'access_token_abc',
            'refreshToken': 'refresh_token_xyz',
          }
        },
      );
    }
    return ApiResponse.error('Invalid credentials');
  }

  @override
  Future<ApiResponse<dynamic>> logout() async {
    return ApiResponse(success: true, message: 'Logged out');
  }
}

class MockGoogleAuthService extends GoogleAuthService {
  bool signOutCalled = false;

  @override
  Future<void> signOut() async {
    signOutCalled = true;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthProvider State Machine Tests', () {
    late MemoryStorage storage;
    late MockAuthRepository repo;
    late MockGoogleAuthService googleAuth;

    setUp(() {
      storage = MemoryStorage();
      repo = MockAuthRepository(storage);
      googleAuth = MockGoogleAuthService();
    });

    test('bootstrapSession restores user profile when valid token exists', () async {
      await storage.storeTokens(accessToken: 'valid_access', refreshToken: 'valid_refresh');
      final container = ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          authRepositoryProvider.overrideWithValue(repo),
          googleAuthServiceProvider.overrideWithValue(googleAuth),
        ],
      );
      addTearDown(container.dispose);

      await container.read(authProvider.notifier).bootstrapSession();

      expect(container.read(authProvider).isAuthenticated, isTrue);
      expect(container.read(authProvider).user, isNotNull);
      expect(container.read(authProvider).user!['email'], equals('bhakta@example.com'));
    });

    test('login succeeds and persists tokens', () async {
      final container = ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          authRepositoryProvider.overrideWithValue(repo),
          googleAuthServiceProvider.overrideWithValue(googleAuth),
        ],
      );
      addTearDown(container.dispose);

      final success = await container.read(authProvider.notifier).login('bhakta@example.com', 'password');

      expect(success, isTrue);
      expect(container.read(authProvider).isAuthenticated, isTrue);
      expect(storage.accessToken, equals('access_token_abc'));
    });

    test('logout wipes stored tokens and calls google sign out', () async {
      await storage.storeTokens(accessToken: 'access_1', refreshToken: 'refresh_1');
      final container = ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          authRepositoryProvider.overrideWithValue(repo),
          googleAuthServiceProvider.overrideWithValue(googleAuth),
        ],
      );
      addTearDown(container.dispose);

      await container.read(authProvider.notifier).logout();

      expect(container.read(authProvider).isAuthenticated, isFalse);
      expect(container.read(authProvider).user, isNull);
      expect(storage.accessToken, isNull);
      expect(googleAuth.signOutCalled, isTrue);
    });
  });
}
