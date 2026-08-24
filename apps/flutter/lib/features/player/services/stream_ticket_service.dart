import 'dart:async';
import '../../../core/config/env_config.dart';
import '../../stream/repositories/stream_repository.dart';

class StreamTicketException implements Exception {
  final String message;
  final bool canRetry;

  StreamTicketException(this.message, {this.canRetry = true});

  @override
  String toString() => message;
}

class StreamTicketService {
  final StreamRepository streamRepository;

  StreamTicketService({required this.streamRepository});

  Future<String> getPlaybackUrl(String trackId, {int attempt = 1, int maxAttempts = 2}) async {
    try {
      final res = await streamRepository.getTicket(trackId);
      if (res.success && res.data != null) {
        final serverStreamUrl = res.data!['streamUrl'] as String?;
        if (serverStreamUrl != null && serverStreamUrl.isNotEmpty) {
          final path = serverStreamUrl.replaceFirst('/api/v1', '');
          return '${EnvConfig.baseUrl}$path';
        }
        final ticket = res.data!['ticket'] as String?;
        if (ticket != null && ticket.isNotEmpty) {
          return '${EnvConfig.baseUrl}/stream/$trackId/master.m3u8?ticket=$ticket';
        }
      }

      if (attempt < maxAttempts) {
        await Future.delayed(Duration(seconds: 2 * attempt));
        return getPlaybackUrl(trackId, attempt: attempt + 1, maxAttempts: maxAttempts);
      }

      throw StreamTicketException(
        'Playback Interrupted — Tap to Retry',
        canRetry: true,
      );
    } catch (e) {
      if (attempt < maxAttempts) {
        await Future.delayed(Duration(seconds: 2 * attempt));
        return getPlaybackUrl(trackId, attempt: attempt + 1, maxAttempts: maxAttempts);
      }

      throw StreamTicketException(
        'Playback Interrupted — Tap to Retry',
        canRetry: true,
      );
    }
  }
}
