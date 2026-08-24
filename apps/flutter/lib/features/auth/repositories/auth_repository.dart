import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class AuthRepository {
  final ApiClient apiClient;

  AuthRepository(this.apiClient);

  Future<ApiResponse<Map<String, dynamic>>> register({
    required String email,
    required String password,
    required String fullName,
    required String category,
  }) {
    return apiClient.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'fullName': fullName,
        'category': category,
      },
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> login({
    required String email,
    required String password,
  }) {
    return apiClient.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> loginWithGoogle({
    required String idToken,
    String? category,
  }) {
    return apiClient.post<Map<String, dynamic>>(
      '/auth/google',
      data: {
        'idToken': idToken,
        if (category != null) 'category': category,
      },
    );
  }

  Future<ApiResponse<dynamic>> logout() {
    return apiClient.post('/auth/logout');
  }

  Future<ApiResponse<Map<String, dynamic>>> me() {
    return apiClient.get<Map<String, dynamic>>('/auth/me');
  }

  Future<ApiResponse<dynamic>> changePassword(String password) {
    return apiClient.post(
      '/auth/change-password',
      data: {'password': password},
    );
  }

  Future<ApiResponse<dynamic>> updateProfile({String? fullName, String? language, String? category}) {
    return apiClient.patch(
      '/auth/profile',
      data: {
        if (fullName != null) 'fullName': fullName,
        if (language != null) 'language': language,
        if (category != null) 'category': category,
      },
    );
  }
}
