-- ============================================================================
-- DELIGHT SMILE DENTAL CLINIC MANAGEMENT SYSTEM
-- Migration 02: Strict PostgreSQL Row Level Security (RLS) Policies
-- ============================================================================

-- Helper functions for RBAC evaluation inside RLS
CREATE OR REPLACE FUNCTION public.current_user_has_role(target_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profile_roles pr
    JOIN roles r ON r.id = pr.role_id
    WHERE pr.profile_id = auth.uid()
      AND r.code = target_role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_permission(target_perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profile_roles pr
    JOIN role_permissions rp ON rp.role_id = pr.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE pr.profile_id = auth.uid()
      AND (p.code = target_perm OR p.code = 'admin.all')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_verified_patient_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT patient_id
  FROM patient_user_links
  WHERE profile_id = auth.uid()
    AND is_verified = true
  LIMIT 1;
$$;

-- Enable RLS across all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontogram_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Patients Isolation Policy:
-- Staff with 'patients.read' can view clinic patients; verified Patient Portal user can ONLY view their own linked patient row.
CREATE POLICY patients_select_policy ON patients
  FOR SELECT USING (
    public.current_user_has_permission('patients.read')
    OR id = public.current_verified_patient_id()
  );

CREATE POLICY patients_write_policy ON patients
  FOR ALL USING (
    public.current_user_has_permission('patients.write')
  );

-- 2. Odontogram & Clinical Encounters Isolation:
-- Only clinical staff (Admin, Dentist, Assistant with clinical.read) can view internal encounters.
-- Patients can ONLY view encounters explicitly marked released_to_patient = true.
CREATE POLICY encounters_select_policy ON clinical_encounters
  FOR SELECT USING (
    public.current_user_has_permission('clinical.read')
    OR (patient_id = public.current_verified_patient_id() AND released_to_patient = true)
  );

CREATE POLICY encounters_write_policy ON clinical_encounters
  FOR INSERT WITH CHECK (
    public.current_user_has_permission('clinical.write')
  );

-- 3. Treatment Plans Isolation:
-- Staff with clinical/reception permissions or verified patient when shared_with_patient = true.
CREATE POLICY treatment_plans_select_policy ON treatment_plans
  FOR SELECT USING (
    public.current_user_has_permission('clinical.read')
    OR (patient_id = public.current_verified_patient_id() AND shared_with_patient = true)
  );

-- 4. Appointments Isolation:
-- Staff can manage clinic appointments; Patient can only view or request appointments for their own verified patient_id.
CREATE POLICY appointments_select_policy ON appointments
  FOR SELECT USING (
    public.current_user_has_permission('appointments.read')
    OR patient_id = public.current_verified_patient_id()
  );

-- 5. Invoices & Financial Isolation:
-- Receptionists/Accountants/Admin can view invoices; Patients can only view their own released invoices.
-- Expenses and Dentist Commissions are strictly restricted to Accountant & Administrator.
CREATE POLICY invoices_select_policy ON invoices
  FOR SELECT USING (
    public.current_user_has_permission('finance.read')
    OR (patient_id = public.current_verified_patient_id() AND released_to_patient = true)
  );

CREATE POLICY expenses_select_policy ON expenses
  FOR SELECT USING (
    public.current_user_has_permission('finance.manage')
  );

-- 6. Private Documents Isolation:
-- Only authorized staff or verified patient when released_to_patient = true.
CREATE POLICY documents_select_policy ON patient_documents
  FOR SELECT USING (
    public.current_user_has_permission('clinical.read')
    OR (patient_id = public.current_verified_patient_id() AND released_to_patient = true)
  );

-- 7. Audit Logs (Append-only for system/staff, readable only by Administrator)
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT USING (
    public.current_user_has_role('admin')
  );
