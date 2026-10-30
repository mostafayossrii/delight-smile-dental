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

  // Alexandria Clinic Coordinates & Official Address
  static const double clinicLatitude = 31.2333; // Glim, Alexandria
  static const double clinicLongitude = 29.9650;
  static const double geofenceRadiusMeters = 500.0;

  // Official Clinic & Doctor Details
  static const String doctorNameAr = 'د. عمر سالم';
  static const String doctorNameEn = 'Dr. Omar Salem';
  static const String doctorTitleAr = 'جميع التخصصات وجراحة وتجميل وزراعة الأسنان';
  static const String doctorTitleEn = 'All Dental Specialties, Surgery & Cosmetic Dentistry';
  static const String businessPhone = '+201034366020';
  static const String clinicPhone = '+201091313305';
  static const String whatsappNumber = '201034366020';
  static const String whatsappLink = 'https://wa.me/201034366020';
  static const String clinicAddressAr = 'الأسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول';
  static const String clinicAddressEn = 'Glim Heights Tower, 1st Floor, 4 Ahmed Fathi St., Glim, Alexandria, Egypt';
  static const String clinicSlogan = 'Your Delight is on your Smile';

  // Working Hours
  static const String scheduleDaysA = 'السبت - الإثنين - الأربعاء: 12:00 ظهراً - 06:00 مساءً';
  static const String scheduleDaysB = 'الأحد - الثلاثاء - الخميس: 04:00 عصراً - 10:00 مساءً';
  static const String scheduleOffDay = 'الجمعة: إجازة أسبوعية';

  // Clinical Procedures
  static const List<Map<String, String>> officialProcedures = [
    {'nameEn': 'Composite Restoration', 'nameAr': 'حشو كومبوزيت تجميلي'},
    {'nameEn': 'Composite veneer', 'nameAr': 'فينير كومبوزيت تجميلي'},
    {'nameEn': 'Endodontic treatment', 'nameAr': 'علاج جذور وعصب الأسنان'},
    {'nameEn': 'Pulpotomy', 'nameAr': 'بتر لب السن (علاج أسنان الأطفال)'},
    {'nameEn': 'Pulpectomy', 'nameAr': 'استئصال لب السن الجذري'},
    {'nameEn': 'Extraction', 'nameAr': 'خلع الأسنان وجراحة الفم'},
    {'nameEn': 'Crown restoration', 'nameAr': 'تركيبات التيجان والجسور الثابتة'},
    {'nameEn': 'Veneers', 'nameAr': 'عدسات الفينير الخزفي E-Max'},
    {'nameEn': 'Complete denture', 'nameAr': 'طقم أسنان صناعي كامل'},
    {'nameEn': 'Single denture', 'nameAr': 'طقم أسنان أحادي'},
    {'nameEn': 'Partial denture', 'nameAr': 'طقم أسنان صناعي جزئي'},
    {'nameEn': 'Scaling', 'nameAr': 'تنظيف الجير وتلميع الأسنان وعلاج اللثة'},
    {'nameEn': 'Whitening', 'nameAr': 'تبييض الأسنان الاحترافي بالليزر'},
  ];

  // Supabase defaults
  static const String defaultSupabaseUrl = 'https://uujtikjqzeqgbhtudlxc.supabase.co';
  static const String defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjg2OTQsImV4cCI6MjEwODk0NDY5NH0.ZCT-GP5qEaZHpFGMRup0oBzdpiu3RQqhRsffq0Y97_Q';
  static const String storageBucket = 'clinical-private';
}
