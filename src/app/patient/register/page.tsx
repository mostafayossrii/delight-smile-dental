'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredLanguage: 'ar',
    acceptTerms: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('كلمات المرور غير متطابقة.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMsg('يرجى الموافقة على سياسة الخصوصية والشروط والأحكام للمتابعة.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          emergencyContactName: formData.emergencyContactName.trim(),
          emergencyContactPhone: formData.emergencyContactPhone.trim(),
          preferredBranch: 'عيادة Delight Smile للأسنان - فرع جليم'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'تعذر إنشاء الحساب. قد يكون البريد الإلكتروني أو الهاتف مسجلاً مسبقاً.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('تم إنشاء حساب المريض بنجاح! جاري تحويلك لتسجيل الدخول...');
      setTimeout(() => {
        router.push('/patient/login?registered=true');
      }, 1500);
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      {/* Header */}
      <header className="border-b border-gold-500/20 bg-obsidian-900/90 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base font-black gold-text-gradient">Delight Smile</h1>
            <p className="text-[11px] text-slate-400">د/ عمر سالم (فرع جليم)</p>
          </div>
        </Link>
        <Link href="/patient/login" className="text-xs text-gold-300 hover:underline font-bold">
          لديك حساب بالفعل؟ تسجيل الدخول
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-obsidian-900/90 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-black gold-text-gradient">إنشاء حساب مريض جديد</h2>
            <p className="text-xs text-slate-400">سجل بياناتك للوصول إلى مواعيدك، وخطط علاجك، وسجلات أسنانك بأمان تام</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-400 text-sm"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم بالكامل (رباعي):</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="محمد أحمد إبراهيم علي"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف المحمول (مصر):</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Email & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">تاريخ الميلاد:</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة المرور (8 أحرف على الأقل):</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">تأكيد كلمة المرور:</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم جهة اتصال الطوارئ (اختياري):</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="الأب أو الزوج/الزوجة"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">هاتف الطوارئ (اختياري):</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer text-slate-300 leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-0.5 rounded text-gold-500 focus:ring-gold-400"
                />
                <span>
                  أوافق على{' '}
                  <Link href="/privacy" target="_blank" className="text-gold-300 underline font-bold">
                    سياسة الخصوصية
                  </Link>{' '}
                  و{' '}
                  <Link href="/terms" target="_blank" className="text-gold-300 underline font-bold">
                    الشروط والأحكام
                  </Link>{' '}
                  الخاصة بعيادة Delight Smile للأسنان.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl gold-gradient text-obsidian-950 font-black text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>جاري تسجيل الحساب والتحقق...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-check"></i>
                  <span>إنشاء الحساب وتأكيد التسجيل</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p>جميع الحقوق محفوظة © 2026 عيادة Delight Smile للأسنان — د/ عمر سالم (فرع جليم، الإسكندرية)</p>
      </footer>
    </div>
  );
}
