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
        return 'Therapeutic sound frequencies calibrated to support physical and neurological conditions naturally through Raga Chikitsa.';
      case AppCategory.secular:
        return 'Circadian-aligned sound therapy designed to reduce stress, boost focus, and enhance well-being in the workplace.';
      case AppCategory.pregnancy:
        return 'Sacred sound guidance for a harmonious pregnancy journey and positive fetal development based on Garbha Sanskar.';
    }
  }

  String get greetingText {
    switch (this) {
      case AppCategory.devotional:
        return 'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।';
      case AppCategory.secular:
        return 'स्वस्थस्य स्वास्थ्य रक्षणं, आतुरस्य विकार प्रशमनं च।';
      case AppCategory.pregnancy:
        return 'पुत्रं कुरु प्रवरं कुलवर्धनम्, गर्भं रक्ष सुशोभनम्।';
    }
  }

  String get bannerText {
    switch (this) {
      case AppCategory.devotional:
        return 'Your personalized healing journey is in progress. Keep listening daily to experience the full benefits of Raga Chikitsa.';
      case AppCategory.secular:
        return 'Workplace wellness and productivity programs active. Listen daily for optimal circadian rhythm alignment.';
      case AppCategory.pregnancy:
        return 'Nurturing Garbha Sanskar sound frequencies active. Connect with your baby and support healthy fetal development.';
    }
  }

  String get placeholderSearch {
    switch (this) {
      case AppCategory.devotional:
        return 'Search surawalis, ragas, ailments...';
      case AppCategory.secular:
        return 'Search surawalis, wellness programs...';
      case AppCategory.pregnancy:
        return 'Search surawalis, pregnancy themes...';
    }
  }

  List<String> get filters {
    switch (this) {
      case AppCategory.devotional:
        return const ['All', 'Disorder Relief', 'Stress Relief', 'Focus', 'Sleep', 'Energy', 'Anxiety', 'Meditation', 'Healing'];
      case AppCategory.secular:
        return const ['All', 'Workplace Stress', 'Focus Boost', 'Mental Clarity', 'Burnout Relief', 'Rest & Reset', 'Meditation', 'Energy'];
      case AppCategory.pregnancy:
        return const ['All', 'Month 1-3', 'Month 4-6', 'Month 7-9', 'Maternal Calm', 'Baby Bond', 'Sleep', 'Meditation'];
    }
  }
}

@immutable
class CategoryColors extends ThemeExtension<CategoryColors> {
  final Color cat;
  final Color catLight;
  final Color catAccent;
  final Color catForeground;
  final Color catText;
  final Color catQuoteBg;
  final Color catSubtext;

  const CategoryColors({
    required this.cat,
    required this.catLight,
    required this.catAccent,
    required this.catForeground,
    required this.catText,
    required this.catQuoteBg,
    required this.catSubtext,
  });

  static const CategoryColors devotional = CategoryColors(
    cat: Color(0xFF7C1C24),
    catLight: Color(0xFFF3E8D0),
    catAccent: Color(0xFFC9A84C),
    catForeground: Color(0xFFFFFFFF),
    catText: Color(0xFF4D0F1B),
    catQuoteBg: Color(0xFFFAF6EE),
    catSubtext: Color(0xFF8A7963),
  );

  static const CategoryColors secular = CategoryColors(
    cat: Color(0xFF0F766E),
    catLight: Color(0xFFE6F5F3),
    catAccent: Color(0xFF14B8A6),
    catForeground: Color(0xFFFFFFFF),
    catText: Color(0xFF0D4A44),
    catQuoteBg: Color(0xFFECF5F2),
    catSubtext: Color(0xFF4A6B65),
  );

  static const CategoryColors pregnancy = CategoryColors(
    cat: Color(0xFFD01C5C),
    catLight: Color(0xFFFFF0F5),
    catAccent: Color(0xFFFB7185),
    catForeground: Color(0xFFFFFFFF),
    catText: Color(0xFF7A0C35),
    catQuoteBg: Color(0xFFFAF0F4),
    catSubtext: Color(0xFF7B4E5C),
  );

  static const CategoryColors devotionalDark = CategoryColors(
    cat: Color(0xFFE27B8A),
    catLight: Color(0xFF38181E),
    catAccent: Color(0xFFE0C475),
    catForeground: Color(0xFF141218),
    catText: Color(0xFFFAD2E1),
    catQuoteBg: Color(0xFF2D161C),
    catSubtext: Color(0xFFC4B5A8),
  );

  static const CategoryColors secularDark = CategoryColors(
    cat: Color(0xFF2DD4BF),
    catLight: Color(0xFF113835),
    catAccent: Color(0xFF2DD4BF),
    catForeground: Color(0xFF141218),
    catText: Color(0xFFDDEBE4),
    catQuoteBg: Color(0xFF132D29),
    catSubtext: Color(0xFFA5C4BF),
  );

  static const CategoryColors pregnancyDark = CategoryColors(
    cat: Color(0xFFF4A3B4),
    catLight: Color(0xFF3D2127),
    catAccent: Color(0xFFF4A3B4),
    catForeground: Color(0xFF141218),
    catText: Color(0xFFFDE2E8),
    catQuoteBg: Color(0xFF331620),
    catSubtext: Color(0xFFD4B0BC),
  );

  static CategoryColors ofCategory(AppCategory category, {bool isDark = false}) {
    if (isDark) {
      switch (category) {
        case AppCategory.devotional:
          return devotionalDark;
        case AppCategory.secular:
          return secularDark;
        case AppCategory.pregnancy:
          return pregnancyDark;
      }
    }
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
    Color? catText,
    Color? catQuoteBg,
    Color? catSubtext,
  }) {
    return CategoryColors(
      cat: cat ?? this.cat,
      catLight: catLight ?? this.catLight,
      catAccent: catAccent ?? this.catAccent,
      catForeground: catForeground ?? this.catForeground,
      catText: catText ?? this.catText,
      catQuoteBg: catQuoteBg ?? this.catQuoteBg,
      catSubtext: catSubtext ?? this.catSubtext,
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
      catText: Color.lerp(catText, other.catText, t)!,
      catQuoteBg: Color.lerp(catQuoteBg, other.catQuoteBg, t)!,
      catSubtext: Color.lerp(catSubtext, other.catSubtext, t)!,
    );
  }
}
