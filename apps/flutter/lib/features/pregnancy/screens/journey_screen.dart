import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../core/providers/network_providers.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../player/providers/player_provider.dart';
import '../repositories/pregnancy_repository.dart';

final pregnancyRepositoryProvider = Provider<PregnancyRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PregnancyRepository(apiClient);
});

final pregnancyWeekTracksProvider =
    FutureProvider.family<List<Map<String, dynamic>>, int>((ref, week) async {
  final repo = ref.watch(pregnancyRepositoryProvider);
  final res = await repo.getByWeek(week);

  if (res.success && res.data != null) {
    if (res.data is List && (res.data as List).isNotEmpty) {
      return List<Map<String, dynamic>>.from(res.data as List);
    }
  }

  // Curated acoustic sessions for week fallback
  return [
    {
      'id': 'preg_track_w${week}_1',
      'title': 'Week $week: Garbha Sanjeevani Baby Resonance',
      'duration': 1800,
      'frequency': '432 Hz',
      'category': 'Garbha Sanjeevani',
      'description': 'Prenatal acoustic frequency tailored for maternal wellbeing and baby bonding.',
    },
    {
      'id': 'preg_track_w${week}_2',
      'title': 'Garbha Raksha Stotram Sound Bath',
      'duration': 2400,
      'frequency': '528 Hz',
      'category': 'Garbha Sanjeevani',
      'description': 'Soothing protective mantras combined with therapeutic sound bath.',
    },
  ];
});

class JourneyScreen extends ConsumerStatefulWidget {
  const JourneyScreen({super.key});

  @override
  ConsumerState<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends ConsumerState<JourneyScreen> {
  int _selectedWeek = 24;
  DateTime? _eddDate;

  Future<void> _selectEDDDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 100)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 300)),
    );
    if (picked != null) {
      setState(() {
        _eddDate = picked;
      });
      final repo = ref.read(pregnancyRepositoryProvider);
      await repo.saveUserInfo(
        edd: picked.toIso8601String(),
        currentWeek: _selectedWeek,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final weekTracksAsync = ref.watch(pregnancyWeekTracksProvider(_selectedWeek));

    final trimester = _selectedWeek <= 12
        ? 'Trimester 1 (Weeks 1-12)'
        : (_selectedWeek <= 27 ? 'Trimester 2 (Weeks 13-27)' : 'Trimester 3 (Weeks 28-40)');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Garbha Sanjeevani Journey'),
        actions: [
          IconButton(
            icon: Icon(Icons.calendar_today, color: catColors.cat, size: 20),
            onPressed: _selectEDDDate,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // EDD Banner
            SanjeevaniCard(
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: catColors.catLight,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.child_care, color: catColors.cat, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _eddDate != null
                              ? 'EDD: ${_eddDate!.day}/${_eddDate!.month}/${_eddDate!.year}'
                              : 'Set Due Date (EDD)',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: catColors.cat,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          trimester,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _selectEDDDate,
                    child: const Text('Set'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Horizontal Week Selector
            Text(
              'Select Pregnancy Week',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: catColors.cat,
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              height: 50,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 40,
                itemBuilder: (context, index) {
                  final weekNum = index + 1;
                  final selected = weekNum == _selectedWeek;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text('Wk $weekNum'),
                      selected: selected,
                      selectedColor: catColors.catLight,
                      onSelected: (_) {
                        setState(() {
                          _selectedWeek = weekNum;
                        });
                      },
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 24),

            // Weekly Recommended Sessions
            Text(
              'Week $_selectedWeek Curative Audio',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: catColors.cat,
              ),
            ),
            const SizedBox(height: 12),

            weekTracksAsync.when(
              data: (tracks) {
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tracks.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = tracks[index];
                    final title = item['title'] as String? ?? 'Pregnancy Session';
                    final durationMins = (((item['duration'] as num?) ?? 1800) / 60).round();
                    final freq = item['frequency'] as String? ?? '432 Hz';

                    final thumbnailKey = item['thumbnailKey'] as String?;
                    final imageUrl = (thumbnailKey != null && thumbnailKey.isNotEmpty)
                        ? '${EnvConfig.baseUrl}/storage/file/$thumbnailKey'
                        : null;

                    return SanjeevaniCard(
                      onTap: () {
                        ref.read(playerProvider.notifier).playTrack(item);
                        context.push('/player');
                      },
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: catColors.catLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: imageUrl != null
                                  ? Image.network(
                                      imageUrl,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Icon(
                                        Icons.music_note,
                                        color: catColors.cat,
                                        size: 22,
                                      ),
                                    )
                                  : Icon(
                                      Icons.music_note,
                                      color: catColors.cat,
                                      size: 22,
                                    ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: catColors.cat,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '$durationMins mins • $freq Frequency',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.play_circle_fill, color: catColors.cat, size: 32),
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error loading week sessions: $err')),
            ),
          ],
        ),
      ),
    );
  }
}
