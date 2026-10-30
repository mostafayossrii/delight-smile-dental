import { NextResponse } from 'next/server';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId = 'usr-dentist-1', latitude, longitude, ipAddress } = body;

    const record = sharedEngine.recordStaffAttendance(profileId, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      ipAddress
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
