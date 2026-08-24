import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/player/providers/player_provider.dart';
import '../providers/category_provider.dart';

class MiniPlayerWidget extends ConsumerWidget {
  const MiniPlayerWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final playerState = ref.watch(playerProvider);
    final playerNotifier = ref.read(playerProvider.notifier);

    final track = playerState.currentTrack;
    if (track == null) {
      return const SizedBox.shrink();
    }

    final title = track['title'] as String? ?? 'Sound Session';
    final subtitle = track['category'] as String? ?? 'Curative Sound Therapy • 432 Hz';
    final isPlaying = playerState.isPlaying;

    final durationSecs = playerState.duration.inSeconds;
    final positionSecs = playerState.position.inSeconds;
    final progress = durationSecs > 0 ? (positionSecs / durationSecs) : 0.0;

    return GestureDetector(
      onTap: () {
        context.push('/player');
      },
      child: Container(
        height: 64,
        margin: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: catColors.cat.withValues(alpha: 0.12),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: catColors.catAccent.withValues(alpha: 0.2)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0),
                  child: Row(
                    children: [
                      // Thumbnail
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: catColors.catLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.music_note,
                          color: catColors.cat,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Title & Subtitle
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: catColors.cat,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              subtitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF7A6B58),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Play/Pause Button
                      IconButton(
                        icon: Icon(
                          isPlaying ? Icons.pause : Icons.play_arrow,
                          color: catColors.cat,
                          size: 24,
                        ),
                        onPressed: () {
                          playerNotifier.togglePlayPause();
                        },
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Progress Bar Line
              LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                backgroundColor: catColors.catLight,
                valueColor: AlwaysStoppedAnimation<Color>(catColors.cat),
                minHeight: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
