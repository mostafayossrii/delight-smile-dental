'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'dentist' | 'receptionist' | 'patient';
  email?: string;
  phone?: string;
  dentistId?: string;
}

interface DelightSmileAuthProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const PROCEDURES = [
  { name: 'Composite Restoration (حشو كومبوزيت تجميلي)', price: 1200 },
  { name: 'Composite veneer (فينير كومبوزيت تجميلي)', price: 2500 },
  { name: 'Endodontic treatment (علاج جذور وعصب)', price: 4200 },
  { name: 'Pulpotomy (بتر لب السن)', price: 1800 },
  { name: 'Pulpectomy (استئصال لب السن)', price: 1800 },
  { name: 'Extraction (خلع أسنان وجراحة فم)', price: 950 },
  { name: 'Crown restoration (تركيبات التيجان والجسور)', price: 3800 },
  { name: 'Veneers (عدسات الفينير الخزفي E-Max)', price: 6500 },
  { name: 'Complete denture (طقم كامل للأسنان)', price: 8000 },
  { name: 'Single denture (طقم أحادي للفك)', price: 4500 },
  { name: 'Partial denture (طقم جزئي)', price: 3500 },
  { name: 'Scaling (تنظيف جير وتلميع بالموجات)', price: 800 },
  { name: 'Whitening (تبييض الأسنان بالليزر)', price: 3500 }
];

export const DelightSmileAuth: React.FC<DelightSmileAuthProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'patient'>('staff');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Patient Booking State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientProcedure, setPatientProcedure] = useState(PROCEDURES[0].name);
  const [bookingDate, setBookingDate] = useState('2026-10-31');
  const [bookingTime, setBookingTime] = useState('01:00 PM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Staff Login Handler
  const handleStaffLogin = async (e: React.FormEvent) => {
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
        setErrorMsg(data.message || 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.');
        setIsLoading(false);
        return;
      }

      const session = data.session;
      const user: AuthUser = {
        id: session.userId || 'usr-dentist-1',
        name: session.fullName || 'د. عمر سالم',
        role: session.role || 'dentist',
        dentistId: session.dentistId || 'dent-1',
        email: session.email
      };
      onLoginSuccess(user);
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  // Patient Booking Submit
  const handlePatientBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMsg('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }

    // Verify Friday rule
    const dateObj = new Date(bookingDate);
    if (dateObj.getUTCDay() === 5) { // 5 is Friday
      setErrorMsg('تنبيه: يوم الجمعة عطلة أسبوعية رسمية لعيادة د. عمر سالم. يرجى اختيار يوم آخر.');
      return;
    }

    setBookingSuccess(true);
    // After 2 seconds, enter patient portal
    setTimeout(() => {
      onLoginSuccess({
        id: 'P-' + Math.floor(1000 + Math.random() * 9000),
        name: patientName.trim(),
        role: 'patient',
        phone: patientPhone.trim()
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950 font-sans">
      {/* Top Header Banner */}
      <header className="border-b border-gold-500/20 bg-obsidian-900/80 backdrop-blur py-3 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold-500/40 shadow-lg relative bg-obsidian-950 flex items-center justify-center">
            <Image src="/logo.jpg" alt="Delight Smile Logo" width={40} height={40} className="object-cover" priority />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold gold-text-gradient tracking-wide">Delight Smile</h1>
            <p className="text-[11px] text-slate-400 font-semibold">د/ عمر سالم • جميع التخصصات</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gold-300 bg-gold-500/10 px-3 py-1.5 rounded-xl border border-gold-500/25">
            <i className="fa-solid fa-location-dot text-gold-400"></i>
            <span>جليم - برج جليم هايتس - الإسكندرية</span>
          </div>
          <a
            href="https://wa.me/201034366020"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i>
            <span className="font-mono">01034366020</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-obsidian-900/90 border border-gold-500/30 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold glow at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>

          {/* Clinic Brand Presentation */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-gold-500/50 shadow-2xl bg-obsidian-950 p-1 flex items-center justify-center">
              <Image src="/logo.jpg" alt="Delight Smile" width={80} height={80} className="object-cover rounded-xl" priority />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black gold-text-gradient">عيادة Delight Smile</h2>
            <p className="text-sm text-gold-200 font-bold">د/ عمر سالم — جميع تخصصات طب وجراحة وتجميل الأسنان</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              الأسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول
            </p>
          </div>

          {/* Official Schedule Card */}
          <div className="bg-obsidian-950/80 border border-gold-500/20 rounded-2xl p-3 mb-6 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-gold-300 border-b border-gold-500/15 pb-1.5">
              <span><i className="fa-regular fa-clock ml-1.5 text-gold-400"></i>مواعيد العمل الرسمية بالعيادة:</span>
              <span className="text-[10px] bg-gold-500/15 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30">فرع جليم فقط</span>
            </div>
            <div className="flex justify-between">
              <span>السبت • الإثنين • الأربعاء:</span>
              <span className="font-bold text-white font-mono">12:00 ظهراً - 06:00 مساءً</span>
            </div>
            <div className="flex justify-between">
              <span>الأحد • الثلاثاء • الخميس:</span>
              <span className="font-bold text-white font-mono">04:00 عصراً - 10:00 مساءً</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>الجمعة:</span>
              <span className="font-bold">عطلة أسبوعية رسمية (مغلق)</span>
            </div>
          </div>

          {/* Tabs Selector: Staff vs Patient */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-obsidian-950 rounded-2xl border border-gold-500/20 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'staff'
                  ? 'gold-gradient text-obsidian-950 shadow-lg font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-user-doctor"></i>
              <span>دخول الطبيب والإدارة</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'patient'
                  ? 'gold-gradient text-obsidian-950 shadow-lg font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-calendar-plus"></i>
              <span>حجز موعد جديد للمريض</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Staff / Doctor Login */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المستخدم أو البريد الإلكتروني:
                </label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400/60 text-sm"></i>
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  كلمة المرور:
                </label>
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
                className="w-full py-3 rounded-xl gold-gradient text-obsidian-950 font-black text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>جاري التحقق وتسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>تسجيل الدخول للنظام السحابي</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Patient Booking & Portal */}
          {activeTab === 'patient' && (
            <div>
              {bookingSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/40">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">تم استلام طلب الموعد بنجاح!</h3>
                  <p className="text-xs text-emerald-200">
                    أهلاً بك يا {patientName}. تم تأكيد موعدك لدى د. عمر سالم في فرع جليم.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    جاري توجيهك الآن إلى بوابة ملفك الطبي المعتمد...
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePatientBooking} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم المريض بالكامل:</label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="الاسم الثلاثي أو الرباعي"
                        className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (مصر):</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-gold-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الإجراء الطبي المطلوب:</label>
                    <select
                      value={patientProcedure}
                      onChange={(e) => setPatientProcedure(e.target.value)}
                      className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-gold-300 focus:outline-none focus:border-gold-400"
                    >
                      {PROCEDURES.map((p, idx) => (
                        <option key={idx} value={p.name}>
                          {p.name} — ({p.price.toLocaleString()} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ الموعد:</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">وقت الموعد:</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-obsidian-950 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="12:00 PM">12:00 PM (ظهراً)</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl gold-gradient text-obsidian-950 font-black text-xs sm:text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <i className="fa-solid fa-calendar-check"></i>
                    <span>تأكيد حجز الموعد والدخول للملف</span>
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-400">
                    <span>أو الحجز المباشر:</span>
                    <a
                      href={`https://wa.me/201034366020?text=${encodeURIComponent('السلام عليكم دكتور عمر سالم، أود حجز موعد في عيادة Delight Smile بجليم')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <i className="fa-brands fa-whatsapp"></i> واتساب العيادة
                    </a>
                    <a
                      href="tel:01091313305"
                      className="text-gold-300 hover:underline flex items-center gap-1 font-bold"
                    >
                      <i className="fa-solid fa-phone"></i> اتصال هاتفياً
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-500/15 py-3 px-4 text-center text-xs text-slate-500">
        <p className="font-serif italic text-gold-400/80 mb-0.5">&ldquo;Your Delight is on your Smile&rdquo;</p>
        <p>جميع الحقوق محفوظة © 2026 لعيادة Delight Smile — د/ عمر سالم (الإسكندرية - جليم)</p>
      </footer>
    </div>
  );
};
export default DelightSmileAuth;
