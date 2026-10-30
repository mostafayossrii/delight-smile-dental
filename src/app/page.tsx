'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicLandingPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const content = {
    ar: {
      clinicName: 'عيادة Delight Smile للأسنان',
      doctorName: 'د/ عمر سالم',
      specialties: 'جميع تخصصات طب وجراحة وتجميل وزراعة الأسنان',
      tagline: 'Your Delight is on your Smile',
      addressTitle: 'عنوان العيادة:',
      address: 'الإسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول',
      phone: '01091313305',
      whatsapp: '01034366020',
      scheduleTitle: 'مواعيد العمل الرسمية:',
      satMonWed: 'السبت • الإثنين • الأربعاء: 12:00 ظهراً - 06:00 مساءً',
      sunTueThu: 'الأحد • الثلاثاء • الخميس: 04:00 عصراً - 10:00 مساءً',
      friday: 'الجمعة: عطلة أسبوعية رسمية (مغلق)',
      patientPortal: 'بوابة المريض',
      patientLogin: 'تسجيل دخول المريض',
      patientRegister: 'إنشاء حساب مريض جديد',
      staffLogin: 'دخول الطاقم الطبي والإدارة',
      bookAppointment: 'حجز موعد كشف',
      forgotPassword: 'نسيت كلمة المرور؟',
      privacyPolicy: 'سياسة الخصوصية',
      terms: 'الشروط والأحكام',
      copyright: 'جميع الحقوق محفوظة © 2026 عيادة Delight Smile للأسنان - د. عمر سالم'
    },
    en: {
      clinicName: 'Delight Smile Dental Clinic',
      doctorName: 'Dr. Omar Salem',
      specialties: 'Comprehensive Dentistry, Oral Surgery, Implants & Aesthetics',
      tagline: 'Your Delight is on your Smile',
      addressTitle: 'Clinic Location:',
      address: 'Alexandria - Gleem - 4 Ahmed Fathi St, Gleem Heights Tower, 1st Floor',
      phone: '01091313305',
      whatsapp: '01034366020',
      scheduleTitle: 'Official Working Hours:',
      satMonWed: 'Sat • Mon • Wed: 12:00 PM - 06:00 PM',
      sunTueThu: 'Sun • Tue • Thu: 04:00 PM - 10:00 PM',
      friday: 'Friday: Official Weekly Holiday (Closed)',
      patientPortal: 'Patient Portal',
      patientLogin: 'Patient Login',
      patientRegister: 'Create New Patient Account',
      staffLogin: 'Staff & Doctor Login',
      bookAppointment: 'Book Appointment',
      forgotPassword: 'Forgot Password?',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms and Conditions',
      copyright: 'All rights reserved © 2026 Delight Smile Dental Clinic - Dr. Omar Salem'
    }
  };

  const t = content[lang];
  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-gold-500 selection:text-obsidian-950">
      {/* Top Navbar */}
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 shadow-lg relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile Logo" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black gold-text-gradient tracking-wide">{t.clinicName}</h1>
            <p className="text-[11px] text-slate-400 font-semibold">{t.doctorName}</p>
          </div>
        </div>

        {/* Actions & Language Selector */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 font-bold transition flex items-center gap-1.5"
            title="Switch Language"
          >
            <i className="fa-solid fa-globe"></i>
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <Link
            href="/staff/login"
            className="px-3.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 font-bold transition hidden sm:flex items-center gap-1.5"
          >
            <i className="fa-solid fa-user-doctor"></i>
            <span>{t.staffLogin}</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl bg-obsidian-900/80 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden space-y-8">
          {/* Subtle gold line at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>

          {/* Clinic Branding */}
          <div className="text-center space-y-3">
            <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-gold-500/50 shadow-2xl bg-obsidian-950 p-1.5 flex items-center justify-center">
              <Image src="/logo.jpg" alt="Delight Smile Logo" width={96} height={96} className="object-cover rounded-2xl" priority />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black gold-text-gradient">{t.clinicName}</h2>
            <p className="text-base sm:text-lg text-gold-200 font-bold">{t.doctorName}</p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">{t.specialties}</p>
            <p className="text-sm font-serif italic text-gold-400 font-semibold tracking-wider">
              &ldquo;{t.tagline}&rdquo;
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              href="/patient/register"
              className="py-3.5 px-4 rounded-2xl gold-gradient text-obsidian-950 font-black text-sm text-center shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-user-plus text-base"></i>
              <span>{t.patientRegister}</span>
            </Link>

            <Link
              href="/patient/login"
              className="py-3.5 px-4 rounded-2xl bg-obsidian-950 hover:bg-obsidian-800 text-gold-300 border border-gold-500/40 font-black text-sm text-center shadow-lg transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket text-base"></i>
              <span>{t.patientLogin}</span>
            </Link>
          </div>

          {/* Booking & Staff Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-1">
            <Link
              href="/patient/login?mode=book"
              className="px-4 py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 border border-gold-500/30 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-calendar-check text-gold-400"></i>
              <span>{t.bookAppointment}</span>
            </Link>
            <Link
              href="/staff/login"
              className="px-4 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 hover:text-white border border-gold-500/20 transition flex items-center gap-1.5 sm:hidden"
            >
              <i className="fa-solid fa-user-doctor text-gold-400"></i>
              <span>{t.staffLogin}</span>
            </Link>
            <Link
              href="/forgot-password"
              className="text-slate-400 hover:text-gold-300 transition"
            >
              {t.forgotPassword}
            </Link>
          </div>

          {/* Official Location & Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gold-500/20 text-xs">
            {/* Location & Contact */}
            <div className="bg-obsidian-950/70 border border-gold-500/25 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-gold-300 flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-gold-400"></i>
                <span>{t.addressTitle}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{t.address}</p>

              <div className="pt-2 flex flex-wrap items-center gap-3 font-mono">
                <a
                  href={`tel:${t.phone}`}
                  className="flex items-center gap-1.5 text-gold-300 hover:underline"
                >
                  <i className="fa-solid fa-phone text-gold-400"></i>
                  <span>{t.phone}</span>
                </a>
                <a
                  href="https://wa.me/201034366020"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>{t.whatsapp}</span>
                </a>
              </div>
            </div>

            {/* Official Hours */}
            <div className="bg-obsidian-950/70 border border-gold-500/25 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-gold-300 flex items-center gap-1.5">
                <i className="fa-regular fa-clock text-gold-400"></i>
                <span>{t.scheduleTitle}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>{t.satMonWed.split(':')[0]}:</span>
                  <span className="font-bold text-white font-mono">{t.satMonWed.split(':')[1]}:{t.satMonWed.split(':')[2]}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.sunTueThu.split(':')[0]}:</span>
                  <span className="font-bold text-white font-mono">{t.sunTueThu.split(':')[1]}:{t.sunTueThu.split(':')[2]}</span>
                </div>
                <div className="flex justify-between text-rose-300 font-bold">
                  <span>{t.friday}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-500/15 py-4 px-4 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-400 font-semibold">
          <Link href="/privacy" className="hover:text-gold-300 transition">{t.privacyPolicy}</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gold-300 transition">{t.terms}</Link>
          <span>•</span>
          <a href="https://wa.me/201034366020" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
            WhatsApp
          </a>
        </div>
        <p>{t.copyright}</p>
      </footer>
    </div>
  );
}
