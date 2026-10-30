-- ============================================================================
-- DELIGHT SMILE DENTAL CLINIC MANAGEMENT SYSTEM
-- Migration 04: Row Level Security for Enterprise Tables
-- ============================================================================

ALTER TABLE clinic_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE laser_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE laser_pulse_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Clinic Rooms & Equipment
CREATE POLICY rooms_read_policy ON clinic_rooms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY rooms_manage_policy ON clinic_rooms
  FOR ALL USING (public.current_user_has_permission('admin.all'));

CREATE POLICY equipment_read_policy ON equipment_assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY equipment_manage_policy ON equipment_assets
  FOR ALL USING (public.current_user_has_permission('inventory.manage') OR public.current_user_has_permission('admin.all'));

-- 2. Dentist Leaves
CREATE POLICY leaves_read_policy ON dentist_leaves
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY leaves_manage_policy ON dentist_leaves
  FOR ALL USING (public.current_user_has_permission('admin.all'));

-- 3. Treasuries & Cash Flow
CREATE POLICY treasuries_read_policy ON treasuries
  FOR SELECT USING (public.current_user_has_permission('finance.read') OR public.current_user_has_permission('admin.all'));

CREATE POLICY treasuries_manage_policy ON treasuries
  FOR ALL USING (public.current_user_has_permission('finance.manage') OR public.current_user_has_permission('admin.all'));

CREATE POLICY treasury_tx_read_policy ON treasury_transactions
  FOR SELECT USING (public.current_user_has_permission('finance.read') OR public.current_user_has_permission('admin.all'));

CREATE POLICY treasury_tx_insert_policy ON treasury_transactions
  FOR INSERT WITH CHECK (public.current_user_has_permission('finance.manage') OR public.current_user_has_permission('admin.all'));

-- 4. Insurance & Claims
CREATE POLICY insurance_companies_read_policy ON insurance_companies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY insurance_policies_patient_isolation ON insurance_policies
  FOR SELECT USING (
    public.current_user_has_permission('finance.read')
    OR patient_id = public.current_verified_patient_id()
  );

CREATE POLICY insurance_claims_patient_isolation ON insurance_claims
  FOR SELECT USING (
    public.current_user_has_permission('finance.read')
    OR patient_id = public.current_verified_patient_id()
  );

-- 5. Laser Pulse Sessions
CREATE POLICY laser_devices_read_policy ON laser_devices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY laser_sessions_patient_isolation ON laser_pulse_sessions
  FOR SELECT USING (
    public.current_user_has_permission('clinical.read')
    OR patient_id = public.current_verified_patient_id()
  );

CREATE POLICY laser_sessions_write_policy ON laser_pulse_sessions
  FOR INSERT WITH CHECK (public.current_user_has_permission('clinical.write'));

-- 6. Attendance
CREATE POLICY attendance_read_policy ON staff_attendance
  FOR SELECT USING (
    public.current_user_has_permission('admin.all')
    OR profile_id = auth.uid()
  );

CREATE POLICY attendance_insert_policy ON staff_attendance
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- 7. Internal Chat (Staff Only)
CREATE POLICY chat_conversations_policy ON internal_conversations
  FOR ALL USING (auth.role() = 'authenticated' AND NOT public.current_user_has_role('patient'));

CREATE POLICY chat_messages_policy ON internal_messages
  FOR ALL USING (auth.role() = 'authenticated' AND NOT public.current_user_has_role('patient'));

-- 8. Loyalty Points Ledger (Patient can only view their own)
CREATE POLICY loyalty_patient_isolation ON patient_loyalty_transactions
  FOR SELECT USING (
    public.current_user_has_permission('finance.read')
    OR patient_id = public.current_verified_patient_id()
  );

CREATE POLICY loyalty_manage_policy ON patient_loyalty_transactions
  FOR ALL USING (public.current_user_has_permission('finance.manage') OR public.current_user_has_permission('admin.all'));
