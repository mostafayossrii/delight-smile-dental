import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || 'ALEX-MAIN';
    const dentistId = searchParams.get('dentistId') || 'dent-1';
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const slots = sharedEngine.getAvailableAppointmentSlots(branchId, dentistId, dateStr);
    return NextResponse.json({ branchId, dentistId, date: dateStr, slots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
