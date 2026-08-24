import 'dart:async';
import '../../progress/repositories/progress_repository.dart';

class ProgressSyncService {
  final ProgressRepository progressRepository;
  Timer? _syncTimer;
  String? _activeTrackId;
  int _currentPosition = 0;
  int _totalDuration = 0;
  bool _isCompleted = false;

  ProgressSyncService({required this.progressRepository});

  void startTracking({
    required String trackId,
    required int duration,
  }) {
    _activeTrackId = trackId;
    _totalDuration = duration;
    _currentPosition = 0;
    _isCompleted = false;

    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      _syncProgress();
    });
  }

  void updatePosition(int positionInSeconds) {
    _currentPosition = positionInSeconds;
    if (_totalDuration > 0 && (_currentPosition / _totalDuration) >= 0.99) {
      _isCompleted = true;
    }
  }

  Future<void> _syncProgress() async {
    if (_activeTrackId == null) return;
    try {
      await progressRepository.update(
        trackId: _activeTrackId!,
        position: _currentPosition,
        duration: _totalDuration,
        completed: _isCompleted,
      );
    } catch (_) {
      // Non-fatal background sync failure
    }
  }

  Future<void> stopTracking() async {
    _syncTimer?.cancel();
    _syncTimer = null;
    await _syncProgress();
    _activeTrackId = null;
  }
}
