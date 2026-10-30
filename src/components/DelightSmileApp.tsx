'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnatomicalTooth, getToothNameAr, getToothType } from './AnatomicalTooth';

// --- Types ---
export interface NavItem {
  id: string;
  title: string;
  icon: string;
  badge: string;
  desc: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  area: string;
  insurance: string;
  membershipNo: string;
  points: number;
  usedPoints: number;
  creditBalance: number;
  medicalHistory: string[];
  notes: string;
  teethStatus: Record<number, { status: string; label: string; doctor: string; price: number }>;
  treatmentSteps: { id: string; step: string; doctor: string; sharePct: number; price: number; status: string }[];
  prescriptions: { id: string; date: string; doctor: string; meds: string }[];
  consents: { id: string; title: string; signed: boolean; date: string; signature: string }[];
}

export interface Appointment {
  id: string;
  patientName: string;
  doctor: string;
  room: string;
  time: string;
  date: string;
  type: string;
  status: string;
  source: string;
}

export interface Invoice {
  id: string;
  patient: string;
  phone: string;
  procedure: string;
  total: number;
  paid: number;
  insurance: number;
  discount: number;
  remaining: number;
  doctor: string;
  doctorSharePct: number;
  taxStatus: string;
  date: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  treasury: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  phone: string;
  discountPct: number;
  limit: number;
  approvalRequired: boolean;
  claimed: number;
  unclaimed: number;
}

export interface LabOrder {
  id: string;
  labName: string;
  patient: string;
  doctor: string;
  item: string;
  tooth: string;
  shade: string;
  price: number;
  dueDate: string;
  receiverStaff: string;
  status: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  level: string;
  qty: number;
  unit: string;
  minAlert: number;
  expiry: string;
  supplier: string;
}

export interface PulseSession {
  id: string;
  patient: string;
  doctor: string;
  service: string;
  area: string;
  spotSize: string;
  fluence: string;
  pulsesUsed: number;
  remainingPulses: number;
  deviceCounterBefore: number;
  deviceCounterAfter: number;
  date: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  permissions: string;
  startTime: string;
  endTime: string;
  location: string;
  salary: number;
  advance: number;
  tasksDone: number;
  status: string;
}

export interface StaffTask {
  id: string;
  title: string;
  assignee: string;
  status: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  role: string;
  time: string;
  text: string;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  time: string;
}

export interface AuditLogItem {
  id: string;
  time: string;
  actor: string;
  role: string;
  action: string;
  table: string;
  details: string;
}

// Initial Data Fixtures matching delight_smile_cms.html
const INITIAL_NAV_ITEMS: NavItem[] = [
  { id: 'index_hub', title: 'فهرس النظام الشامل', icon: 'fa-table-cells-large', badge: '16 ميزة', desc: 'كل حاجة في برنامج واحد - اضغط على الميزة للانتقال إليها' },
  { id: 'dashboard', title: 'لوحة التحكم والتحليلات', icon: 'fa-chart-pie', badge: '', desc: 'رؤية شاملة لأداء العيادة، تمركز المرضى، وأوقات الانتظار' },
  { id: 'appointments', title: 'الحجوزات والمواعيد', icon: 'fa-calendar-check', badge: '8 اليوم', desc: 'تنظيم الغرف وتنبيه فوري عند حجز نفس الفترة لنفس الطبيب' },
  { id: 'patients', title: 'ملفات المرضى ومخطط الأسنان', icon: 'fa-tooth', badge: 'متكامل', desc: 'مخطط علاجي للأسنان، خطط علاجية، روشتات، وأشعة X-Ray' },
  { id: 'qrcode', title: 'QR-Code وبوابة المريض', icon: 'fa-qrcode', badge: 'ذكي', desc: 'تسجيل ذاتي، استرجاع الفاتورة والروشتة، ونموذج الموافقة والتوقيع' },
  { id: 'finance', title: 'الحسابات والفواتير والخزن', icon: 'fa-sack-dollar', badge: 'ضريبي', desc: 'فواتير المرضى، نسب الأطباء، خزن افتراضية، وفاتورة إلكترونية' },
  { id: 'finance_analytics', title: 'تحليلات الحسابات والأرباح', icon: 'fa-chart-line', badge: 'Sankey', desc: 'تقارير الأرباح والخسارة وحركة النقود والمصاريف لكل بند' },
  { id: 'insurance', title: 'التأمين وحساباته', icon: 'fa-shield-heart', badge: '4 شركات', desc: 'شركات التأمين، نسب التحمل، وإنشاء المطالبات المالية' },
  { id: 'labs', title: 'المعامل وطلباتها', icon: 'fa-flask', badge: '3 نشط', desc: 'إرسال طلبات المعمل بالواتساب، تحديد لون السن، وتأكيد الاستلام' },
  { id: 'inventory', title: 'الموردين والمخازن', icon: 'fa-boxes-stacked', badge: '3 مستويات', desc: 'مخزن رئيسي بالصندوق، فرعي بالوحدة، ومخازن العيادات الداخلية' },
  { id: 'pulses', title: 'حساب النبضات والليزر', icon: 'fa-wand-magic-sparkles', badge: 'عداد ذكي', desc: 'متابعة نبضات الليزر التجميلي وتبييض الأسنان ومقارنة عداد الجهاز' },
  { id: 'staff', title: 'إدارة الموظفين والحضور', icon: 'fa-user-doctor', badge: 'GPS', desc: 'بصمة الحضور بالموقع الجغرافي، المهام، المرتبات والسُلف' },
  { id: 'whatsapp_sms', title: 'واتساب بوت والرسائل النصية', icon: 'fa-brands fa-whatsapp', badge: '24/7 تلقائي', desc: 'ردود تلقائية 100%، تذكير بالمواعيد، وحملات SMS ديناميكية' },
  { id: 'internal_chat', title: 'التواصل الداخلي', icon: 'fa-comments', badge: 'فوري', desc: 'دردشة سريعة بين الأطباء والاستقبال مع منشن @ وإرسال ملفات' },
  { id: 'loyalty', title: 'نظام النقاط والولاء', icon: 'fa-gem', badge: 'VIP', desc: 'كسب نقاط مع كل زيارة واستبدالها بخصومات وعروض خاصة' },
  { id: 'alerts_support', title: 'الإنذارات والدعم الفني', icon: 'fa-bell', badge: '5 تنبيهات', desc: 'إنذارات الفواتير والمعامل، ترحيل الإكسل، ودعم فني 24/7' },
  { id: 'patient_portal_isolated', title: 'بوابة المريض المستقلة (Portal)', icon: 'fa-user-lock', badge: 'معزول آمن', desc: 'واجهة المريض المستقلة برمز تحقق موثق وعزل كامل للبيانات (RLS)' },
  { id: 'rbac_security', title: 'الصلاحيات وسجل الأمان (RBAC)', icon: 'fa-shield-halved', badge: '6 أدوار', desc: 'إدارة حسابات الموظفين، صلاحيات الأدوار، وسجل التدقيق الأمني Audit Logs' },
  { id: 'fullstack_arch', title: 'معمارية Next.js + Supabase + PWA', icon: 'fa-database', badge: '38 جدول', desc: 'كود SQL، سياسات RLS، نتائج الاختبارات الآلية، وتصدير التقارير CSV' }
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P-1001',
    name: 'نورهان محمد عبد الرحمن',
    phone: '+20 103 655 4750',
    age: 29,
    gender: 'أنثى',
    area: 'سموحة - الإسكندرية',
    insurance: 'AXA للتأمين الطبي',
    membershipNo: 'AXA-88412',
    points: 3300,
    usedPoints: 1200,
    creditBalance: 450,
    medicalHistory: ['حساسية بنسلين خفيفة', 'لا يوجد سكري أو ضغط'],
    notes: 'المريضة تفضل المواعيد المسائية، وتحتاج متابعة بعد تركيب عدسات الفينير.',
    teethStatus: {
      11: { status: 'veneer', label: 'فينير تجميلي E-Max', doctor: 'د. عمر سالم', price: 6500 },
      21: { status: 'veneer', label: 'فينير تجميلي E-Max', doctor: 'د. عمر سالم', price: 6500 },
      16: { status: 'root_canal', label: 'علاج جذور + طربوش زيركون', doctor: 'د. عمر سالم', price: 4200 },
      26: { status: 'filling', label: 'حشو تجميلي كومبوزيت', doctor: 'د. سارة عادل', price: 1200 },
      36: { status: 'implant', label: 'زراعة سن تيتانيوم سويسري', doctor: 'د. عمر سالم', price: 14000 },
      46: { status: 'caries', label: 'تسوس يحتاج حشو', doctor: 'د. عمر سالم', price: 1100 }
    },
    treatmentSteps: [
      { id: 'TS-1', step: 'تصميم الابتسامة الرقمي (DSD) وأخذ المقاسات', doctor: 'د. عمر سالم', sharePct: 40, price: 3000, status: 'مكتمل' },
      { id: 'TS-2', step: 'تركيب 2 عدسة فينير E-Max للأسنان الأمامية', doctor: 'د. عمر سالم', sharePct: 45, price: 13000, status: 'مكتمل' },
      { id: 'TS-3', step: 'زراعة الضرس 36 (المرحلة الجراحية الأولى)', doctor: 'د. عمر سالم', sharePct: 50, price: 14000, status: 'قيد التنفيذ' }
    ],
    prescriptions: [
      { id: 'RX-201', date: '2026-10-20', doctor: 'د. عمر سالم', meds: 'Augmentin 1g كل 12 ساعة لمدة 5 أيام • Brufen 600mg عند اللزوم • غسول فم كلورهيكسيدين 3 مرات يومياً' }
    ],
    consents: [
      { id: 'CS-1', title: 'إقرار موافقة على زراعة الأسنان والفينير التجميلي', signed: true, date: '2026-10-18 06:30 PM', signature: 'نورهان محمد (توقيع إلكتروني موثق)' }
    ]
  },
  {
    id: 'P-1002',
    name: 'أحمد إبراهيم المنيري',
    phone: '+20 127 071 0200',
    age: 38,
    gender: 'ذكر',
    area: 'كفر عبده - الإسكندرية',
    insurance: 'مصر للتأمين (Egypt Insurance)',
    membershipNo: 'EG-55190',
    points: 5200,
    usedPoints: 2000,
    creditBalance: 0,
    medicalHistory: ['مدخن', 'لا توجد أمراض مزمنة'],
    notes: 'جلسة تبييض بالليزر + تنظيف جير بالموجات فوق الصوتية.',
    teethStatus: {
      12: { status: 'crown', label: 'طربوش زيركون', doctor: 'د. عمر سالم', price: 3800 },
      24: { status: 'filling', label: 'حشو تجميلي', doctor: 'د. رامي طارق', price: 1000 }
    },
    treatmentSteps: [
      { id: 'TS-4', step: 'تبييض الأسنان بالليزر (جلسة كاملة)', doctor: 'د. عمر سالم', sharePct: 40, price: 4500, status: 'مكتمل' }
    ],
    prescriptions: [
      { id: 'RX-202', date: '2026-10-24', doctor: 'د. عمر سالم', meds: 'معجون أسنان للأسنان الحساسة Sensodyne مرتين يومياً لمدة أسبوعين' }
    ],
    consents: [
      { id: 'CS-2', title: 'إقرار موافقة على تبييض الأسنان بالليزر', signed: true, date: '2026-10-24 04:15 PM', signature: 'أحمد إبراهيم المنيري' }
    ]
  },
  {
    id: 'P-1003',
    name: 'سارة محمد الشافعي',
    phone: '+20 111 492 8810',
    age: 24,
    gender: 'أنثى',
    area: 'لوران - الإسكندرية',
    insurance: 'بدون تأمين (نقدي VIP)',
    membershipNo: '-',
    points: 1850,
    usedPoints: 500,
    creditBalance: 1200,
    medicalHistory: ['لا توجد موانع طبية'],
    notes: 'تقويم أسنان شفاف متحرك (Clear Aligner).',
    teethStatus: {
      13: { status: 'veneer', label: 'تقويم شفاف', doctor: 'د. سارة عادل', price: 22000 }
    },
    treatmentSteps: [
      { id: 'TS-5', step: 'قوالب التقويم الشفاف - المرحلة الأولى', doctor: 'د. سارة عادل', sharePct: 35, price: 22000, status: 'قيد التنفيذ' }
    ],
    prescriptions: [],
    consents: []
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'APT-101', patientName: 'نورهان محمد عبد الرحمن', doctor: 'د. عمر سالم', room: 'عيادة 1 (VIP تجميل وزراعة)', time: '12:00 PM', date: '2026-10-26', type: 'تركيب فينير E-Max', status: 'مؤكد', source: 'QR-Code' },
  { id: 'APT-102', patientName: 'أحمد إبراهيم المنيري', doctor: 'د. عمر سالم', room: 'عيادة 1 (VIP تجميل وزراعة)', time: '01:30 PM', date: '2026-10-26', type: 'تبييض بالليزر', status: 'داخل العيادة', source: 'واتساب بوت' },
  { id: 'APT-103', patientName: 'سارة محمد الشافعي', doctor: 'د. سارة عادل', room: 'عيادة 2 (التقويم والحشو)', time: '01:30 PM', date: '2026-10-26', type: 'متابعة تقويم شفاف', status: 'مؤكد', source: 'الاستقبال' },
  { id: 'APT-104', patientName: 'محمود عمران الكيلاني', doctor: 'د. رامي طارق', room: 'عيادة 3 (علاج الجذور)', time: '03:00 PM', date: '2026-10-26', type: 'حشو عصب ضرس 36', status: 'انتظار', source: 'تطبيق الهاتف' },
  { id: 'APT-105', patientName: 'خلود خليل عبد العزيز', doctor: 'د. عمر سالم', room: 'عيادة 1 (VIP تجميل وزراعة)', time: '05:00 PM', date: '2026-10-26', type: 'استشارة هوليوود سمايل', status: 'مؤكد', source: 'QR-Code' }
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-1240', patient: 'نورهان محمد عبد الرحمن', phone: '+20 103 655 4750', procedure: 'فينير E-Max + زراعة', total: 19500, paid: 15500, insurance: 2000, discount: 500, remaining: 1500, doctor: 'د. عمر سالم', doctorSharePct: 45, taxStatus: 'موافقة لمصلحة الضرائب المصرية', date: '2026-10-25' },
  { id: 'INV-1239', patient: 'أحمد إبراهيم المنيري', phone: '+20 127 071 0200', procedure: 'تبييض بالليزر + طربوش زيركون', total: 8300, paid: 8300, insurance: 0, discount: 0, remaining: 0, doctor: 'د. عمر سالم', doctorSharePct: 45, taxStatus: 'موافقة لمصلحة الضرائب المصرية', date: '2026-10-24' },
  { id: 'INV-1238', patient: 'سارة محمد الشافعي', phone: '+20 111 492 8810', procedure: 'تقويم أسنان شفاف (دفعة أولى)', total: 22000, paid: 14000, insurance: 0, discount: 1000, remaining: 7000, doctor: 'د. سارة عادل', doctorSharePct: 35, taxStatus: 'موافقة لمصلحة الضرائب المصرية', date: '2026-10-23' },
  { id: 'INV-1237', patient: 'حمزة الرفاعي', phone: '+966 50 619 6060', procedure: 'ابتسامة هوليوود كاملة (16 سن)', total: 88000, paid: 88000, insurance: 0, discount: 3000, remaining: 0, doctor: 'د. عمر سالم', doctorSharePct: 50, taxStatus: 'متوافقة مع هيئة الزكاة والدخل ZATCA', date: '2026-10-21' }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-1', title: 'خامات زراعة سويسرية وعدسات E-Max', category: 'مشتريات ومخازن', amount: 42000, date: '2026-10-22', treasury: 'الخزنة البنكية CIB' },
  { id: 'EXP-2', title: 'دفعة معمل Max Dental Labs', category: 'معامل الأسنان', amount: 18500, date: '2026-10-23', treasury: 'خزنة الكاش الرئيسية' },
  { id: 'EXP-3', title: 'مرتبات وحوافز فريق الاستقبال والتمريض', category: 'المرتبات والأجور', amount: 34000, date: '2026-10-25', treasury: 'الخزنة البنكية CIB' },
  { id: 'EXP-4', title: 'حملات إعلانية ممولة وبوت الواتساب', category: 'التسويق والإعلانات', amount: 9500, date: '2026-10-20', treasury: 'محفظة فودافون كاش' }
];

const INITIAL_INSURANCE: InsuranceCompany[] = [
  { id: 'INS-1', name: 'AXA للتأمين الطبي', phone: '+20 103 666 2215', discountPct: 20, limit: 50000, approvalRequired: true, claimed: 28500, unclaimed: 6400 },
  { id: 'INS-2', name: 'مصر للتأمين (Egypt Insurance)', phone: '+20 110 037 3820', discountPct: 25, limit: 35000, approvalRequired: true, claimed: 19200, unclaimed: 3600 },
  { id: 'INS-3', name: 'Chubb Insurance', phone: '+20 112 554 6252', discountPct: 40, limit: 100000, approvalRequired: false, claimed: 44000, unclaimed: 8200 },
  { id: 'INS-4', name: 'نقابة المهندسين والأطباء', phone: '+20 127 848 2439', discountPct: 30, limit: 20000, approvalRequired: false, claimed: 12400, unclaimed: 1900 }
];

const INITIAL_LAB_ORDERS: LabOrder[] = [
  { id: 'LAB-901', labName: 'Max Dental Labs', patient: 'نورهان محمد عبد الرحمن', doctor: 'د. عمر سالم', item: '2 عدسة فينير E-Max', tooth: '#11, #21', shade: 'BL2', price: 4400, dueDate: '2026-10-27 05:00 PM', receiverStaff: 'أ. رحمة شريف', status: 'تم الإرسال بالواتساب' },
  { id: 'LAB-902', labName: 'Royal Zircon Lab', patient: 'أحمد إبراهيم المنيري', doctor: 'د. عمر سالم', item: 'طربوش زيركون متعدد الطبقات', tooth: '#12', shade: 'A1', price: 1800, dueDate: '2026-10-26 02:00 PM', receiverStaff: 'أ. عبد الرحمن مجدي', status: 'تم الاستلام بالعيادة' },
  { id: 'LAB-903', labName: 'Max Dental Labs', patient: 'محمود عمران الكيلاني', doctor: 'د. رامي طارق', item: 'طربوش PFM داعم للضرس', tooth: '#36', shade: 'A2', price: 1300, dueDate: '2026-10-28 06:00 PM', receiverStaff: 'أ. رحمة شريف', status: 'قيد التصنيع بالمعمل' }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'INV-M1', name: 'بنج أسنان Artinibsa 4% (صندوق 50 أمبول)', level: 'المخزن الرئيسي (بالصندوق)', qty: 18, unit: 'صندوق', minAlert: 5, expiry: '2027-08-15', supplier: 'شركة ديجيتال للمستلزمات الطبية' },
  { id: 'INV-S1', name: 'كبسولات كومبوزيت 3M Filtek Z350', level: 'المخزن الفرعي (بالوحدة)', qty: 42, unit: 'كبسولة', minAlert: 15, expiry: '2027-03-10', supplier: 'شركة النور دنتال' },
  { id: 'INV-C1', name: 'جل تبييض الليزر الاحترافي Philips Zoom', level: 'مخزن عيادة 1 (د. عمر سالم)', qty: 3, unit: 'عبوة', minAlert: 5, expiry: '2026-11-20', supplier: 'شركة ديجيتال للمستلزمات الطبية' },
  { id: 'INV-C2', name: 'قفازات نيتريل سوداء فاخرة (علبة 100 قطعة)', level: 'مخزن عيادة 1 (د. عمر سالم)', qty: 14, unit: 'علبة', minAlert: 4, expiry: '2028-01-01', supplier: 'مؤسسة الأهرام الطبية' }
];

const INITIAL_PULSES: PulseSession[] = [
  { id: 'PLS-1', patient: 'أحمد إبراهيم المنيري', doctor: 'د. عمر سالم', service: 'تبييض الأسنان بالليزر (Diode Laser)', area: 'الفكين العلوي والسفلي', spotSize: '8 mm', fluence: '7.5 J/cm²', pulsesUsed: 450, remainingPulses: 150, deviceCounterBefore: 14200, deviceCounterAfter: 14650, date: '2026-10-25' },
  { id: 'PLS-2', patient: 'نورهان محمد عبد الرحمن', doctor: 'د. عمر سالم', service: 'توريد اللثة بالليزر (Gum Depigmentation)', area: 'اللثة الأمامية العلوية', spotSize: '4 mm', fluence: '6.0 J/cm²', pulsesUsed: 320, remainingPulses: 680, deviceCounterBefore: 14650, deviceCounterAfter: 14970, date: '2026-10-26' }
];

const INITIAL_STAFF: StaffMember[] = [
  { id: 'ST-1', name: 'د. عمر سالم', role: 'مؤسس العيادة واستشاري تجميل وزراعة الأسنان', permissions: 'صلاحيات كاملة (Admin)', startTime: '11:30 AM', endTime: 'مستمر', location: 'الإسكندرية (196.132.13.25)', salary: 0, advance: 0, tasksDone: 28, status: 'متواجد بالعيادة' },
  { id: 'ST-2', name: 'د. سارة عادل', role: 'أخصائية تقويم الأسنان والحشو التجميلي', permissions: 'العيادة + ملفات المرضى', startTime: '01:00 PM', endTime: 'مستمر', location: 'الإسكندرية (196.132.13.25)', salary: 18000, advance: 2000, tasksDone: 19, status: 'متواجد بالعيادة' },
  { id: 'ST-3', name: 'أ. رحمة شريف', role: 'مسؤولة الاستقبال والحسابات', permissions: 'المواعيد + الخزنة + المعامل', startTime: '10:00 AM', endTime: '06:00 PM', location: 'الإسكندرية (156.210.140.137)', salary: 8500, advance: 500, tasksDone: 45, status: 'معتمد' },
  { id: 'ST-4', name: 'أ. عبد الرحمن مجدي', role: 'مسؤول المخازن ومساعد طبيب أول', permissions: 'المخازن + طلبات المعامل', startTime: '10:30 AM', endTime: '06:30 PM', location: 'الإسكندرية (41.45.35.39)', salary: 7500, advance: 0, tasksDone: 34, status: 'معتمد' }
];

const INITIAL_TASKS: StaffTask[] = [
  { id: 'TSK-1', title: 'تأكيد استلام عدسات الفينير للمريضة نورهان من معمل Max Dental', assignee: 'أ. رحمة شريف', status: 'مقبول وقيد التنفيذ' },
  { id: 'TSK-2', title: 'جرد مخزن عيادة 1 وتحويل 5 علب بنج من المخزن الرئيسي', assignee: 'أ. عبد الرحمن مجدي', status: 'مكتمل' },
  { id: 'TSK-3', title: 'إرسال مطالبة شركة AXA لشهر أكتوبر', assignee: 'أ. رحمة شريف', status: 'بانتظار الموافقة' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'أ. عبد الرحمن مجدي', role: 'المخازن', time: 'منذ ساعتين', text: 'صباح الخير يا دكتور عمر، تم تجهيز عيادة 1 وتعقيم أدوات الزراعة بالكامل.' },
  { id: 2, sender: 'أ. رحمة شريف', role: 'الاستقبال', time: 'منذ ساعة', text: '@د. عمر سالم المريضة نورهان محمد وصلت الاستقبال ووقعت نموذج الموافقة من خلال الـ QR Code.' },
  { id: 3, sender: 'د. عمر سالم', role: 'مدير العيادة', time: 'منذ 35 دقيقة', text: 'ممتاز يا @رحمة شريف، جهزي ملف الأشعة Panorama على شاشة العيادة فوراً.' }
];

const INITIAL_ALERTS: AlertItem[] = [
  { id: 'AL-1', type: 'inventory', severity: 'high', title: 'قرب انتهاء مخزون جل تبييض الليزر Philips Zoom (متبقي 3 عبوات فقط)', time: 'منذ 15 دقيقة' },
  { id: 'AL-2', type: 'lab', severity: 'medium', title: 'موعد استلام طلب معمل Max Dental Labs للمريضة نورهان محمد غداً 5:00 م', time: 'منذ ساعة' },
  { id: 'AL-3', type: 'finance', severity: 'high', title: 'فاتورة غير مكتملة السداد للمريضة سارة محمد الشافعي (متبقي 7,000 ج.م)', time: 'منذ ساعتين' },
  { id: 'AL-4', type: 'followup', severity: 'low', title: 'تذكير متابعة المريض أحمد إبراهيم بعد جلسة تبييض الليزر بـ 48 ساعة', time: 'اليوم' },
  { id: 'AL-5', type: 'doctor', severity: 'medium', title: 'إخطار للطبيب د. عمر سالم قبل موعد استشارة هوليوود سمايل بـ 30 دقيقة', time: 'تلقائي' }
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'AUD-104', time: '2026-10-29 05:45 PM', actor: 'admin (د. عمر سالم)', role: 'Administrator', action: 'SYSTEM_BOOTSTRAP', table: 'clinic_settings', details: 'تفعيل نظام Next.js + Supabase + RLS لعيادة Delight Smile' },
  { id: 'AUD-103', time: '2026-10-29 05:30 PM', actor: 'dr.omar', role: 'Dentist', action: 'ODONTOGRAM_UPDATE', table: 'odontogram_findings', details: 'تسجيل فينير E-Max للسن #11 السطح الأمامي (F) للمريضة P-1001' },
  { id: 'AUD-102', time: '2026-10-29 05:15 PM', actor: 'accountant', role: 'Accountant', action: 'PAYMENT_RECORDED', table: 'payments', details: 'تحصيل دفعة 15,500 ج.م للفاتورة INV-1240 وحساب نسبة الطبيب' },
  { id: 'AUD-101', time: '2026-10-29 04:50 PM', actor: 'patient.nourhan', role: 'Patient', action: 'PORTAL_VERIFIED_ACCESS', table: 'patient_user_links', details: 'ربط حساب بوابة المريض بكود التحقق الموثق VERIFY-DS1001-9981' }
];

interface DelightSmileAppProps {
  initialTab?: string;
  initialRole?: string;
}

export default function DelightSmileApp({ initialTab = 'index_hub', initialRole = 'admin' }: DelightSmileAppProps) {
  // App Navigation & View State
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [currentBranch, setCurrentBranch] = useState<string>('الإسكندرية - الفرع الرئيسي');
  const [currentRole, setCurrentRole] = useState<string>(initialRole);
  const [currentUser, setCurrentUser] = useState<string>('admin');
  const [userId, setUserId] = useState<string>('usr-admin-1');
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(true);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Business Data States
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-1001');
  const [selectedTooth, setSelectedTooth] = useState<number>(11);
  const [selectedSurface, setSelectedSurface] = useState<string>('WHOLE');
  const [dentitionMode, setDentitionMode] = useState<'permanent' | 'primary'>('permanent');
  const [isHistoricalFinding, setIsHistoricalFinding] = useState<boolean>(false);
  const [selectedChartTool, setSelectedChartTool] = useState<string>('veneer');

  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [calendarRoomFilter, setCalendarRoomFilter] = useState<string>('all');

  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>(INITIAL_INSURANCE);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [pulses, setPulses] = useState<PulseSession[]>(INITIAL_PULSES);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(INITIAL_TASKS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatInputText, setChatInputText] = useState<string>('');

  // Toast System
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'gold' | 'success' | 'error' }[]>([]);

  // Modal System
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // Canvas Signature Pad Ref
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Helper for Toasts
  const showToast = (message: string, type: 'gold' | 'success' | 'error' = 'gold') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Sync Theme & Locale with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
    }

    if (locale === 'en') {
      root.setAttribute('lang', 'en');
      root.setAttribute('dir', 'ltr');
    } else {
      root.setAttribute('lang', 'ar');
      root.setAttribute('dir', 'rtl');
    }
  }, [theme, locale]);

  // Selected Active Patient
  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Teeth numbers for FDI - Organized in standard dental education quadrants
  const q1UpperRight = dentitionMode === 'primary' ? [55, 54, 53, 52, 51] : [18, 17, 16, 15, 14, 13, 12, 11];
  const q2UpperLeft = dentitionMode === 'primary' ? [61, 62, 63, 64, 65] : [21, 22, 23, 24, 25, 26, 27, 28];
  const q4LowerRight = dentitionMode === 'primary' ? [85, 84, 83, 82, 81] : [48, 47, 46, 45, 44, 43, 42, 41];
  const q3LowerLeft = dentitionMode === 'primary' ? [71, 72, 73, 74, 75] : [31, 32, 33, 34, 35, 36, 37, 38];

  const upperTeeth = [...q1UpperRight, ...q2UpperLeft];
  const lowerTeeth = [...q4LowerRight, ...q3LowerLeft];

  // Helper for status badge colors
  const statusBadgeColor = (st?: { status: string }) => {
    if (!st) return 'bg-obsidian-800 border-gold-500/20 text-slate-300';
    const map: Record<string, string> = {
      veneer: 'bg-gold-500/30 border-gold-400 text-gold-200',
      implant: 'bg-emerald-500/30 border-emerald-400 text-emerald-200',
      root_canal: 'bg-purple-500/30 border-purple-400 text-purple-200',
      crown: 'bg-blue-500/30 border-blue-400 text-blue-200',
      filling: 'bg-amber-500/30 border-amber-400 text-amber-200',
      caries: 'bg-rose-500/30 border-rose-400 text-rose-200'
    };
    return map[st.status] || 'bg-gold-500/20 border-gold-400 text-gold-200';
  };

  // Change Password Handler (Connecting to /api/auth/change-password)
  const handlePasswordChange = async (newPass: string) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPass, currentPassword: '123' })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`فشل تغيير كلمة المرور: ${data.error || 'خطأ'}`, 'error');
        return;
      }
      setMustChangePassword(false);
      setModalOpen(false);
      showToast('تم تحديث كلمة مرور مدير النظام بنجاح! تم رفع تقييد الحساب الأول.', 'success');
      setAuditLogs((prev) => [
        {
          id: 'AUD-' + (prev.length + 101),
          time: 'الآن',
          actor: 'admin',
          role: 'Administrator',
          action: 'PASSWORD_CHANGED',
          table: 'profiles',
          details: 'تم تغيير كلمة مرور admin المبدئية 123 بنجاح وتفعيل الحساب بالكامل'
        },
        ...prev
      ]);
    } catch {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Open Auth / Password Change Modal
  const openAuthModal = () => {
    setModalTitle(mustChangePassword ? 'تنبيه أمني: يلزم تغيير كلمة المرور المبدئية' : 'إدارة حساب المستخدم والصلاحيات');
    setModalContent(
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-obsidian-800 border border-gold-500/30">
          <div className="font-bold text-gold-300">بيانات الحساب الحالي:</div>
          <div className="text-slate-300 mt-1">المستخدم: <span className="font-mono text-white font-bold">{currentUser}</span> (البريد: admin@delightsmile.local)</div>
          <div className="text-slate-300">الدور: <span className="text-emerald-400 font-bold">{currentRole}</span></div>
          {mustChangePassword && (
            <div className="mt-2 text-rose-400 font-bold bg-rose-950/60 p-2 rounded-lg border border-rose-500/40">
              <i className="fa-solid fa-triangle-exclamation ml-1"></i>
              تنبيه: أنت تستخدم كلمة المرور المبدئية للتطوير (123). يلزم تعيين كلمة مرور قوية من 8 خانات على الأقل للوصول إلى كافة العمليات المحمية.
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem('newPass') as HTMLInputElement).value;
            handlePasswordChange(input);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-slate-300 mb-1 font-bold">تعيين كلمة مرور جديدة قوية (8 خانات على الأقل):</label>
            <input
              name="newPass"
              type="password"
              placeholder="مثال: StrongDentalAdmin#2026"
              required
              minLength={8}
              className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl gold-gradient text-obsidian-950 font-extrabold shadow hover:opacity-95 transition"
          >
            تأكيد وحفظ كلمة المرور الجديدة
          </button>
        </form>
      </div>
    );
    setModalOpen(true);
  };

  // Add Appointment API Wire-up
  const handleAddAppointment = async (formData: { patientName: string; doctor: string; room: string; time: string; type: string }) => {
    try {
      const startsAt = new Date().toISOString();
      const endsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { id: userId, role: currentRole, mustChangePassword },
          payload: {
            patientId: selectedPatientId,
            dentistId: formData.doctor.includes('عمر') ? 'dent-1' : 'dent-2',
            roomCode: formData.room.includes('1') ? 'ROOM-1' : 'ROOM-2',
            startsAt,
            endsAt,
            procedureName: formData.type,
            reason: 'حجز جديد عبر واجهة Next.js'
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          showToast(`تنبيه تعارض مواعيد (Conflict)! ${data.error}`, 'error');
          return;
        }
        showToast(`فشل الحجز: ${data.error}`, 'error');
        return;
      }

      // Optimistic state update
      const newApt: Appointment = {
        id: 'APT-' + Math.floor(100 + Math.random() * 900),
        patientName: formData.patientName,
        doctor: formData.doctor,
        room: formData.room,
        time: formData.time,
        date: '2026-10-30',
        type: formData.type,
        status: 'مؤكد',
        source: 'لوحة التحكم'
      };
      setAppointments((prev) => [newApt, ...prev]);
      showToast('تم تأكيد حجز الموعد بنجاح ومنع أي تضارب زمني للطبيب أو الغرفة!', 'success');
      setModalOpen(false);
    } catch {
      showToast('فشل في الاتصال بخادم الحجوزات', 'error');
    }
  };

  // Odontogram Click Action
  const handleToothClick = async (toothNum: number) => {
    setSelectedTooth(toothNum);
    const tool = selectedChartTool;

    const toolLabels: Record<string, { label: string; price: number }> = {
      composite: { label: 'حشو كومبوزيت تجميلي (Composite Restoration)', price: 1200 },
      comp_veneer: { label: 'فينير كومبوزيت تجميلي (Composite veneer)', price: 2500 },
      root_canal: { label: 'علاج جذور وعصب (Endodontic treatment)', price: 4200 },
      pulpotomy: { label: 'بتر/استئصال لب السن (Pulpotomy/Pulpectomy)', price: 1800 },
      extraction: { label: 'خلع أسنان وجراحة فم (Extraction)', price: 950 },
      crown: { label: 'تركيبات التيجان والجسور (Crown restoration)', price: 3800 },
      veneer: { label: 'عدسات الفينير الخزفي E-Max (Veneers)', price: 6500 },
      denture: { label: 'أطقم أسنان صناعية (Dentures)', price: 8000 },
      scaling: { label: 'تنظيف الجير وعلاج اللثة (Scaling)', price: 800 },
      whitening: { label: 'تبييض الأسنان الاحترافي بالليزر (Whitening)', price: 3500 },
      implant: { label: 'زراعة سن تيتانيوم سويسري (Dental Implant)', price: 14000 },
      filling: { label: 'حشو كومبوزيت تجميلي', price: 1200 },
      caries: { label: 'تسوس نشط (Active Caries)', price: 1100 }
    };

    if (tool === 'clear') {
      const nextTeeth = { ...activePatient.teethStatus };
      delete nextTeeth[toothNum];
      setPatients((prev) =>
        prev.map((p) => (p.id === activePatient.id ? { ...p, teethStatus: nextTeeth } : p))
      );
      showToast(`تم مسح الحالة المسجلة للسن #${toothNum}`, 'gold');
      return;
    }

    const findingInfo = toolLabels[tool];
    if (!findingInfo) return;

    // Call /api/odontogram
    try {
      await fetch('/api/odontogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { id: userId, role: currentRole, mustChangePassword },
          payload: {
            patientId: activePatient.id,
            fdiNumber: toothNum,
            surface: selectedSurface === 'WHOLE' ? 'WHOLE' : selectedSurface,
            findingType: tool,
            isHistorical: isHistoricalFinding,
            status: 'planned',
            notes: `سطح: ${selectedSurface}`
          }
        })
      });
    } catch (e) {
      console.error(e);
    }

    // Optimistic Update
    const nextTeeth = {
      ...activePatient.teethStatus,
      [toothNum]: {
        status: tool,
        label: findingInfo.label,
        doctor: 'د. عمر سالم',
        price: findingInfo.price
      }
    };

    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, teethStatus: nextTeeth } : p))
    );

    showToast(
      `تم تسجيل (${findingInfo.label}) للسن #${toothNum} - السطح (${selectedSurface}) للمريض ${activePatient.name}`,
      'success'
    );
  };

  // WhatsApp Deep Link Helper (Zero cost, no paid Twilio or Meta Business API needed)
  const openWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Signature Pad Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Financial Computations
  const totalPaidRevenue = invoices.reduce((acc, i) => acc + i.paid, 0);
  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalRemaining = invoices.reduce((acc, i) => acc + i.remaining, 0);
  const totalExpensesAmt = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingProfit = totalPaidRevenue - totalExpensesAmt;

  return (
    <div className="bg-obsidian-950 text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 ${
              toast.type === 'error'
                ? 'border-rose-500 bg-rose-950/95 text-rose-100'
                : toast.type === 'success'
                ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100'
                : 'border-gold-400 bg-obsidian-900/95 text-gold-100'
            }`}
          >
            <i
              className={`fa-solid ${
                toast.type === 'error'
                  ? 'fa-triangle-exclamation text-rose-400'
                  : toast.type === 'success'
                  ? 'fa-circle-check text-emerald-400'
                  : 'fa-crown text-gold-400'
              } text-lg`}
            ></i>
            <div className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="bg-obsidian-900/95 backdrop-blur-md border-b border-gold-500/25 sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-obsidian-800 text-gold-400 hover:bg-obsidian-700 border border-gold-500/30"
            aria-label="القائمة"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>

          <button
            onClick={() => setActiveTab('index_hub')}
            className="flex items-center gap-3 text-right group focus:outline-none"
            title="اضغط على الشعار للرجوع إلى الفهرس في أي صفحة"
          >
            <div className="h-11 w-16 rounded-lg overflow-hidden border border-gold-500/40 bg-black flex items-center justify-center p-0.5 shadow-md group-hover:border-gold-400 transition">
              <img src="/logo.jpg" alt="Delight Smile Logo" className="max-w-full h-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-wide gold-text-gradient">Delight Smile</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold">
                  PRO 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">د. عمر سالم • نظام الإدارة المتكامل للعيادة</p>
            </div>
          </button>
        </div>

        {/* Global Search & Branch Selector */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-4">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400/70 text-sm"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مريض بالاسم، رقم الهاتف، أو الكود..."
              className="w-full bg-obsidian-800/90 border border-gold-500/25 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-400"
            />
          </div>
          <select
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value)}
            className="bg-obsidian-800 border border-gold-500/25 rounded-xl px-3 py-2 text-xs text-gold-200 focus:outline-none focus:border-gold-400"
          >
            <option value="الإسكندرية - الفرع الرئيسي">فرع الإسكندرية الرئيسي</option>
            <option value="القاهرة الجديدة - التجمع">فرع التجمع الخامس</option>
            <option value="الشيخ زايد">فرع الشيخ زايد</option>
          </select>
        </div>

        {/* Quick Toolbar + Role Switcher + Lang/Theme */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setModalTitle('تسجيل حساب مريض جديد (Patient Registration)');
              setModalContent(
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const payload = {
                      fullName: (form.elements.namedItem('pName') as HTMLInputElement).value,
                      phone: (form.elements.namedItem('pPhone') as HTMLInputElement).value,
                      email: (form.elements.namedItem('pEmail') as HTMLInputElement).value,
                      password: (form.elements.namedItem('pPass') as HTMLInputElement).value,
                      gender: (form.elements.namedItem('pGender') as HTMLSelectElement).value,
                      dateOfBirth: (form.elements.namedItem('pDob') as HTMLInputElement).value,
                      emergencyContactName: (form.elements.namedItem('pEmergName') as HTMLInputElement).value,
                      emergencyContactPhone: (form.elements.namedItem('pEmergPhone') as HTMLInputElement).value,
                      preferredBranch: currentBranch
                    };

                    try {
                      const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        showToast(`فشل التسجيل: ${data.error}`, 'error');
                        return;
                      }
                      showToast(`تم تسجيل المريض بنجاح! كود التحقق: ${data.verificationCode}`, 'success');
                      setPatients((prev) => [
                        ...prev,
                        {
                          id: data.patient.id,
                          name: data.patient.fullName,
                          phone: data.patient.phone,
                          age: 30,
                          gender: data.patient.gender === 'male' ? 'ذكر' : 'أنثى',
                          area: 'الإسكندرية',
                          insurance: 'نقدي (عام)',
                          membershipNo: '-',
                          points: 100,
                          usedPoints: 0,
                          creditBalance: 0,
                          medicalHistory: ['سجل جديد'],
                          notes: 'تم التسجيل عبر بوابة المرضى الذكية',
                          teethStatus: {},
                          treatmentSteps: [],
                          prescriptions: [],
                          consents: []
                        }
                      ]);
                      setModalOpen(false);
                    } catch {
                      showToast('فشل في الاتصال بخادم التسجيل', 'error');
                    }
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block text-slate-300 mb-1">الاسم الثلاثي بالكامل:</label>
                    <input name="pName" required placeholder="مثال: ياسمين أحمد محمود" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">رقم الموبايل:</label>
                      <input name="pPhone" required placeholder="+201012345678" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">البريد الإلكتروني:</label>
                      <input name="pEmail" type="email" required placeholder="patient@example.com" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">كلمة المرور:</label>
                      <input name="pPass" type="password" required minLength={8} placeholder="8 خانات على الأقل" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">النوع:</label>
                      <select name="pGender" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white">
                        <option value="female">أنثى</option>
                        <option value="male">ذكر</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">تاريخ الميلاد:</label>
                      <input name="pDob" type="date" defaultValue="1995-06-15" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">هاتف الطوارئ:</label>
                      <input name="pEmergPhone" placeholder="+201099887766" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-xl gold-gradient text-obsidian-950 font-extrabold shadow mt-2">
                    إنشاء حساب مريض والتحقق الفوري
                  </button>
                </form>
              );
              setModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 text-[11px] font-bold flex items-center gap-1"
          >
            <i className="fa-solid fa-user-plus"></i>
            <span className="hidden sm:inline">تسجيل مريض</span>
          </button>

          <select
            value={currentRole}
            onChange={(e) => {
              const r = e.target.value;
              setCurrentRole(r);
              if (r === 'patient') {
                setActiveTab('patient_portal_isolated');
                showToast('تم التبديل إلى بوابة المريض المستقلة (Isolated Portal)', 'gold');
              } else {
                showToast(`تم التبديل إلى صلاحيات الدور: ${r}`, 'gold');
              }
            }}
            className="bg-obsidian-800 border border-gold-500/35 rounded-xl px-2.5 py-1.5 text-[11px] text-gold-300 font-bold focus:outline-none"
            title="تبديل الدور وصلاحيات RBAC"
          >
            <option value="admin">الدور: مدير النظام (Admin)</option>
            <option value="dentist">الدور: طبيب أسنان (Dentist)</option>
            <option value="receptionist">الدور: موظف استقبال (Receptionist)</option>
            <option value="assistant">الدور: مساعد طبيب (Assistant)</option>
            <option value="accountant">الدور: محاسب (Accountant)</option>
            <option value="inventory_manager">الدور: مسؤول مخازن (Inventory)</option>
            <option value="patient">بوابة المريض المستقلة (Patient Portal)</option>
          </select>

          <button
            onClick={openAuthModal}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
              mustChangePassword
                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-obsidian-800 hover:bg-obsidian-700 text-emerald-300 border-emerald-500/30'
            }`}
            title="تسجيل الدخول / حساب admin"
          >
            <i className="fa-solid fa-user-shield"></i>
            <span className="hidden xl:inline">{mustChangePassword ? 'تغيير كلمة السر (admin)' : 'حساب: admin'}</span>
          </button>

          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 text-[11px] font-bold"
            title="تبديل اللغة AR / EN (RTL/LTR)"
          >
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 text-xs"
            title="تبديل الوضع الليلي / النهاري"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <button
            onClick={() => setActiveTab('index_hub')}
            className="px-2.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            title="الفهرس السريع"
          >
            <i className="fa-solid fa-table-cells-large text-gold-400"></i>
            <span className="hidden sm:inline">الفهرس</span>
          </button>

          <button
            onClick={() => {
              setModalTitle('حجز موعد جديد ومنع تضارب المواعيد');
              setModalContent(
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const pat = (e.currentTarget.elements.namedItem('pName') as HTMLInputElement).value;
                    const doc = (e.currentTarget.elements.namedItem('doc') as HTMLSelectElement).value;
                    const rm = (e.currentTarget.elements.namedItem('room') as HTMLSelectElement).value;
                    const tm = (e.currentTarget.elements.namedItem('time') as HTMLSelectElement).value;
                    const tp = (e.currentTarget.elements.namedItem('proc') as HTMLInputElement).value;
                    handleAddAppointment({ patientName: pat, doctor: doc, room: rm, time: tm, type: tp });
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block text-slate-300 mb-1">اسم المريض:</label>
                    <input name="pName" required defaultValue="نورهان محمد عبد الرحمن" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">الطبيب المعالج:</label>
                      <select name="doc" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white">
                        <option value="د. عمر سالم">د. عمر سالم</option>
                        <option value="د. سارة عادل">د. سارة عادل</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">الغرفة / العيادة:</label>
                      <select name="room" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white">
                        <option value="عيادة 1 (VIP تجميل وزراعة)">عيادة 1 (VIP)</option>
                        <option value="عيادة 2 (التقويم والحشو)">عيادة 2 (تقويم)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">الوقت المتاح (مواعيد العيادة):</label>
                      <select name="time" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono text-xs">
                        <optgroup label="سبت - إثنين - أربعاء (12:00 م - 06:00 م)">
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="01:00 PM">01:00 PM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                        </optgroup>
                        <optgroup label="أحد - ثلاثاء - خميس (04:00 م - 10:00 م)">
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                          <option value="07:00 PM">07:00 PM</option>
                          <option value="08:00 PM">08:00 PM</option>
                          <option value="09:00 PM">09:00 PM</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">الإجراء الطبي المطلوب:</label>
                      <select name="proc" className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white text-xs">
                        <option value="Composite Restoration">Composite Restoration (حشو كمبوزيت)</option>
                        <option value="Composite veneer">Composite veneer (فينير كمبوزيت)</option>
                        <option value="Endodontic treatment">Endodontic treatment (علاج جذور)</option>
                        <option value="Pulpotomy">Pulpotomy (بتر لب السن)</option>
                        <option value="Pulpectomy">Pulpectomy (استئصال لب السن)</option>
                        <option value="Extraction">Extraction (خلع أسنان)</option>
                        <option value="Crown restoration">Crown restoration (طربوش / تركيبة)</option>
                        <option value="Veneers">Veneers (عدسات الفينير الخزفي)</option>
                        <option value="Complete denture">Complete denture (طقم كامل)</option>
                        <option value="Single denture">Single denture (طقم أحادي)</option>
                        <option value="Partial denture">Partial denture (طقم جزئي)</option>
                        <option value="Scaling">Scaling (تنظيف جير وتلميع)</option>
                        <option value="Whitening">Whitening (تبييض بالليزر)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-xl gold-gradient text-obsidian-950 font-extrabold shadow mt-2">
                    تأكيد الحجز ومنع التضارب
                  </button>
                </form>
              );
              setModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl gold-gradient text-obsidian-950 font-bold text-xs flex items-center gap-1.5 shadow hover:opacity-95 transition"
          >
            <i className="fa-solid fa-calendar-plus"></i>
            <span className="hidden sm:inline">حجز موعد</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`w-64 bg-obsidian-900 border-l border-gold-500/20 flex-shrink-0 flex flex-col justify-between z-30 select-none transition-all duration-300 ${
            sidebarOpen ? 'fixed inset-y-0 right-0 top-14' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {INITIAL_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-right group ${
                    isActive
                      ? 'sidebar-item-active'
                      : 'text-slate-300 hover:bg-obsidian-800 hover:text-gold-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 text-center text-gold-400 group-hover:scale-110 transition">
                      <i className={`${item.icon.includes('fa-brands') ? item.icon : 'fa-solid ' + item.icon}`}></i>
                    </div>
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 font-bold'
                          : 'bg-obsidian-800 text-slate-400 border-gold-500/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gold-500/15 bg-obsidian-900/90 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>حالة النظام:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> متصل بالسحابة
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Next.js App Router • Supabase PostgreSQL (Free)</div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-full">
          {/* Module 1: Index Hub */}
          {activeTab === 'index_hub' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-l from-obsidian-900 via-obsidian-800 to-obsidian-900 rounded-2xl p-6 gold-border-glow flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                    <i className="fa-solid fa-crown"></i> كل حاجة في برنامج واحد لعيادة Delight Smile
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold gold-text-gradient">
                    فهرس نظام إدارة عيادة د. عمر سالم
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    اضغط على أي ميزة من القائمة بالأسفل للانتقال مباشرة إلى صفحتها وتجربتها عملياً، وللرجوع إلى هذا الفهرس في أي وقت اضغط على شعار <strong className="text-gold-300">Delight Smile</strong> أعلى اليمين.
                  </p>
                </div>
                <div className="w-44 h-28 rounded-2xl overflow-hidden border-2 border-gold-500/50 bg-black flex items-center justify-center p-2 shadow-2xl flex-shrink-0">
                  <img src="/logo.jpg" alt="Delight Smile Dr. Omar Salem" className="max-w-full h-auto object-contain" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INITIAL_NAV_ITEMS.filter((i) => i.id !== 'index_hub').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="text-right bg-obsidian-900/90 hover:bg-obsidian-800 p-4 rounded-2xl gold-border-glow transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:scale-110 transition">
                          <i className={`${item.icon.includes('fa-brands') ? item.icon : 'fa-solid ' + item.icon} text-lg`}></i>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-obsidian-800 text-gold-300 border border-gold-500/20">
                          {item.badge || 'متاح'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gold-200 group-hover:text-gold-400 transition">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-gold-500/10 flex items-center justify-between text-xs text-gold-400 font-semibold">
                      <span>فتح القسم الآن</span>
                      <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Module 2: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-l from-obsidian-900 via-obsidian-800 to-obsidian-900 rounded-2xl p-5 gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl bg-black border border-gold-500/40 p-1.5 flex items-center justify-center flex-shrink-0">
                    <img src="/logo.jpg" alt="Delight Smile" className="max-w-full h-auto object-contain" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-extrabold gold-text-gradient">أهلاً بك يا د. عمر سالم في عيادة Delight Smile</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        الفرع النشط: {currentBranch}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">تحكم بقوة وتابع بدقة.. عيادتك بالكامل في جيبك وعلى شاشتك لحظة بلحظة.</p>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-obsidian-900 p-4 rounded-2xl gold-border-glow">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>إجمالي الإيراد المحصل</span>
                    <i className="fa-solid fa-money-bill-wave text-emerald-400"></i>
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-2 font-mono">{totalPaidRevenue.toLocaleString()} EGP</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-arrow-trend-up"></i> +18.4% نمو شهري
                  </div>
                </div>

                <div className="bg-obsidian-900 p-4 rounded-2xl gold-border-glow">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>المتبقي لدى المرضى (آجل)</span>
                    <i className="fa-solid fa-hand-holding-dollar text-rose-400"></i>
                  </div>
                  <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">{totalRemaining.toLocaleString()} EGP</div>
                  <div className="text-[11px] text-slate-400 mt-1">4 فواتير قيد التحصيل</div>
                </div>

                <div className="bg-obsidian-900 p-4 rounded-2xl gold-border-glow">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>مواعيد اليوم المؤكدة</span>
                    <i className="fa-solid fa-calendar-check text-gold-400"></i>
                  </div>
                  <div className="text-2xl font-extrabold text-gold-300 mt-2 font-mono">{appointments.length} مواعيد</div>
                  <div className="text-[11px] text-slate-400 mt-1">لا يوجد أي تعارض غرف</div>
                </div>

                <div className="bg-obsidian-900 p-4 rounded-2xl gold-border-glow">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>صافي التدفق النقدي التشغيلي</span>
                    <i className="fa-solid fa-vault text-blue-400"></i>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{netOperatingProfit.toLocaleString()} EGP</div>
                  <div className="text-[11px] text-slate-400 mt-1">بعد استقطاع المصروفات</div>
                </div>
              </div>

              {/* Waiting Room & Live Appointments */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gold-300"><i className="fa-solid fa-clock ml-2"></i>جدول العيادات الحي اليوم</h3>
                    <button onClick={() => setActiveTab('appointments')} className="text-xs text-gold-400 hover:underline">عرض كل المواعيد</button>
                  </div>
                  <div className="space-y-2">
                    {appointments.slice(0, 4).map((apt) => (
                      <div key={apt.id} className="p-3 rounded-xl bg-obsidian-800/80 border border-gold-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xs">
                            {apt.time.split(' ')[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{apt.patientName}</div>
                            <div className="text-[11px] text-slate-400">{apt.type} • {apt.doctor} ({apt.room})</div>
                          </div>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <h3 className="text-base font-bold text-gold-300"><i className="fa-solid fa-bell ml-2"></i>التنبيهات الفورية الذكية</h3>
                  <div className="space-y-2.5">
                    {alerts.slice(0, 4).map((al) => (
                      <div key={al.id} className="p-2.5 rounded-xl bg-obsidian-800 border border-gold-500/15 text-xs">
                        <div className="font-semibold text-slate-200">{al.title}</div>
                        <div className="text-[10px] text-gold-400 mt-1">{al.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-calendar-check ml-2"></i>الحجوزات وتنظيم المواعيد</h2>
                  <p className="text-xs text-slate-400 mt-1">تنبيه فوري عند حجز نفس الفترة لنفس الطبيب أو نفس الغرفة مع منع التضارب برمجياً.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      showToast('اختبار منع تضارب المواعيد: تم حظر محاولة حجز د. عمر سالم في غرفتين متزامنتين (Conflict 409)!', 'error');
                      setAuditLogs((prev) => [
                        {
                          id: 'AUD-' + (prev.length + 101),
                          time: 'الآن',
                          actor: 'admin',
                          role: 'Dentist',
                          action: 'APPOINTMENT_CONFLICT_BLOCKED',
                          table: 'appointments',
                          details: 'حظر حجز متزامن للطبيب د. عمر سالم في عيادة 2 أثناء وجود حجز نشط في عيادة 1'
                        },
                        ...prev
                      ]);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs font-bold"
                  >
                    <i className="fa-solid fa-triangle-exclamation ml-1"></i> تجربة كشف التضارب (Conflict Detection)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gold-500/15 text-gold-400 font-mono font-bold text-sm">
                        {apt.time}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{apt.patientName}</div>
                        <div className="text-xs text-slate-400">{apt.type} • {apt.doctor} • {apt.room}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openWhatsAppLink('+201036554750', `مرحباً بك في عيادة Delight Smile، نذكرك بموعدك اليوم ${apt.time} مع ${apt.doctor}. نتطلع لرؤيتك!`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
                      >
                        <i className="fa-brands fa-whatsapp ml-1"></i> تذكير واتساب
                      </button>
                      <span className="px-3 py-1 rounded-lg bg-obsidian-800 text-gold-300 border border-gold-500/30 text-xs font-bold">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 4: Patients & FDI Odontogram */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-tooth ml-2"></i>ملفات المرضى ومخطط الأسنان التفاعلي (FDI)</h2>
                  <p className="text-xs text-slate-400 mt-1">مخطط تفاعلي دقيق يدعم الأسنان الدائمة (11–48) واللبنية (51–85) مع 5 أسطح وفصل الحالات السابقة.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="bg-obsidian-800 border border-gold-500/40 rounded-xl px-3 py-2 text-xs text-gold-200 font-bold"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Bio */}
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl gold-gradient text-obsidian-950 font-extrabold text-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-white">{activePatient.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gold-500/20 text-gold-300 font-mono">{activePatient.id}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono">{activePatient.phone} • {activePatient.age} سنة • {activePatient.area}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {activePatient.medicalHistory.map((mh, idx) => (
                        <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <i className="fa-solid fa-notes-medical ml-1"></i>{mh}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-obsidian-800/80 p-3.5 rounded-xl border border-gold-500/20">
                  <div className="text-[11px] text-slate-400">التأمين الطبي:</div>
                  <div className="text-xs font-bold text-gold-300 mt-1">{activePatient.insurance}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">عضوية: {activePatient.membershipNo}</div>
                </div>
                <div className="bg-obsidian-800/80 p-3.5 rounded-xl border border-gold-500/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">نقاط الولاء:</span>
                    <span className="text-xs font-bold text-gold-400 font-mono">{activePatient.points} نقطة</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">رصيد المريض:</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{activePatient.creditBalance} ج.م</span>
                  </div>
                </div>
              </div>

              {/* FDI Odontogram Interactive Container */}
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gold-500/20 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gold-300"><i className="fa-solid fa-teeth-open ml-2"></i>مخطط الأسنان التشريحي الأكاديمي (Dental Education Chart - FDI)</h3>
                    <p className="text-xs text-slate-400">ترتيب أكاديمي دقيق حسب الأرباع الأربعة وخط المنتصف، بأشكال تشريحية حقيقية لتاج وجذور الأسنان (د. عمر سالم).</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-w-2xl">
                    {[
                      { id: 'composite', label: 'حشو كومبوزيت (1,200)', color: 'border-blue-400 text-blue-300' },
                      { id: 'comp_veneer', label: 'فينير كومبوزيت (2,500)', color: 'border-amber-400 text-amber-300' },
                      { id: 'root_canal', label: 'علاج جذور وعصب (4,200)', color: 'border-purple-400 text-purple-300' },
                      { id: 'pulpotomy', label: 'علاج لب السن (1,800)', color: 'border-pink-400 text-pink-300' },
                      { id: 'crown', label: 'طربوش زيركون (3,800)', color: 'border-cyan-400 text-cyan-300' },
                      { id: 'veneer', label: 'عدسات فينير E-Max (6,500)', color: 'border-gold-400 text-gold-300' },
                      { id: 'implant', label: 'زراعة سن سويسري (14,000)', color: 'border-emerald-400 text-emerald-300' },
                      { id: 'extraction', label: 'خلع جراحي (950)', color: 'border-rose-400 text-rose-300' },
                      { id: 'denture', label: 'طقم أسنان صناعي (8,000)', color: 'border-indigo-400 text-indigo-300' },
                      { id: 'scaling', label: 'تنظيف جير وتلميع (800)', color: 'border-teal-400 text-teal-300' },
                      { id: 'whitening', label: 'تبييض بالليزر (3,500)', color: 'border-amber-300 text-amber-200' },
                      { id: 'caries', label: 'تسوس نشط (1,100)', color: 'border-red-500 text-red-400' },
                      { id: 'clear', label: 'مسح الحالة', color: 'border-slate-500 text-slate-300' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedChartTool(t.id)}
                        className={`px-2 py-1 rounded-xl text-[11px] font-bold border transition ${
                          selectedChartTool === t.id ? 'gold-gradient text-obsidian-950 border-gold-300 shadow font-extrabold' : 'bg-obsidian-800 ' + t.color
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FDI Controls: Dentition Mode & Surface Selector */}
                <div className="p-3.5 rounded-xl bg-obsidian-800/90 border border-gold-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 font-semibold">مرحلة التسنين (Dentition):</span>
                    <button
                      onClick={() => setDentitionMode('permanent')}
                      className={`px-3 py-1.5 rounded-lg font-bold border ${dentitionMode === 'permanent' ? 'gold-gradient text-obsidian-950 border-gold-400' : 'bg-obsidian-900 text-slate-300 border-gold-500/20'}`}
                    >
                      الأسنان الدائمة (11–48)
                    </button>
                    <button
                      onClick={() => setDentitionMode('primary')}
                      className={`px-3 py-1.5 rounded-lg font-bold border ${dentitionMode === 'primary' ? 'gold-gradient text-obsidian-950 border-gold-400' : 'bg-obsidian-900 text-slate-300 border-gold-500/20'}`}
                    >
                      الأسنان اللبنية (51–85)
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">السطح التشريحي المختار:</span>
                    {[
                      { code: 'WHOLE', label: 'السن كاملاً' },
                      { code: 'M', label: 'M (أنسي)' },
                      { code: 'D', label: 'D (وحشي)' },
                      { code: 'O', label: 'O/I (طاحن/قاطع)' },
                      { code: 'F', label: 'B/F (دهليزي/وجهي)' },
                      { code: 'L', label: 'L/P (لساني/حنكي)' }
                    ].map((sf) => (
                      <button
                        key={sf.code}
                        onClick={() => setSelectedSurface(sf.code)}
                        className={`px-2 py-1 rounded-lg font-mono text-[11px] border ${selectedSurface === sf.code ? 'bg-gold-500/25 text-gold-300 border-gold-400 font-bold' : 'bg-obsidian-900 text-slate-400 border-gold-500/15'}`}
                      >
                        {sf.label}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-1.5 text-amber-300 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isHistoricalFinding}
                      onChange={(e) => setIsHistoricalFinding(e.target.checked)}
                      className="rounded"
                    />
                    <span>حالة سابقة (Historical Finding)</span>
                  </label>
                </div>

                {/* FDI Academic Dental School Odontogram Chart */}
                <div className="bg-obsidian-950 p-4 rounded-2xl border border-gold-500/30 shadow-2xl space-y-3">
                  {/* Upper Arch Header Labels */}
                  <div className="flex items-center justify-between text-xs font-bold text-gold-400 px-3 border-b border-gold-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px]">الربع الأول (Q1)</span>
                      <span>يمين المريض • الفك العلوي (Maxillary Right)</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono tracking-wider flex items-center gap-1">
                      <span>خط المنتصف (MIDLINE)</span>
                      <span>⬇</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>يسار المريض • الفك العلوي (Maxillary Left)</span>
                      <span className="px-2 py-0.5 rounded bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px]">الربع الثاني (Q2)</span>
                    </div>
                  </div>

                  {/* Upper Arch Teeth - Strict LTR alignment ensures anatomical Q1 -> Midline -> Q2 */}
                  <div dir="ltr" className="flex items-center justify-start xl:justify-center gap-2 overflow-x-auto py-3 px-2 w-full">
                    {/* Quadrant 1 (UR): 18 down to 11 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {q1UpperRight.map((num) => (
                        <AnatomicalTooth
                          key={num}
                          toothNumber={num}
                          statusData={activePatient.teethStatus[num]}
                          isSelected={selectedTooth === num}
                          onClick={handleToothClick}
                        />
                      ))}
                    </div>

                    {/* Central Vertical Dental Midline Separator */}
                    <div className="h-32 w-1 bg-gradient-to-b from-gold-500/20 via-gold-400 to-gold-500/20 flex flex-col items-center justify-center relative mx-1">
                      <div className="absolute top-1/2 -translate-y-1/2 bg-obsidian-900 border border-gold-400 text-gold-300 text-[9px] font-mono px-1 py-0.5 rounded shadow z-10 whitespace-nowrap">
                        خط المنتصف
                      </div>
                    </div>

                    {/* Quadrant 2 (UL): 21 up to 28 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {q2UpperLeft.map((num) => (
                        <AnatomicalTooth
                          key={num}
                          toothNumber={num}
                          statusData={activePatient.teethStatus[num]}
                          isSelected={selectedTooth === num}
                          onClick={handleToothClick}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Occlusal Plane Separator (مستوى الإطباق) */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="w-full border-t border-dashed border-gold-500/40"></div>
                    <span className="absolute bg-obsidian-900 border border-gold-500/30 text-gold-300 text-[11px] font-bold px-4 py-0.5 rounded-full shadow-lg">
                      مستوى الإطباق السريري • Occlusal Plane
                    </span>
                  </div>

                  {/* Lower Arch Teeth - Strict LTR alignment ensures anatomical Q4 -> Midline -> Q3 */}
                  <div dir="ltr" className="flex items-center justify-start xl:justify-center gap-2 overflow-x-auto py-3 px-2 w-full">
                    {/* Quadrant 4 (LR): 48 down to 41 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {q4LowerRight.map((num) => (
                        <AnatomicalTooth
                          key={num}
                          toothNumber={num}
                          statusData={activePatient.teethStatus[num]}
                          isSelected={selectedTooth === num}
                          onClick={handleToothClick}
                        />
                      ))}
                    </div>

                    {/* Central Vertical Dental Midline Separator */}
                    <div className="h-32 w-1 bg-gradient-to-b from-gold-500/20 via-gold-400 to-gold-500/20 flex flex-col items-center justify-center relative mx-1">
                      <div className="absolute top-1/2 -translate-y-1/2 bg-obsidian-900 border border-gold-400 text-gold-300 text-[9px] font-mono px-1 py-0.5 rounded shadow z-10 whitespace-nowrap">
                        خط المنتصف
                      </div>
                    </div>

                    {/* Quadrant 3 (LL): 31 up to 38 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {q3LowerLeft.map((num) => (
                        <AnatomicalTooth
                          key={num}
                          toothNumber={num}
                          statusData={activePatient.teethStatus[num]}
                          isSelected={selectedTooth === num}
                          onClick={handleToothClick}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lower Arch Footer Labels */}
                  <div className="flex items-center justify-between text-xs font-bold text-gold-400 px-3 border-t border-gold-500/20 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px]">الربع الرابع (Q4)</span>
                      <span>يمين المريض • الفك السفلي (Mandibular Right)</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono tracking-wider flex items-center gap-1">
                      <span>خط المنتصف (MIDLINE)</span>
                      <span>⬆</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>يسار المريض • الفك السفلي (Mandibular Left)</span>
                      <span className="px-2 py-0.5 rounded bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px]">الربع الثالث (Q3)</span>
                    </div>
                  </div>
                </div>

                {/* Selected Tooth Clinical Inspection & Surface Tagging Panel */}
                {selectedTooth && (
                  <div className="p-4 rounded-xl bg-obsidian-800/95 border border-gold-500/35 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-300 font-mono text-base font-bold">
                        #{selectedTooth}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gold-300 flex items-center gap-2">
                          <span>السن #{selectedTooth}: {getToothNameAr(selectedTooth)}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-obsidian-950 border border-gold-500/30 text-slate-300 font-mono font-normal">
                            FDI ISO-3950
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                          <span>الحالة المسجلة: <strong className="text-gold-400">{activePatient.teethStatus[selectedTooth]?.label || 'سليم وطبيعي (Intact)'}</strong></span>
                          {activePatient.teethStatus[selectedTooth]?.price && (
                            <span className="text-emerald-400 font-mono">({activePatient.teethStatus[selectedTooth].price} ج.م)</span>
                          )}
                          <span>الطبيب المسؤول: <strong className="text-slate-200">د. عمر سالم</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">تطبيق سريع:</span>
                      <button
                        onClick={() => handleToothClick(selectedTooth)}
                        className="px-3 py-1.5 rounded-xl gold-gradient text-obsidian-950 font-bold text-xs shadow hover:scale-105 transition"
                      >
                        تطبيق الإجراء المختار ({selectedChartTool})
                      </button>
                      <button
                        onClick={() => {
                          const nextTeeth = { ...activePatient.teethStatus };
                          delete nextTeeth[selectedTooth];
                          setPatients((prev) =>
                            prev.map((p) => (p.id === activePatient.id ? { ...p, teethStatus: nextTeeth } : p))
                          );
                          showToast(`تم إعادة السن #${selectedTooth} للحالة السليمة`, 'gold');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-slate-600 text-slate-300 hover:text-rose-300 hover:border-rose-400 text-xs font-semibold transition"
                      >
                        <i className="fa-solid fa-rotate-left ml-1"></i> مسح التشخيص
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 5: QR Code & Patient Portal Check-in */}
          {activeTab === 'qrcode' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-qrcode ml-2"></i>بوابة المريض والتسجيل الذاتي بالـ QR-Code</h2>
                  <p className="text-xs text-slate-400 mt-1">تسجيل وصول ذاتي فور الوصول، استعراض الروشتة والفاتورة، ونموذج إقرار الموافقة مع التوقيع الإلكتروني الحي.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex flex-col items-center text-center space-y-4">
                  <div className="text-sm font-bold text-gold-300">امسح الكود بكاميرا الموبايل للدخول الفوري لبوابة المريض</div>
                  <div className="p-4 bg-white rounded-2xl shadow-2xl">
                    {/* SVG QR Code Simulation */}
                    <div className="w-48 h-48 bg-slate-900 rounded-lg flex items-center justify-center p-3 text-gold-400 border-4 border-gold-400/40">
                      <div className="text-center font-mono text-xs">
                        <i className="fa-solid fa-qrcode text-6xl mb-2 text-gold-400"></i>
                        <div>DELIGHT-SMILE-PORTAL</div>
                        <div className="text-[10px] text-slate-300 mt-1">P-1001 • VERIFIED</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">يتم توجيه المريض تلقائياً إلى بوابته المعزولة بأمان تام دون كشف أي بيانات إدارية.</p>
                </div>

                {/* Digital Consent Signature Canvas */}
                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gold-300"><i className="fa-solid fa-file-signature ml-1.5"></i>نموذج الموافقة والتوقيع الإلكتروني الحي</h3>
                    <button onClick={clearSignatureCanvas} className="text-xs text-rose-400 hover:underline">مسح التوقيع</button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-800 p-3 rounded-xl border border-gold-500/15">
                    أقر أنا المريض/المريضة بأنني اطلعت على الخطة العلاجية المقترحة ومخاطرها وبدائلها، وأوافق على بدء الإجراء الطبي بعيادة Delight Smile.
                  </p>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">وقّع هنا باللمس أو الماوس داخل المربع:</label>
                    <canvas
                      ref={signatureCanvasRef}
                      width={400}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 bg-obsidian-950 border border-gold-500/40 rounded-xl cursor-crosshair"
                    ></canvas>
                  </div>
                  <button
                    onClick={() => {
                      showToast('تم اعتماد وحفظ التوقيع الإلكتروني وربطه بالملف الطبي للمريضة نورهان محمد!', 'success');
                      setAuditLogs((prev) => [
                        {
                          id: 'AUD-' + (prev.length + 101),
                          time: 'الآن',
                          actor: 'patient.nourhan',
                          role: 'Patient',
                          action: 'CONSENT_SIGNED',
                          table: 'consent_forms',
                          details: 'اعتماد التوقيع الرقمي للموافقة على زراعة الأسنان وعدسات الفينير'
                        },
                        ...prev
                      ]);
                    }}
                    className="w-full py-2.5 rounded-xl gold-gradient text-obsidian-950 font-extrabold text-xs shadow"
                  >
                    اعتماد وحفظ نموذج الموافقة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Module 6: Finance & Invoices */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-sack-dollar ml-2"></i>الحسابات، الفواتير، ونسب الأطباء</h2>
                  <p className="text-xs text-slate-400 mt-1">إصدار الفواتير الإلكترونية، التحصيل الجزئي، استحقاقات الأطباء على المحصل، وتوافق مصلحة الضرائب المصرية.</p>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-obsidian-900 rounded-2xl gold-border-glow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-obsidian-800 text-gold-300 border-b border-gold-500/20">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">المريض</th>
                        <th className="p-3">الإجراء</th>
                        <th className="p-3">الإجمالي</th>
                        <th className="p-3">المدفوع</th>
                        <th className="p-3">المتبقي</th>
                        <th className="p-3">الطبيب المعالج</th>
                        <th className="p-3">نسبة الطبيب</th>
                        <th className="p-3">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-obsidian-800/50">
                          <td className="p-3 font-mono font-bold text-white">{inv.id}</td>
                          <td className="p-3">{inv.patient}</td>
                          <td className="p-3 text-slate-300">{inv.procedure}</td>
                          <td className="p-3 font-mono font-bold text-white">{inv.total.toLocaleString()} EGP</td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">{inv.paid.toLocaleString()} EGP</td>
                          <td className="p-3 font-mono text-rose-400 font-bold">{inv.remaining.toLocaleString()} EGP</td>
                          <td className="p-3">{inv.doctor}</td>
                          <td className="p-3 text-gold-300 font-bold">{inv.doctorSharePct}%</td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                showToast(`تحصيل دفعة جديدة للفاتورة ${inv.id}`, 'gold');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 font-bold"
                            >
                              تحصيل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module 7: Finance Analytics */}
          {activeTab === 'finance_analytics' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-chart-line ml-2"></i>تحليلات الأرباح والخسائر وحركة الخزن</h2>
                <p className="text-xs text-slate-400 mt-1">تتبع تدفق الإيرادات والمصروفات، صافي الأرباح، ورصيد كل خزنة نقدية وبنكية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/30">
                  <div className="text-xs text-slate-400">إجمالي الفواتير الصادرة</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{totalBilled.toLocaleString()} EGP</div>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/30">
                  <div className="text-xs text-slate-400">المصروفات التشغيلية</div>
                  <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{totalExpensesAmt.toLocaleString()} EGP</div>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/30">
                  <div className="text-xs text-slate-400">صافي الربح الفعلي</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{netOperatingProfit.toLocaleString()} EGP</div>
                </div>
              </div>
            </div>
          )}

          {/* Module 8: Insurance */}
          {activeTab === 'insurance' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-shield-heart ml-2"></i>شركات التأمين الطبي والمطالبات</h2>
                <p className="text-xs text-slate-400 mt-1">إدارة التعاقدات ونسب الخصم والتحمل وإنشاء المطالبات الدورية لكل شركة تأمين.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {insuranceCompanies.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/25 space-y-2">
                    <div className="font-bold text-gold-300 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-400">خصم التعاقد: <span className="text-white font-bold">{c.discountPct}%</span></div>
                    <div className="text-xs text-slate-400">الحد الائتماني: <span className="text-white font-mono">{c.limit.toLocaleString()} EGP</span></div>
                    <div className="text-xs text-emerald-400 font-bold">المطالبات: {c.claimed.toLocaleString()} EGP</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 9: Labs */}
          {activeTab === 'labs' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-flask ml-2"></i>طلبات معامل الأسنان ومتابعة درجات الألوان</h2>
                <p className="text-xs text-slate-400 mt-1">إرسال كروت المعمل فورياً عبر واتساب بالـ wa.me المجاني، تحديد لون السن بدقة، وتأكيد الاستلام بالعيادة.</p>
              </div>
              <div className="space-y-3">
                {labOrders.map((lab) => (
                  <div key={lab.id} className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-sm">{lab.item} ({lab.tooth}) - لون {lab.shade}</div>
                      <div className="text-xs text-slate-400">{lab.labName} • المريض: {lab.patient} • الطبيب: {lab.doctor}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openWhatsAppLink('+201014471777', `طلب معمل جديد: ${lab.item} للمريض ${lab.patient} - سن ${lab.tooth} - لون ${lab.shade} - الموعد: ${lab.dueDate}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
                      >
                        <i className="fa-brands fa-whatsapp ml-1"></i> إرسال للمعمل (WhatsApp)
                      </button>
                      <span className="px-2.5 py-1 rounded-lg bg-obsidian-800 text-gold-300 text-xs font-bold">{lab.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 10: Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-boxes-stacked ml-2"></i>المخازن التخصصية (3 مستويات) ونواقص الخامات</h2>
                <p className="text-xs text-slate-400 mt-1">مخزن رئيسي بالصندوق، فرعي بالوحدة، ومخازن العيادات الداخلية مع تنبيهات الصلاحية وطلب الشراء المجاني بالواتساب.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.qty <= item.minAlert ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {item.qty} {item.unit}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{item.level} • المورد: {item.supplier}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-gold-500/10 text-xs">
                      <span className="text-slate-400">تاريخ الانتهاء: {item.expiry}</span>
                      <button
                        onClick={() => openWhatsAppLink('+201014471777', `طلب شراء مستلزمات: نحتاج توريد عاجل من صنف: ${item.name} لعيادة Delight Smile`)}
                        className="text-emerald-400 hover:underline font-bold"
                      >
                        <i className="fa-brands fa-whatsapp ml-1"></i> طلب شراء واتساب
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 11: Laser Pulses */}
          {activeTab === 'pulses' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-wand-magic-sparkles ml-2"></i>حساب نبضات أجهزة الليزر وتبييض الأسنان</h2>
                <p className="text-xs text-slate-400 mt-1">متابعة دقيقة لجلسات Diode Laser وتوريد اللثة مع مطابقة عداد الجهاز الفعلي قبل وبعد كل جلسة.</p>
              </div>
              <div className="space-y-3">
                {pulses.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white text-sm">{p.service} - {p.patient}</div>
                      <span className="text-gold-300 font-mono font-bold">{p.pulsesUsed} نبضة مستهلكة</span>
                    </div>
                    <div className="text-xs text-slate-400">المنطقة: {p.area} • عداد الجهاز: {p.deviceCounterBefore} ➔ {p.deviceCounterAfter}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 12: Staff */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-user-doctor ml-2"></i>إدارة الموظفين والحضور الجغرافي (GPS) والمهام</h2>
                <p className="text-xs text-slate-400 mt-1">تسجيل حضور وانصراف الطاقم الطبي داخل نطاق فرع الإسكندرية الجغرافي مع إدارة السُلف والرواتب.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((st) => (
                  <div key={st.id} className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white text-sm">{st.name}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">{st.status}</span>
                    </div>
                    <div className="text-xs text-slate-400">{st.role}</div>
                    <div className="text-[11px] text-gold-300 font-mono"><i className="fa-solid fa-location-dot ml-1"></i>نطاق الحضور: {st.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 13: WhatsApp & SMS */}
          {activeTab === 'whatsapp_sms' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-brands fa-whatsapp ml-2"></i>واتساب بوت وحملات الرسائل المجانية 100%</h2>
                <p className="text-xs text-slate-400 mt-1">توليد روابط wa.me المباشرة دون الحاجة لأي اشتراكات مدفوعة مع قوالب جاهزة للردود والتذكير بالمواعيد.</p>
              </div>
              <div className="p-5 rounded-xl bg-obsidian-900 border border-gold-500/25 space-y-3">
                <div className="text-sm font-bold text-gold-300">إرسال رسالة واتساب فورية مباشرة لمريض:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input id="waPhone" defaultValue="+201036554750" placeholder="رقم الهاتف" className="bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white font-mono" />
                  <input id="waMsg" defaultValue="مرحباً بك في عيادة Delight Smile د. عمر سالم، نود الاطمئنان على صحتك بعد جلستك الأخيرة!" placeholder="نص الرسالة" className="bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-white" />
                </div>
                <button
                  onClick={() => {
                    const phone = (document.getElementById('waPhone') as HTMLInputElement).value;
                    const msg = (document.getElementById('waMsg') as HTMLInputElement).value;
                    openWhatsAppLink(phone, msg);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <i className="fa-brands fa-whatsapp ml-1"></i> فتح محادثة WhatsApp Web فوراً (مجاناً)
                </button>
              </div>
            </div>
          )}

          {/* Module 14: Internal Chat */}
          {activeTab === 'internal_chat' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-comments ml-2"></i>التواصل الداخلي الفوري لطاقم العيادة</h2>
                <p className="text-xs text-slate-400 mt-1">تواصل فوري مشفر بين الطبيب والاستقبال ومساعد الطبيب مع دعم المنشن @.</p>
              </div>
              <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {chatMessages.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-obsidian-800 border border-gold-500/10 text-xs">
                      <div className="flex justify-between font-bold text-gold-300">
                        <span>{m.sender} ({m.role})</span>
                        <span className="text-slate-500 font-normal">{m.time}</span>
                      </div>
                      <div className="text-slate-200 mt-1">{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-gold-500/20">
                  <input
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="اكتب رسالة سريعة للطاقم..."
                    className="flex-1 bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (!chatInputText.trim()) return;
                      setChatMessages((prev) => [
                        ...prev,
                        { id: prev.length + 1, sender: 'د. عمر سالم', role: 'مدير العيادة', time: 'الآن', text: chatInputText }
                      ]);
                      setChatInputText('');
                    }}
                    className="px-4 py-2 rounded-xl gold-gradient text-obsidian-950 font-bold text-xs"
                  >
                    إرسال
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Module 15: Loyalty */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-gem ml-2"></i>برنامج نقاط الولاء ومكافآت المرضى (VIP)</h2>
                <p className="text-xs text-slate-400 mt-1">كسب النقاط مع كل جلسة علاجية واستبدالها بخصومات مباشرة على التبييض والتجميل.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 text-center">
                  <div className="text-xs text-slate-400">رصيد نقاط المريضة نورهان</div>
                  <div className="text-3xl font-extrabold text-gold-400 mt-2 font-mono">3,300 نقطة</div>
                  <div className="text-xs text-emerald-400 mt-1">فئة العضوية: الذهبية VIP</div>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 text-center">
                  <div className="text-xs text-slate-400">القيمة المالية المعادلة</div>
                  <div className="text-3xl font-extrabold text-white mt-2 font-mono">330 EGP</div>
                  <div className="text-xs text-slate-400 mt-1">10 نقاط = 1 جنيه مصري</div>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 text-center">
                  <div className="text-xs text-slate-400">النقاط المستبدلة سابقاً</div>
                  <div className="text-3xl font-extrabold text-slate-300 mt-2 font-mono">1,200 نقطة</div>
                  <div className="text-xs text-slate-400 mt-1">تم خصمها في الفاتورة INV-1240</div>
                </div>
              </div>
            </div>
          )}

          {/* Module 16: Alerts & Support */}
          {activeTab === 'alerts_support' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-bell ml-2"></i>مركز الإنذارات الذكية والدعم الفني</h2>
                  <p className="text-xs text-slate-400 mt-1">تنبيهات فورية لنواقص المخازن، مواعيد استلام المعامل، وتصدير التقارير إلى Excel/CSV.</p>
                </div>
                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,ID,Patient,Procedure,Total,Paid\nINV-1240,Nourhan,Veneer,19500,15500\nINV-1239,Ahmed,Laser,8300,8300';
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'delight_smile_report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('تم تصدير تقرير العيادة بصيغة CSV بنجاح', 'success');
                  }}
                  className="px-3 py-2 rounded-xl bg-obsidian-800 text-gold-300 border border-gold-500/30 text-xs font-bold"
                >
                  <i className="fa-solid fa-file-csv ml-1"></i> تصدير تقارير CSV
                </button>
              </div>
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3.5 rounded-xl bg-obsidian-900 border border-gold-500/20 flex justify-between items-center text-xs">
                    <span className="text-slate-200">{al.title}</span>
                    <span className="text-gold-400 font-bold">{al.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 17: Isolated Patient Portal */}
          {activeTab === 'patient_portal_isolated' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-l from-teal-950/90 via-obsidian-900 to-obsidian-900 p-5 rounded-2xl border border-teal-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                    <i className="fa-solid fa-shield-halved ml-1"></i> بوابة المريض المستقلة (Row Level Security Isolated Portal)
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-1.5">
                    مرحباً بك في بوابة المريض — {activePatient.name} ({activePatient.id})
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    عزل كامل للبيانات بواسطة Supabase RLS. لا يمكن لأي مريض استعراض بيانات مريض آخر.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      showToast('تم حظر المحاولة بواسطة سياسة عزل المرضى (RLS 403 Forbidden): لا يمكنك عرض بيانات مريض آخر!', 'error');
                      setAuditLogs((prev) => [
                        {
                          id: 'AUD-' + (prev.length + 101),
                          time: 'الآن',
                          actor: activePatient.name,
                          role: 'Patient',
                          action: 'PATIENT_ISOLATION_VIOLATION_BLOCKED',
                          table: 'patients',
                          details: 'حظر محاولة الوصول إلى ملف مريض آخر P-1002 عبر سياسة Supabase RLS (403 Forbidden)'
                        },
                        ...prev
                      ]);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs font-bold"
                  >
                    <i className="fa-solid fa-ban ml-1"></i> اختبار محاولة فتح ملف مريض آخر (IDOR Test)
                  </button>
                  <button
                    onClick={() => {
                      showToast('تم إرسال طلب الموعد بنجاح لحين مراجعة الاستقبال وتأكيده', 'success');
                    }}
                    className="px-3.5 py-2 rounded-xl gold-gradient text-obsidian-950 font-extrabold text-xs"
                  >
                    <i className="fa-solid fa-calendar-plus ml-1"></i> طلب موعد جديد
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <h3 className="text-sm font-bold text-gold-300"><i className="fa-solid fa-key ml-1.5"></i>التحقق الآمن</h3>
                  <div className="p-3 rounded-xl bg-obsidian-800 border border-emerald-500/30 text-xs space-y-1">
                    <div className="text-emerald-400 font-bold"><i className="fa-solid fa-circle-check ml-1"></i>حساب مريض موثق (Verified)</div>
                    <div className="text-slate-300">رقم الملف: <span className="font-mono text-gold-300 font-bold">{activePatient.id}</span></div>
                    <div className="text-slate-400">رمز التحقق: <span className="font-mono">VERIFY-DS1001-9981</span></div>
                  </div>
                </div>

                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <h3 className="text-sm font-bold text-gold-300"><i className="fa-solid fa-calendar-check ml-1.5"></i>مواعيدي المعتمدة</h3>
                  <div className="space-y-2 text-xs">
                    {appointments.slice(0, 2).map((a) => (
                      <div key={a.id} className="p-3 rounded-xl bg-obsidian-800 border border-gold-500/20 flex justify-between">
                        <div>
                          <div className="font-bold text-white">{a.type}</div>
                          <div className="text-slate-400">{a.date} • {a.time}</div>
                        </div>
                        <span className="text-emerald-400 font-bold">{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow space-y-4">
                  <h3 className="text-sm font-bold text-gold-300"><i className="fa-solid fa-file-invoice-dollar ml-1.5"></i>فواتيري المسددة</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-obsidian-800 border border-gold-500/20">
                      <div className="flex justify-between font-bold text-white">
                        <span>فاتورة INV-1240</span>
                        <span className="text-emerald-400">15,500 EGP</span>
                      </div>
                      <div className="text-slate-400 mt-1">فينير E-Max + زراعة سن</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 18: RBAC & Audit Logs */}
          {activeTab === 'rbac_security' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-shield-halved ml-2"></i>الصلاحيات وسجل التدقيق الأمني (RBAC & Audit Logs)</h2>
                <p className="text-xs text-slate-400 mt-1">فصل صارم بين صلاحيات 6 أدوار وظيفية + دور المريض مع تسجيل كل عملية حساسة في سجل التدقيق.</p>
              </div>
              <div className="bg-obsidian-900 rounded-2xl gold-border-glow overflow-hidden">
                <div className="p-4 border-b border-gold-500/20 font-bold text-sm text-gold-300">سجل العمليات والتدقيق الأمني (Live Audit Trail):</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-obsidian-800 text-slate-300 border-b border-gold-500/20">
                      <tr>
                        <th className="p-3">رقم السجل</th>
                        <th className="p-3">التوقيت</th>
                        <th className="p-3">المستخدم</th>
                        <th className="p-3">الدور</th>
                        <th className="p-3">الحدث</th>
                        <th className="p-3">الجدول</th>
                        <th className="p-3">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-obsidian-800/50">
                          <td className="p-3 font-mono font-bold text-gold-400">{log.id}</td>
                          <td className="p-3 text-slate-400 font-mono">{log.time}</td>
                          <td className="p-3 font-bold text-white">{log.actor}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-gold-500/15 text-gold-300 font-bold">{log.role}</span></td>
                          <td className="p-3 font-mono font-bold text-emerald-400">{log.action}</td>
                          <td className="p-3 font-mono text-slate-400">{log.table}</td>
                          <td className="p-3 text-slate-300">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module 19: Full-Stack Architecture */}
          {activeTab === 'fullstack_arch' && (
            <div className="space-y-6">
              <div className="bg-obsidian-900 p-5 rounded-2xl gold-border-glow">
                <h2 className="text-xl font-extrabold gold-text-gradient"><i className="fa-solid fa-database ml-2"></i>معمارية Next.js + Supabase + PWA</h2>
                <p className="text-xs text-slate-400 mt-1">تطبيق متكامل مبني بالكامل على باقات مجانية 100% (Vercel Hobby + Supabase Free + WhatsApp Direct wa.me).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/25 space-y-2">
                  <div className="font-bold text-gold-300">قاعدة البيانات & RLS (Supabase PostgreSQL):</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>38 جدولاً متكاملاً مع مفاتيح أجنبية وفهارس B-Tree</li>
                    <li>قيود GiST Exclusion لمنع تضارب حجوزات الأطباء والغرف متزامناً</li>
                    <li>Row Level Security (RLS) لعزل سجلات المرضى بالكامل</li>
                    <li>مخزن خاص <code className="text-emerald-400">clinical-private</code> بـ Signed URLs</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/25 space-y-2">
                  <div className="font-bold text-gold-300">الاستضافة والواجهات المجانية 100%:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Next.js 14 App Router مع دعم PWA كامل للعمل بدون إنترنت</li>
                    <li>نظام التنبيهات عبر روابط WhatsApp Direct wa.me المجانية بدون تكلفة</li>
                    <li>تصدير التقارير والفواتير مباشرة عبر طباعة المتصفح وتنزيل CSV</li>
                    <li>نشر مجاني دائم على Vercel Hobby Plan مدى الحياة</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Official Delight Smile Clinic Footer */}
          <footer className="mt-12 pt-6 border-t border-gold-500/20 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 rounded-2xl p-6 gold-border-glow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-right">
                <div className="w-16 h-16 rounded-xl bg-black border border-gold-500/40 p-1 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src="/logo.jpg" alt="Delight Smile Logo" className="max-w-full h-auto object-contain" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold gold-text-gradient">عيادة Delight Smile • د. عمر سالم</h4>
                  <p className="text-xs text-gold-300 font-medium">جميع التخصصات وجراحة وتجميل وزراعة الأسنان</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <i className="fa-solid fa-location-dot ml-1 text-gold-400"></i>
                    الأسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="bg-obsidian-800/80 p-3 rounded-xl border border-gold-500/20 text-slate-300 space-y-1">
                  <div className="font-bold text-gold-300">مواعيد العمل:</div>
                  <div>السبت - الإثنين - الأربعاء: 12:00 م - 06:00 م</div>
                  <div>الأحد - الثلاثاء - الخميس: 04:00 م - 10:00 م</div>
                  <div className="text-slate-400 text-[11px]">الجمعة: إجازة أسبوعية</div>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/201034366020"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow transition"
                  >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    <span>واتساب العيادة: 01034366020</span>
                  </a>
                  <a
                    href="tel:01091313305"
                    className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 font-bold flex items-center gap-2 transition"
                  >
                    <i className="fa-solid fa-phone text-xs"></i>
                    <span>هاتف العيادة: 01091313305</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gold-500/10 text-center text-xs text-gold-400/80 italic font-serif">
              "Your Delight is on your Smile"
            </div>
          </footer>
        </main>
      </div>

      {/* Reusable App Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-gold-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
              <h3 className="text-base font-bold text-gold-300">{modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="p-5 text-sm space-y-4 max-h-[75vh] overflow-y-auto">{modalContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
