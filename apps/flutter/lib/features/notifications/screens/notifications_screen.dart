import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  return [
    {
      'id': 'notif_1',
      'title': 'Daily Garbha Sanjeevani Reminder',
      'message': 'Your Week 24 acoustic sound session is ready.',
      'read': false,
      'createdAt': '2 hours ago',
    },
    {
      'id': 'notif_2',
      'title': 'New 432 Hz Sound Track Released',
      'message': 'Explore Om Namo Bhagavate Vasudevaya therapy track.',
      'read': true,
      'createdAt': '1 day ago',
    },
  ];
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
            return const Center(child: Text('No notifications received.'));
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
              
              String time = '';
              final rawCreated = notif['createdAt'];
              if (rawCreated is int) {
                final dt = DateTime.fromMillisecondsSinceEpoch(rawCreated);
                time = '${dt.day}/${dt.month}/${dt.year}';
              } else if (rawCreated != null) {
                time = rawCreated.toString();
              }

              return SanjeevaniCard(
                onTap: () async {
                  if (!isRead) {
                    final repo = ref.read(notificationsRepositoryProvider);
                    await repo.markAsRead(notifId);
                    ref.invalidate(notificationsListProvider);
                  }
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 4, right: 12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isRead ? Colors.transparent : catColors.cat,
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
        error: (err, _) => Center(child: Text('Error loading notifications: $err')),
      ),
    );
  }
}
