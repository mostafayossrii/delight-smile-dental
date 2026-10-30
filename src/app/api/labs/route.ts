import { NextResponse } from 'next/server';

export async function GET() {
  const initialLabs = [
    { id: 'LAB-901', labName: 'Max Dental Labs', patient: 'نورهان محمد عبد الرحمن', doctor: 'د. عمر سالم', item: '2 عدسة فينير E-Max', tooth: '#11, #21', shade: 'BL2', price: 4400, dueDate: '2026-10-27 05:00 PM', receiverStaff: 'أ. رحمة شريف', status: 'تم الإرسال بالواتساب' },
    { id: 'LAB-902', labName: 'Royal Zircon Lab', patient: 'أحمد إبراهيم المنيري', doctor: 'د. عمر سالم', item: 'طربوش زيركون متعدد الطبقات', tooth: '#12', shade: 'A1', price: 1800, dueDate: '2026-10-26 02:00 PM', receiverStaff: 'أ. عبد الرحمن مجدي', status: 'تم الاستلام بالعيادة' },
    { id: 'LAB-903', labName: 'Max Dental Labs', patient: 'محمود عمران الكيلاني', doctor: 'د. رامي طارق', item: 'طربوش PFM داعم للضرس', tooth: '#36', shade: 'A2', price: 1300, dueDate: '2026-10-28 06:00 PM', receiverStaff: 'أ. رحمة شريف', status: 'قيد التصنيع بالمعمل' }
  ];
  return NextResponse.json({ labOrders: initialLabs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = `LAB-${Math.floor(900 + Math.random() * 100)}`;
    const newOrder = { id: orderId, ...body, status: 'تم الإنشاء' };

    // Generate zero-cost click-to-chat WhatsApp deep link
    const waText = `طلب معمل جديد: ${newOrder.item} للمريض ${newOrder.patient} - سن ${newOrder.tooth} - لون ${newOrder.shade} - الموعد: ${newOrder.dueDate}`;
    const cleanPhone = (newOrder.labPhone || '201014471777').replace(/[^0-9]/g, '');
    const whatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({ success: true, order: newOrder, whatsAppLink }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
