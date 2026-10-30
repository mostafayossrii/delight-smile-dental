import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET() {
  const summary = sharedEngine.getFinancialSummary();
  const invoices = Array.from(sharedEngine.invoices.values());
  const payments = sharedEngine.payments;
  const refunds = sharedEngine.refunds;
  const commissions = sharedEngine.commissions;

  return NextResponse.json({
    summary,
    invoices,
    payments,
    refunds,
    commissions
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actor, action, payload } = body;

    if (action === 'create_invoice') {
      const inv = sharedEngine.createInvoice(actor, payload);
      return NextResponse.json({ invoice: inv }, { status: 201 });
    }

    if (action === 'record_payment') {
      const result = sharedEngine.recordPayment(actor, payload);
      return NextResponse.json(result, { status: 201 });
    }

    if (action === 'record_refund') {
      const result = sharedEngine.recordRefund(actor, payload);
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  } catch (err: any) {
    const status = err.message?.includes('FORBIDDEN') ? 403 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
