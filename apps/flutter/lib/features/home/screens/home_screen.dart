import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/screens/notifications_screen.dart';
import '../../player/providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';
import '../../therapy/providers/discover_provider.dart';

String _getGreeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  void _handlePlaySurawali(BuildContext context, WidgetRef ref, String surawaliName) {
    final allTracks = ref.read(allTracksProvider).value ?? [];
    
    // Find track matching the Surawali name in title or raga name
    final existingTrack = allTracks.firstWhere(
      (t) {
        final title = (t['title'] as String? ?? '').toLowerCase();
        final raga = (t['raga'] as String? ?? '').toLowerCase();
        final q = surawaliName.toLowerCase();
        return title.contains(q) || raga.contains(q);
      },
      orElse: () => <String, dynamic>{},
    );

    if (existingTrack.isNotEmpty) {
      ref.read(playerProvider.notifier).playTrack(existingTrack);
      context.push('/player');
    } else {
      // Try to find any track in similar categories, or play the first track as a fallback
      final fallback = allTracks.isNotEmpty ? allTracks.first : <String, dynamic>{};
      if (fallback.isNotEmpty) {
        final playedTrack = Map<String, dynamic>.from(fallback);
        playedTrack['title'] = '$surawaliName (${fallback['title']})';
        ref.read(playerProvider.notifier).playTrack(playedTrack);
        context.push('/player');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Audio session not available for this Surāwali yet.'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCat = ref.watch(categoryProvider);
    final tracksAsync = ref.watch(tracksProvider);
    final continueListeningAsync = ref.watch(continueListeningProvider);
    final notificationsAsync = ref.watch(notificationsListProvider);
    final authState = ref.watch(authProvider);
    final subscriptionsAsync = ref.watch(userSubscriptionsProvider);

    final user = authState.user;
    final userName = user?['profile']?['fullName'] ??
        (user?['email'] != null ? (user!['email'] as String).split('@')[0] : 'Bhakta');

    final unreadCount = notificationsAsync.value?.where((n) => n['read'] == false).length ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${_getGreeting()},',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal, color: Color(0xFF7A6B58)),
            ),
            Text(
              userName,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: catColors.cat),
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                  );
                },
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: catColors.cat,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category Mode Selector Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: AppCategory.values.map((cat) {
                  final selected = cat == activeCat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(cat.displayName),
                      selected: selected,
                      selectedColor: catColors.catLight,
                      onSelected: (_) {
                        ref.read(categoryProvider.notifier).setCategory(cat);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Hero Curative Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    catColors.cat,
                    catColors.catAccent,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: catColors.cat.withValues(alpha: 0.2),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '432 HZ ACOUSTIC THERAPY',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white70,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    activeCat.displayName,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    activeCat.tagline,
                    style: const TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Purchased Surawalis Section
            subscriptionsAsync.when(
              data: (subscriptions) {
                if (subscriptions.isEmpty) return const SizedBox.shrink();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Purchased Surāwalis',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 72,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: subscriptions.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final sub = subscriptions[index];
                          final surawaliName = sub['surawaliName'] as String? ?? 'Surawali';
                          final plan = sub['plan'] as String? ?? 'monthly';

                          return SizedBox(
                            width: 240,
                            child: SanjeevaniCard(
                              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
                              onTap: () {
                                _handlePlaySurawali(context, ref, surawaliName);
                              },
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: catColors.catLight,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(Icons.play_arrow_rounded, color: catColors.cat, size: 24),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          surawaliName,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: catColors.cat,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${plan.toUpperCase()} PASS',
                                          style: const TextStyle(
                                            fontSize: 10,
                                            color: Color(0xFF7A6B58),
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 28),
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),

            // Continue Listening Section (Fetched from real backend /progress/continue-listening)
            continueListeningAsync.when(
              data: (item) {
                if (item == null) return const SizedBox.shrink();
                final title = item['title'] as String? ?? 'Previous Session';
                final progressPercent = (item['progressPercent'] as num? ?? 0.3).toDouble();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Continue Listening',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SanjeevaniCard(
                      onTap: () {
                        ref.read(playerProvider.notifier).playTrack(item);
                        context.push('/player');
                      },
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: catColors.catLight,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(Icons.play_arrow, color: catColors.cat, size: 24),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      title,
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: catColors.cat,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Curative Audio Session • 432 Hz',
                                      style: TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          LinearProgressIndicator(
                            value: progressPercent,
                            backgroundColor: catColors.catLight,
                            valueColor: AlwaysStoppedAnimation<Color>(catColors.cat),
                            minHeight: 4,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),

            // Curative Audio Recommendations
            Text(
              'Curative Audio Sessions',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: catColors.cat,
              ),
            ),
            const SizedBox(height: 12),

            tracksAsync.when(
              data: (tracks) {
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tracks.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = tracks[index];
                    final title = item['title'] as String? ?? 'Sound Session';
                    final freq = item['frequency'] as String? ?? '432 Hz';
                    final durationMins = ((item['duration'] as int? ?? 0) / 60).round();

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
              error: (err, _) => Text('Error loading tracks: $err'),
            ),
          ],
        ),
      ),
    );
  }
}
