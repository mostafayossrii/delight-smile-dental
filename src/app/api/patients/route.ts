import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    const role = searchParams.get('role') || 'admin';
    const userId = searchParams.get('userId') || 'usr-admin-1';
    const mustChangePassword = searchParams.get('mustChangePassword') === 'true';

    const actor = { id: userId, role, mustChangePassword };

    if (patientId) {
      const patient = sharedEngine.getPatientRecord(actor, patientId);
      return NextResponse.json({ patient });
    }

    // List all patients for staff with patients.read
    if (sharedEngine.hasPermission(actor, 'patients.read')) {
      const allPatients = Array.from(sharedEngine.patients.values());
      return NextResponse.json({ patients: allPatients });
    }

    return NextResponse.json({ error: 'FORBIDDEN_MISSING_PERMISSION:patients.read' }, { status: 403 });
  } catch (err: any) {
    const status = err.message?.includes('FORBIDDEN') ? 403 : err.message?.includes('NOT_FOUND') ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actor, action, payload } = body;

    if (action === 'link_portal') {
      const res = sharedEngine.linkPatientPortalAccount(
        actor.id,
        payload.patientId,
        payload.verificationToken
      );
      return NextResponse.json(res);
    }

    // Create treatment plan
    if (action === 'create_treatment_plan') {
      const plan = sharedEngine.createTreatmentPlan(actor, payload);
      return NextResponse.json({ plan }, { status: 201 });
    }

    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  } catch (err: any) {
    const status = err.message?.includes('FORBIDDEN') ? 403 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
