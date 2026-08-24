import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  static TextStyle headerTitle = GoogleFonts.dmSans(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 3.0,
    color: const Color(0xFF4D0F1B),
  );

  static TextStyle headingLarge = GoogleFonts.dmSans(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: const Color(0xFF4D0F1B),
  );

  static TextStyle headingMedium = GoogleFonts.dmSans(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: const Color(0xFF4D0F1B),
  );

  static TextStyle headingSmall = GoogleFonts.dmSans(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: const Color(0xFF4D0F1B),
  );

  static TextStyle bodyMedium = GoogleFonts.dmSans(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: const Color(0xFF4A4A4A),
  );

  static TextStyle bodySmall = GoogleFonts.dmSans(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: const Color(0xFF8A7963),
  );

  static TextStyle caption = GoogleFonts.dmSans(
    fontSize: 10,
    fontWeight: FontWeight.w800,
    letterSpacing: 2.5,
    color: const Color(0xFFC9A84C),
  );

  static TextStyle buttonText = GoogleFonts.dmSans(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );
}
