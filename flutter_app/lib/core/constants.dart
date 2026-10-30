import 'package:flutter/material.dart';

class AppConstants {
  static const String appNameAr = 'عيادة Delight Smile - د. عمر سالم';
  static const String appNameEn = 'Delight Smile Dental Clinic - Dr. Omar Salem';

  // Obsidian & Royal Gold Palette
  static const Color obsidian950 = Color(0xFF070709);
  static const Color obsidian900 = Color(0xFF0D0E12);
  static const Color obsidian800 = Color(0xFF14161D);
  static const Color obsidian700 = Color(0xFF1D202A);

  static const Color gold500 = Color(0xFFD4AF37);
  static const Color gold400 = Color(0xFFD9A736);
  static const Color gold300 = Color(0xFFE2BD5A);
  static const Color gold100 = Color(0xFFF5EBC7);

  // Light Mode Palette (Warm Ivory & Bronze Gold)
  static const Color ivoryBg = Color(0xFFF5F3EE);
  static const Color ivoryCard = Color(0xFFFFFFFF);
  static const Color bronzeGold = Color(0xFF8A620A);

  // Status Colors
  static const Color successEmerald = Color(0xFF10B981);
  static const Color alertRose = Color(0xFFF43F5E);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color infoBlue = Color(0xFF3B82F6);

  // Alexandria Clinic Coordinates
  static const double clinicLatitude = 31.2001;
  static const double clinicLongitude = 29.9187;
  static const double geofenceRadiusMeters = 500.0;

  // Supabase defaults
  static const String defaultSupabaseUrl = 'https://delight-smile-dental.supabase.co';
  static const String defaultAnonKey = 'dummy_anon_key';
  static const String storageBucket = 'clinical-private';
}
