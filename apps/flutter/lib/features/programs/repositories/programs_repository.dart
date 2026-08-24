import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class ProgramsRepository {
  final ApiClient apiClient;

  ProgramsRepository(this.apiClient);

  Future<ApiResponse<dynamic>> list({String? category}) {
    final query = <String, dynamic>{
      if (category != null) 'category': category,
    };
    return apiClient.get('/programs', queryParameters: query);
  }

  Future<ApiResponse<dynamic>> get(String id) {
    return apiClient.get('/programs/$id');
  }

  Future<ApiResponse<dynamic>> getTracks(String id) {
    return apiClient.get('/programs/$id/tracks');
  }
}
