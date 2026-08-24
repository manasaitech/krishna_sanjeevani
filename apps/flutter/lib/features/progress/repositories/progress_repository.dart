import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class ProgressRepository {
  final ApiClient apiClient;

  ProgressRepository(this.apiClient);

  Future<ApiResponse<dynamic>> get(String programId) {
    return apiClient.get('/programs/$programId/progress');
  }

  Future<ApiResponse<dynamic>> completeTrack(String programId, String trackId, {bool complete = true}) {
    return apiClient.post(
      '/programs/$programId/tracks/$trackId/complete',
      data: {'complete': complete},
    );
  }

  Future<ApiResponse<dynamic>> update({
    required String trackId,
    required int position,
    required int duration,
    bool completed = false,
    String? programId,
  }) {
    return apiClient.post(
      '/progress/update',
      data: {
        'trackId': trackId,
        'position': position,
        'duration': duration,
        'completed': completed,
        if (programId != null) 'programId': programId,
      },
    );
  }

  Future<ApiResponse<dynamic>> continueListening() {
    return apiClient.get('/progress/continue-listening');
  }

  Future<ApiResponse<dynamic>> history() {
    return apiClient.get('/progress/history');
  }

  Future<ApiResponse<dynamic>> getTrackProgress(String trackId) {
    return apiClient.get('/progress/track/$trackId');
  }
}
