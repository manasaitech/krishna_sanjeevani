import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/category_badge.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../../shared/widgets/therapeutic_button.dart';
import '../../player/providers/player_provider.dart';

class ProgramDetailScreen extends ConsumerWidget {
  final String programId;

  const ProgramDetailScreen({
    super.key,
    required this.programId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);

    // Mock program track sequence
    final programTracks = [
      {
        'id': 'track_1',
        'title': 'Day 1: Sound Initiation & Deep Breathing',
        'duration': 1200,
        'completed': true,
        'frequency': '432 Hz',
      },
      {
        'id': 'track_2',
        'title': 'Day 2: Acoustic Stress Dissolution',
        'duration': 1500,
        'completed': true,
        'frequency': '432 Hz',
      },
      {
        'id': 'track_3',
        'title': 'Day 3: Heart Resonance Therapy',
        'duration': 1800,
        'completed': false,
        'frequency': '528 Hz',
      },
      {
        'id': 'track_4',
        'title': 'Day 4: Deep Neural Rest & Nidra',
        'duration': 2100,
        'completed': false,
        'frequency': '432 Hz',
      },
    ];

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
      body: SingleChildScrollView(
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
                    '21-Day Stress & Anxiety Healing',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: catColors.cat,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Daily progressive sound therapy sessions designed to restore emotional equilibrium and nervous system calm.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(Icons.subscriptions_outlined, size: 16, color: catColors.cat),
                      const SizedBox(width: 6),
                      Text(
                        '4 Tracks • 1 hr 6 mins',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: catColors.cat,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: TherapeuticButton(
                      label: 'Start Program',
                      icon: Icons.play_arrow,
                      onPressed: () {
                        ref.read(playerProvider.notifier).playTrack(programTracks.first);
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
            ...programTracks.map((item) {
              final isCompleted = item['completed'] as bool? ?? false;
              final durationMins = ((item['duration'] as int? ?? 0) / 60).round();
              final thumbnailKey = item['thumbnailKey'] as String?;
              final imageUrl = (thumbnailKey != null && thumbnailKey.isNotEmpty)
                  ? '${EnvConfig.baseUrl}/storage/file/$thumbnailKey'
                  : null;

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
                          color: isCompleted ? Colors.green.withValues(alpha: 0.15) : catColors.catLight,
                          shape: BoxShape.circle,
                        ),
                        child: ClipOval(
                          child: isCompleted
                              ? const Icon(
                                  Icons.check,
                                  color: Colors.green,
                                  size: 18,
                                )
                              : (imageUrl != null
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
                                    )),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title'] as String,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: catColors.cat,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$durationMins mins • ${item['frequency']}',
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
      ),
    );
  }
}
