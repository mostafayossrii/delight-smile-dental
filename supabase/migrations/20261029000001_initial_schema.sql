-- ============================================================================
-- DELIGHT SMILE DENTAL CLINIC MANAGEMENT SYSTEM (DR. OMAR SALEM)
-- Migration 01: Complete Normalized PostgreSQL Schema (38 Tables)
-- Single-branch default with multi-branch future readiness (branch_id FK)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 0. Clinic Branches & Settings
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  clinic_name_ar TEXT NOT NULL DEFAULT 'عيادة Delight Smile - د. عمر سالم',
  clinic_name_en TEXT NOT NULL DEFAULT 'Delight Smile Dental Clinic - Dr. Omar Salem',
  default_currency TEXT NOT NULL DEFAULT 'EGP',
  default_locale TEXT NOT NULL DEFAULT 'ar',
  tax_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  working_hours JSONB NOT NULL DEFAULT '{"start":"10:00","end":"22:00","SlotMinutes":30}',
  cancellation_cutoff_hours INTEGER NOT NULL DEFAULT 12,
  auto_deduct_inventory BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1. Profiles, Roles & Granular Permissions
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- admin, dentist, receptionist, assistant, accountant, inventory_manager, patient
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- e.g. patients.read, odontogram.write, finance.manage
  module TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE profile_roles (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, role_id)
);

-- 2. Dentists & Rooms/Chairs
CREATE TABLE dentists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id),
  specialty_ar TEXT NOT NULL,
  specialty_en TEXT NOT NULL,
  license_number TEXT,
  default_commission_percent NUMERIC(5,2) NOT NULL DEFAULT 40.00,
  working_schedule JSONB NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Patients, Portal Account Linking & Medical History
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  patient_number TEXT UNIQUE NOT NULL, -- e.g. DS-1001
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_no TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  credit_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  qr_checkin_token TEXT UNIQUE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patients_lookup ON patients(patient_number, phone, full_name);

-- Secure Patient Portal Linking (Requires verified one-time invitation code, never auto-claimed by phone/name alone)
CREATE TABLE patient_user_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  verification_code_hash TEXT NOT NULL,
  verification_expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  linked_by_staff UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medical_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  conditions JSONB NOT NULL DEFAULT '[]',
  current_medications JSONB NOT NULL DEFAULT '[]',
  previous_dental_treatments TEXT,
  bleeding_disorder BOOLEAN NOT NULL DEFAULT false,
  diabetes BOOLEAN NOT NULL DEFAULT false,
  hypertension BOOLEAN NOT NULL DEFAULT false,
  pregnancy BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  reaction_notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Configurable Services / Procedure Catalog
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  default_price NUMERIC(12,2) NOT NULL CHECK (default_price >= 0),
  default_duration_mins INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Appointments & Conflict Prevention
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  service_id UUID REFERENCES services(id),
  room_code TEXT NOT NULL DEFAULT 'ROOM-1',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
    status IN ('requested', 'booked', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show')
  ),
  booking_source TEXT NOT NULL DEFAULT 'reception',
  reason TEXT,
  internal_notes TEXT, -- Never exposed to patient portal
  follow_up_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_appointment_time_order CHECK (ends_at > starts_at)
);

-- Database-level GiST exclusion constraints preventing overlapping active bookings for the same dentist or same room
ALTER TABLE appointments
  ADD CONSTRAINT excl_dentist_overlapping_appointments
  EXCLUDE USING gist (
    dentist_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'));

ALTER TABLE appointments
  ADD CONSTRAINT excl_room_overlapping_appointments
  EXCLUDE USING gist (
    branch_id WITH =,
    room_code WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'));

CREATE TABLE appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Clinical Encounters (Versioned & Auditable)
CREATE TABLE clinical_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  appointment_id UUID REFERENCES appointments(id),
  encounter_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  chief_complaint TEXT NOT NULL,
  examination_findings TEXT,
  diagnoses_recorded TEXT,
  clinical_notes TEXT,
  follow_up_instructions TEXT,
  is_signed BOOLEAN NOT NULL DEFAULT false,
  signed_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  amended_from_id UUID REFERENCES clinical_encounters(id),
  released_to_patient BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. FDI Odontogram Reference & Tooth Surface Findings
CREATE TABLE teeth (
  fdi_number INTEGER PRIMARY KEY CHECK (
    (fdi_number BETWEEN 11 AND 18) OR
    (fdi_number BETWEEN 21 AND 28) OR
    (fdi_number BETWEEN 31 AND 38) OR
    (fdi_number BETWEEN 41 AND 48) OR
    (fdi_number BETWEEN 51 AND 55) OR
    (fdi_number BETWEEN 61 AND 65) OR
    (fdi_number BETWEEN 71 AND 75) OR
    (fdi_number BETWEEN 81 AND 85)
  ),
  dentition_type TEXT NOT NULL CHECK (dentition_type IN ('permanent', 'primary')),
  quadrant INTEGER NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL
);

CREATE TABLE odontogram_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  fdi_number INTEGER NOT NULL REFERENCES teeth(fdi_number),
  surface TEXT NOT NULL DEFAULT 'WHOLE' CHECK (surface IN ('WHOLE', 'M', 'D', 'O', 'I', 'B', 'F', 'L', 'P')),
  finding_type TEXT NOT NULL CHECK (
    finding_type IN ('healthy', 'caries', 'filling', 'crown', 'veneer', 'root_canal', 'implant', 'missing', 'bridge', 'fracture')
  ),
  is_historical BOOLEAN NOT NULL DEFAULT false, -- Distinguishes pre-existing historical findings from current findings
  status TEXT NOT NULL DEFAULT 'existing' CHECK (status IN ('existing', 'planned', 'in_progress', 'completed')),
  notes TEXT,
  dentist_id UUID REFERENCES dentists(id),
  encounter_id UUID REFERENCES clinical_encounters(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_odontogram_patient ON odontogram_findings(patient_id, fdi_number);

-- 8. Treatment Plans, Plan Items & Completed Procedures
CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (
    status IN ('proposed', 'approved', 'in_progress', 'completed', 'cancelled')
  ),
  estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  approved_quotation NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  patient_consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    patient_consent_status IN ('pending', 'acknowledged', 'declined')
  ),
  shared_with_patient BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE treatment_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  fdi_number INTEGER REFERENCES teeth(fdi_number),
  surface TEXT DEFAULT 'WHOLE',
  stage_order INTEGER NOT NULL DEFAULT 1,
  dentist_id UUID REFERENCES dentists(id),
  estimated_price NUMERIC(12,2) NOT NULL CHECK (estimated_price >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (
    status IN ('planned', 'approved', 'in_progress', 'completed', 'cancelled')
  ),
  planned_date DATE,
  completed_date DATE,
  clinical_notes TEXT
);

-- Completed Procedures recorded separately from proposed plan items
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES clinical_encounters(id),
  treatment_plan_item_id UUID REFERENCES treatment_plan_items(id),
  service_id UUID NOT NULL REFERENCES services(id),
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  fdi_number INTEGER REFERENCES teeth(fdi_number),
  surface TEXT DEFAULT 'WHOLE',
  fee_charged NUMERIC(12,2) NOT NULL CHECK (fee_charged >= 0),
  clinical_notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Prescriptions, Consent Forms & Private Documents
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES clinical_encounters(id),
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  medications JSONB NOT NULL, -- [{name, dosage, frequency, duration, instructions}]
  notes TEXT,
  is_authorized BOOLEAN NOT NULL DEFAULT true,
  released_to_patient BOOLEAN NOT NULL DEFAULT true,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES treatment_plans(id),
  title TEXT NOT NULL,
  body_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'revoked')),
  signed_by_name TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('xray', 'cbct', 'photo', 'consent', 'lab_sheet', 'other')),
  title TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'clinical-private',
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  released_to_patient BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Dental Laboratories & Lab Orders
CREATE TABLE laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE laboratory_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  treatment_plan_id UUID REFERENCES treatment_plans(id),
  laboratory_id UUID NOT NULL REFERENCES laboratories(id),
  fdi_numbers TEXT NOT NULL,
  work_description TEXT NOT NULL,
  shade TEXT NOT NULL,
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE NOT NULL,
  actual_receipt_date DATE,
  lab_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (
    status IN ('draft', 'sent', 'in_progress', 'received', 'fitted', 'rejected', 'cancelled')
  ),
  assigned_staff_id UUID REFERENCES profiles(id),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Billing, Invoices, Payments, Refunds, Expenses & Dentist Commissions
-- Rule: Proposed treatments are NEVER counted as revenue. Only finalized invoices from completed procedures/services count as billed, and only recorded payments minus refunds count as collected revenue.
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES dentists(id),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'EGP',
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'refunded', 'cancelled')),
  released_to_patient BOOLEAN NOT NULL DEFAULT true,
  issued_by UUID REFERENCES profiles(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id),
  service_id UUID REFERENCES services(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'instapay', 'wallet', 'patient_credit')),
  reference_no TEXT,
  received_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  approved_by UUID REFERENCES profiles(id),
  refunded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dentist_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID NOT NULL REFERENCES dentists(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  payment_id UUID REFERENCES payments(id),
  commission_rate_percent NUMERIC(5,2) NOT NULL,
  net_collected_basis NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'accrued' CHECK (status IN ('accrued', 'settled', 'reversed')),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Dental Inventory, Batches, Suppliers & Purchase Orders
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  balance_owed NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  sku TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL, -- composite, anesthetic, disposables, sterilization, endodontic, impression, instruments
  unit TEXT NOT NULL,
  min_stock_level NUMERIC(10,2) NOT NULL DEFAULT 5,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  supplier_id UUID REFERENCES suppliers(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  quantity_received NUMERIC(10,2) NOT NULL,
  quantity_remaining NUMERIC(10,2) NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES inventory_batches(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receipt', 'consumption', 'adjustment', 'discard_expired')),
  quantity_change NUMERIC(10,2) NOT NULL,
  reason TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  po_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'paid', 'cancelled')),
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Notifications & Immutable Audit Logs
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp', 'push')),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (
    delivery_status IN ('queued', 'provider_unconfigured', 'sent_to_provider', 'delivered', 'failed')
  ),
  provider_response TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_table, entity_id, created_at DESC);
