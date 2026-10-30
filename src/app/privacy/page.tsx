'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base font-black gold-text-gradient">Delight Smile</h1>
            <p className="text-[11px] text-slate-400">سياسة الخصوصية وسرية السجلات الطبية</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-gold-300 hover:underline font-bold">
          العودة للرئيسية
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-8 my-6 space-y-6">
        <div className="bg-obsidian-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-black gold-text-gradient">سياسة الخصوصية وحماية البيانات الطبية</h2>
          <p className="text-xs text-gold-300">آخر تحديث: 30 أكتوبر 2026 • عيادة Delight Smile للأسنان (د/ عمر سالم - الإسكندرية)</p>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. التزام العيادة بالسرية الطبية</h3>
            <p>تلتزم عيادة Delight Smile للأسنان بأعلى معايير السرية المهنية والطبية في التعامل مع بيانات المرضى، وأشعة الأسنان، والخطط العلاجية، والبيانات المالية وفقاً لقوانين حماية البيانات والآداب الطبية المعمول بها في جمهورية مصر العربية.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. عزل بيانات المرضى (Row Level Security)</h3>
            <p>تعتمد العيادة على نظام قواعد بيانات مشفر مع سياسات عزل صارمة (RLS). لا يمكن لأي مريض الاطلاع على ملف أو بيانات أو صور أشعة أي مريض آخر، ويقتصر الوصول على المريض نفسه والطبيب المشرف المعالج د. عمر سالم وفريق العمل المصرح له.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">3. البيانات التي نجمعها</h3>
            <p>نجمع البيانات الأساسية الضرورية لتقديم الرعاية الصحية، وتشمل: الاسم الرباعي، رقم الهاتف، التاريخ المرضي، الحساسية الدوائية، مخطط الأسنان التشريحي، وسجلات الدفعات المالية.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">4. أمن البيانات والتخزين السحابي</h3>
            <p>تُحفظ صور الأشعة والملفات الطبية في مستودعات سحابية مشفرة بتشفير AES-256، ولا يتم مشاركة أي بيانات مع أي جهة خارجية أو إعلانية تحت أي ظرف.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">5. التواصل والاستفسارات</h3>
            <p>لأي استفسار بشأن خصوصية بياناتك الطبية، يمكنك التواصل مباشرة مع إدارة العيادة هاتفياً على <span className="font-mono text-gold-300">01091313305</span> أو عبر واتساب العيادة <span className="font-mono text-emerald-400">01034366020</span>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>عيادة Delight Smile للأسنان — د/ عمر سالم (فرع جليم، الإسكندرية)</p>
      </footer>
    </div>
  );
}
