import { NextResponse } from 'next/server';

export async function GET() {
  const inventory = [
    { id: 'INV-M1', name: 'بنج أسنان Artinibsa 4% (صندوق 50 أمبول)', level: 'المخزن الرئيسي (بالصندوق)', qty: 18, unit: 'صندوق', minAlert: 5, expiry: '2027-08-15', supplier: 'شركة ديجيتال للمستلزمات الطبية' },
    { id: 'INV-S1', name: 'كبسولات كومبوزيت 3M Filtek Z350', level: 'المخزن الفرعي (بالوحدة)', qty: 42, unit: 'كبسولة', minAlert: 15, expiry: '2027-03-10', supplier: 'شركة النور دنتال' },
    { id: 'INV-C1', name: 'جل تبييض الليزر الاحترافي Philips Zoom', level: 'مخزن عيادة 1 (د. عمر سالم)', qty: 3, unit: 'عبوة', minAlert: 5, expiry: '2026-11-20', supplier: 'شركة ديجيتال للمستلزمات الطبية' },
    { id: 'INV-C2', name: 'قفازات نيتريل سوداء فاخرة (علبة 100 قطعة)', level: 'مخزن عيادة 1 (د. عمر سالم)', qty: 14, unit: 'علبة', minAlert: 4, expiry: '2028-01-01', supplier: 'مؤسسة الأهرام الطبية' }
  ];
  return NextResponse.json({ inventory });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, itemId, quantityChange, reason } = body;

    // Zero-cost supplier purchase order WhatsApp link
    const waText = `طلب توريد عاجل: نحتاج توريد مستلزمات طبية للصنف (${itemId}) بكمية مطلوبة لعيادة Delight Smile د. عمر سالم.`;
    const whatsAppLink = `https://wa.me/201014471777?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({
      success: true,
      action,
      itemId,
      quantityChange,
      reason,
      whatsAppLink
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
