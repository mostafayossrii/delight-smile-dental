import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, pointsChange, transactionType, notes } = body;
    const result = sharedEngine.manageLoyaltyPoints(patientId, pointsChange, transactionType, notes);
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
