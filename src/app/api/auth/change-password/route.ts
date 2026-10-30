import { NextResponse } from 'next/server';
import { PasswordChangeSchema } from '@/lib/validations/schemas';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    const parsed = PasswordChangeSchema.safeParse({
      currentPassword: body.currentPassword || '123',
      newPassword
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }

    const updatedUser = sharedEngine.changePassword(userId, newPassword);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'PASSWORD_CHANGE_FAILED' }, { status: 400 });
  }
}
