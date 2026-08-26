import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ChooseSanjeevaniScreen extends ConsumerStatefulWidget {
  const ChooseSanjeevaniScreen({super.key});

  @override
  ConsumerState<ChooseSanjeevaniScreen> createState() => _ChooseSanjeevaniScreenState();
}

class _ChooseSanjeevaniScreenState extends ConsumerState<ChooseSanjeevaniScreen> {
  AppCategory? _savingCategory;

  void _onSelectCategory(AppCategory category) async {
    if (_savingCategory != null) return;
    setState(() {
      _savingCategory = category;
    });

    try {
      ref.read(categoryProvider.notifier).setCategory(category, syncWithBackend: true);
      // Wait briefly for sync operation
      await Future.delayed(const Duration(milliseconds: 600));
      // Force reload auth user details to refresh router redirects
      await ref.read(authProvider.notifier).bootstrapSession();

      if (mounted) {
        context.go(category == AppCategory.pregnancy ? '/journey' : '/home');
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update Sanjeevani selection. Please try again.'),
            backgroundColor: Color(0xFFB00020),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _savingCategory = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              // Ornamental Logo Header
              Center(
                child: ClipOval(
                  child: Image.asset(
                    AssetConstants.logoWithoutText,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Titles
              const Text(
                'Choose Your Sanjeevani',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Cinzel',
                  color: Color(0xFF4A0E17),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Select the path that best matches your journey.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF5C5040),
                ),
              ),
              const SizedBox(height: 24),

              // Stacked cards
              _buildCategoryCard(
                category: AppCategory.devotional,
                imagePath: AssetConstants.artDevotional,
                title: 'Krishna Sanjeevani',
                tagline: 'Raga Chikitsa & Devotion',
                description:
                    'Therapeutic sound frequencies calibrated to support physical, neurological, and emotional well-being naturally through sacred classical ragas.',
                themeColor: const Color(0xFF7A1E2C),
                bullets: [
                  'Targeted relief for clinical disorders',
                  'Devotional sound formulas',
                  'Rooted in ancient Vedic wisdom',
                ],
              ),
              const SizedBox(height: 20),

              _buildCategoryCard(
                category: AppCategory.secular,
                imagePath: AssetConstants.artSecular,
                title: 'Arogya Sanjeevani',
                tagline: 'Stress, Focus & Recovery',
                description:
                    'Circadian-aligned sound therapy designed to reduce stress, boost focus, and enhance well-being in your professional and daily life.',
                themeColor: const Color(0xFF0F766E),
                bullets: [
                  'Enhances focus & mental clarity',
                  'Reduces burnout & stress levels',
                  'Aligned with natural circadian rhythms',
                ],
              ),
              const SizedBox(height: 20),

              _buildCategoryCard(
                category: AppCategory.pregnancy,
                imagePath: AssetConstants.artPregnancy,
                title: 'Garbh Sanjeevani',
                tagline: 'Prenatal Care & Garbha Sanskar',
                description:
                    'Sacred sound guidance and month-wise audio tracks calibrated for a harmonious pregnancy journey and healthy fetal development.',
                themeColor: const Color(0xFFC07B8A),
                bullets: [
                  'Supports healthy fetal progress',
                  'Gentle maternal bonding sounds',
                  'Month-wise guided developmental tips',
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryCard({
    required AppCategory category,
    required String imagePath,
    required String title,
    required String tagline,
    required String description,
    required Color themeColor,
    required List<String> bullets,
  }) {
    final isSaving = _savingCategory == category;
    final isAnySaving = _savingCategory != null;

    return Card(
      elevation: 3,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: themeColor.withValues(alpha: 0.15), width: 1.5),
      ),
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Card Header Artwork
          SizedBox(
            height: 150,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  imagePath,
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.25),
                        Colors.transparent,
                        Colors.white.withValues(alpha: 0.95),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: themeColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      category == AppCategory.devotional
                          ? 'Spiritual'
                          : category == AppCategory.secular
                              ? 'Wellness'
                              : 'Maternity',
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cinzel',
                    color: themeColor,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  tagline.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: themeColor.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Color(0xFF5C5040),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 14),

                // Bullets
                ...bullets.map((bullet) => Padding(
                      padding: const EdgeInsets.only(bottom: 6.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 14,
                            color: themeColor,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              bullet,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF3A2C18),
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),

                const SizedBox(height: 16),

                // CTA Button
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: isAnySaving ? null : () => _onSelectCategory(category),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: themeColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: themeColor.withValues(alpha: 0.6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: isSaving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text(
                            'Enter $title',
                            style: const TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
