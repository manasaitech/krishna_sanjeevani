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

  static final Map<String, String> _surawaliToEmotionMap = {
    'smrutigandha': 'em_song_005',
    'shantidoot': 'em_song_001',
    'medhavardhini': 'em_song_006',
    'anandalahari': 'em_song_002',
    'chittaprasadana': 'em_song_003',
    'ojovardhini': 'em_song_004',
    'nidraposhini': 'em_song_007',
    'hrudayashanti': 'em_song_008',
    'pranadaatri': 'em_song_009',
    'tejaswini': 'em_song_010',
    'soukhyadhaatri': 'em_song_011',
    'dhyanaganga': 'em_song_012',
    'bhaktirasayana': 'em_song_013',
    'sanjeevani': 'em_song_014',
    'satsangini': 'em_song_015',
    'vairagyadaatri': 'em_song_016',
    'shubhadayini': 'em_song_017',
    'mon_morning_kickstart': 'em_song_001',
    'tue_midweek_focus': 'em_song_002',
    'wed_deep_strategy': 'em_song_003',
    'thu_zen_unwind': 'em_song_004',
  };

  static String resolveFallbackUrl(String trackId) {
    if (trackId.startsWith('em_song_')) {
      return '${EnvConfig.baseUrl}/emotion/content/songs/$trackId/stream';
    }
    final clean = trackId.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    for (final entry in _surawaliToEmotionMap.entries) {
      final keyClean = entry.key.replaceAll(RegExp(r'[^a-z0-9]'), '');
      if (clean.contains(keyClean) || keyClean.contains(clean)) {
        return '${EnvConfig.baseUrl}/emotion/content/songs/${entry.value}/stream';
      }
    }
    return '${EnvConfig.baseUrl}/emotion/content/songs/em_song_001/stream';
  }

  Future<String> getPlaybackUrl(String trackId, {int attempt = 1, int maxAttempts = 2}) async {
    // If it's a direct emotion song, stream directly from the emotion bucket
    if (trackId.startsWith('em_song_')) {
      return '${EnvConfig.baseUrl}/emotion/content/songs/$trackId/stream';
    }

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

      // Graceful local fallback to high-quality therapeutic audio stream
      return resolveFallbackUrl(trackId);
    } catch (e) {
      if (attempt < maxAttempts) {
        await Future.delayed(Duration(seconds: 1 * attempt));
        return getPlaybackUrl(trackId, attempt: attempt + 1, maxAttempts: maxAttempts);
      }

      // If backend request fails, seamlessly fallback to direct audio stream instead of breaking playback
      return resolveFallbackUrl(trackId);
    }
  }
}
