/**
 * Local Development Seed Script
 * Creates the local dev administrator account:
 *   Username: admin
 *   Password: 123
 * Maps username 'admin' to 'admin@delightsmile.local' in Supabase Auth and sets must_change_password = true.
 * Strictly blocked in production (NODE_ENV === 'production' or ALLOW_DEV_SEED !== 'true').
 */
import { createClient } from '@supabase/supabase-js';

async function runDevSeed() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEV_SEED !== 'true') {
    console.error('SECURITY ABORT: Development seed with weak initial password (admin / 123) is strictly prohibited in production.');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const adminEmail = 'admin@delightsmile.local';
  const { data: userRes, error: authErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: '123',
    email_confirm: true,
    user_metadata: { username: 'admin', full_name: 'د. عمر سالم (المدير العام)' }
  });

  if (authErr && !authErr.message.includes('already been registered')) {
    throw authErr;
  }

  const userId = userRes?.user?.id;
  if (userId) {
    await supabase.from('profiles').upsert({
      id: userId,
      branch_id: '11111111-1111-1111-1111-111111111111',
      username: 'admin',
      email: adminEmail,
      full_name: 'د. عمر سالم (مدير النظام)',
      is_active: true,
      must_change_password: true // Forces immediate password change on first login
    });
  }

  console.log('Development admin seeded (username: admin, initial password: 123, must_change_password: true).');
}

runDevSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
