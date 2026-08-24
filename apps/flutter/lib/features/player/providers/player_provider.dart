import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart' show ProcessingState;
import '../../../core/providers/network_providers.dart';
import '../../progress/repositories/progress_repository.dart';
import '../../stream/repositories/stream_repository.dart';
import '../../tracks/providers/tracks_provider.dart';
import '../services/audio_player_handler.dart';
import '../services/stream_ticket_service.dart';

class PlayerState {
  final Map<String, dynamic>? currentTrack;
  final bool isPlaying;
  final bool isBuffering;
  final Duration position;
  final Duration duration;
  final double speed;
  final String? errorMessage;

  PlayerState({
    this.currentTrack,
    this.isPlaying = false,
    this.isBuffering = false,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.speed = 1.0,
    this.errorMessage,
  });

  PlayerState copyWith({
    Map<String, dynamic>? currentTrack,
    bool? isPlaying,
    bool? isBuffering,
    Duration? position,
    Duration? duration,
    double? speed,
    String? errorMessage,
    bool clearError = false,
  }) {
    return PlayerState(
      currentTrack: currentTrack ?? this.currentTrack,
      isPlaying: isPlaying ?? this.isPlaying,
      isBuffering: isBuffering ?? this.isBuffering,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      speed: speed ?? this.speed,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class PlayerNotifier extends StateNotifier<PlayerState> {
  final AudioPlayerHandler _handler;
  final StreamTicketService _ticketService;
  final ProgressRepository _progressRepository;
  StreamSubscription? _posSub;
  StreamSubscription? _stateSub;
  Duration _lastSyncedPosition = Duration.zero;

  PlayerNotifier({
    required AudioPlayerHandler handler,
    required StreamTicketService ticketService,
    required ProgressRepository progressRepository,
  })  : _handler = handler,
        _ticketService = ticketService,
        _progressRepository = progressRepository,
        super(PlayerState()) {
    _listenToPlayer();
  }

  void _listenToPlayer() {
    _posSub = _handler.player.positionStream.listen((pos) {
      state = state.copyWith(position: pos);
      _syncProgressIfNeeded(pos);
    });

    _stateSub = _handler.player.playerStateStream.listen((ps) {
      final playing = ps.playing;
      final buffering = ps.processingState == ProcessingState.buffering ||
          ps.processingState == ProcessingState.loading;
      final duration = _handler.player.duration ?? Duration.zero;

      state = state.copyWith(
        isPlaying: playing,
        isBuffering: buffering,
        duration: duration,
      );

      if (!playing || ps.processingState == ProcessingState.completed) {
        _syncProgress(pos: _handler.player.position, completed: ps.processingState == ProcessingState.completed);
      }
    });
  }

  void _syncProgressIfNeeded(Duration currentPos) {
    final diff = (currentPos - _lastSyncedPosition).abs();
    if (diff >= const Duration(seconds: 10)) {
      _syncProgress(pos: currentPos);
    }
  }

  Future<void> _syncProgress({required Duration pos, bool completed = false}) async {
    final track = state.currentTrack;
    if (track == null) return;

    final trackId = track['id'] as String?;
    if (trackId == null) return;

    _lastSyncedPosition = pos;
    final dur = state.duration;

    await _progressRepository.update(
      trackId: trackId,
      position: pos.inSeconds,
      duration: dur.inSeconds,
      completed: completed || (dur.inSeconds > 0 && pos.inSeconds >= dur.inSeconds - 1),
    );
  }

  Future<void> playTrack(Map<String, dynamic> track) async {
    state = state.copyWith(
      currentTrack: track,
      isBuffering: true,
      clearError: true,
    );

    final trackId = track['id'] as String? ?? 'track_1';
    final title = track['title'] as String? ?? 'Curative Sound Session';
    final artist = track['category'] as String? ?? 'Krishna Sanjeevani';

    try {
      final streamUrl = await _ticketService.getPlaybackUrl(trackId);
      final mediaItem = MediaItem(
        id: trackId,
        title: title,
        artist: artist,
        album: '432 Hz Healing Audio',
        duration: state.duration,
      );

      await _handler.playTrackItem(mediaItem, streamUrl);
      state = state.copyWith(isBuffering: false);
    } catch (err) {
      state = state.copyWith(
        isBuffering: false,
        isPlaying: false,
        errorMessage: err.toString(),
      );
    }
  }

  Future<void> togglePlayPause() async {
    if (state.errorMessage != null && state.currentTrack != null) {
      await retryPlayback();
      return;
    }

    if (state.isPlaying) {
      await _handler.pause();
    } else {
      await _handler.play();
    }
  }

  Future<void> retryPlayback() async {
    if (state.currentTrack != null) {
      await playTrack(state.currentTrack!);
    }
  }

  Future<void> seek(Duration position) async {
    await _handler.seek(position);
  }

  Future<void> seekForward15() async {
    final target = state.position + const Duration(seconds: 15);
    final max = state.duration;
    await _handler.seek(target > max ? max : target);
  }

  Future<void> seekBackward15() async {
    final target = state.position - const Duration(seconds: 15);
    await _handler.seek(target < Duration.zero ? Duration.zero : target);
  }

  Future<void> setSpeed(double speed) async {
    await _handler.setSpeed(speed);
    state = state.copyWith(speed: speed);
  }

  @override
  void dispose() {
    _posSub?.cancel();
    _stateSub?.cancel();
    super.dispose();
  }
}

final audioPlayerHandlerProvider = Provider<AudioPlayerHandler>((ref) {
  return AudioPlayerHandler();
});

final streamTicketServiceProvider = Provider<StreamTicketService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final repo = StreamRepository(apiClient);
  return StreamTicketService(streamRepository: repo);
});

final playerProvider = StateNotifierProvider<PlayerNotifier, PlayerState>((ref) {
  final handler = ref.watch(audioPlayerHandlerProvider);
  final ticketService = ref.watch(streamTicketServiceProvider);
  final progressRepo = ref.watch(progressRepositoryProvider);
  return PlayerNotifier(
    handler: handler,
    ticketService: ticketService,
    progressRepository: progressRepo,
  );
});
