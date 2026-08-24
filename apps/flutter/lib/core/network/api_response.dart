class ApiError {
  final String name;
  final String message;

  ApiError({required this.name, required this.message});

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      name: json['name'] as String? ?? 'Error',
      message: json['message'] as String? ?? 'An error occurred',
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'message': message,
      };
}

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final List<ApiError>? errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    T? parsedData;
    if (json['data'] != null) {
      if (fromJsonT != null) {
        try {
          parsedData = fromJsonT(json['data']);
        } catch (e) {
          parsedData = null;
        }
      } else {
        try {
          parsedData = json['data'] as T?;
        } catch (e) {
          parsedData = null;
        }
      }
    }

    List<ApiError>? parsedErrors;
    if (json['errors'] is List) {
      parsedErrors = (json['errors'] as List)
          .map((e) => ApiError.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: parsedData,
      errors: parsedErrors,
    );
  }

  factory ApiResponse.error(String message, {String errorName = 'ApiError'}) {
    return ApiResponse<T>(
      success: false,
      message: message,
      errors: [ApiError(name: errorName, message: message)],
    );
  }
}
