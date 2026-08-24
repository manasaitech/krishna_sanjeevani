import 'package:flutter_test/flutter_test.dart';
import 'package:krishna_sanjeevani/core/network/api_client.dart';
import 'package:krishna_sanjeevani/core/network/api_response.dart';
import 'package:krishna_sanjeevani/features/progress/repositories/progress_repository.dart';
import 'package:krishna_sanjeevani/features/progress/services/progress_sync_service.dart';
import '../../core/network/auth_interceptor_test.dart';

class MockProgressRepository extends ProgressRepository {
  MockProgressRepository() : super(ApiClient(secureStorage: MemoryStorage()));

  int updateCalls = 0;
  bool lastCompletedState = false;
  int lastPosition = 0;

  @override
  Future<ApiResponse<dynamic>> update({
    required String trackId,
    required int position,
    required int duration,
    bool completed = false,
    String? programId,
  }) async {
    updateCalls++;
    lastPosition = position;
    lastCompletedState = completed;
    return ApiResponse(success: true, message: 'Updated');
  }
}

void main() {
  group('ProgressSyncService Auto-Sync Tests', () {
    test('stopTracking flushes progress and marks completed true when position reaches 99% spec threshold', () async {
      final repo = MockProgressRepository();
      final syncService = ProgressSyncService(progressRepository: repo);

      syncService.startTracking(trackId: 'track_456', duration: 100);
      syncService.updatePosition(99); // 99% -> exact spec completed threshold met

      await syncService.stopTracking();

      expect(repo.updateCalls, equals(1));
      expect(repo.lastPosition, equals(99));
      expect(repo.lastCompletedState, isTrue);
    });
  });
}
