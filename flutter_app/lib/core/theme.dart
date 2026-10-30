import 'package:flutter/material.dart';
import 'constants.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppConstants.obsidian950,
      primaryColor: AppConstants.gold500,
      fontFamily: 'Cairo',
      colorScheme: const ColorScheme.dark(
        primary: AppConstants.gold500,
        secondary: AppConstants.gold400,
        surface: AppConstants.obsidian900,
        background: AppConstants.obsidian950,
        error: AppConstants.alertRose,
      ),
      cardTheme: CardTheme(
        color: AppConstants.obsidian900,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppConstants.gold500.withOpacity(0.25)),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppConstants.obsidian900,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: AppConstants.gold400,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          fontFamily: 'Cairo',
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.gold500,
          foregroundColor: AppConstants.obsidian950,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppConstants.obsidian800,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppConstants.gold500.withOpacity(0.3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppConstants.gold500.withOpacity(0.25)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppConstants.gold400, width: 1.5),
        ),
        labelStyle: const TextStyle(color: Colors.white70),
        hintStyle: const TextStyle(color: Colors.white38),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppConstants.ivoryBg,
      primaryColor: AppConstants.bronzeGold,
      fontFamily: 'Cairo',
      colorScheme: const ColorScheme.light(
        primary: AppConstants.bronzeGold,
        secondary: AppConstants.gold500,
        surface: AppConstants.ivoryCard,
        background: AppConstants.ivoryBg,
        error: AppConstants.alertRose,
      ),
      cardTheme: CardTheme(
        color: AppConstants.ivoryCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppConstants.bronzeGold.withOpacity(0.3)),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppConstants.ivoryCard,
        elevation: 1,
        titleTextStyle: TextStyle(
          color: AppConstants.bronzeGold,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          fontFamily: 'Cairo',
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.bronzeGold,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppConstants.bronzeGold.withOpacity(0.3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppConstants.bronzeGold.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppConstants.bronzeGold, width: 1.5),
        ),
        labelStyle: const TextStyle(color: Colors.black87),
        hintStyle: const TextStyle(color: Colors.black38),
      ),
    );
  }
}
