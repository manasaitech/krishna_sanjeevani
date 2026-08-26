import 'package:flutter/material.dart';

enum AppCategory {
  devotional,
  secular,
  pregnancy;

  String get displayName {
    switch (this) {
      case AppCategory.devotional:
        return 'Krishna Sanjeevani';
      case AppCategory.secular:
        return 'Arogya Sanjeevani';
      case AppCategory.pregnancy:
        return 'Garbh Sanjeevani';
    }
  }

  String get tagline {
    switch (this) {
      case AppCategory.devotional:
        return 'Rich maroon · golden light';
      case AppCategory.secular:
        return 'Elegant teal · clear mind';
      case AppCategory.pregnancy:
        return 'Soft rose · gentle care';
    }
  }

  String get description {
    switch (this) {
      case AppCategory.devotional:
        return 'Traditional Krishna Sanjeevani healing.';
      case AppCategory.secular:
        return 'Stress reduction, productivity, emotional wellness.';
      case AppCategory.pregnancy:
        return 'Month-wise pregnancy wellness journey.';
    }
  }
}

@immutable
class CategoryColors extends ThemeExtension<CategoryColors> {
  final Color cat;
  final Color catLight;
  final Color catAccent;
  final Color catForeground;

  const CategoryColors({
    required this.cat,
    required this.catLight,
    required this.catAccent,
    required this.catForeground,
  });

  static const CategoryColors devotional = CategoryColors(
    cat: Color(0xFF7A1E2C),
    catLight: Color(0xFFF2E0E3),
    catAccent: Color(0xFFC9A84C),
    catForeground: Color(0xFFFCFCFC),
  );

  static const CategoryColors secular = CategoryColors(
    cat: Color(0xFF0F766E),
    catLight: Color(0xFFE6F5F3),
    catAccent: Color(0xFF0F766E),
    catForeground: Color(0xFFFCFCFC),
  );

  static const CategoryColors pregnancy = CategoryColors(
    cat: Color(0xFFC07B8A),
    catLight: Color(0xFFF5E4E8),
    catAccent: Color(0xFFC07B8A),
    catForeground: Color(0xFFFCFCFC),
  );

  static CategoryColors ofCategory(AppCategory category) {
    switch (category) {
      case AppCategory.devotional:
        return devotional;
      case AppCategory.secular:
        return secular;
      case AppCategory.pregnancy:
        return pregnancy;
    }
  }

  @override
  CategoryColors copyWith({
    Color? cat,
    Color? catLight,
    Color? catAccent,
    Color? catForeground,
  }) {
    return CategoryColors(
      cat: cat ?? this.cat,
      catLight: catLight ?? this.catLight,
      catAccent: catAccent ?? this.catAccent,
      catForeground: catForeground ?? this.catForeground,
    );
  }

  @override
  CategoryColors lerp(ThemeExtension<CategoryColors>? other, double t) {
    if (other is! CategoryColors) return this;
    return CategoryColors(
      cat: Color.lerp(cat, other.cat, t)!,
      catLight: Color.lerp(catLight, other.catLight, t)!,
      catAccent: Color.lerp(catAccent, other.catAccent, t)!,
      catForeground: Color.lerp(catForeground, other.catForeground, t)!,
    );
  }
}
