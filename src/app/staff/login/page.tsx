'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const completeLogin = (sessionData: { userId: string; fullName: string; role: string; token: string; email?: string }) => {
    document.cookie = `delight_smile_token=${sessionData.token}; path=/; max-age=86400; SameSite=Lax`;
    localStorage.setItem('delight_smile_session', JSON.stringify({
      id: sessionData.userId,
      name: sessionData.fullName,
      role: sessionData.role,
      email: sessionData.email
    }));
    router.push(redirectTarget);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setErrorMsg(data.message || 'بيانات الدخول غير صحيحة. يرجى مراجعة إدارة العيادة.');
        setIsLoading(false);
        return;
      }

      completeLogin({
        userId: data.session.userId,
        fullName: data.session.fullName,
        role: data.session.role,
        token: data.session.token,
        email: data.session.email
      });
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بنظام العيادة. يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block text-slate-300 font-bold mb-1.5">اسم المستخدم أو البريد المهني:</label>
        <div className="relative">
          <i className="fa-solid fa-user-doctor absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400/60 text-sm"></i>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="اسم المستخدم، البريد، أو رقم الهاتف"
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

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation text-rose-400"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl gold-gradient text-obsidian-950 font-black text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <span>جاري التحقق من الصلاحيات...</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-right-to-bracket"></i>
            <span>تسجيل الدخول للنظام السحابي</span>
          </>
        )}
      </button>

      <div className="pt-2 text-center text-[11px] text-slate-500">
        <i className="fa-solid fa-shield-halved ml-1 text-gold-400/70"></i>
        <span>نظام تسجيل دخول مشفر وآمن مخصص لأطباء وإدارة عيادة Delight Smile</span>
      </div>
    </form>
  );
}

export default function StaffLoginPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base font-black gold-text-gradient">Delight Smile</h1>
            <p className="text-[11px] text-slate-400">نظام الإدارة السحابي • د/ عمر سالم</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-gold-300 hover:underline font-bold">
          العودة للرئيسية
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-obsidian-900/90 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-gold-500/40 bg-obsidian-950 p-1 flex items-center justify-center">
              <Image src="/logo.jpg" alt="Delight Smile" width={64} height={64} className="object-cover rounded-xl" priority />
            </div>
            <h2 className="text-2xl font-black gold-text-gradient">تسجيل دخول الكادر الطبي</h2>
            <p className="text-xs text-slate-400">لوحة التحكم السحابية المعتمدة لعيادة Delight Smile (فرع جليم)</p>
          </div>

          <Suspense fallback={<div className="text-center p-6 text-gold-400 text-xs">جاري تحميل واجهة الدخول...</div>}>
            <StaffLoginForm />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>عيادة Delight Smile للأسنان — د/ عمر سالم (الإسكندرية - جليم - برج جليم هايتس)</p>
      </footer>
    </div>
  );
}
