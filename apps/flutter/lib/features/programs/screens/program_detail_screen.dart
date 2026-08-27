import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/category_badge.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../../shared/widgets/therapeutic_button.dart';
import '../../player/providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';

class ProgramDetailScreen extends ConsumerWidget {
  final String programId;

  const ProgramDetailScreen({
    super.key,
    required this.programId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final detailsAsync = ref.watch(programDetailsProvider(programId));
    final tracksAsync = ref.watch(programTracksProvider(programId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Program Details'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: CategoryBadge(),
          ),
        ],
      ),
      body: detailsAsync.when(
        data: (details) {
          final title = details['title'] as String? ?? 'Program';
          final description = details['description'] as String? ?? '';
          
          return tracksAsync.when(
            data: (tracks) {
              final trackCount = tracks.length;
              final totalSeconds = tracks.fold<int>(0, (sum, t) => sum + (t['duration'] as int? ?? 0));
              final totalMins = (totalSeconds / 60).round();
              
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Program Header Card
                    Container(
                      padding: const EdgeInsets.all(20.0),
                      decoration: BoxDecoration(
                        color: catColors.catLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: catColors.catAccent.withValues(alpha: 0.2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: catColors.cat,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            description,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Icon(Icons.subscriptions_outlined, size: 16, color: catColors.cat),
                              const SizedBox(width: 6),
                              Text(
                                '$trackCount Tracks • $totalMins mins',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: catColors.cat,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (tracks.isNotEmpty)
                            SizedBox(
                              width: double.infinity,
                              child: TherapeuticButton(
                                label: 'Start Program',
                                icon: Icons.play_arrow,
                                onPressed: () {
                                  ref.read(playerProvider.notifier).playTrack(tracks.first);
                                  context.push('/player');
                                },
                              ),
                            ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),

                    Text(
                      'Program Sequence',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Track Sequence List
                    if (tracks.isEmpty)
                      const SanjeevaniCard(
                        child: Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Center(
                            child: Text(
                              'No tracks scheduled for this program.',
                              style: TextStyle(color: Color(0xFF7A6B58)),
                            ),
                          ),
                        ),
                      ),
                    ...tracks.map((item) {
                      final durationMins = ((item['duration'] as int? ?? 0) / 60).round();
                      final thumbnailKey = item['thumbnailKey'] as String?;
                      final imageUrl = (thumbnailKey != null && thumbnailKey.isNotEmpty)
                          ? '${EnvConfig.baseUrl}/storage/file/$thumbnailKey'
                          : null;
                      final freq = item['frequency'] as String? ?? '432 Hz';

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: SanjeevaniCard(
                          onTap: () {
                            ref.read(playerProvider.notifier).playTrack(item);
                            context.push('/player');
                          },
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: catColors.catLight,
                                  shape: BoxShape.circle,
                                ),
                                child: ClipOval(
                                  child: imageUrl != null
                                      ? Image.network(
                                          imageUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => Icon(
                                            Icons.music_note,
                                            color: catColors.cat,
                                            size: 18,
                                          ),
                                        )
                                      : Icon(
                                          Icons.music_note,
                                          color: catColors.cat,
                                          size: 18,
                                        ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['title'] as String? ?? 'Sound Session',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: catColors.cat,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '$durationMins mins • $freq',
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error loading tracks: $err')),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading program details: $err')),
      ),
    );
  }
}
