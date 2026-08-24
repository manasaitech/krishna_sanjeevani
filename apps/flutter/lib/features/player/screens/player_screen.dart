import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/env_config.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../providers/player_provider.dart';

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
    final title = track?['title'] ?? 'Shree Krishna Govind Hare Murari';
    final subtitle = track?['category'] ?? 'Curative Sound Therapy • 432 Hz';

    final thumbnailKey = track?['thumbnailKey'] as String?;
    final imageUrl = (thumbnailKey != null && thumbnailKey.isNotEmpty)
        ? '${EnvConfig.baseUrl}/storage/file/$thumbnailKey'
        : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Now Playing'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.favorite_border, color: catColors.cat),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 16),

              // Album Artwork Container
              Center(
                child: Container(
                  width: 260,
                  height: 260,
                  decoration: BoxDecoration(
                    color: catColors.catLight,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: catColors.cat.withValues(alpha: 0.18),
                        blurRadius: 32,
                        offset: const Offset(0, 12),
                      ),
                    ],
                    border: Border.all(
                      color: catColors.catAccent.withValues(alpha: 0.3),
                      width: 2,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: imageUrl != null
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            width: 260,
                            height: 260,
                            errorBuilder: (_, __, ___) => _buildFallbackArtwork(catColors),
                          )
                        : _buildFallbackArtwork(catColors),
                  ),
                ),
              ),

              const SizedBox(height: 16),

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
              const SizedBox(height: 6),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF7A6B58),
                ),
              ),

              const SizedBox(height: 24),

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

              const SizedBox(height: 24),

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
                      width: 64,
                      height: 64,
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

                  // Stop / Close Button
                  IconButton(
                    icon: Icon(Icons.close, color: catColors.cat),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    ),
  );
}

  Widget _buildFallbackArtwork(CategoryColors catColors) {
    return Container(
      width: 260,
      height: 260,
      decoration: BoxDecoration(
        color: catColors.catLight,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.music_note, size: 80, color: catColors.cat),
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
