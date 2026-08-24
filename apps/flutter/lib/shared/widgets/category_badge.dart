import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/category_theme.dart';
import '../providers/category_provider.dart';

class CategoryBadge extends ConsumerWidget {
  final AppCategory? category;
  final VoidCallback? onTap;

  const CategoryBadge({
    super.key,
    this.category,
    this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppCategory activeCategory = category ?? ref.watch(categoryProvider);
    final CategoryColors colors = CategoryColors.ofCategory(activeCategory);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: colors.catLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: colors.cat.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: colors.cat,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              activeCategory.displayName,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: colors.cat,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
