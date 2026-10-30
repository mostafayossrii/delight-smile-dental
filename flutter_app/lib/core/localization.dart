import 'package:flutter/material.dart';

class AppLocalization {
  final Locale locale;
  AppLocalization(this.locale);

  static final Map<String, Map<String, String>> _localizedValues = {
    'ar': {
      'welcome_title': 'أهلاً بك في عيادة Delight Smile',
      'doctor_name': 'د. عمر سالم',
      'login': 'تسجيل الدخول',
      'create_account': 'إنشاء حساب جديد',
      'continue_as_patient': 'المتابعة كـ مريض',
      'forgot_password': 'هل نسيت كلمة المرور؟',
      'biometric_login': 'الدخول بالبصمة البيومترية',
      'terms_and_privacy': 'الشروط وسياسة الخصوصية الطبية',
      'book_appointment': 'حجز موعد جديد',
      'upcoming_appointments': 'المواعيد القادمة',
      'treatment_plans': 'الخطط العلاجية',
      'odontogram': 'مخطط الأسنان التفاعلي (FDI)',
      'invoices': 'الفواتير والمدفوعات',
      'prescriptions': 'الروشتات الطبية',
      'loyalty_points': 'نقاط الولاء VIP',
      'qr_checkin': 'تسجيل الوصول بالـ QR',
      'select_branch': 'اختر الفرع',
      'select_dentist': 'اختر الطبيب المعالج',
      'select_date': 'اختر التاريخ',
      'select_slot': 'اختر الوقت المتاح',
      'notes_symptoms': 'الأعراض أو الملاحظات',
      'attach_xray': 'إرفاق أشعة أو تقارير سابقة',
      'confirm_booking': 'تأكيد حجز الموعد',
      'cancel': 'إلغاء',
      'reschedule': 'تعديل الموعد',
    },
    'en': {
      'welcome_title': 'Welcome to Delight Smile Dental Clinic',
      'doctor_name': 'Dr. Omar Salem',
      'login': 'Sign In',
      'create_account': 'Create New Account',
      'continue_as_patient': 'Continue as Patient',
      'forgot_password': 'Forgot Password?',
      'biometric_login': 'Biometric Login',
      'terms_and_privacy': 'Terms & Privacy Policy',
      'book_appointment': 'Book Appointment',
      'upcoming_appointments': 'Upcoming Appointments',
      'treatment_plans': 'Treatment Plans',
      'odontogram': 'FDI Interactive Odontogram',
      'invoices': 'Invoices & Payments',
      'prescriptions': 'Prescriptions',
      'loyalty_points': 'VIP Loyalty Points',
      'qr_checkin': 'QR Self Check-In',
      'select_branch': 'Select Branch',
      'select_dentist': 'Select Dentist',
      'select_date': 'Select Date',
      'select_slot': 'Select Available Slot',
      'notes_symptoms': 'Symptoms or Notes',
      'attach_xray': 'Attach X-Rays or Previous Reports',
      'confirm_booking': 'Confirm Appointment Booking',
      'cancel': 'Cancel',
      'reschedule': 'Reschedule',
    }
  };

  String translate(String key) {
    return _localizedValues[locale.languageCode]?[key] ?? key;
  }
}
