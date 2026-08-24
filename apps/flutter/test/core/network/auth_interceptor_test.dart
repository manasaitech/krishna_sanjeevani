import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:krishna_sanjeevani/core/network/auth_interceptor.dart';
import 'package:krishna_sanjeevani/core/storage/secure_storage_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MemoryStorage extends SecureStorageService {
  final Map<String, String> _data = {};

  MemoryStorage() : super(storage: const FlutterSecureStorage());

  @override
  Future<void> init() async {}

  @override
  String? get accessToken => _data['ks_mobile_access_token'];

  @override
  String? get refreshToken => _data['ks_mobile_refresh_token'];

  @override
  Future<void> storeTokens({required String accessToken, required String refreshToken}) async {
    _data['ks_mobile_access_token'] = accessToken;
    _data['ks_mobile_refresh_token'] = refreshToken;
  }

  @override
  Future<void> clearTokens() async {
    _data.clear();
  }
}

class TestErrorInterceptorHandler extends ErrorInterceptorHandler {
  DioException? errorPassedToNext;
  Response? responsePassedToResolve;

  @override
  void next(DioException err) {
    errorPassedToNext = err;
  }

  @override
  void resolve(Response response) {
    responsePassedToResolve = response;
  }

  @override
  void reject(DioException err, [bool silent = false]) {
    errorPassedToNext = err;
  }
}

void main() {
  group('AuthInterceptor Concurrency & Failure Tests', () {
    test('3 concurrent 401 requests trigger EXACTLY 1 call to /auth/refresh', () async {
      final storage = MemoryStorage();
      await storage.storeTokens(accessToken: 'old_access', refreshToken: 'valid_refresh');

      int refreshCallCount = 0;
      bool authFailureTriggered = false;

      final mockRefreshDio = Dio();
      mockRefreshDio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            if (options.path.contains('/auth/refresh')) {
              refreshCallCount++;
              // Simulate network delay for refresh
              await Future.delayed(const Duration(milliseconds: 50));
              return handler.resolve(
                Response(
                  requestOptions: options,
                  statusCode: 200,
                  data: {
                    'success': true,
                    'data': {
                      'accessToken': 'new_access_token',
                      'refreshToken': 'new_refresh_token',
                    }
                  },
                ),
              );
            }
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {'success': true, 'data': 'ok'},
              ),
            );
          },
        ),
      );

      final interceptor = AuthInterceptor(
        secureStorage: storage,
        refreshDio: mockRefreshDio,
        onAuthFailure: () {
          authFailureTriggered = true;
        },
      );

      // Simulate 3 concurrent 401 DioExceptions
      final req1 = RequestOptions(path: '/api/v1/tracks');
      final req2 = RequestOptions(path: '/api/v1/programs');
      final req3 = RequestOptions(path: '/api/v1/profile');

      final err1 = DioException(requestOptions: req1, response: Response(requestOptions: req1, statusCode: 401));
      final err2 = DioException(requestOptions: req2, response: Response(requestOptions: req2, statusCode: 401));
      final err3 = DioException(requestOptions: req3, response: Response(requestOptions: req3, statusCode: 401));

      final handler1 = TestErrorInterceptorHandler();
      final handler2 = TestErrorInterceptorHandler();
      final handler3 = TestErrorInterceptorHandler();

      // Fire all 3 concurrently
      await Future.wait([
        interceptor.onError(err1, handler1),
        interceptor.onError(err2, handler2),
        interceptor.onError(err3, handler3),
      ]);

      // ASSERT: Only 1 refresh request was executed
      expect(refreshCallCount, equals(1));
      expect(storage.accessToken, equals('new_access_token'));
      expect(storage.refreshToken, equals('new_refresh_token'));
      expect(authFailureTriggered, isFalse);
    });

    test('Failed refresh triggers onAuthFailure callback and wipes stored tokens', () async {
      final storage = MemoryStorage();
      await storage.storeTokens(accessToken: 'expired_access', refreshToken: 'invalid_refresh');

      bool authFailureTriggered = false;

      final mockRefreshDio = Dio();
      mockRefreshDio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            if (options.path.contains('/auth/refresh')) {
              return handler.resolve(
                Response(
                  requestOptions: options,
                  statusCode: 401,
                  data: {'success': false, 'message': 'Refresh token expired'},
                ),
              );
            }
            return handler.next(options);
          },
        ),
      );

      final interceptor = AuthInterceptor(
        secureStorage: storage,
        refreshDio: mockRefreshDio,
        onAuthFailure: () {
          authFailureTriggered = true;
        },
      );

      final req = RequestOptions(path: '/api/v1/user');
      final err = DioException(requestOptions: req, response: Response(requestOptions: req, statusCode: 401));
      final handler = TestErrorInterceptorHandler();

      await interceptor.onError(err, handler);

      // ASSERT: onAuthFailure callback was called and tokens were wiped
      expect(authFailureTriggered, isTrue);
      expect(storage.accessToken, isNull);
      expect(storage.refreshToken, isNull);
      expect(handler.errorPassedToNext, equals(err));
    });
  });
}
