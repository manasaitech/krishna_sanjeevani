import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class FavoritesRepository {
  final ApiClient apiClient;

  FavoritesRepository(this.apiClient);

  Future<ApiResponse<dynamic>> list([String? itemType]) {
    final query = itemType != null ? '?itemType=$itemType' : '';
    return apiClient.get('/favorites$query');
  }

  Future<ApiResponse<dynamic>> add(String itemId, String itemType) {
    return apiClient.post(
      '/favorites',
      data: {
        'itemId': itemId,
        'itemType': itemType,
      },
    );
  }

  Future<ApiResponse<dynamic>> remove(String itemId) {
    return apiClient.delete('/favorites/$itemId');
  }

  Future<ApiResponse<dynamic>> status(String itemId) {
    return apiClient.get('/favorites/$itemId/status');
  }
}
