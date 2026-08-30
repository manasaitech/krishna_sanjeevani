import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../auth/providers/auth_provider.dart';

// Custom painter to draw the background mandala pattern
class MandalaPainter extends CustomPainter {
  final Color color;

  MandalaPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width > size.height ? size.width : size.height;

    // Draw concentric circles
    for (double r = 40; r < maxRadius; r += 40) {
      canvas.drawCircle(center, r, paint);
    }

    // Draw radial lines
    const numLines = 16;
    for (int i = 0; i < numLines; i++) {
      final angle = (i * 2 * pi) / numLines;
      final dx = maxRadius * 1.5 * cos(angle);
      final dy = maxRadius * 1.5 * sin(angle);
      canvas.drawLine(center, Offset(center.dx + dx, center.dy + dy), paint);
    }

    // Draw secondary intersecting circles for geometric mandala pattern
    const numSubCircles = 8;
    final subCircleRadius = maxRadius * 0.3;
    for (int i = 0; i < numSubCircles; i++) {
      final angle = (i * 2 * pi) / numSubCircles;
      final subCenter = Offset(
        center.dx + maxRadius * 0.4 * cos(angle),
        center.dy + maxRadius * 0.4 * sin(angle),
      );
      canvas.drawCircle(subCenter, subCircleRadius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom painter for Concentric dashed rings in card headers
class ConcentricRingsPainter extends CustomPainter {
  final Color color;

  ConcentricRingsPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final center = Offset(size.width / 2, size.height / 2);

    // 1. Draw outer dashed circle
    final dashPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    const double radius = 70.0;
    const int dashCount = 36;
    const double dashLength = (2 * pi * radius) / dashCount / 2;
    for (int i = 0; i < dashCount; i++) {
      final startAngle = (i * 2 * pi) / dashCount;
      const sweepAngle = dashLength / radius;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        dashPaint,
      );
    }

    // 2. Draw middle solid circle
    canvas.drawCircle(center, 55.0, paint..strokeWidth = 1.5);

    // 3. Draw inner dashed circle
    const double innerRadius = 40.0;
    const int innerDashCount = 24;
    const double innerDashLength = (2 * pi * innerRadius) / innerDashCount / 2;
    for (int i = 0; i < innerDashCount; i++) {
      final startAngle = (i * 2 * pi) / innerDashCount;
      const sweepAngle = innerDashLength / innerRadius;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: innerRadius),
        startAngle,
        sweepAngle,
        false,
        dashPaint..strokeWidth = 1.0,
      );
    }

    // Draw 4 symmetric decorative petals/curves around the center
    final pathPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    for (int i = 0; i < 4; i++) {
      final angle = (i * pi) / 2;
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(angle);

      final path = Path()
        ..moveTo(0, -55)
        ..quadraticBezierTo(20, -70, 0, -85)
        ..quadraticBezierTo(-20, -70, 0, -55)
        ..close();
      canvas.drawPath(path, pathPaint);

      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ChooseSanjeevaniScreen extends ConsumerStatefulWidget {
  const ChooseSanjeevaniScreen({super.key});

  @override
  ConsumerState<ChooseSanjeevaniScreen> createState() => _ChooseSanjeevaniScreenState();
}

class _ChooseSanjeevaniScreenState extends ConsumerState<ChooseSanjeevaniScreen> {
  AppCategory? _selectedCategory;
  AppCategory? _savingCategory;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authProvider);
      final profile = authState.user?['profile'];
      final categoryStr = (profile is Map<String, dynamic>) ? profile['category'] as String? : null;
      if (categoryStr != null && categoryStr != 'unset') {
        setState(() {
          if (categoryStr == 'devotional') {
            _selectedCategory = AppCategory.devotional;
          } else if (categoryStr == 'secular') {
            _selectedCategory = AppCategory.secular;
          } else if (categoryStr == 'pregnancy') {
            _selectedCategory = AppCategory.pregnancy;
          }
        });
      }
    });
  }

  void _onContinue() async {
    final selected = _selectedCategory;
    if (selected == null || _savingCategory != null) return;
    setState(() {
      _savingCategory = selected;
    });

    try {
      ref.read(categoryProvider.notifier).setCategory(selected, syncWithBackend: true);
      // Wait briefly for sync operation
      await Future.delayed(const Duration(milliseconds: 600));
      // Force reload auth user details to refresh router redirects
      await ref.read(authProvider.notifier).bootstrapSession();

      if (mounted) {
        context.go(selected == AppCategory.pregnancy ? '/journey' : '/home');
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
    final hasSelection = _selectedCategory != null;

    String ctaText = 'Select Your Pathway';
    if (_selectedCategory == AppCategory.devotional) {
      ctaText = 'Continue with Krishna Sanjeevani';
    } else if (_selectedCategory == AppCategory.secular) {
      ctaText = 'Continue with Arogya Sanjeevani';
    } else if (_selectedCategory == AppCategory.pregnancy) {
      ctaText = 'Continue with Garbh Sanjeevani';
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      body: Stack(
        children: [
          // Background Mandala Overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.03,
              child: CustomPaint(
                painter: MandalaPainter(color: const Color(0xFF7C1C24)),
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 12),
                        // Top Logo
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

                        // Header Tagline
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.star_outline, size: 14, color: Color(0xFFC5A880)),
                            SizedBox(width: 6),
                            Text(
                              'CHOOSE YOUR HEALING JOURNEY',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFC5A880),
                                letterSpacing: 1.5,
                              ),
                            ),
                            SizedBox(width: 6),
                            Icon(Icons.star_outline, size: 14, color: Color(0xFFC5A880)),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Header Title
                        const Text(
                          'Choose Your Healing Journey',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Cinzel',
                            color: Color(0xFF4A0E17),
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Header Description
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16.0),
                          child: Text(
                            'Choose the wellness pathway that best matches your needs. You can explore a personalized experience designed specifically for your selected journey.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: Color(0xFF7A6B58),
                              height: 1.4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Devotional Card
                        _buildPathwayCard(
                          category: AppCategory.devotional,
                          title: 'Krishna Sanjeevani',
                          tagline: 'DISORDER & AILMENT RELIEF',
                          description:
                              'Therapeutic sound frequencies calibrated to support physical and neurological conditions naturally through Raga Chikitsa.',
                          themeColor: const Color(0xFF7C1C24),
                          selectedBgColors: [const Color(0xFFFFF0F0), const Color(0xFFFDF0F0)],
                          unselectedBgColors: [const Color(0xFFFFF5F5), const Color(0xFFFDF4F4)],
                          unselectedBorderColor: const Color(0xFFF2D6D6),
                          iconData: Icons.spa_outlined,
                          headerGradient: const [Color(0xFFA72C38), Color(0xFF5A1218)],
                          bullets: [
                            'Targeted relief for various ailments',
                            'Non-invasive & natural support',
                            'Rooted in ancient Indian wisdom',
                          ],
                          bulletIcons: [
                            Icons.favorite_border,
                            Icons.local_florist_outlined,
                            Icons.shield_outlined,
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Secular Card
                        _buildPathwayCard(
                          category: AppCategory.secular,
                          title: 'Arogya Sanjeevani',
                          tagline: 'CORPORATE WELLNESS & PRODUCTIVITY',
                          description:
                              'Circadian-aligned sound therapy designed to reduce stress, boost focus, and enhance well-being in the workplace.',
                          themeColor: const Color(0xFF1C5D4B),
                          selectedBgColors: [const Color(0xFFEBF5F1), const Color(0xFFE3EFEA)],
                          unselectedBgColors: [const Color(0xFFF4F8F6), const Color(0xFFECF2EF)],
                          unselectedBorderColor: const Color(0xFFDDEBE4),
                          iconData: Icons.work_outline,
                          headerGradient: const [Color(0xFF247D64), Color(0xFF124335)],
                          bullets: [
                            'Enhances focus & mental clarity',
                            'Reduces stress & burnout',
                            'Improves team well-being',
                          ],
                          bulletIcons: [
                            Icons.psychology_outlined,
                            Icons.shield_outlined,
                            Icons.group_outlined,
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Pregnancy Card
                        _buildPathwayCard(
                          category: AppCategory.pregnancy,
                          title: 'Garbh Sanjeevani',
                          tagline: 'PREGNANCY CARE (GARBHA SANSKAR)',
                          description:
                              'Sacred sound guidance for a harmonious pregnancy journey and positive fetal development based on Garbha Sanskar.',
                          themeColor: const Color(0xFFD01C5C),
                          selectedBgColors: [const Color(0xFFF2EBF7), const Color(0xFFEBE2F3)],
                          unselectedBgColors: [const Color(0xFFFFF0F5), const Color(0xFFFDF2F4)],
                          unselectedBorderColor: const Color(0xFFFAD2E1),
                          iconData: Icons.child_care_outlined,
                          headerGradient: const [Color(0xFF8A57AA), Color(0xFF4E2A66)],
                          bullets: [
                            'Supports fetal development',
                            'Promotes emotional balance',
                            'Guided by Garbha Sanskar wisdom',
                          ],
                          bulletIcons: [
                            Icons.music_note_outlined,
                            Icons.favorite_border,
                            Icons.menu_book_outlined,
                          ],
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),

                // Bottom Action Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                  child: SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: (!hasSelection || _savingCategory != null) ? null : _onContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF264653),
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: const Color(0xFFE0E0E0),
                        disabledForegroundColor: const Color(0xFF757575),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(26),
                        ),
                        elevation: 2,
                      ),
                      child: _savingCategory != null
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  ctaText,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.arrow_forward, size: 16),
                              ],
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

  Widget _buildPathwayCard({
    required AppCategory category,
    required String title,
    required String tagline,
    required String description,
    required Color themeColor,
    required List<Color> selectedBgColors,
    required List<Color> unselectedBgColors,
    required Color unselectedBorderColor,
    required IconData iconData,
    required List<Color> headerGradient,
    required List<String> bullets,
    required List<IconData> bulletIcons,
  }) {
    final isSelected = _selectedCategory == category;
    final isAnySaving = _savingCategory != null;

    final border = Border.all(
      color: isSelected ? themeColor : unselectedBorderColor,
      width: isSelected ? 2.5 : 1.5,
    );

    final bgColors = isSelected ? selectedBgColors : unselectedBgColors;

    return GestureDetector(
      onTap: isAnySaving
          ? null
          : () {
              setState(() {
                _selectedCategory = category;
              });
            },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          border: border,
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: bgColors,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected ? themeColor.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.04),
              blurRadius: isSelected ? 16 : 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Artwork (Circular Medallion)
            SizedBox(
              height: 160,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Vector concentric dashed rings background
                  Positioned.fill(
                    child: Opacity(
                      opacity: 0.15,
                      child: CustomPaint(
                        painter: ConcentricRingsPainter(color: themeColor),
                      ),
                    ),
                  ),

                  // Medallion
                  Container(
                    width: 108,
                    height: 108,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: headerGradient,
                      ),
                      border: Border.all(color: Colors.white, width: 4),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      iconData,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            // Card Body details
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Title
                  Text(
                    title,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cinzel',
                      color: themeColor,
                    ),
                  ),
                  const SizedBox(height: 2),

                  // Tagline
                  Text(
                    tagline,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: themeColor.withValues(alpha: 0.85),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Ornamental line divider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(height: 0.7, width: 36, color: themeColor.withValues(alpha: 0.2)),
                      const SizedBox(width: 8),
                      Transform.rotate(
                        angle: pi / 4,
                        child: Container(width: 5, height: 5, color: themeColor.withValues(alpha: 0.4)),
                      ),
                      const SizedBox(width: 8),
                      Container(height: 0.7, width: 36, color: themeColor.withValues(alpha: 0.2)),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Description
                  Text(
                    description,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFF5C5040),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Bullets
                  ...Iterable<int>.generate(bullets.length).map((index) {
                    final bullet = bullets[index];
                    final bIcon = bulletIcons[index];

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: themeColor.withValues(alpha: 0.08),
                            ),
                            alignment: Alignment.center,
                            child: Icon(
                              bIcon,
                              size: 13,
                              color: themeColor,
                            ),
                          ),
                          const SizedBox(width: 10),
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
                    );
                  }),
                  const SizedBox(height: 18),

                  // Selection State Indicator (Card-level pill button)
                  Container(
                    width: double.infinity,
                    height: 38,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(19),
                      color: isSelected ? themeColor : Colors.white,
                      border: Border.all(
                        color: isSelected ? Colors.transparent : themeColor.withValues(alpha: 0.2),
                        width: 1.0,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      isSelected ? 'Selected Pathway' : 'Select $title',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : themeColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
