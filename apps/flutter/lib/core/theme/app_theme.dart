import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'category_theme.dart';

class AppTheme {
  static ThemeData buildTheme(AppCategory category) {
    final catColors = CategoryColors.ofCategory(category);

    return ThemeData(
      useMaterial3: true,
      fontFamily: GoogleFonts.dmSans().fontFamily,
      colorScheme: ColorScheme(
        brightness: Brightness.light,
        primary: catColors.cat,
        onPrimary: catColors.catForeground,
        secondary: catColors.catAccent,
        onSecondary: Colors.white,
        error: const Color(0xFFB00020),
        onError: Colors.white,
        surface: const Color(0xFFFAF5EC),
        onSurface: const Color(0xFF4D0F1B),
      ),
      scaffoldBackgroundColor: const Color(0xFFFAF5EC),
      extensions: [catColors],
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shadowColor: Colors.black.withValues(alpha: 0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFFAF5EC),
        elevation: 0,
      ),
    );
  }
}
