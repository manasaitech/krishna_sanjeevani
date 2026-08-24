import 'package:dio/dio.dart';
import '../config/env_config.dart';
import '../storage/secure_storage_service.dart';
import 'api_response.dart';
import 'auth_interceptor.dart';

class ApiClient {
  late final Dio _dio;
  final SecureStorageService secureStorage;
  final void Function()? onAuthFailure;

  ApiClient({
    required this.secureStorage,
    this.onAuthFailure,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
      ),
    );

    _dio.interceptors.add(
      AuthInterceptor(
        secureStorage: secureStorage,
        onAuthFailure: onAuthFailure,
      ),
    );
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? fromJsonT,
  }) async {
    return _request<T>(
      () => _dio.get(path, queryParameters: queryParameters),
      fromJsonT,
    );
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJsonT,
  }) async {
    return _request<T>(
      () => _dio.post(path, data: data),
      fromJsonT,
    );
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJsonT,
  }) async {
    return _request<T>(
      () => _dio.patch(path, data: data),
      fromJsonT,
    );
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJsonT,
  }) async {
    return _request<T>(
      () => _dio.delete(path, data: data),
      fromJsonT,
    );
  }

  Future<ApiResponse<T>> _request<T>(
    Future<Response> Function() call,
    T Function(dynamic json)? fromJsonT,
  ) async {
    try {
      final response = await call();
      if (response.data is Map<String, dynamic>) {
        return ApiResponse.fromJson(
          response.data as Map<String, dynamic>,
          fromJsonT,
        );
      }
      return ApiResponse<T>(
        success: true,
        message: 'Request successful',
        data: response.data != null && fromJsonT != null ? fromJsonT(response.data) : null,
      );
    } on DioException catch (err) {
      return _handleDioError<T>(err);
    } catch (err) {
      return ApiResponse.error('An unexpected error occurred: $err');
    }
  }

  ApiResponse<T> _handleDioError<T>(DioException err) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout) {
      return ApiResponse.error(
        'Request timed out. Please check your network connection.',
        errorName: 'TimeoutError',
      );
    }

    if (err.type == DioExceptionType.connectionError) {
      return ApiResponse.error(
        'No internet connection detected. Please verify your network and try again.',
        errorName: 'NetworkError',
      );
    }

    final res = err.response;
    if (res != null) {
      if (res.data is Map<String, dynamic>) {
        return ApiResponse.fromJson(res.data as Map<String, dynamic>, null);
      }

      switch (res.statusCode) {
        case 401:
          return ApiResponse.error(
            'Session expired. Please log in again.',
            errorName: 'UnauthorizedError',
          );
        case 403:
          return ApiResponse.error(
            'Access denied.',
            errorName: 'ForbiddenError',
          );
        case 404:
          return ApiResponse.error(
            'Requested resource was not found.',
            errorName: 'NotFoundError',
          );
        case 429:
          return ApiResponse.error(
            'Too many requests. Please try again later.',
            errorName: 'RateLimitError',
          );
        default:
          if (res.statusCode != null && res.statusCode! >= 500) {
            return ApiResponse.error(
              'Server error encountered. Please try again later.',
              errorName: 'ServerError',
            );
          }
      }
    }

    return ApiResponse.error(
      err.message ?? 'Network connection error',
      errorName: 'NetworkError',
    );
  }
}
