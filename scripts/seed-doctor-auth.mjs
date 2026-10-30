import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uujtikjqzeqgbhtudlxc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM2ODY5NCwiZXhwIjoyMTA4OTQ0Njk0fQ.gr-hGOWymJLuAc3LOMjzWwnAG5swRxN98J4S4Z4tE6M';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const email = 'dromarsalem@delightsmile.com';
  console.log('Checking if Dr. Omar user exists in auth...');

  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('List users error:', listErr);
    process.exit(1);
  }

  let user = users.users.find(u => u.email === email);
  if (!user) {
    console.log('Creating Dr. Omar in auth.users...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: 'DelightSmile2026!DoctorAlex',
      email_confirm: true,
      user_metadata: {
        full_name: 'د. عمر سالم',
        phone: '+201034366020'
      }
    });

    if (createErr) {
      console.error('Create doctor error:', createErr);
      process.exit(1);
    }
    user = created.user;
    console.log('Created auth user:', user.id);
  } else {
    console.log('Doctor already exists in auth:', user.id);
  }

  // Insert or update profile
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: user.id,
    branch_id: '11111111-1111-1111-1111-111111111111',
    username: 'dr.omar',
    email,
    full_name: 'د. عمر سالم',
    phone: '+201034366020',
    is_active: true,
    must_change_password: false
  });
  if (profErr) {
    console.error('Profile upsert error:', profErr);
    process.exit(1);
  }
  console.log('Profile created/updated.');

  // Find admin and dentist role IDs
  const { data: roles } = await supabase.from('roles').select('id, code').in('code', ['admin', 'dentist']);
  for (const r of roles || []) {
    await supabase.from('profile_roles').upsert({
      profile_id: user.id,
      role_id: r.id
    }, { onConflict: 'profile_id,role_id' });
  }
  console.log('Roles assigned.');

  // Insert dentist record
  const { error: dentErr } = await supabase.from('dentists').upsert({
    id: '33333333-3333-3333-3333-333333333333',
    profile_id: user.id,
    branch_id: '11111111-1111-1111-1111-111111111111',
    specialty_ar: 'جميع التخصصات وجراحة وتجميل وزراعة الأسنان',
    specialty_en: 'All Dental Specialties, Oral Surgery & Cosmetic Dentistry',
    license_number: 'EGY-ALX-78901',
    default_commission_percent: 50.00,
    is_available: true,
    working_schedule: {
      saturday: { start: '12:00', end: '18:00' },
      sunday: { start: '16:00', end: '22:00' },
      monday: { start: '12:00', end: '18:00' },
      tuesday: { start: '16:00', end: '22:00' },
      wednesday: { start: '12:00', end: '18:00' },
      thursday: { start: '16:00', end: '22:00' },
      friday: { closed: true }
    }
  }, { onConflict: 'id' });

  if (dentErr) {
    console.error('Dentist upsert error:', dentErr);
    process.exit(1);
  }
  console.log('Dentist record created/updated successfully!');
}

main();
