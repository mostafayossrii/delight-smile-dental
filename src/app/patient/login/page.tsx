'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg('بيانات الدخول غير صحيحة. يرجى التحقق من رقم الهاتف أو البريد وكلمة المرور.');
        setIsLoading(false);
        return;
      }

      // Set cookie for route protection
      document.cookie = `delight_smile_token=${data.session?.token || 'patient_session'}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('delight_smile_session', JSON.stringify({
        id: data.session?.userId || 'patient-user',
        name: data.session?.fullName || 'مريض العيادة',
        role: 'patient',
        email: data.session?.email
      }));

      router.push('/portal');
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-[11px] text-slate-400">بوابة المريض (فرع جليم)</p>
          </div>
        </Link>
        <Link href="/patient/register" className="text-xs text-gold-300 hover:underline font-bold">
          مريض جديد؟ إنشاء حساب
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-obsidian-900/90 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-gold-500/40 bg-obsidian-950 p-1 flex items-center justify-center">
              <Image src="/logo.jpg" alt="Delight Smile" width={64} height={64} className="object-cover rounded-xl" priority />
            </div>
            <h2 className="text-2xl font-black gold-text-gradient">تسجيل دخول المريض</h2>
            <p className="text-xs text-slate-400">أدخل رقم الهاتف أو البريد الإلكتروني وكلمة المرور</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-400"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">رقم الهاتف أو البريد الإلكتروني:</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400/60 text-sm"></i>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01012345678 أو email@example.com"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 font-bold">كلمة المرور:</label>
                <Link href="/forgot-password" className="text-[11px] text-gold-300 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400/60 text-sm"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl gold-gradient text-obsidian-950 font-black text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <span>دخول إلى بوابة ملف المريض</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-gold-500/15 text-center text-xs space-y-2">
            <p className="text-slate-400">
              ليس لديك حساب مريض بعد؟{' '}
              <Link href="/patient/register" className="text-gold-300 font-bold hover:underline">
                إنشاء حساب مريض الآن
              </Link>
            </p>
            <p className="text-slate-500 text-[11px]">
              هل أنت من الطاقم الطبي أو الإدارة؟{' '}
              <Link href="/staff/login" className="text-slate-400 hover:text-gold-300 underline">
                دخول الكادر الطبي
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>جميع الحقوق محفوظة © 2026 عيادة Delight Smile — د/ عمر سالم</p>
      </footer>
    </div>
  );
}
