import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../player/providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final favoritesAsync = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Liked Songs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () {
              ref.invalidate(favoritesProvider);
            },
          ),
        ],
      ),
      body: favoritesAsync.when(
        data: (favorites) {
          if (favorites.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_outline,
                    size: 64,
                    color: catColors.catAccent,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No favorites yet',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Tap the heart icon on any session to save it here.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                  ),
                ],
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
    );
  }
}
