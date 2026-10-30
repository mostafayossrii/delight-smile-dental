'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base font-black gold-text-gradient">Delight Smile</h1>
            <p className="text-[11px] text-slate-400">استعادة كلمة المرور</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-gold-300 hover:underline font-bold">
          العودة للرئيسية
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-obsidian-900/90 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black gold-text-gradient">نسيت كلمة المرور؟</h2>
            <p className="text-xs text-slate-400">
              أدخل بريدك الإلكتروني أو رقم هاتفك المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور فوراً.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-3">
              <i className="fa-solid fa-envelope-circle-check text-emerald-400 text-3xl"></i>
              <h3 className="text-base font-bold text-white">تم إرسال رابط الاستعادة!</h3>
              <p className="text-xs text-emerald-200">
                إذا كان الحساب مسجلاً لدينا، ستتلقى رابطاً آمناً لإعادة تعيين كلمة المرور خلال دقائق.
              </p>
              <div className="pt-2">
                <Link href="/patient/login" className="text-xs text-gold-300 underline font-bold">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">البريد الإلكتروني أو رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com أو 010XXXXXXXX"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl gold-gradient text-obsidian-950 font-black text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>إرسال رابط إعادة التعيين</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-400">تذكرت كلمة المرور؟ </span>
                <Link href="/patient/login" className="text-gold-300 font-bold hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>عيادة Delight Smile للأسنان — د/ عمر سالم</p>
      </footer>
    </div>
  );
}
