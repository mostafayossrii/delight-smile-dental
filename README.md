# Delight Smile Dental Clinic Management System (`Next.js + TypeScript + Supabase + PWA`)

A full-stack, single-branch (multi-branch ready) Dental Clinic Management System & Isolated Patient Portal tailored for **Delight Smile Clinic — Dr. Omar Salem**.

---

## 1. Architecture Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend & App Router** | Next.js 14 (React 18 + TypeScript) | Staff Dashboard, Clinical Workspace, and Isolated Patient Portal |
| **Styling & Themes** | Tailwind CSS + shadcn/ui patterns | RTL Arabic & LTR English, Dark (Obsidian/Gold) & Light (Clinical Teal) themes |
| **Database & RLS** | Supabase PostgreSQL (38 Normalized Tables) | GiST exclusion constraints for double-booking + strict Row Level Security |
| **Authentication** | Supabase Auth + Server RBAC | Username/Email mapping, session management, 6 staff roles + verified patient role |
| **File Storage** | Private Supabase Storage (`clinical-private`) | Short-lived signed URLs for radiographs, CBCT scans, and signed consents |
| **Mobile Experience** | Progressive Web App (`manifest.json` + `sw.js`) | Installable on Android/iOS without caching confidential clinical data offline |
| **Testing** | Node Test Runner / Vitest + Playwright | Automated tests for auth, RBAC, patient isolation, conflicts, odontogram, and billing |

---

## 2. Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Populate `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. **Apply PostgreSQL Migrations & RLS Policies**:
   ```bash
   npx supabase db push
   # Or run supabase/migrations/20261029000001_initial_schema.sql
   # and supabase/migrations/20261029000002_rls_policies.sql in the Supabase SQL Editor
   ```
4. **Seed Development Data (Local Development Only)**:
   ```bash
   npm run db:seed
   ```
   - **Development Administrator Account**:
     - **Username**: `admin` (mapped on the backend to `admin@delightsmile.local`)
     - **Initial Password**: `123`
     - **Mandatory First-Login Password Change**: `must_change_password` is set to `true`. All API endpoints reject operations with `PASSWORD_CHANGE_REQUIRED_FIRST` until the administrator sets a strong password (minimum 8 characters, cannot reuse `123`).
   - **Production Bootstrap Warning**: `scripts/seed-dev.ts` aborts immediately if `NODE_ENV=production` or `ALLOW_DEV_SEED !== 'true'`. In production, create the initial administrator via Supabase Auth invitation and assign the `admin` role in `profile_roles`.
5. **Run Automated Tests**:
   ```bash
   npm test
   ```
6. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 3. Financial & Clinical Accounting Rules

1. **Proposed Treatment vs. Revenue**: Treatment plans (`treatment_plans` and `treatment_plan_items`) represent clinical proposals and price quotations only. They are **never** counted as billed or collected revenue.
2. **Billed Revenue**: Generated only when completed procedures are itemized on an issued `invoice`.
3. **Collected Revenue & Dentist Commissions**: Calculated strictly from recorded `payments` minus `refunds`. Dentist commissions (`dentist_commissions`) accrue on net collected payments and automatically record a negative reversal entry when a refund is processed.
4. **Currency & Tax**: Defaults to `EGP` with configurable tax rates in `clinic_settings`. Electronic tax invoicing integrations (such as Egyptian ETA or Saudi ZATCA) require official government API credentials and cryptographic signing certificates before claiming legal tax compliance.

---

## 4. Backup, Recovery & Healthcare Privacy Checklist

### Automated Backup & Recovery (Supabase PostgreSQL + Storage)
- **Daily Physical/Logical Backups**: Enable Supabase Point-in-Time Recovery (PITR) or schedule daily `pg_dump --format=custom` backups encrypted at rest.
- **Restoration Verification**: Test restoring backups quarterly to an isolated staging project using `pg_restore --clean --no-owner -d $STAGING_DB_URL backup.dump` and verify row counts across `patients`, `clinical_encounters`, `invoices`, and `audit_logs`.
- **Private Storage Backup**: Synchronize the private `clinical-private` bucket (radiographs and signed consents) to encrypted cold storage.

### Healthcare Privacy & Regulatory Verification Before Production
- Verify compliance with applicable national regulations (e.g., Egyptian Personal Data Protection Law No. 151 of 2020 and Ministry of Health medical record retention guidelines) with qualified legal counsel.
- Obtain explicit patient consent for electronic health record storage and WhatsApp/SMS appointment reminders.

---

## 5. Completed Features & Known Limitations

- **Completed**:
  - 38-table normalized PostgreSQL schema with GiST overlap exclusion constraints on `appointments` (preventing double-booking of dentists or rooms).
  - Row Level Security (RLS) policies and server-side RBAC for Administrator, Dentist, Receptionist, Dental Assistant, Accountant, Inventory Manager, and Patient Portal.
  - Interactive Adult (`11–48`) and Primary (`51–85`) FDI Odontogram with 5-surface selection (`M, D, O/I, B/F, L/P`), historical vs. current findings, and encounter versioning.
  - Secure Patient Portal account linking requiring a clinic-issued verification code (`VERIFY-...`), preventing public registration from claiming existing records by name or phone number alone.
  - Complete billing, partial payments, refunds, commission accrual/reversal, laboratory orders, and batch-level inventory tracking.
- **Known Limitations**:
  - External SMS, WhatsApp Cloud API, and Email delivery remain in `provider_unconfigured` status until live API keys (`WHATSAPP_CLOUD_API_TOKEN`, `TWILIO_AUTH_TOKEN`, `RESEND_API_KEY`) are supplied in `.env.local`.
  - PWA offline mode intentionally does **not** cache confidential medical records or patient profiles on the device for security and privacy protection.
