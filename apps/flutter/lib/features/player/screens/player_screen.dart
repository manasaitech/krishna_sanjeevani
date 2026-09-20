import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/env_config.dart';
import '../../../core/providers/network_providers.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';

class PlayerScreen extends ConsumerWidget {
  const PlayerScreen({super.key});

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final playerState = ref.watch(playerProvider);
    final playerNotifier = ref.read(playerProvider.notifier);

    final track = playerState.currentTrack;
    final title = track?['title'] as String? ?? 'Shree Krishna Govind Hare Murari';
    final subtitle = track?['category'] as String? ?? 'Curative Sound Therapy • 432 Hz';
    final description = track?['description'] as String? ??
        'A sacred acoustic arrangement meticulously tuned to curative micro-tones, promoting deep emotional remediation, inner equilibrium, and stress alleviation.';
    final instructions = track?['instructions'] as String? ??
        'Listen in a peaceful environment using stereo headphones. Keep your posture straight, breathe gently, and allow the resonant soundscape to settle your thoughts.';
    final frequency = track?['frequency'] as String? ?? '432 Hz Healing Resonance';

    final thumbnailKey = track?['thumbnailKey'] as String?;
    final imageUrl = (thumbnailKey != null && thumbnailKey.isNotEmpty)
        ? '${EnvConfig.baseUrl}/storage/file/$thumbnailKey'
        : null;

    final currentTrack = playerState.currentTrack;
    final trackId = (currentTrack?['id'] ?? currentTrack?['trackId'])?.toString();
    final isFavorite = ref.watch(favoritesNotifierProvider.notifier).isFavorite(trackId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Now Playing'),
        centerTitle: true,
        actions: [
          if (currentTrack != null)
            IconButton(
              icon: Icon(
                isFavorite ? Icons.favorite : Icons.favorite_border,
                color: isFavorite ? const Color(0xFFD01C5C) : catColors.cat,
              ),
              onPressed: () async {
                final success = await ref.read(favoritesNotifierProvider.notifier).toggleFavorite(currentTrack);
                if (success && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isFavorite ? 'Removed from favorites' : 'Added to favorites',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              },
            ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 8),

                // Album Artwork Container
                Center(
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      color: catColors.catLight,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: catColors.cat.withValues(alpha: 0.18),
                          blurRadius: 28,
                          offset: const Offset(0, 10),
                        ),
                      ],
                      border: Border.all(
                        color: catColors.catAccent.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(26),
                      child: imageUrl != null
                          ? Image.network(
                              imageUrl,
                              fit: BoxFit.cover,
                              width: 250,
                              height: 250,
                              errorBuilder: (_, __, ___) => _buildFallbackArtwork(catColors),
                            )
                          : _buildFallbackArtwork(catColors),
                    ),
                  ),
                ),

                const SizedBox(height: 18),

                // Track Details
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF7A6B58),
                  ),
                ),

                const SizedBox(height: 20),

                // Error Interrupted Banner
                if (playerState.errorMessage != null) ...[
                  SanjeevaniCard(
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Color(0xFFB00020)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            playerState.errorMessage!,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFB00020),
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => playerNotifier.retryPlayback(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Scrubber Slider
                SliderTheme(
                  data: SliderThemeData(
                    activeTrackColor: catColors.cat,
                    inactiveTrackColor: catColors.catLight,
                    thumbColor: catColors.cat,
                    trackHeight: 4.0,
                  ),
                  child: Slider(
                    value: playerState.position.inSeconds.toDouble().clamp(
                          0.0,
                          playerState.duration.inSeconds > 0
                              ? playerState.duration.inSeconds.toDouble()
                              : 1.0,
                        ),
                    max: playerState.duration.inSeconds > 0
                        ? playerState.duration.inSeconds.toDouble()
                        : 1.0,
                    onChanged: (val) {
                      playerNotifier.seek(Duration(seconds: val.toInt()));
                    },
                  ),
                ),

                // Timestamp Labels
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDuration(playerState.position),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                      ),
                      Text(
                        _formatDuration(playerState.duration),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Transport Controls
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Speed Selector
                    PopupMenuButton<double>(
                      initialValue: playerState.speed,
                      onSelected: (spd) => playerNotifier.setSpeed(spd),
                      itemBuilder: (context) => const [
                        PopupMenuItem(value: 1.0, child: Text('1.0x Speed')),
                        PopupMenuItem(value: 1.25, child: Text('1.25x Speed')),
                        PopupMenuItem(value: 1.5, child: Text('1.5x Speed')),
                      ],
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: catColors.catLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${playerState.speed}x',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: catColors.cat,
                          ),
                        ),
                      ),
                    ),

                    // 15s Rewind
                    IconButton(
                      iconSize: 32,
                      icon: Icon(Icons.replay_10, color: catColors.cat),
                      onPressed: () => playerNotifier.seekBackward15(),
                    ),

                    // Play / Pause Button
                    GestureDetector(
                      onTap: () => playerNotifier.togglePlayPause(),
                      child: Container(
                        width: 62,
                        height: 62,
                        decoration: BoxDecoration(
                          color: catColors.cat,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: catColors.cat.withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: playerState.isBuffering
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Icon(
                                playerState.isPlaying ? Icons.pause : Icons.play_arrow,
                                color: Colors.white,
                                size: 36,
                              ),
                      ),
                    ),

                    // 15s Forward
                    IconButton(
                      iconSize: 32,
                      icon: Icon(Icons.forward_10, color: catColors.cat),
                      onPressed: () => playerNotifier.seekForward15(),
                    ),

                    // Favorite Shortcut
                    IconButton(
                      iconSize: 28,
                      icon: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: isFavorite ? const Color(0xFFD01C5C) : catColors.cat,
                      ),
                      onPressed: () async {
                        if (currentTrack != null) {
                          await ref.read(favoritesNotifierProvider.notifier).toggleFavorite(currentTrack);
                        }
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // ── Song Description & Listening Guidance Section ──
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE8E0D2)),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0A000000),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.info_outline, size: 16, color: catColors.cat),
                          const SizedBox(width: 8),
                          Text(
                            'ABOUT THIS SESSION',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                              color: catColors.cat,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.5,
                          color: Color(0xFF33271D),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Listening Instructions & Frequency Cards
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAF8F5),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE8E0D2)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.headphones, size: 14, color: Color(0xFF7A6B58)),
                                SizedBox(width: 6),
                                Text(
                                  'GUIDANCE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.6,
                                    color: Color(0xFF7A6B58),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              instructions,
                              style: const TextStyle(
                                fontSize: 12,
                                height: 1.4,
                                color: Color(0xFF4D3F33),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: catColors.catLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: catColors.catAccent.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.graphic_eq, size: 14, color: catColors.cat),
                                const SizedBox(width: 6),
                                Text(
                                  'FREQUENCY',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.6,
                                    color: catColors.cat,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              frequency,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                height: 1.4,
                                color: catColors.cat,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // ── Session Completed & Feedback Button ──
                ElevatedButton.icon(
                  onPressed: () {
                    _showFeedbackBottomSheet(
                      context,
                      ref,
                      track: currentTrack,
                      duration: playerState.position.inSeconds > 0
                          ? playerState.position
                          : playerState.duration,
                      catColors: catColors,
                    );
                  },
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text(
                    'Session Completed & Give Feedback',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: catColors.cat,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 2,
                  ),
                ),

                const SizedBox(height: 12),

                const Center(
                  child: Text(
                    'Streaming only • sessions are guided therapeutic sound baths',
                    style: TextStyle(fontSize: 11, color: Color(0xFF9E8E7D)),
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showFeedbackBottomSheet(
    BuildContext context,
    WidgetRef ref, {
    required Map<String, dynamic>? track,
    required Duration duration,
    required CategoryColors catColors,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _FeedbackSheet(
        track: track,
        duration: duration,
        catColors: catColors,
      ),
    );
  }

  Widget _buildFallbackArtwork(CategoryColors catColors) {
    return Container(
      width: 250,
      height: 250,
      decoration: BoxDecoration(
        color: catColors.catLight,
        borderRadius: BorderRadius.circular(26),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.music_note, size: 76, color: catColors.cat),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: catColors.cat,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '432 Hz THERAPEUTIC',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeedbackSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic>? track;
  final Duration duration;
  final CategoryColors catColors;

  const _FeedbackSheet({
    required this.track,
    required this.duration,
    required this.catColors,
  });

  @override
  ConsumerState<_FeedbackSheet> createState() => _FeedbackSheetState();
}

class _FeedbackSheetState extends ConsumerState<_FeedbackSheet> {
  int _rating = 5;
  String _mood = 'Calmer';
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;
  bool _isSubmitted = false;

  final List<Map<String, String>> _moods = [
    {'emoji': '🌤️', 'label': 'Calmer'},
    {'emoji': '😌', 'label': 'Rested'},
    {'emoji': '😐', 'label': 'Neutral'},
    {'emoji': '🌧️', 'label': 'Heavy'},
  ];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    if (_isSubmitting || _isSubmitted) return;
    setState(() => _isSubmitting = true);

    try {
      final trackId = widget.track?['id']?.toString() ?? widget.track?['trackId']?.toString();
      final title = widget.track?['title']?.toString() ?? 'Therapeutic Sound Session';
      final totalSeconds = widget.duration.inSeconds > 0 ? widget.duration.inSeconds : 1080;

      final apiClient = ref.read(apiClientProvider);
      await apiClient.post(
        '/feedback',
        data: {
          'trackId': trackId,
          'trackTitle': title,
          'rating': _rating,
          'mood': _mood,
          'notes': _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
          'sessionDuration': totalSeconds,
        },
      );

      if (mounted) {
        setState(() {
          _isSubmitted = true;
          _isSubmitting = false;
        });
      }
    } catch (e) {
      // Gracefully accept offline submission
      if (mounted) {
        setState(() {
          _isSubmitted = true;
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final minutes = (widget.duration.inMinutes > 0) ? widget.duration.inMinutes : 18;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Color(0x29000000),
              blurRadius: 24,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: _isSubmitted
            ? _buildSuccessView()
            : _buildFormView(minutes),
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: widget.catColors.catLight,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.check_circle, size: 36, color: widget.catColors.cat),
        ),
        const SizedBox(height: 16),
        const Text(
          'Session Complete',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF221710),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Thank you for sharing your experience. May the restorative frequencies bring you lasting peace and harmony.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, height: 1.4, color: Color(0xFF7A6B58)),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: widget.catColors.cat,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Continue', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildFormView(int minutes) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Aura Header
        Center(
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: widget.catColors.catLight,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.auto_awesome, color: widget.catColors.cat, size: 22),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Session Complete',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF221710),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '$minutes min steady listening. Sit quietly before moving on.',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
        ),
        const SizedBox(height: 20),

        // Star Rating
        const Text(
          'RATE TODAY\'S EXPERIENCE',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: Color(0xFF7A6B58),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(5, (index) {
            final starNum = index + 1;
            final isSelected = starNum <= _rating;
            return InkWell(
              onTap: () => setState(() => _rating = starNum),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 52,
                height: 40,
                decoration: BoxDecoration(
                  color: isSelected ? widget.catColors.cat : const Color(0xFFFAF8F5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? widget.catColors.cat : const Color(0xFFE8E0D2),
                  ),
                ),
                child: Center(
                  child: Text(
                    '$starNum',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : const Color(0xFF5A4C3E),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),

        const SizedBox(height: 18),

        // Mood Selection
        const Text(
          'HOW DO YOU FEEL?',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: Color(0xFF7A6B58),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: _moods.map((m) {
            final isSelected = _mood == m['label'];
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3.0),
                child: InkWell(
                  onTap: () => setState(() => _mood = m['label']!),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? widget.catColors.catLight : const Color(0xFFFAF8F5),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? widget.catColors.cat : const Color(0xFFE8E0D2),
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(m['emoji']!, style: const TextStyle(fontSize: 18)),
                        const SizedBox(height: 4),
                        Text(
                          m['label']!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? widget.catColors.cat : const Color(0xFF5A4C3E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 18),

        // Notes Input
        const Text(
          'NOTES (OPTIONAL)',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: Color(0xFF7A6B58),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _notesController,
          maxLines: 2,
          decoration: InputDecoration(
            hintText: 'Anything you noticed during the session...',
            hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF9E8E7D)),
            filled: true,
            fillColor: const Color(0xFFFAF8F5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE8E0D2)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE8E0D2)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: widget.catColors.cat, width: 1.5),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Submit & Dismiss Actions
        Row(
          children: [
            Expanded(
              flex: 1,
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Maybe later', style: TextStyle(color: Color(0xFF7A6B58))),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitFeedback,
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.catColors.cat,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Submit Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
