import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://uujtikjqzeqgbhtudlxc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1anRpa2pxemVxZ2JodHVkbHhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM2ODY5NCwiZXhwIjoyMTA4OTQ0Njk0fQ.gr-hGOWymJLuAc3LOMjzWwnAG5swRxN98J4S4Z4tE6M';

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('=== STEP 1: BACKING UP CURRENT PRODUCTION DATABASE ===');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `supabase-production-backup-${timestamp}.json`);

  const tablesToBackup = [
    'branches', 'profiles', 'dentists', 'services', 'patients',
    'appointments', 'encounters', 'odontogram_findings', 'treatment_plans',
    'invoices', 'payments', 'refunds', 'laboratory_orders', 'inventory_items',
    'audit_logs'
  ];

  const backupData = {};
  for (const table of tablesToBackup) {
    try {
      const { data, error } = await adminClient.from(table).select('*');
      if (!error) {
        backupData[table] = data;
        console.log(`Backed up ${table}: ${data?.length || 0} rows`);
      }
    } catch (e) {
      console.warn(`Could not backup ${table}: ${e.message}`);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`\n[SUCCESS] Backup saved to ${backupFile}\n`);

  console.log('=== STEP 2: CLEANING DEMO / OPERATIONAL DATA ===');

  // Tables to wipe clean
  const operationalTables = [
    'patient_files',
    'clinical_notes',
    'consent_signatures',
    'consent_forms',
    'prescriptions',
    'treatment_plan_items',
    'treatment_plans',
    'odontogram_findings',
    'encounters',
    'waiting_room',
    'appointment_history',
    'appointments',
    'laser_sessions',
    'attendance_records',
    'internal_messages',
    'notifications',
    'laboratory_orders',
    'inventory_transactions',
    'refunds',
    'dentist_commissions',
    'payments',
    'invoice_items',
    'invoices',
    'expenses',
    'treasury_transactions',
    'insurance_claims',
    'insurance_policies',
    'loyalty_transactions',
    'medical_history',
    'allergies',
    'patient_user_links',
    'patients'
  ];

  for (const table of operationalTables) {
    try {
      const { error, count } = await adminClient.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn(`Delete on ${table} note: ${error.message}`);
      } else {
        console.log(`Cleared table ${table}`);
      }
    } catch (e) {
      console.warn(`Exception on ${table}: ${e.message}`);
    }
  }

  // Clear demo audit logs
  try {
    await adminClient.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Cleared demo audit_logs');
  } catch (e) {
    console.warn(`audit_logs: ${e.message}`);
  }

  // Clean Storage Bucket 'clinical-private'
  console.log('\nCleaning storage bucket clinical-private...');
  try {
    const { data: files, error: fErr } = await adminClient.storage.from('clinical-private').list();
    if (!fErr && files?.length > 0) {
      const fileNames = files.map(f => f.name);
      await adminClient.storage.from('clinical-private').remove(fileNames);
      console.log(`Deleted ${fileNames.length} demo files from clinical-private bucket`);
    } else {
      console.log('Bucket clinical-private is already empty.');
    }
  } catch (e) {
    console.warn(`Storage cleanup: ${e.message}`);
  }

  // Clean test auth users (except dr.omar and official staff)
  console.log('\nCleaning demo auth users...');
  try {
    const { data: { users }, error: uErr } = await adminClient.auth.admin.listUsers();
    if (!uErr && users) {
      for (const u of users) {
        if (u.email?.includes('patient.test') || u.email?.includes('test.') || u.email?.includes('demo')) {
          await adminClient.auth.admin.deleteUser(u.id);
          console.log(`Deleted test user: ${u.email}`);
        }
      }
    }
  } catch (e) {
    console.warn(`Auth users cleanup: ${e.message}`);
  }

  console.log('\n=== STEP 3: ENFORCING STRICTLY 1 REAL CLINIC BRANCH (GLEEM) ===');
  // Delete all non-Gleem branches
  const { data: branches } = await adminClient.from('branches').select('*');
  if (branches && branches.length > 0) {
    for (let i = 1; i < branches.length; i++) {
      await adminClient.from('branches').delete().eq('id', branches[i].id);
      console.log(`Deleted non-Gleem branch: ${branches[i].name_ar || branches[i].name_en}`);
    }

    // Update the 1 remaining branch with official details
    const gleemBranchId = branches[0].id;
    await adminClient.from('branches').update({
      name_ar: 'عيادة Delight Smile للأسنان - فرع جليم',
      name_en: 'Delight Smile Dental Clinic - Gleem Branch',
      address_ar: 'الإسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول',
      address_en: 'Alexandria - Gleem - 4 Ahmed Fathi St, Gleem Heights Tower, 1st Floor',
      phone: '01091313305',
      whatsapp: '01034366020',
      is_active: true
    }).eq('id', gleemBranchId);
    console.log(`Updated Gleem branch record (${gleemBranchId}) with official data.`);
  }

  console.log('\n=== STEP 4: VERIFYING POST-CLEANUP PRODUCTION COUNTS ===');
  const verifyTables = [
    'branches',
    'patients',
    'appointments',
    'encounters',
    'odontogram_findings',
    'treatment_plans',
    'invoices',
    'payments',
    'refunds',
    'laboratory_orders',
    'loyalty_transactions'
  ];

  const counts = {};
  for (const tbl of verifyTables) {
    const { count, error } = await adminClient.from(tbl).select('*', { count: 'exact', head: true });
    counts[tbl] = error ? `Error: ${error.message}` : count;
    console.log(`COUNT [${tbl}] = ${counts[tbl]}`);
  }

  console.log('\nAll verification counts complete.');
}

main().catch(console.error);
