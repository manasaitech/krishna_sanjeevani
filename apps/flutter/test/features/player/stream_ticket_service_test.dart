import 'package:flutter_test/flutter_test.dart';
import 'package:krishna_sanjeevani/core/network/api_client.dart';
import 'package:krishna_sanjeevani/core/network/api_response.dart';
import 'package:krishna_sanjeevani/features/player/services/stream_ticket_service.dart';
import 'package:krishna_sanjeevani/features/stream/repositories/stream_repository.dart';
import '../../core/network/auth_interceptor_test.dart';

class MockStreamRepository extends StreamRepository {
  MockStreamRepository() : super(ApiClient(secureStorage: MemoryStorage()));

  int callsCount = 0;
  bool shouldSucceedOnSecondAttempt = false;
  bool shouldAlwaysFail = false;

  @override
  Future<ApiResponse<Map<String, dynamic>>> getTicket(String trackId) async {
    callsCount++;
    if (shouldAlwaysFail) {
      return ApiResponse.error('Ticket expired');
    }
    if (shouldSucceedOnSecondAttempt && callsCount == 1) {
      return ApiResponse.error('Ticket expired');
    }
    return ApiResponse(
      success: true,
      message: 'Ticket acquired',
      data: {'ticket': 'valid_stream_ticket_123'},
    );
  }
}

void main() {
  group('StreamTicketService Retry & Fallback Tests', () {
    test('Mid-playback stream ticket failure executes 1 retry with exponential backoff and succeeds', () async {
      final repo = MockStreamRepository();
      repo.shouldSucceedOnSecondAttempt = true;

      final service = StreamTicketService(streamRepository: repo);
      final url = await service.getPlaybackUrl('track_123');

      expect(repo.callsCount, equals(2)); // Verified: exactly 1 retry executed
      expect(url, contains('valid_stream_ticket_123'));
    });

    test('Permanent stream ticket failure throws StreamTicketException triggering UI fallback state', () async {
      final repo = MockStreamRepository();
      repo.shouldAlwaysFail = true;

      final service = StreamTicketService(streamRepository: repo);

      StreamTicketException? caughtException;
      try {
        await service.getPlaybackUrl('track_123');
      } on StreamTicketException catch (e) {
        caughtException = e;
      }

      expect(caughtException, isNotNull);
      expect(caughtException!.message, equals('Playback Interrupted — Tap to Retry'));
      expect(repo.callsCount, equals(2)); // Verified: max 2 attempts executed
    });
  });
}
