import { NextResponse } from 'next/server';
import { AppointmentSchema } from '@/lib/validations/schemas';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET() {
  return NextResponse.json({ appointments: sharedEngine.appointments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AppointmentSchema.safeParse(body.payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }
    const created = sharedEngine.bookAppointment(body.actor, parsed.data);
    return NextResponse.json({ appointment: created }, { status: 201 });
  } catch (err: any) {
    const status = err.message?.includes('CONFLICT') ? 409 : err.message?.includes('FORBIDDEN') ? 403 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
