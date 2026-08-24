import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../player/providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    // Auto-refresh listening history & favorites on view launch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.invalidate(historyProvider);
      ref.invalidate(favoritesProvider);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final favoritesAsync = ref.watch(favoritesProvider);
    final historyAsync = ref.watch(historyProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('History & Favorites'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () {
              ref.invalidate(historyProvider);
              ref.invalidate(favoritesProvider);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: catColors.cat,
          labelColor: catColors.cat,
          unselectedLabelColor: const Color(0xFF7A6B58),
          tabs: const [
            Tab(text: 'Favorites'),
            Tab(text: 'Listening History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Favorites (Real backend /favorites)
          favoritesAsync.when(
            data: (favorites) {
              if (favorites.isEmpty) {
                return const Center(
                  child: Text(
                    'No favorite sound sessions added yet.',
                    style: TextStyle(color: Color(0xFF7A6B58)),
                  ),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(20.0),
                itemCount: favorites.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = favorites[index];
                  final title = item['title'] as String? ?? 'Sound Session';
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
                                      Icons.favorite,
                                      color: catColors.cat,
                                      size: 22,
                                    ),
                                  )
                                : Icon(
                                    Icons.favorite,
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
                                freq,
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
            error: (err, _) => Center(child: Text('Error loading favorites: $err')),
          ),

          // Tab 2: Listening History (Real backend GET /progress/history)
          historyAsync.when(
            data: (history) {
              if (history.isEmpty) {
                return const Center(
                  child: Text(
                    'No listening history recorded yet.',
                    style: TextStyle(color: Color(0xFF7A6B58)),
                  ),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(20.0),
                itemCount: history.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = history[index];
                  final title = item['title'] as String? ?? 'Sound Session';
                  final durationMins = (((item['duration'] as num?) ?? 1800) / 60).round();

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
                                      Icons.history,
                                      color: catColors.cat,
                                      size: 22,
                                    ),
                                  )
                                : Icon(
                                    Icons.history,
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
                                'Session Completed • $durationMins mins',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.play_arrow, color: catColors.cat, size: 24),
                      ],
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error loading history: $err')),
          ),
        ],
      ),
    );
  }
}
