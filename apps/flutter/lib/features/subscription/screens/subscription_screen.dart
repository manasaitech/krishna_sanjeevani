import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../../shared/widgets/therapeutic_button.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/subscription_provider.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  String _selectedPlanId = 'plan_annual';

  void _handleCheckout() async {
    final user = ref.read(authProvider).user;
    final userEmail = user?['email'] as String? ?? 'user@example.com';

    final success = await ref.read(subscriptionProvider.notifier).checkoutPlan(
          planId: _selectedPlanId,
          userEmail: userEmail,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Subscription activated successfully! Enjoy full premium access.'),
          backgroundColor: Color(0xFF0F766E),
        ),
      );
      Navigator.of(context).pop();
    } else if (mounted) {
      final err = ref.read(subscriptionProvider).error;
      if (err != null && err.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(err),
            backgroundColor: const Color(0xFFB00020),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final subState = ref.watch(subscriptionProvider);

    final features = [
      '432 Hz High-Definition Sound Therapy',
      'Full Garbha Sanjeevani 40-Week Care',
      'Unlimited Offline Audio Downloads',
      'Ad-Free Curative Healing Sessions',
      'Priority Customer & Wellness Support',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sanjeevni Premium'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Card
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [catColors.cat, catColors.catAccent],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Column(
                children: [
                  Icon(Icons.workspace_premium, size: 54, color: Color(0xFFC9A84C)),
                  SizedBox(height: 12),
                  Text(
                    'Unlock Full Curative Healing',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Unlimited access to all sound programs, Garbha Sanjeevani care, and 432 Hz frequency sessions.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            Text(
              'Select Subscription Plan',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: catColors.cat,
              ),
            ),
            const SizedBox(height: 14),

            // Plan Selection Cards
            ...subState.plans.map((plan) {
              final id = plan['id'] as String;
              final name = plan['name'] as String;
              final price = plan['price'] as int;
              final interval = plan['interval'] as String;
              final savings = plan['savings'] as String?;
              final isPopular = plan['popular'] as bool? ?? false;
              final isSelected = id == _selectedPlanId;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedPlanId = id;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: isSelected ? catColors.catLight : Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? catColors.cat : catColors.catAccent.withValues(alpha: 0.2),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                          color: isSelected ? catColors.cat : const Color(0xFF8A7963),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    name,
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: catColors.cat,
                                    ),
                                  ),
                                  if (isPopular) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFC9A84C),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'POPULAR',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              if (savings != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  savings,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F766E),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        Text(
                          '₹$price/$interval',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: catColors.cat,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Included Features List
            SanjeevaniCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Included in Premium',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: catColors.cat,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...features.map((feat) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle, color: catColors.cat, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              feat,
                              style: const TextStyle(fontSize: 13, color: Color(0xFF4A4A4A)),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Subscribe Button
            TherapeuticButton(
              label: 'Subscribe Now',
              isLoading: subState.isLoading,
              onPressed: _handleCheckout,
            ),

            const SizedBox(height: 16),
            const Text(
              'Secured by Razorpay • Cancel anytime from profile settings.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, color: Color(0xFF7A6B58)),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
