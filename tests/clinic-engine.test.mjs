import test from 'node:test';
import assert from 'node:assert/strict';
import { ClinicEngine } from '../src/lib/services/clinic-engine.mjs';

test('1. Dev Admin Login (admin / 123) & Forced First-Login Password Change', () => {
  const engine = new ClinicEngine();

  // Login with initial dev credentials
  const session = engine.authenticate('admin', '123');
  assert.equal(session.username, 'admin');
  assert.equal(session.role, 'admin');
  assert.equal(session.mustChangePassword, true);

  // Attempting any privileged action before changing password MUST be blocked
  assert.throws(() => {
    engine.getPatientRecord({ id: session.userId, role: 'admin', mustChangePassword: true }, 'DS-1001');
  }, /PASSWORD_CHANGE_REQUIRED_FIRST/);

  // Reject weak password or reusing '123'
  assert.throws(() => {
    engine.changePassword(session.userId, '123');
  }, /WEAK_PASSWORD_REJECTED/);

  // Change to strong password
  const res = engine.changePassword(session.userId, 'StrongDentalAdmin#2026');
  assert.equal(res.mustChangePassword, false);

  // Re-login with old password '123' fails, new password succeeds
  assert.throws(() => engine.authenticate('admin', '123'), /INVALID_CREDENTIALS/);
  const updatedSession = engine.authenticate('admin', 'StrongDentalAdmin#2026');
  assert.equal(updatedSession.mustChangePassword, false);
});

test('2. Role-Based Access Control (RBAC) Server-Side Enforcement', () => {
  const engine = new ClinicEngine();
  const receptionist = { id: 'usr-rec-1', role: 'receptionist', mustChangePassword: false };
  const dentist = { id: 'usr-dentist-1', role: 'dentist', mustChangePassword: false };
  const accountant = { id: 'usr-acc-1', role: 'accountant', mustChangePassword: false };

  // Receptionist can read patients and book appointments, but CANNOT write odontogram or process refunds
  assert.equal(engine.hasPermission(receptionist, 'appointments.write'), true);
  assert.equal(engine.hasPermission(receptionist, 'clinical.write'), false);
  assert.throws(() => {
    engine.recordOdontogramFinding(receptionist, {
      patientId: 'DS-1001',
      fdiNumber: 11,
      surface: 'B',
      findingType: 'veneer'
    });
  }, /FORBIDDEN_MISSING_PERMISSION:clinical.write/);

  // Dentist can record odontogram findings, but CANNOT process financial refunds
  const finding = engine.recordOdontogramFinding(dentist, {
    patientId: 'DS-1001',
    fdiNumber: 11,
    surface: 'F',
    findingType: 'veneer',
    isHistorical: false,
    status: 'completed'
  });
  assert.equal(finding.fdiNumber, 11);
  assert.equal(finding.surface, 'F');

  assert.throws(() => {
    engine.assertPermission(dentist, 'finance.manage');
  }, /FORBIDDEN_MISSING_PERMISSION:finance.manage/);

  assert.equal(engine.hasPermission(accountant, 'finance.manage'), true);
});

test('3. Patient Portal Isolation & Verification Token Requirement', () => {
  const engine = new ClinicEngine();
  const verifiedPatient = { id: 'usr-pat-1', role: 'patient', mustChangePassword: false };

  // Verified patient DS-1001 can read their own record
  const ownRecord = engine.getPatientRecord(verifiedPatient, 'DS-1001');
  assert.equal(ownRecord.patientNumber, 'DS-1001');

  // Verified patient DS-1001 is strictly blocked from accessing DS-1002
  assert.throws(() => {
    engine.getPatientRecord(verifiedPatient, 'DS-1002');
  }, /FORBIDDEN_PATIENT_ISOLATION/);

  // Unverified patient cannot claim DS-1002 without valid clinic verification token
  assert.throws(() => {
    engine.linkPatientPortalAccount('usr-pat-unverified', 'DS-1002', 'WRONG-CODE-123');
  }, /INVALID_VERIFICATION_TOKEN/);

  const linkRes = engine.linkPatientPortalAccount('usr-pat-2', 'DS-1002', 'VERIFY-DS-1002-9981');
  assert.equal(linkRes.linked, true);
});

test('4. Appointment Conflict Detection (Same Dentist or Same Room Overlap Blocked)', () => {
  const engine = new ClinicEngine();
  const reception = { id: 'usr-rec-1', role: 'receptionist', mustChangePassword: false };

  const apt1 = engine.bookAppointment(reception, {
    patientId: 'DS-1001',
    dentistId: 'dent-1',
    roomCode: 'ROOM-1',
    startsAt: '2026-10-30T12:00:00.000Z',
    endsAt: '2026-10-30T13:00:00.000Z',
    procedureName: 'E-Max Veneer Fitting'
  });
  assert.equal(apt1.status, 'confirmed');

  // Overlapping time for same dentist in a different room -> MUST fail
  assert.throws(() => {
    engine.bookAppointment(reception, {
      patientId: 'DS-1002',
      dentistId: 'dent-1',
      roomCode: 'ROOM-2',
      startsAt: '2026-10-30T12:30:00.000Z',
      endsAt: '2026-10-30T13:30:00.000Z',
      procedureName: 'Laser Whitening'
    });
  }, /APPOINTMENT_TIME_CONFLICT/);

  // Overlapping time for different dentist in the SAME room -> MUST fail
  assert.throws(() => {
    engine.bookAppointment(reception, {
      patientId: 'DS-1002',
      dentistId: 'dent-2',
      roomCode: 'ROOM-1',
      startsAt: '2026-10-30T12:15:00.000Z',
      endsAt: '2026-10-30T12:45:00.000Z',
      procedureName: 'Root Canal'
    });
  }, /APPOINTMENT_TIME_CONFLICT/);
});

test('5. FDI Odontogram Validation (Adult 11-48 & Primary 51-85)', () => {
  const engine = new ClinicEngine();
  const dentist = { id: 'usr-dentist-1', role: 'dentist', mustChangePassword: false };

  // Valid adult tooth #36 & primary tooth #55
  const f1 = engine.recordOdontogramFinding(dentist, {
    patientId: 'DS-1001',
    fdiNumber: 36,
    surface: 'O',
    findingType: 'implant',
    isHistorical: false
  });
  assert.equal(f1.fdiNumber, 36);

  const f2 = engine.recordOdontogramFinding(dentist, {
    patientId: 'DS-1001',
    fdiNumber: 55,
    surface: 'M',
    findingType: 'caries',
    isHistorical: true
  });
  assert.equal(f2.isHistorical, true);

  // Invalid FDI tooth number #99 -> MUST fail
  assert.throws(() => {
    engine.recordOdontogramFinding(dentist, {
      patientId: 'DS-1001',
      fdiNumber: 99,
      surface: 'O',
      findingType: 'caries'
    });
  }, /INVALID_FDI_TOOTH_NUMBER:99/);
});

test('6. Financial Separation (Proposed Plan != Revenue), Invoice Math, Payments, Refunds & Dentist Commissions', () => {
  const engine = new ClinicEngine();
  const dentist = { id: 'usr-dentist-1', role: 'dentist', mustChangePassword: false };
  const accountant = { id: 'usr-acc-1', role: 'accountant', mustChangePassword: false };

  // Create a proposed treatment plan worth 20,000 EGP (with 1,000 discount = 19,000 approved quotation)
  const plan = engine.createTreatmentPlan(dentist, {
    patientId: 'DS-1001',
    title: 'Smile Makeover Plan',
    items: [
      { fdiNumber: 11, surface: 'F', procedureName: 'E-Max Veneer', estimatedPrice: 6500, discount: 500 },
      { fdiNumber: 21, surface: 'F', procedureName: 'E-Max Veneer', estimatedPrice: 6500, discount: 500 },
      { fdiNumber: 36, surface: 'WHOLE', procedureName: 'Swiss Implant', estimatedPrice: 7000, discount: 0 }
    ]
  });
  assert.equal(plan.approvedQuotation, 19000);

  // Verify proposed treatment plan is NOT counted as collected or billed revenue
  let summary = engine.getFinancialSummary();
  assert.equal(summary.proposedPipelineExcludedFromRevenue, 19000);
  assert.equal(summary.totalBilled, 0);
  assert.equal(summary.netCollectedRevenue, 0);

  // Issue an invoice for completed veneers (13,000 subtotal - 1,000 discount = 12,000 EGP)
  const inv = engine.createInvoice(accountant, {
    patientId: 'DS-1001',
    dentistId: 'dent-1',
    dentistCommissionPct: 45,
    discountAmount: 1000,
    taxRatePercent: 0,
    items: [
      { description: 'E-Max Veneer #11', quantity: 1, unitPrice: 6500 },
      { description: 'E-Max Veneer #21', quantity: 1, unitPrice: 6500 }
    ]
  });
  assert.equal(inv.totalAmount, 12000);
  assert.equal(inv.balanceDue, 12000);

  // Record partial payment of 8,000 EGP -> Dentist commission (45%) = 3,600 EGP
  const payRes = engine.recordPayment(accountant, {
    invoiceId: inv.id,
    amount: 8000,
    paymentMethod: 'card'
  });
  assert.equal(payRes.invoice.balanceDue, 4000);
  assert.equal(payRes.invoice.status, 'partially_paid');
  assert.equal(payRes.commission.commissionAmount, 3600);

  // Process a 2,000 EGP refund -> Reverses 900 EGP of dentist commission
  const refRes = engine.recordRefund(accountant, {
    invoiceId: inv.id,
    paymentId: payRes.payment.id,
    amount: 2000,
    reason: 'Patient courtesy adjustment'
  });
  assert.equal(refRes.invoice.balanceDue, 6000);
  assert.equal(refRes.commissionReversal, -900);

  summary = engine.getFinancialSummary();
  assert.equal(summary.totalBilled, 12000);
  assert.equal(summary.grossCollected, 8000);
  assert.equal(summary.totalRefunded, 2000);
  assert.equal(summary.netCollectedRevenue, 6000);
  assert.equal(summary.netDentistCommissions, 2700);
  assert.ok(engine.auditLogs.length >= 4);
});

test('7. Patient Registration & Duplicate Phone/Email Prevention', () => {
  const engine = new ClinicEngine();

  // Successful new registration
  const res = engine.registerPatient({
    fullName: 'محمود عبد السلام',
    phone: '+201099887766',
    email: 'mahmoud@example.com',
    password: 'PatientSecurePass#2026',
    gender: 'male',
    dateOfBirth: '1992-05-14',
    emergencyContactName: 'عمر عبد السلام',
    emergencyContactPhone: '+201011223344',
    preferredBranch: 'ALEX-MAIN'
  });
  assert.equal(res.success, true);
  assert.ok(res.patient.id.startsWith('DS-'));
  assert.ok(res.verificationCode.startsWith('VERIFY-'));

  // Duplicate registration with same phone MUST fail
  assert.throws(() => {
    engine.registerPatient({
      fullName: 'محمود مكرر',
      phone: '+201099887766',
      email: 'other_email@example.com',
      password: 'Pass#12345678'
    });
  }, /DUPLICATE_PATIENT_PHONE_OR_EMAIL/);

  // Duplicate registration with same email MUST fail
  assert.throws(() => {
    engine.registerPatient({
      fullName: 'محمود مكرر 2',
      phone: '+201299999999',
      email: 'mahmoud@example.com',
      password: 'Pass#12345678'
    });
  }, /DUPLICATE_PATIENT_PHONE_OR_EMAIL/);
});

test('8. Real-Time Appointment Slot Generation & Dentist Availability', () => {
  const engine = new ClinicEngine();
  const reception = { id: 'usr-rec-1', role: 'receptionist', mustChangePassword: false };

  // Book dentist dent-1 at 12:00 PM
  engine.bookAppointment(reception, {
    patientId: 'DS-1001',
    dentistId: 'dent-1',
    roomCode: 'ROOM-1',
    startsAt: '2026-10-30T12:00:00.000Z',
    endsAt: '2026-10-30T12:30:00.000Z',
    procedureName: 'Consultation'
  });

  const slots = engine.getAvailableAppointmentSlots('ALEX-MAIN', 'dent-1', '2026-10-30');
  const slot1200 = slots.find((s) => s.slot === '12:00 PM');
  const slot1230 = slots.find((s) => s.slot === '12:30 PM');

  assert.equal(slot1200.isAvailable, false);
  assert.equal(slot1230.isAvailable, true);
});

test('9. Laser Pulse Session Meter Audit Verification', () => {
  const engine = new ClinicEngine();
  const dentist = { id: 'usr-dentist-1', role: 'dentist', mustChangePassword: false };

  // Valid session: counterAfter === counterBefore + pulsesUsed
  const session = engine.recordLaserPulseSession(dentist, {
    deviceId: 'DEV-LASER-1',
    patientId: 'DS-1001',
    dentistId: 'dent-1',
    serviceName: 'Laser Teeth Whitening',
    pulsesUsed: 450,
    counterBefore: 14200,
    counterAfter: 14650
  });
  assert.equal(session.pulsesUsed, 450);

  // Invalid meter audit sequence MUST throw error
  assert.throws(() => {
    engine.recordLaserPulseSession(dentist, {
      deviceId: 'DEV-LASER-1',
      patientId: 'DS-1001',
      dentistId: 'dent-1',
      serviceName: 'Laser Teeth Whitening',
      pulsesUsed: 450,
      counterBefore: 14200,
      counterAfter: 14999 // Mismatch!
    });
  }, /INVALID_METER_COUNTER_SEQUENCE/);
});

test('10. Staff Geolocation Attendance & Alexandria Geofence Validation', () => {
  const engine = new ClinicEngine();

  // Within 500m of Alexandria Clinic
  const inside = engine.recordStaffAttendance('usr-dentist-1', {
    latitude: 31.2005,
    longitude: 29.9189,
    ipAddress: '196.132.13.25'
  });
  assert.equal(inside.isWithinGeofence, true);
  assert.equal(inside.status, 'present');

  // Far away (Cairo Coordinates: 30.0444, 31.2357)
  const outside = engine.recordStaffAttendance('usr-dentist-1', {
    latitude: 30.0444,
    longitude: 31.2357,
    ipAddress: '41.45.35.39'
  });
  assert.equal(outside.isWithinGeofence, false);
  assert.equal(outside.status, 'flagged_outside_geofence');
});

test('11. Patient Loyalty & VIP Reward Points Ledger', () => {
  const engine = new ClinicEngine();

  // Patient DS-1001 earns 500 points
  const earnRes = engine.manageLoyaltyPoints('DS-1001', 500, 'earned_visit', 'Routine Checkup');
  assert.equal(earnRes.balanceAfter, 500);

  // Patient DS-1001 redeems 200 points for discount
  const redeemRes = engine.manageLoyaltyPoints('DS-1001', -200, 'redeemed_discount', 'Whitening Discount');
  assert.equal(redeemRes.balanceAfter, 300);
});
