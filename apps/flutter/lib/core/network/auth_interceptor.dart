import 'dart:async';
import 'package:dio/dio.dart';
import '../config/env_config.dart';
import '../storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService secureStorage;
  final void Function()? onAuthFailure;
  final Dio? refreshDio;
  
  // Single-flight refresh mutex lock
  Completer<bool>? _refreshCompleter;

  AuthInterceptor({
    required this.secureStorage,
    this.onAuthFailure,
    this.refreshDio,
  });

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = secureStorage.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Content-Type'] = 'application/json';
    return handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !err.requestOptions.extra.containsKey('isRetry')) {
      final success = await _refreshToken();
      if (success) {
        final options = err.requestOptions;
        options.extra['isRetry'] = true;
        options.headers['Authorization'] = 'Bearer ${secureStorage.accessToken}';
        
        try {
          final dio = refreshDio ?? Dio();
          final response = await dio.fetch(options);
          return handler.resolve(response);
        } on DioException catch (retryErr) {
          return handler.reject(retryErr);
        }
      } else {
        onAuthFailure?.call();
      }
    }
    return handler.next(err);
  }

  Future<bool> _refreshToken() async {
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }

    final completer = Completer<bool>();
    _refreshCompleter = completer;
    final refreshToken = secureStorage.refreshToken;

    if (refreshToken == null || refreshToken.isEmpty) {
      await secureStorage.clearTokens();
      completer.complete(false);
      _refreshCompleter = null;
      return false;
    }

    try {
      final dio = refreshDio ??
          Dio(BaseOptions(
            baseUrl: EnvConfig.baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
          ));

      final response = await dio.post('/auth/refresh', data: {'refreshToken': refreshToken});

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'];
        if (data != null && data['accessToken'] != null && data['refreshToken'] != null) {
          await secureStorage.storeTokens(
            accessToken: data['accessToken'] as String,
            refreshToken: data['refreshToken'] as String,
          );
          completer.complete(true);
          _refreshCompleter = null;
          return true;
        }
      }

      await secureStorage.clearTokens();
      completer.complete(false);
      _refreshCompleter = null;
      return false;
    } catch (_) {
      await secureStorage.clearTokens();
      completer.complete(false);
      _refreshCompleter = null;
      return false;
    }
  }
}
