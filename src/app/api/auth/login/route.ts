import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/schemas';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uujtikjqzeqgbhtudlxc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjg2OTQsImV4cCI6MjEwODk0NDY5NH0.ZCT-GP5qEaZHpFGMRup0oBzdpiu3RQqhRsffq0Y97_Q';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM2ODY5NCwiZXhwIjoyMTA4OTQ0Njk0fQ.gr-hGOWymJLuAc3LOMjzWwnAG5swRxN98J4S4Z4tE6M';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'يرجى إدخال اسم مستخدم وكلمة مرور صحيحة.' }, { status: 400 });
    }

    const { identifier, password } = parsed.data;
    const cleanId = identifier.trim();

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Resolve canonical email from identifier (email, username, or phone)
    let emailToAuth = cleanId;

    if (!cleanId.includes('@')) {
      // Look up in profiles by username or phone
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email')
        .or(`username.eq.${cleanId},phone.eq.${cleanId},phone.eq.+2${cleanId},phone.eq.+20${cleanId.replace(/^0/, '')}`)
        .limit(1)
        .maybeSingle();

      if (profile?.email) {
        emailToAuth = profile.email;
      } else {
        // Also check patients table by phone
        const { data: patient } = await adminClient
          .from('patients')
          .select('email')
          .or(`phone.eq.${cleanId},phone.eq.+2${cleanId}`)
          .limit(1)
          .maybeSingle();

        if (patient?.email) {
          emailToAuth = patient.email;
        }
      }
    }

    // 2. Perform authentic Supabase credential verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: emailToAuth,
      password: password
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.' },
        { status: 401 }
      );
    }

    // 3. Resolve user profile, doctor profile, and roles
    const userId = authData.user.id;
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Check user role from profile_roles
    let userRole = 'receptionist';
    const { data: userRoles } = await adminClient
      .from('profile_roles')
      .select('roles(code)')
      .eq('profile_id', userId);

    if (userRoles && userRoles.length > 0) {
      const roleCodes = userRoles.map((r: any) => r.roles?.code).filter(Boolean);
      if (roleCodes.includes('admin')) {
        userRole = 'admin';
      } else if (roleCodes.includes('dentist')) {
        userRole = 'dentist';
      } else if (roleCodes.includes('accountant')) {
        userRole = 'accountant';
      } else if (roleCodes.includes('receptionist')) {
        userRole = 'receptionist';
      } else if (roleCodes.includes('patient')) {
        userRole = 'patient';
      }
    } else {
      // Check if patient
      const { data: patientRecord } = await adminClient
        .from('patients')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (patientRecord) {
        userRole = 'patient';
      }
    }

    // Resolve dentist profile if dentist or admin
    let dentistId = undefined;
    if (userRole === 'dentist' || userRole === 'admin') {
      const { data: dentist } = await adminClient
        .from('dentists')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (dentist) {
        dentistId = dentist.id;
      }
    }

    // Update last login timestamp
    await adminClient
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      session: {
        token: authData.session.access_token,
        userId: userId,
        fullName: profile?.full_name || authData.user.user_metadata?.full_name || 'طاقم العيادة',
        role: userRole,
        dentistId: dentistId,
        email: authData.user.email,
        mustChangePassword: profile?.must_change_password || false
      }
    });
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'حدث خطأ في معالجة طلب تسجيل الدخول.' },
      { status: 500 }
    );
  }
}
