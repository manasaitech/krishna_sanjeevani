import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ChangeSanjeevaniScreen extends ConsumerStatefulWidget {
  const ChangeSanjeevaniScreen({super.key});

  @override
  ConsumerState<ChangeSanjeevaniScreen> createState() => _ChangeSanjeevaniScreenState();
}

class _ChangeSanjeevaniScreenState extends ConsumerState<ChangeSanjeevaniScreen> {
  AppCategory? _switchingCategory;

  void _showConfirmationDialog(BuildContext context, AppCategory targetCategory, String currentName, String targetName, Color themeColor) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFFFAF8F5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: themeColor.withValues(alpha: 0.2), width: 1.5),
          ),
          title: Text(
            'Switch to $targetName?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cinzel',
              color: themeColor,
            ),
          ),
          content: Text(
            'You are currently using $currentName. Switching to $targetName will change your app experience, layout themes, and available content.',
            style: const TextStyle(
              fontSize: 13.5,
              color: Color(0xFF5C5040),
              height: 1.4,
            ),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: Color(0xFF7A6B58),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                _performSwitch(targetCategory);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
              child: Text(
                'Switch to ${targetCategory == AppCategory.pregnancy ? 'Garbh' : targetCategory == AppCategory.secular ? 'Arogya' : 'Krishna'}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  void _performSwitch(AppCategory targetCategory) async {
    setState(() {
      _switchingCategory = targetCategory;
    });

    try {
      ref.read(categoryProvider.notifier).setCategory(targetCategory, syncWithBackend: true);
      // Wait for backend synchronization
      await Future.delayed(const Duration(milliseconds: 650));
      // Refresh user profile session to ensure router guards sync
      await ref.read(authProvider.notifier).bootstrapSession();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Switched to ${targetCategory.displayName}'),
            backgroundColor: CategoryColors.ofCategory(targetCategory).cat,
          ),
        );
        // Reset navigation stack to the new dashboard
        context.go(targetCategory == AppCategory.pregnancy ? '/journey' : '/home');
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to switch experience. Please check connection.'),
            backgroundColor: Color(0xFFB00020),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _switchingCategory = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeCategory = ref.watch(categoryProvider);
    final catColors = ref.watch(categoryColorsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      appBar: AppBar(
        title: const Text('Switch Sanjeevani Pathway'),
        backgroundColor: Colors.white,
        foregroundColor: catColors.cat,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _switchingCategory != null ? null : () => context.pop(),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Change Your Experience',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cinzel',
                    color: Color(0xFF4A0E17),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Choose another pathway configuration. Your active theme and available audio tracks will transform accordingly.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFF7A6B58),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),

                // Card 1: Krishna Sanjeevani
                _buildSwitchCard(
                  category: AppCategory.devotional,
                  activeCategory: activeCategory,
                  imagePath: AssetConstants.artDevotional,
                  title: 'Krishna Sanjeevani',
                  tagline: 'Raga Chikitsa & Devotion',
                  description: 'Sacred ragas calibrated to support physical and neurological disorders.',
                  themeColor: const Color(0xFF7A1E2C),
                ),
                const SizedBox(height: 16),

                // Card 2: Arogya Sanjeevani
                _buildSwitchCard(
                  category: AppCategory.secular,
                  activeCategory: activeCategory,
                  imagePath: AssetConstants.artSecular,
                  title: 'Arogya Sanjeevani',
                  tagline: 'Stress, Focus & Recovery',
                  description: 'Wellness, focus, and productivity designed for modern professional lifestyles.',
                  themeColor: const Color(0xFF0F766E),
                ),
                const SizedBox(height: 16),

                // Card 3: Garbh Sanjeevani
                _buildSwitchCard(
                  category: AppCategory.pregnancy,
                  activeCategory: activeCategory,
                  imagePath: AssetConstants.artPregnancy,
                  title: 'Garbh Sanjeevani',
                  tagline: 'Prenatal Care & Garbha Sanskar',
                  description: 'Month-wise pregnancy care, prenatal meditation, and Garbha Sanskar tracks.',
                  themeColor: const Color(0xFFC07B8A),
                ),
              ],
            ),
          ),
          if (_switchingCategory != null)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSwitchCard({
    required AppCategory category,
    required AppCategory activeCategory,
    required String imagePath,
    required String title,
    required String tagline,
    required String description,
    required Color themeColor,
  }) {
    final isSelected = category == activeCategory;

    return GestureDetector(
      onTap: _switchingCategory != null
          ? null
          : () {
              if (isSelected) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('You are already using ${category.displayName}'),
                    backgroundColor: themeColor,
                  ),
                );
                return;
              }
              _showConfirmationDialog(
                context,
                category,
                activeCategory.displayName,
                title,
                themeColor,
              );
            },
      child: Card(
        elevation: isSelected ? 4 : 2,
        shadowColor: Colors.black.withValues(alpha: isSelected ? 0.12 : 0.05),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isSelected ? themeColor : themeColor.withValues(alpha: 0.1),
            width: isSelected ? 2.0 : 1.0,
          ),
        ),
        color: isSelected ? themeColor.withValues(alpha: 0.02) : Colors.white,
        clipBehavior: Clip.antiAlias,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Left Image Accent
            SizedBox(
              width: 100,
              height: 120,
              child: Image.asset(
                imagePath,
                fit: BoxFit.cover,
              ),
            ),

            // Right Body Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Cinzel',
                            color: themeColor,
                          ),
                        ),
                        if (isSelected)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: themeColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check, size: 10, color: themeColor),
                                const SizedBox(width: 4),
                                Text(
                                  'Active',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: themeColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tagline.toUpperCase(),
                      style: TextStyle(
                        fontSize: 8.5,
                        fontWeight: FontWeight.bold,
                        color: themeColor.withValues(alpha: 0.7),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: Color(0xFF7A6B58),
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
