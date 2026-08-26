import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../../shared/widgets/therapeutic_button.dart';
import '../../auth/providers/auth_provider.dart';
import '../../therapy/providers/discover_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCategory = ref.watch(categoryProvider);
    final authState = ref.watch(authProvider);
    final subscriptionsAsync = ref.watch(userSubscriptionsProvider);

    final user = authState.user;
    final name = user?['profile']?['fullName'] ??
        (user?['email'] != null ? (user!['email'] as String).split('@')[0] : 'Bhakta / User');
    final email = user?['email'] ?? 'user@example.com';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Card
            SanjeevaniCard(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: catColors.catLight,
                    child: Icon(Icons.person, color: catColors.cat, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: catColors.cat,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          email,
                          style: const TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // My Sanjeevani Section Card
            SanjeevaniCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'My Sanjeevani',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: catColors.cat,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activeCategory.displayName,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF3A2C18),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              activeCategory.description,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF7A6B58),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: () => context.push('/change-sanjeevani'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: catColors.cat,
                          foregroundColor: catColors.catForeground,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                        child: const Text(
                          'Change',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Active Surawali Subscriptions Section
            Text(
              'Active Surawali Subscriptions',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: catColors.cat,
              ),
            ),
            const SizedBox(height: 12),

            subscriptionsAsync.when(
              data: (subscriptions) {
                if (subscriptions.isEmpty) {
                  return const SanjeevaniCard(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        'No active Surawali subscriptions found. Explore the Therapy tab to subscribe.',
                        style: TextStyle(fontSize: 13, color: Color(0xFF7A6B58)),
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: subscriptions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final sub = subscriptions[index];
                    final subId = sub['id'] as String;
                    final surawaliName = sub['surawaliName'] as String? ?? 'Surawali';
                    final plan = sub['plan'] as String? ?? 'yearly';
                    final endDateMs = (sub['endDate'] as num? ?? 0).toInt();
                    final endDateStr = DateTime.fromMillisecondsSinceEpoch(endDateMs).toLocal().toString().split(' ')[0];

                    return SanjeevaniCard(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: catColors.catLight,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.star, color: catColors.cat, size: 20),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  surawaliName,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: catColors.cat,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${plan.toUpperCase()} PASS • Valid until $endDateStr',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Cancel Subscription?'),
                                  content: Text('Are you sure you want to cancel access to $surawaliName?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.of(ctx).pop(false),
                                      child: const Text('Keep'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.of(ctx).pop(true),
                                      child: const Text('Cancel Sub', style: TextStyle(color: Colors.red)),
                                    ),
                                  ],
                                ),
                              );

                              if (confirm == true) {
                                await ref.read(discoverNotifierProvider.notifier).cancelSubscription(subId);
                              }
                            },
                            child: const Text('Cancel', style: TextStyle(color: Colors.red, fontSize: 12)),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Text('Error loading subscriptions: $err'),
            ),

            const SizedBox(height: 32),

            // Sign Out Button
            SizedBox(
              width: double.infinity,
              child: TherapeuticButton(
                label: 'Sign Out',
                isOutlined: true,
                icon: Icons.logout,
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
