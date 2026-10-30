import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/schemas';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }
    const session = sharedEngine.authenticate(parsed.data.identifier, parsed.data.password);
    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AUTH_FAILED' }, { status: 401 });
  }
}
