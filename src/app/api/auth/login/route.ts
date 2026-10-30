import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/schemas';
import { sharedEngine } from '@/lib/services/clinic-engine-singleton';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    // 1. Try in-memory engine (for local unit tests)
    try {
      const session = sharedEngine.authenticate(identifier, password);
      if (session) {
        return NextResponse.json({ session });
      }
    } catch {
      // Continue to Supabase Auth
    }

    // 2. Real Supabase Auth
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uujtikjqzeqgbhtudlxc.supabase.co';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjg2OTQsImV4cCI6MjEwODk0NDY5NH0.ZCT-GP5qEaZHpFGMRup0oBzdpiu3RQqhRsffq0Y97_Q';
      const sb = createClient(supabaseUrl, anonKey);

      const email = identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@delightsmile.local`;
      const { data: authData, error: authError } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (!authError && authData.user) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM2ODY5NCwiZXhwIjoyMTA4OTQ0Njk0fQ.gr-hGOWymJLuAc3LOMjzWwnAG5swRxN98J4S4Z4tE6M';
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: profile } = await adminClient.from('profiles').select('*').eq('id', authData.user.id).single();

        return NextResponse.json({
          session: {
            token: authData.session?.access_token || ('token_' + Date.now()),
            userId: authData.user.id,
            fullName: profile?.full_name || authData.user.user_metadata?.full_name || 'مريض مسجل',
            role: profile?.role || 'patient',
            email: authData.user.email,
            mustChangePassword: false
          }
        });
      }
    } catch {
      // Ignore and check clinic credentials
    }

    // 3. Official Clinic Staff & Doctor Credentials
    const clean = identifier.trim().toLowerCase();
    if ((clean === 'dr.omar' || clean === 'omar' || clean === '01034366020') && (password === '123' || password === 'omar123' || password === 'pass123')) {
      return NextResponse.json({
        session: {
          token: 'staff_omar_' + Date.now(),
          userId: 'usr-dentist-1',
          fullName: 'د. عمر سالم',
          role: 'dentist',
          dentistId: 'dent-1',
          email: 'omar@delightsmile.com',
          mustChangePassword: false
        }
      });
    }

    if ((clean === 'admin' || clean === 'admin@delightsmile.com') && (password === '123' || password === 'admin123')) {
      return NextResponse.json({
        session: {
          token: 'staff_admin_' + Date.now(),
          userId: 'usr-admin-1',
          fullName: 'د. عمر سالم (المدير العام)',
          role: 'admin',
          dentistId: 'dent-1',
          email: 'admin@delightsmile.com',
          mustChangePassword: false
        }
      });
    }

    if ((clean === 'reception' || clean === 'receptionist') && (password === '123' || password === 'rec123')) {
      return NextResponse.json({
        session: {
          token: 'staff_rec_' + Date.now(),
          userId: 'usr-rec-1',
          fullName: 'موظف الاستقبال',
          role: 'receptionist',
          email: 'reception@delightsmile.com',
          mustChangePassword: false
        }
      });
    }

    return NextResponse.json({ error: 'INVALID_CREDENTIALS', message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AUTH_FAILED' }, { status: 401 });
  }
}
