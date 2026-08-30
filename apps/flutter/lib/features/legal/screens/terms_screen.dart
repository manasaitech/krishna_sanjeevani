import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';

class TermsScreen extends ConsumerWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final category = ref.watch(categoryProvider);
    final catColors = CategoryColors.ofCategory(category);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F4),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF8F4),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF261E0E)),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/login');
            }
          },
        ),
        title: const Text(
          'Terms of Service',
          style: TextStyle(
            color: Color(0xFF261E0E),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge & Title Header
              Center(
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: catColors.catLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: catColors.cat.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.gavel, size: 14, color: catColors.cat),
                          const SizedBox(width: 6),
                          Text(
                            'LEGAL GUIDELINES',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              color: catColors.cat,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Terms of Service',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Serif',
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Last updated: August 20, 2026. Please read these terms carefully before using our therapeutic sanctuary.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF7C7A85),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Content Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE8E4DC)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1
                    _buildSectionHeader('1.', 'Acceptance of Terms', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'Welcome to Krishna Sanjeevani. By accessing or using our streaming services, website, and mobile application (collectively, the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.',
                    ),
                    const SizedBox(height: 20),

                    // Section 2 - Disclaimer Box
                    _buildSectionHeader('2.', 'Therapeutic Nature & Medical Disclaimer', catColors.cat),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Text(
                        'Important Notice: Krishna Sanjeevani offers traditional meditative, Vedic sound, and therapeutic classical musical compositions (Ragas) rooted in ancient Indian heritage. Our streams and contents are created for stress-relief, spiritual contemplation, emotional balance, sleep support, and general wellness. They do NOT constitute medical advice, diagnosis, or treatment. Always seek the advice of a physician or other qualified health providers with any questions regarding a medical condition.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF92400E),
                          height: 1.45,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Section 3
                    _buildSectionHeader('3.', 'Account Registration & Security', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'To explore full-length therapeutic ragas and customize your listening experience, you are required to create an account. You are responsible for keeping your credentials confidential and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
                    ),
                    const SizedBox(height: 20),

                    // Section 4
                    _buildSectionHeader('4.', 'Intellectual Property & Sacred Audio', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'All recordings, raga compositions, Sanskrit recitations, text, logos, custom player interfaces, and visual assets hosted on the Platform are protected by copyright, trademark, and intellectual property laws. Your registration grants you a limited, non-transferable, personal license to stream our therapeutic audio files for individual, non-commercial listening only. Any reproduction, distribution, public broadcasting, or commercial extraction of our audio assets is strictly prohibited.',
                    ),
                    const SizedBox(height: 20),

                    // Section 5
                    _buildSectionHeader('5.', 'Subscription Fees, Billing, & Donations', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'Certain premium tiers, curated listening pathways, or prenatal tracks may require active subscriptions or donations. All payments are processed securely through third-party services. Subscription renewals and cancellation terms will be detailed upon billing setup, and you may manage your preferences directly in your Account settings.',
                    ),
                    const SizedBox(height: 20),

                    // Section 6
                    _buildSectionHeader('6.', 'Prohibited Conduct', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'You agree not to engage in web scraping, reverse engineering, audio recording extraction, denial-of-service attempts, or any behaviors that undermine the performance, security, or spiritual integrity of the Platform.',
                    ),
                    const SizedBox(height: 20),

                    // Section 7
                    _buildSectionHeader('7.', 'Limitation of Liability', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'Krishna Sanjeevani is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we disclaim all warranties, and shall not be held liable for any damages, losses, or physiological/mental disturbances arising from your access to or reliance on the therapeutic soundtracks.',
                    ),
                    const SizedBox(height: 20),

                    // Section 8
                    _buildSectionHeader('8.', 'Modifications to Terms', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'We reserve the right to revise these Terms of Service at any time. When updates are published, the "Last updated" date at the top will be updated. Your continued use of the Platform after revisions implies acceptance of the new terms.',
                    ),
                    const SizedBox(height: 24),

                    // Footer Mantra
                    const Divider(color: Color(0xFFE8E4DC)),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        'Harer Nāma Harer Nāma Harer Nāmaiva Kevalam',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          fontFamily: 'Serif',
                          color: catColors.cat,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String number, String title, Color catColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$number ',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: catColor,
          ),
        ),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Serif',
              color: Color(0xFF1A1A1A),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildParagraph(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        color: Color(0xFF52525B),
        height: 1.5,
      ),
    );
  }
}
