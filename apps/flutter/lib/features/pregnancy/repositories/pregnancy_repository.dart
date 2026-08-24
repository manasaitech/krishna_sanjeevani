import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class PregnancyRepository {
  final ApiClient apiClient;

  PregnancyRepository(this.apiClient);

  Future<ApiResponse<dynamic>> listPrograms() {
    return apiClient.get('/pregnancy/programs');
  }

  Future<ApiResponse<dynamic>> getToday() {
    return apiClient.get('/pregnancy/today');
  }

  Future<ApiResponse<dynamic>> getByWeek(int week) {
    return apiClient.get('/pregnancy/week/$week');
  }

  Future<ApiResponse<dynamic>> getByMonth(int month) {
    return apiClient.get('/pregnancy/month/$month');
  }

  Future<ApiResponse<dynamic>> saveUserInfo({String? edd, int? currentWeek}) {
    return apiClient.post(
      '/pregnancy/user-info',
      data: {
        if (edd != null) 'edd': edd,
        if (currentWeek != null) 'currentWeek': currentWeek,
      },
    );
  }
}
