import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sharedEngine.registerPatient(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const status = err.message?.includes('DUPLICATE') ? 409 : 400;
    return NextResponse.json({ error: err.message || 'REGISTRATION_FAILED' }, { status });
  }
}
