import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'csv';

    const summary = sharedEngine.getFinancialSummary();
    const invoices = Array.from(sharedEngine.invoices.values());

    if (type === 'csv') {
      let csv = 'Invoice ID,Patient ID,Total (EGP),Paid (EGP),Balance (EGP),Status\n';
      invoices.forEach((inv) => {
        csv += `${inv.id},${inv.patientId},${inv.totalAmount},${inv.paidAmount},${inv.balanceDue},${inv.status}\n`;
      });
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="delight_smile_financial_report.csv"'
        }
      });
    }

    return NextResponse.json({ summary, invoices });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
