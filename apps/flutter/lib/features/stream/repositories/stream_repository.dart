import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class StreamRepository {
  final ApiClient apiClient;

  StreamRepository(this.apiClient);

  Future<ApiResponse<Map<String, dynamic>>> getTicket(String trackId) {
    return apiClient.post<Map<String, dynamic>>('/stream/$trackId/ticket');
  }
}
