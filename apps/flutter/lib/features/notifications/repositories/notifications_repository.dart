import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class NotificationsRepository {
  final ApiClient apiClient;

  NotificationsRepository(this.apiClient);

  Future<ApiResponse<dynamic>> list() {
    return apiClient.get('/notifications');
  }

  Future<ApiResponse<dynamic>> unreadCount() {
    return apiClient.get('/notifications/unread/count');
  }

  Future<ApiResponse<dynamic>> markAsRead(String id) {
    return apiClient.post('/notifications/$id/read');
  }

  Future<ApiResponse<dynamic>> markAllAsRead() {
    return apiClient.post('/notifications/read/all');
  }
}
