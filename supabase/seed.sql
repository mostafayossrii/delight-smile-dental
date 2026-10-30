-- ============================================================================
-- DEVELOPMENT SEED DATA (DEMO ONLY - NO REAL PATIENT DATA)
-- ============================================================================

INSERT INTO branches (id, code, name_ar, name_en, address, phone, timezone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ALEX-GLIM',
  'فرع الإسكندرية الرئيسي - جليم',
  'Alexandria Main Branch - Glim',
  'الأسكندرية - جليم - ٤ شارع أحمد فتحي برج جليم هايتس الدور الأول',
  '+20 109 131 3305',
  'Africa/Cairo'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO clinic_settings (branch_id, clinic_name_ar, clinic_name_en, default_currency, default_locale, tax_rate_percent)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'عيادة Delight Smile - د. عمر سالم (جميع التخصصات)',
  'Delight Smile Dental Clinic - Dr. Omar Salem',
  'EGP',
  'ar',
  0.00
);

-- Official Clinical Procedures Catalog (Dr. Omar Salem)
INSERT INTO procedures (code, name_ar, name_en, category, estimated_duration_minutes) VALUES
  ('COMP-REST', 'حشو كومبوزيت تجميلي', 'Composite Restoration', 'Restorative', 45),
  ('COMP-VEN', 'فينير كومبوزيت تجميلي', 'Composite veneer', 'Cosmetic', 60),
  ('ENDO-TRT', 'علاج جذور وعصب الأسنان', 'Endodontic treatment', 'Endodontics', 60),
  ('PULPOTOMY', 'بتر لب السن (علاج أسنان الأطفال)', 'Pulpotomy', 'Pediatric', 30),
  ('PULPECTOMY', 'استئصال لب السن الجذري', 'Pulpectomy', 'Pediatric/Endo', 45),
  ('EXTRACT', 'خلع أسنان وجراحة الفم', 'Extraction', 'Surgery', 30),
  ('CROWN-REST', 'تركيبات التيجان والجسور الثابتة', 'Crown restoration', 'Prosthodontics', 45),
  ('PORC-VEN', 'عدسات الفينير الخزفي E-Max', 'Veneers', 'Cosmetic', 60),
  ('DENT-COMPL', 'طقم أسنان صناعي كامل', 'Complete denture', 'Removable Prosthodontics', 60),
  ('DENT-SNGL', 'طقم أسنان أحادي', 'Single denture', 'Removable Prosthodontics', 45),
  ('DENT-PART', 'طقم أسنان صناعي جزئي', 'Partial denture', 'Removable Prosthodontics', 45),
  ('SCALING', 'تنظيف الجير وتلميع الأسنان وعلاج اللثة', 'Scaling', 'Preventive', 30),
  ('WHITENING', 'تبييض الأسنان الاحترافي بالليزر', 'Whitening', 'Cosmetic', 45)
ON CONFLICT (code) DO NOTHING;

-- Roles (6 Staff Roles + Patient Role)
INSERT INTO roles (code, name_ar, name_en, is_system) VALUES
  ('admin', 'مدير النظام (Administrator)', 'Administrator', true),
  ('dentist', 'طبيب أسنان (Dentist)', 'Dentist', true),
  ('receptionist', 'موظف استقبال (Receptionist)', 'Receptionist', true),
  ('assistant', 'مساعد طبيب أسنان (Dental Assistant)', 'Dental Assistant', true),
  ('accountant', 'محاسب مالي (Accountant)', 'Accountant', true),
  ('inventory_manager', 'مسؤول المخازن (Inventory Manager)', 'Inventory Manager', true),
  ('patient', 'مريض (Patient Portal)', 'Patient', true)
ON CONFLICT (code) DO NOTHING;

-- Granular Permissions
INSERT INTO permissions (code, module, description) VALUES
  ('admin.all', 'system', 'Full administrative control over settings, users, roles, and audit logs'),
  ('patients.read', 'patients', 'View patient administrative profiles'),
  ('patients.write', 'patients', 'Create and update patient administrative profiles'),
  ('clinical.read', 'clinical', 'View odontogram, encounters, medical history, and radiographs'),
  ('clinical.write', 'clinical', 'Record odontogram findings, encounters, treatment plans, and prescriptions'),
  ('appointments.read', 'appointments', 'View appointment calendar and waiting room'),
  ('appointments.write', 'appointments', 'Create, reschedule, check-in, and cancel appointments'),
  ('labs.manage', 'labs', 'Create and update dental laboratory orders'),
  ('finance.read', 'finance', 'View patient invoices and record payments'),
  ('finance.manage', 'finance', 'Manage refunds, expenses, commissions, and financial reports'),
  ('inventory.manage', 'inventory', 'Manage dental supplies, batches, stock movements, and purchase orders'),
  ('reports.view', 'reports', 'Access analytics and export reports')
ON CONFLICT (code) DO NOTHING;

-- Adult Permanent Teeth (11-48) & Primary Teeth (51-85) FDI Seed
INSERT INTO teeth (fdi_number, dentition_type, quadrant, name_ar, name_en) VALUES
  (11, 'permanent', 1, 'قاطع مركزي علوي أيمن', 'Upper Right Central Incisor'),
  (12, 'permanent', 1, 'قاطع جانبي علوي أيمن', 'Upper Right Lateral Incisor'),
  (13, 'permanent', 1, 'ناب علوي أيمن', 'Upper Right Canine'),
  (14, 'permanent', 1, 'ضاحك أول علوي أيمن', 'Upper Right First Premolar'),
  (15, 'permanent', 1, 'ضاحك ثاني علوي أيمن', 'Upper Right Second Premolar'),
  (16, 'permanent', 1, 'طاحن أول علوي أيمن', 'Upper Right First Molar'),
  (17, 'permanent', 1, 'طاحن ثاني علوي أيمن', 'Upper Right Second Molar'),
  (18, 'permanent', 1, 'ضرس العقل العلوي الأيمن', 'Upper Right Third Molar'),
  (21, 'permanent', 2, 'قاطع مركزي علوي أيسر', 'Upper Left Central Incisor'),
  (22, 'permanent', 2, 'قاطع جانبي علوي أيسر', 'Upper Left Lateral Incisor'),
  (23, 'permanent', 2, 'ناب علوي أيسر', 'Upper Left Canine'),
  (24, 'permanent', 2, 'ضاحك أول علوي أيسر', 'Upper Left First Premolar'),
  (25, 'permanent', 2, 'ضاحك ثاني علوي أيسر', 'Upper Left Second Premolar'),
  (26, 'permanent', 2, 'طاحن أول علوي أيسر', 'Upper Left First Molar'),
  (27, 'permanent', 2, 'طاحن ثاني علوي أيسر', 'Upper Left Second Molar'),
  (28, 'permanent', 2, 'ضرس العقل العلوي الأيسر', 'Upper Left Third Molar'),
  (31, 'permanent', 3, 'قاطع مركزي سفلي أيسر', 'Lower Left Central Incisor'),
  (32, 'permanent', 3, 'قاطع جانبي سفلي أيسر', 'Lower Left Lateral Incisor'),
  (33, 'permanent', 3, 'ناب سفلي أيسر', 'Lower Left Canine'),
  (34, 'permanent', 3, 'ضاحك أول سفلي أيسر', 'Lower Left First Premolar'),
  (35, 'permanent', 3, 'ضاحك ثاني سفلي أيسر', 'Lower Left Second Premolar'),
  (36, 'permanent', 3, 'طاحن أول سفلي أيسر', 'Lower Left First Molar'),
  (37, 'permanent', 3, 'طاحن ثاني سفلي أيسر', 'Lower Left Second Molar'),
  (38, 'permanent', 3, 'ضرس العقل السفلي الأيسر', 'Lower Left Third Molar'),
  (41, 'permanent', 4, 'قاطع مركزي سفلي أيمن', 'Lower Right Central Incisor'),
  (42, 'permanent', 4, 'قاطع جانبي سفلي أيمن', 'Lower Right Lateral Incisor'),
  (43, 'permanent', 4, 'ناب سفلي أيمن', 'Lower Right Canine'),
  (44, 'permanent', 4, 'ضاحك أول سفلي أيمن', 'Lower Right First Premolar'),
  (45, 'permanent', 4, 'ضاحك ثاني سفلي أيمن', 'Lower Right Second Premolar'),
  (46, 'permanent', 4, 'طاحن أول سفلي أيمن', 'Lower Right First Molar'),
  (47, 'permanent', 4, 'طاحن ثاني سفلي أيمن', 'Lower Right Second Molar'),
  (48, 'permanent', 4, 'ضرس العقل السفلي الأيمن', 'Lower Right Third Molar'),
  (51, 'primary', 5, 'قاطع مركزي لبني علوي أيمن', 'Primary Upper Right Central Incisor'),
  (52, 'primary', 5, 'قاطع جانبي لبني علوي أيمن', 'Primary Upper Right Lateral Incisor'),
  (53, 'primary', 5, 'ناب لبني علوي أيمن', 'Primary Upper Right Canine'),
  (54, 'primary', 5, 'طاحن أول لبني علوي أيمن', 'Primary Upper Right First Molar'),
  (55, 'primary', 5, 'طاحن ثاني لبني علوي أيمن', 'Primary Upper Right Second Molar'),
  (61, 'primary', 6, 'قاطع مركزي لبني علوي أيسر', 'Primary Upper Left Central Incisor'),
  (62, 'primary', 6, 'قاطع جانبي لبني علوي أيسر', 'Primary Upper Left Lateral Incisor'),
  (63, 'primary', 6, 'ناب لبني علوي أيسر', 'Primary Upper Left Canine'),
  (64, 'primary', 6, 'طاحن أول لبني علوي أيسر', 'Primary Upper Left First Molar'),
  (65, 'primary', 6, 'طاحن ثاني لبني علوي أيسر', 'Primary Upper Left Second Molar'),
  (71, 'primary', 7, 'قاطع مركزي لبني سفلي أيسر', 'Primary Lower Left Central Incisor'),
  (72, 'primary', 7, 'قاطع جانبي لبني سفلي أيسر', 'Primary Lower Left Lateral Incisor'),
  (73, 'primary', 7, 'ناب لبني سفلي أيسر', 'Primary Lower Left Canine'),
  (74, 'primary', 7, 'طاحن أول لبني سفلي أيسر', 'Primary Lower Left First Molar'),
  (75, 'primary', 7, 'طاحن ثاني لبني سفلي أيسر', 'Primary Lower Left Second Molar'),
  (81, 'primary', 8, 'قاطع مركزي لبني سفلي أيمن', 'Primary Lower Right Central Incisor'),
  (82, 'primary', 8, 'قاطع جانبي لبني سفلي أيمن', 'Primary Lower Right Lateral Incisor'),
  (83, 'primary', 8, 'ناب لبني سفلي أيمن', 'Primary Lower Right Canine'),
  (84, 'primary', 8, 'طاحن أول لبني سفلي أيمن', 'Primary Lower Right First Molar'),
  (85, 'primary', 8, 'طاحن ثاني لبني سفلي أيمن', 'Primary Lower Right Second Molar')
ON CONFLICT (fdi_number) DO NOTHING;

-- Configurable Procedure Catalog
INSERT INTO services (branch_id, code, category, name_ar, name_en, default_price, default_duration_mins) VALUES
  ('11111111-1111-1111-1111-111111111111', 'SRV-EXAM', 'consultation', 'كشف واستشارة وتصميم ابتسامة', 'Examination & Consultation', 500.00, 30),
  ('11111111-1111-1111-1111-111111111111', 'SRV-SCALE', 'preventive', 'تنظيف جير وتلميع الأسنان', 'Scaling & Polishing', 900.00, 30),
  ('11111111-1111-1111-1111-111111111111', 'SRV-FILL', 'restorative', 'حشو تجميلي كومبوزيت ثلاثي الطبقات', 'Composite Aesthetic Filling', 1200.00, 45),
  ('11111111-1111-1111-1111-111111111111', 'SRV-RCT', 'endodontics', 'علاج جذور وحشو عصب بالميكروسكوب', 'Root Canal Treatment (RCT)', 3200.00, 60),
  ('11111111-1111-1111-1111-111111111111', 'SRV-EXT', 'surgery', 'خلع جراحي / ضرس عقل', 'Surgical Extraction', 1800.00, 45),
  ('11111111-1111-1111-1111-111111111111', 'SRV-ZIRC', 'prosthodontics', 'طربوش زيركون متعدد الطبقات', 'Multilayer Zirconia Crown', 3800.00, 45),
  ('11111111-1111-1111-1111-111111111111', 'SRV-VENEER', 'cosmetic', 'عدسة فينير تجميلية E-Max', 'E-Max Porcelain Veneer', 6500.00, 60),
  ('11111111-1111-1111-1111-111111111111', 'SRV-IMPLANT', 'implantology', 'زراعة سن تيتانيوم سويسري', 'Swiss Titanium Dental Implant', 14000.00, 90),
  ('11111111-1111-1111-1111-111111111111', 'SRV-ALIGN', 'orthodontics', 'تقويم أسنان شفاف (Clear Aligner)', 'Clear Aligner Orthodontics', 22000.00, 45),
  ('11111111-1111-1111-1111-111111111111', 'SRV-LASER', 'cosmetic', 'تبييض الأسنان وتوريد اللثة بالليزر', 'Laser Whitening & Depigmentation', 4500.00, 45)
ON CONFLICT (code) DO NOTHING;
