import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actor, payload } = body;
    const session = sharedEngine.recordLaserPulseSession(actor, payload);
    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (err: any) {
    const status = err.message?.includes('INVALID_METER') ? 422 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
