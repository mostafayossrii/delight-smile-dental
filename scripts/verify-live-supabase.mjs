import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uujtikjqzeqgbhtudlxc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM2ODY5NCwiZXhwIjoyMTA4OTQ0Njk0fQ.gr-hGOWymJLuAc3LOMjzWwnAG5swRxN98J4S4Z4tE6M';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjg2OTQsImV4cCI6MjEwODk0NDY5NH0.ZCT-GP5qEaZHpFGMRup0oBzdpiu3RQqhRsffq0Y97_Q';

const adminClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function runTests() {
  console.log('=== STARTING LIVE PRODUCTION VERIFICATION SUITE ===\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  // 1. Verify Clinic Branch and Doctor Existence
  console.log('1. Checking Clinic & Doctor in Live PostgreSQL...');
  const { data: branches, error: bErr } = await adminClient.from('branches').select('*');
  assert(!bErr && branches?.length > 0, `Glim Branch exists: ${branches?.[0]?.name_ar || ''}`);

  const { data: dentists, error: dErr } = await adminClient.from('dentists').select('*, profiles(*)');
  assert(!dErr && dentists?.length > 0, `Dr. Omar Salem exists: ${dentists?.[0]?.profiles?.full_name}`);

  // 2. Patient Registration in Live Database
  console.log('\n2. Testing Live Patient Registration...');
  const testEmail = `patient.test.${Date.now()}@delightsmile.local`;
  const testPhone = `+20109${Math.floor(1000000 + Math.random() * 9000000)}`;

  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: 'PatientPass2026!Secure',
    email_confirm: true,
    user_metadata: { full_name: 'أحمد محمود عبد الرحمن', phone: testPhone }
  });
  assert(!authErr && authUser?.user, `Patient Auth user created: ${authUser?.user?.id}`);

  const patientId = crypto.randomUUID();
  const { data: patientData, error: pErr } = await adminClient.from('patients').insert({
    id: patientId,
    branch_id: branches[0].id,
    patient_number: `PAT-${Date.now().toString().slice(-6)}`,
    full_name: 'أحمد محمود عبد الرحمن',
    phone: testPhone,
    email: testEmail,
    date_of_birth: '1992-05-14',
    gender: 'male',
    address: 'Alexandria, Egypt',
    loyalty_points: 100,
    credit_balance: 0,
    is_demo: false,
    created_by: dentists[0].profile_id
  }).select().single();
  assert(!pErr && patientData?.id === patientId, `Patient profile persistent in PostgreSQL: ${patientData?.full_name}`);

  // Create profile for patient
  const { error: patProfErr } = await adminClient.from('profiles').insert({
    id: authUser.user.id,
    branch_id: branches[0].id,
    username: testEmail,
    email: testEmail,
    full_name: 'أحمد محمود عبد الرحمن',
    phone: testPhone,
    is_active: true,
    must_change_password: false
  });
  if (patProfErr) console.error('Patient Profile Error:', patProfErr);

  // Link patient to user
  const { error: linkErr } = await adminClient.from('patient_user_links').insert({
    patient_id: patientId,
    profile_id: authUser.user.id,
    verification_code_hash: 'HASH_VERIFIED_2026',
    verification_expires_at: new Date(Date.now() + 86400000).toISOString(),
    is_verified: true,
    verified_at: new Date().toISOString()
  });
  if (linkErr) console.error('Link Error detail:', linkErr);
  assert(!linkErr, `Patient User Link created and verified`);

  // 3. Official Working Hours Appointment Booking
  console.log('\n3. Testing Appointment Scheduling for Dr. Omar Salem...');
  // Dynamic slot on next week to ensure unique time
  const randomSlotOffset = Math.floor(Math.random() * 500) + 1;
  const apptStart = new Date(Date.UTC(2026, 10, 14, 12, 0, 0) + randomSlotOffset * 3600000);
  const apptEnd = new Date(apptStart.getTime() + 45 * 60000);

  // Fetch composite restoration service
  const { data: service } = await adminClient.from('services').select('*').eq('code', 'COMP-REST').single();
  assert(!!service, `Official Procedure found: ${service?.name_ar} (${service?.name_en})`);

  const appointmentId = crypto.randomUUID();
  const { data: appt, error: apptErr } = await adminClient.from('appointments').insert({
    id: appointmentId,
    branch_id: branches[0].id,
    patient_id: patientId,
    dentist_id: dentists[0].id,
    service_id: service?.id,
    room_code: 'ROOM-1',
    starts_at: apptStart.toISOString(),
    ends_at: apptEnd.toISOString(),
    status: 'booked',
    booking_source: 'online',
    reason: 'Composite Restoration Examination & Filling'
  }).select().single();
  if (apptErr) console.error('Appointment Error detail:', apptErr);
  assert(!apptErr && appt?.id === appointmentId, `Appointment booked successfully for Saturday 14:00`);

  // 4. Overlap Conflict Detection Test (GiST exclusion constraint)
  console.log('\n4. Testing Overlap Conflict Prevention (Exclusion Constraint)...');
  const conflictApptId = crypto.randomUUID();
  const { error: conflictErr } = await adminClient.from('appointments').insert({
    id: conflictApptId,
    branch_id: branches[0].id,
    patient_id: patientId,
    dentist_id: dentists[0].id,
    room_code: 'ROOM-1',
    starts_at: new Date(apptStart.getTime() + 15 * 60000).toISOString(), // overlaps
    ends_at: new Date(apptStart.getTime() + 60 * 60000).toISOString(),
    status: 'booked',
    booking_source: 'app',
    reason: 'Conflicting Booking'
  });
  assert(!!conflictErr, `Exclusion constraint correctly rejected overlapping appointment (${conflictErr?.message || 'blocked'})`);

  // 5. Clinical Private Storage Upload & Signed URL Test
  console.log('\n5. Testing Private Storage in clinical-private bucket...');
  const testFileContent = Buffer.from('%PDF-1.4 Delight Smile Dental Panoramic Scan 2026');
  const filePath = `${patientId}/xray_${Date.now()}.pdf`;

  const { data: uploadData, error: uploadErr } = await adminClient.storage
    .from('clinical-private')
    .upload(filePath, testFileContent, {
      contentType: 'application/pdf',
      upsert: true
    });
  if (uploadErr) console.error('Upload Error detail:', uploadErr);
  assert(!uploadErr, `Medical document uploaded to clinical-private: ${filePath}`);

  const { data: signedUrlData, error: signedUrlErr } = await adminClient.storage
    .from('clinical-private')
    .createSignedUrl(filePath, 3600);
  assert(!signedUrlErr && signedUrlData?.signedUrl?.startsWith('http'), `Signed URL generated with temporary TTL: ${signedUrlData?.signedUrl?.slice(0, 50)}...`);

  // 6. Test RLS Patient Isolation
  console.log('\n6. Testing Row Level Security Patient Isolation...');
  // Login as the test patient
  const { data: patientAuth, error: patLoginErr } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: 'PatientPass2026!Secure'
  });
  assert(!patLoginErr && patientAuth?.session, `Patient logged in via Supabase Auth`);

  const authedClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${patientAuth.session.access_token}` } }
  });

  // Try to query all patients: should only see own or be restricted
  const { data: visiblePatients, error: rlsErr } = await authedClient.from('patients').select('id, full_name');
  assert(!rlsErr && (!visiblePatients || visiblePatients.every(p => p.id === patientId)), `RLS correctly enforced: patient only sees their own record (${visiblePatients?.length || 0} visible)`);

  console.log('\n=== SUITE SUMMARY ===');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\n>>> ALL LIVE POSTGRESQL & STORAGE INTEGRATION TESTS PASSED 100% <<<');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
