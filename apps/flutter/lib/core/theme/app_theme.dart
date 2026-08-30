import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'category_theme.dart';

class AppTheme {
  static ThemeData buildTheme(AppCategory category, {bool isDark = false}) {
    if (isDark) {
      return buildDarkTheme(category);
    }
    final catColors = CategoryColors.ofCategory(category, isDark: false);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
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
        iconTheme: IconThemeData(color: Color(0xFF261E0E)),
        titleTextStyle: TextStyle(color: Color(0xFF261E0E), fontSize: 18, fontWeight: FontWeight.bold),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  static ThemeData buildDarkTheme(AppCategory category) {
    final catColors = CategoryColors.ofCategory(category, isDark: true);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: GoogleFonts.dmSans().fontFamily,
      colorScheme: ColorScheme(
        brightness: Brightness.dark,
        primary: catColors.cat,
        onPrimary: const Color(0xFF141218),
        secondary: catColors.catAccent,
        onSecondary: const Color(0xFF141218),
        error: const Color(0xFFF2B8B5),
        onError: const Color(0xFF601410),
        surface: const Color(0xFF1E1B24),
        onSurface: const Color(0xFFE6E1E5),
      ),
      scaffoldBackgroundColor: const Color(0xFF141218),
      extensions: [catColors],
      cardTheme: CardThemeData(
        color: const Color(0xFF1E1B24),
        elevation: 2,
        shadowColor: Colors.black.withValues(alpha: 0.3),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF141218),
        elevation: 0,
        iconTheme: IconThemeData(color: Color(0xFFE6E1E5)),
        titleTextStyle: TextStyle(color: Color(0xFFE6E1E5), fontSize: 18, fontWeight: FontWeight.bold),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: const Color(0xFF26232D),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}
