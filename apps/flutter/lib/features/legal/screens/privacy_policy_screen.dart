import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';

class PrivacyPolicyScreen extends ConsumerWidget {
  const PrivacyPolicyScreen({super.key});

  Future<void> _launchEmail(BuildContext context, String email) async {
    final Uri uri = Uri(scheme: 'mailto', path: email);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Contact support at: $email'),
              backgroundColor: const Color(0xFF1A3323),
            ),
          );
        }
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Contact support at: $email'),
            backgroundColor: const Color(0xFF1A3323),
          ),
        );
      }
    }
  }

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
          'Privacy Policy',
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
              // Header Badge & Title
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
                          Icon(Icons.shield_outlined, size: 14, color: catColors.cat),
                          const SizedBox(width: 6),
                          Text(
                            'DATA PROTECTION',
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
                      'Privacy Policy',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Serif',
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Last updated: August 20, 2026. We are committed to safeguarding your personal sanctuary and data.',
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
                    _buildSectionHeader('1.', 'Information We Collect', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'To provide a personalized, calm therapeutic listening environment, we collect minimal and purposeful personal information. This includes:',
                    ),
                    const SizedBox(height: 8),
                    _buildBulletItem(
                      'Account Information',
                      'Your name, email address, password, and registration preferences (e.g. category interests like sleep, focus, devotional, or pregnancy care).',
                    ),
                    _buildBulletItem(
                      'Listening Behavior',
                      'Track playback history, favorite ragas, and completed sessions, which helps compile your personal wellness journey stats.',
                    ),
                    _buildBulletItem(
                      'Device and Usage Info',
                      'IP address, browser type, operating system, and basic interactions to optimize audio streaming quality and prevent service abuse.',
                    ),
                    const SizedBox(height: 20),

                    // Section 2
                    _buildSectionHeader('2.', 'How We Use Your Information', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph('We use the collected information strictly to:'),
                    const SizedBox(height: 8),
                    _buildSimpleBullet('Deliver uninterrupted, adaptive therapeutic audio streaming.'),
                    _buildSimpleBullet('Maintain your personal history, recently played files, and favorites.'),
                    _buildSimpleBullet('Analyze aggregate usage patterns to enhance raga quality and curate new playlists.'),
                    _buildSimpleBullet('Send account-related notifications, security updates, and voluntary spiritual newsletters.'),
                    const SizedBox(height: 20),

                    // Section 3
                    _buildSectionHeader('3.', 'Data Sharing & Third Parties', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'We value your trust and do not sell, rent, trade, or distribute your personal details to third-party marketers. We only share information with trusted operational service providers under strict privacy conditions to process secure payments (like Stripe) and maintain our cloud hosting infrastructure.',
                    ),
                    const SizedBox(height: 20),

                    // Section 4
                    _buildSectionHeader('4.', 'Cookies and Tracking', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'We utilize essential cookies and secure local storage to keep you logged in and persist your volume, player settings, and aesthetic preferences. You can disable cookies via your browser settings, though some streaming features may not function properly.',
                    ),
                    const SizedBox(height: 20),

                    // Section 5
                    _buildSectionHeader('5.', 'Data Security', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'We implement robust security measures, including HTTPS encryption (SSL/TLS) for all data transmissions, to protect your details against unauthorized access, loss, or disclosure. However, please remember that no transmission method over the internet is 100% secure.',
                    ),
                    const SizedBox(height: 20),

                    // Section 6
                    _buildSectionHeader('6.', 'Your Rights & Control', catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      'You retain full control over your data. You may access, correct, or permanently delete your account and personal history at any time by visiting your Profile page or contacting our support team.',
                    ),
                    const SizedBox(height: 20),

                    // Section 7
                    _buildSectionHeader('7.', "Children's Privacy", catColors.cat),
                    const SizedBox(height: 8),
                    _buildParagraph(
                      "While the Platform is safe for all ages and features soothing melodies for children's sleep and pregnancy care, we do not intentionally collect data from children under 13 without parental consent.",
                    ),
                    const SizedBox(height: 20),

                    // Section 8
                    _buildSectionHeader('8.', 'Contact Us', catColors.cat),
                    const SizedBox(height: 8),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF52525B),
                          height: 1.5,
                        ),
                        children: [
                          const TextSpan(
                            text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or your personal sanctuary details, please reach out to us at ',
                          ),
                          WidgetSpan(
                            alignment: PlaceholderAlignment.baseline,
                            baseline: TextBaseline.alphabetic,
                            child: GestureDetector(
                              onTap: () => _launchEmail(context, 'support@krishnasanjeevani.com'),
                              child: Text(
                                'support@krishnasanjeevani.com',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: catColors.cat,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ),
                          const TextSpan(text: '.'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Footer Mantra
                    const Divider(color: Color(0xFFE8E4DC)),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        'Jīva Jāgo Jīva Jāgo Gauracānda Bole',
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

  Widget _buildBulletItem(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 14, color: Color(0xFF52525B))),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 13, color: Color(0xFF52525B), height: 1.45),
                children: [
                  TextSpan(
                    text: '$title: ',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A)),
                  ),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 14, color: Color(0xFF52525B))),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: Color(0xFF52525B), height: 1.45),
            ),
          ),
        ],
      ),
    );
  }
}
