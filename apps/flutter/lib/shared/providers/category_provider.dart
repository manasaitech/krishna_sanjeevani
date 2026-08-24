import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/category_theme.dart';
import '../../features/auth/providers/auth_provider.dart';

class CategoryNotifier extends StateNotifier<AppCategory> {
  final Ref _ref;
  CategoryNotifier(this._ref) : super(AppCategory.devotional);

  void setCategory(AppCategory category, {bool syncWithBackend = true}) async {
    state = category;
    if (syncWithBackend) {
      final auth = _ref.read(authProvider);
      if (auth.isAuthenticated) {
        final repo = _ref.read(authRepositoryProvider);
        await repo.updateProfile(category: category.name);
      }
    }
  }
}

final categoryProvider = StateNotifierProvider<CategoryNotifier, AppCategory>((ref) {
  return CategoryNotifier(ref);
});

final categoryColorsProvider = Provider<CategoryColors>((ref) {
  final category = ref.watch(categoryProvider);
  return CategoryColors.ofCategory(category);
});
