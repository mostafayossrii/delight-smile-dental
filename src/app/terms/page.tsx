'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsAndConditionsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base font-black gold-text-gradient">Delight Smile</h1>
            <p className="text-[11px] text-slate-400">الشروط والأحكام</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-gold-300 hover:underline font-bold">
          العودة للرئيسية
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-8 my-6 space-y-6">
        <div className="bg-obsidian-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-black gold-text-gradient">الشروط والأحكام لحجز المواعيد والخدمات الطبية</h2>
          <p className="text-xs text-gold-300">عيادة Delight Smile للأسنان — د/ عمر سالم (فرع جليم، الإسكندرية)</p>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. مواعيد العمل والحجوزات</h3>
            <p>تعمل العيادة في فرعها الوحيد الكائن ببرج جليم هايتس، الدور الأول، ٤ شارع أحمد فتحي، جليم، الإسكندرية. تتاح المواعيد حسب الجدول المعتمد:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pr-2">
              <li>السبت والإثنين والأربعاء: من 12:00 ظهراً حتى 06:00 مساءً.</li>
              <li>الأحد والثلاثاء والخميس: من 04:00 عصراً حتى 10:00 مساءً.</li>
              <li>يوم الجمعة: عطلة أسبوعية رسمية ومغلق تماماً.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. تأكيد وإلغاء المواعيد</h3>
            <p>يُرجى الحضور قبل الموعد بـ 10 دقائق لإنهاء إجراءات التسجيل. في حال الرغبة في تأجيل أو إلغاء الموعد، يُرجى إخطار العيادة مسبقاً قبل الموعد بـ 24 ساعة على الأقل عبر الواتساب أو الهاتف.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">3. التشخيص والخطط العلاجية</h3>
            <p>يتم وضع الخطة العلاجية وتقدير التكلفة بناءً على الكشف السريري الشامل وصور الأشعة بواسطة د/ عمر سالم، ويحق للمريض مناقشة البدائل المتاحة واعتماد الخطة المناسبة له.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">4. سياسة المدفوعات والفواتير</h3>
            <p>تُصدر العيادة إيصالات سداد إلكترونية موثقة لكافة المعاملات المالية، مع إمكانية الدفع نقداً أو عبر بطاقات الدفع الإلكتروني أو إنستاباي (InstaPay).</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>عيادة Delight Smile للأسنان — د/ عمر سالم (الإسكندرية - جليم)</p>
      </footer>
    </div>
  );
}
