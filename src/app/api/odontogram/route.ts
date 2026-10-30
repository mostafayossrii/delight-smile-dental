import { NextResponse } from 'next/server';
import { OdontogramFindingSchema } from '@/lib/validations/schemas';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  if (patientId) {
    const findings = sharedEngine.odontogramFindings.filter(f => f.patientId === patientId);
    return NextResponse.json({ findings });
  }
  return NextResponse.json({ findings: sharedEngine.odontogramFindings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = OdontogramFindingSchema.safeParse(body.payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }
    const finding = sharedEngine.recordOdontogramFinding(body.actor, parsed.data);
    return NextResponse.json({ finding }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
