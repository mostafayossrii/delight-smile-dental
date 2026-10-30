-- ============================================================================
-- DELIGHT SMILE DENTAL CLINIC MANAGEMENT SYSTEM
-- Migration 03: Comprehensive Enterprise Additions (Rooms, Leaves, Treasuries,
-- Insurance Claims, Laser Pulses, Attendance, Chat & Loyalty)
-- ============================================================================

-- 1. Clinic Treatment Rooms & Physical Equipment Assets
CREATE TABLE IF NOT EXISTS clinic_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  floor_number INTEGER DEFAULT 1,
  chair_model TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, room_code)
);

CREATE TABLE IF NOT EXISTS equipment_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  room_id UUID REFERENCES clinic_rooms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  asset_tag TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- e.g., dental_chair, autoclave, xray_sensor, laser_unit
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_due DATE,
  is_operational BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Dentist Leaves and Blocked Scheduling Periods
CREATE TABLE IF NOT EXISTS dentist_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'vacation', -- vacation, conference, sick, emergency, blocked
  reason TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_leave_time_range CHECK (ends_at > starts_at)
);

-- 3. Treasuries & Cash/Bank Movements
CREATE TABLE IF NOT EXISTS treasuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'wallet', 'pos_terminal')),
  current_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'EGP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treasury_id UUID NOT NULL REFERENCES treasuries(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer_in', 'transfer_out', 'refund_payout')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(14,2) NOT NULL,
  reference_table TEXT,
  reference_id TEXT,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Insurance Companies, Policies & Claims
CREATE TABLE IF NOT EXISTS insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  default_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  coverage_limit NUMERIC(12,2) NOT NULL DEFAULT 50000.00,
  patient_copay_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  requires_prior_approval BOOLEAN NOT NULL DEFAULT false,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, patient_id)
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  claim_amount NUMERIC(12,2) NOT NULL CHECK (claim_amount > 0),
  approved_amount NUMERIC(12,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'settled')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ
);

-- 5. Laser Devices & Pulse Count Auditing
CREATE TABLE IF NOT EXISTS laser_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  room_id UUID REFERENCES clinic_rooms(id) ON DELETE SET NULL,
  model_name TEXT NOT NULL, -- e.g. Diode Laser 980nm, Epic Pro
  serial_number TEXT UNIQUE NOT NULL,
  total_device_pulses BIGINT NOT NULL DEFAULT 0,
  last_maintenance_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS laser_pulse_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES laser_devices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- Laser Whitening, Gum Depigmentation, Gingivectomy
  anatomical_area TEXT NOT NULL,
  spot_size TEXT DEFAULT '8 mm',
  fluence TEXT DEFAULT '7.5 J/cm²',
  pulses_used INTEGER NOT NULL CHECK (pulses_used > 0),
  counter_before BIGINT NOT NULL,
  counter_after BIGINT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_counter_sequence CHECK (counter_after = counter_before + pulses_used)
);

-- 6. Staff GPS Attendance & Work Shifts
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  ip_address TEXT,
  distance_from_branch_meters NUMERIC(8,2),
  is_within_geofence BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Internal Team Messaging & Announcements
CREATE TABLE IF NOT EXISTS internal_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_general_channel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES internal_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Patient Loyalty & VIP Reward Points Ledger
CREATE TABLE IF NOT EXISTS patient_loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  points_change INTEGER NOT NULL, -- Positive for earn, negative for redeem
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned_visit', 'redeemed_discount', 'bonus_promo', 'adjustment')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
