import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers/network_providers.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../repositories/notifications_repository.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationsRepository(apiClient);
});

final notificationsListProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(notificationsRepositoryProvider);
  final res = await repo.list();
  if (res.success && res.data != null && res.data is List) {
    return List<Map<String, dynamic>>.from(res.data as List);
  }
  throw Exception(res.message ?? 'Failed to load notifications');
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final notificationsAsync = ref.watch(notificationsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () async {
              final repo = ref.read(notificationsRepositoryProvider);
              await repo.markAllAsRead();
              ref.invalidate(notificationsListProvider);
            },
            child: const Text('Mark All Read'),
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none_outlined,
                    size: 64,
                    color: catColors.catAccent,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No notifications yet',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'We will notify you here when you have session reminders, subscription updates, or new recommendations.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF7A6B58),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(20.0),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final notif = notifications[index];
              final notifId = notif['id']?.toString() ?? '';
              final isRead = notif['read'] == true || notif['read'] == 1 || notif['read'] == 'true';
              final title = notif['title']?.toString() ?? 'Notification';
              final message = notif['message']?.toString() ?? '';
              final type = notif['type']?.toString() ?? 'system';
              final link = notif['link']?.toString() ?? '';
              
              String time = '';
              final rawCreated = notif['createdAt'];
              if (rawCreated is int) {
                final dt = DateTime.fromMillisecondsSinceEpoch(rawCreated);
                time = '${dt.day}/${dt.month}/${dt.year}';
              } else if (rawCreated != null) {
                time = rawCreated.toString();
              }

              IconData leadingIcon = Icons.notifications;
              if (type == 'welcome') {
                leadingIcon = Icons.favorite_outline;
              } else if (type == 'first_surawali_cta') {
                leadingIcon = Icons.explore_outlined;
              } else if (type == 'surawali_subscription') {
                leadingIcon = Icons.notifications_active_outlined;
              } else if (type == 'surawali_reminder') {
                leadingIcon = Icons.access_time;
              }

              return SanjeevaniCard(
                onTap: () async {
                  if (!isRead) {
                    final repo = ref.read(notificationsRepositoryProvider);
                    await repo.markAsRead(notifId);
                    ref.invalidate(notificationsListProvider);
                  }

                  if (link.isNotEmpty) {
                    if (link.startsWith('/discover/surawalis/')) {
                      final parts = link.split('/');
                      if (parts.length >= 4) {
                        final surawaliId = parts[3];
                        context.go('/therapy?surawaliId=$surawaliId');
                        return;
                      }
                    }

                    if (link == '/home') {
                      context.go('/home');
                    } else if (link.startsWith('/discover/surawalis')) {
                      context.go('/therapy');
                    } else {
                      context.go('/home');
                    }
                  }
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(top: 16, right: 8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isRead ? Colors.transparent : catColors.cat,
                      ),
                    ),
                    Container(
                      width: 40,
                      height: 40,
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: catColors.catLight,
                      ),
                      child: Icon(
                        leadingIcon,
                        size: 20,
                        color: catColors.cat,
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                              color: catColors.cat,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            message,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            time,
                            style: TextStyle(fontSize: 11, color: catColors.catAccent),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'Failed to load notifications: $err',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.invalidate(notificationsListProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
