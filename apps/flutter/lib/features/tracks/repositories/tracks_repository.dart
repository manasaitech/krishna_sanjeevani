import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class TracksRepository {
  final ApiClient apiClient;

  TracksRepository(this.apiClient);

  Future<ApiResponse<dynamic>> list({String? category, String? search}) {
    final query = <String, dynamic>{
      if (category != null) 'category': category,
      if (search != null) 'search': search,
    };
    return apiClient.get('/tracks', queryParameters: query);
  }

  Future<ApiResponse<dynamic>> get(String id) {
    return apiClient.get('/tracks/$id');
  }

  Future<ApiResponse<dynamic>> listTags() {
    return apiClient.get('/tracks/tags');
  }
}
