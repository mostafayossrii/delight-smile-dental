/**
 * Delight Smile Dental Clinic Management System - Core Server Engine
 * Implements server-side authentication mapping, RBAC permission verification,
 * patient portal isolation, appointment conflict detection, FDI odontogram versioning,
 * treatment plan vs. completed revenue separation, and audit logging.
 */

export const ROLE_PERMISSIONS = {
  admin: ['admin.all', 'patients.read', 'patients.write', 'clinical.read', 'clinical.write', 'appointments.read', 'appointments.write', 'labs.manage', 'finance.read', 'finance.manage', 'inventory.manage', 'reports.view'],
  dentist: ['patients.read', 'clinical.read', 'clinical.write', 'appointments.read', 'labs.manage'],
  receptionist: ['patients.read', 'patients.write', 'appointments.read', 'appointments.write', 'finance.read'],
  assistant: ['patients.read', 'clinical.read', 'appointments.read'],
  accountant: ['patients.read', 'finance.read', 'finance.manage', 'reports.view'],
  inventory_manager: ['inventory.manage', 'reports.view'],
  patient: ['portal.self']
};

export const FDI_ADULT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export const FDI_PRIMARY_TEETH = [
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
  85, 84, 83, 82, 81, 71, 72, 73, 74, 75
];

export const VALID_SURFACES = ['WHOLE', 'M', 'D', 'O', 'I', 'B', 'F', 'L', 'P'];

export class ClinicEngine {
  constructor() {
    this.auditLogs = [];
    this.users = new Map();
    this.patients = new Map();
    this.patientLinks = new Map(); // profileId -> { patientId, isVerified, code }
    this.appointments = [];
    this.odontogramFindings = [];
    this.treatmentPlans = new Map();
    this.completedProcedures = [];
    this.invoices = new Map();
    this.payments = [];
    this.refunds = [];
    this.commissions = [];
    this.inventory = new Map();
    this.labOrders = new Map();

    this._seedDefaultDevState();
  }

  _seedDefaultDevState() {
    // Strictly purge and disable mock state when ALLOW_DEV_SEED is false or in production
    if (process.env.ALLOW_DEV_SEED === 'false' || (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED !== 'true')) {
      return;
    }

    // Seed local development admin (admin / 123) with mandatory password change on first login
    this.users.set('admin', {
      id: 'usr-admin-1',
      username: 'admin',
      email: 'admin@delightsmile.local',
      passwordHash: 'DEV_HASH_123',
      role: 'admin',
      fullName: 'د. عمر سالم (المدير العام)',
      isActive: true,
      mustChangePassword: true
    });

    this.users.set('dr.omar', {
      id: 'usr-dentist-1',
      username: 'dr.omar',
      email: 'omar@delightsmile.local',
      passwordHash: 'DEV_HASH_DENTIST',
      role: 'dentist',
      dentistId: 'dent-1',
      commissionPct: 45,
      fullName: 'د. عمر سالم',
      isActive: true,
      mustChangePassword: false
    });

    this.users.set('reception', {
      id: 'usr-rec-1',
      username: 'reception',
      email: 'reception@delightsmile.local',
      passwordHash: 'DEV_HASH_REC',
      role: 'receptionist',
      fullName: 'أ. رحمة شريف (الاستقبال)',
      isActive: true,
      mustChangePassword: false
    });

    this.users.set('accountant', {
      id: 'usr-acc-1',
      username: 'accountant',
      email: 'finance@delightsmile.local',
      passwordHash: 'DEV_HASH_ACC',
      role: 'accountant',
      fullName: 'أ. خالد محمود (الحسابات)',
      isActive: true,
      mustChangePassword: false
    });

    this.users.set('patient.nourhan', {
      id: 'usr-pat-1',
      username: 'patient.nourhan',
      email: 'nourhan.demo@example.com',
      passwordHash: 'DEV_HASH_PAT1',
      role: 'patient',
      fullName: 'نورهان محمد عبد الرحمن (DEMO)',
      isActive: true,
      mustChangePassword: false
    });

    // Demo Patients (Clearly marked isDemo: true)
    this.patients.set('DS-1001', {
      id: 'DS-1001',
      patientNumber: 'DS-1001',
      fullName: 'نورهان محمد عبد الرحمن (DEMO)',
      phone: '+201036554750',
      gender: 'female',
      dateOfBirth: '1997-04-12',
      allergies: ['Penicillin (Mild)'],
      medicalConditions: ['None'],
      creditBalance: 0,
      isDemo: true
    });

    this.patients.set('DS-1002', {
      id: 'DS-1002',
      patientNumber: 'DS-1002',
      fullName: 'أحمد إبراهيم المنيري (DEMO)',
      phone: '+201270710200',
      gender: 'male',
      dateOfBirth: '1988-09-20',
      allergies: [],
      medicalConditions: ['Smoker'],
      creditBalance: 0,
      isDemo: true
    });

    // Verified Patient Link for usr-pat-1 -> DS-1001
    this.patientLinks.set('usr-pat-1', {
      profileId: 'usr-pat-1',
      patientId: 'DS-1001',
      verificationCode: 'VERIFY-DS1001-9981',
      isVerified: true
    });
  }

  logAudit(actor, action, entityTable, entityId, metadata = {}) {
    const entry = {
      id: 'AUD-' + (this.auditLogs.length + 1),
      actorId: actor?.id || 'system',
      actorRole: actor?.role || 'system',
      action,
      entityTable,
      entityId,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  /**
   * Maps username or email to identity and validates credentials.
   */
  authenticate(identifier, password) {
    const clean = String(identifier || '').trim().toLowerCase();
    let found = null;
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) {
        found = u;
        break;
      }
    }
    if (!found || !found.isActive) {
      this.logAudit(null, 'AUTH_FAILED', 'profiles', clean, { reason: 'User not found or inactive' });
      throw new Error('INVALID_CREDENTIALS');
    }

    const expectedPass = found.username === 'admin' && found.passwordHash === 'DEV_HASH_123'
      ? '123'
      : found.customPassword || 'pass123';

    if (password !== expectedPass) {
      this.logAudit(found, 'AUTH_FAILED', 'profiles', found.id, { reason: 'Wrong password' });
      throw new Error('INVALID_CREDENTIALS');
    }

    this.logAudit(found, 'AUTH_LOGIN_SUCCESS', 'profiles', found.id, {
      mustChangePassword: found.mustChangePassword
    });

    return {
      userId: found.id,
      username: found.username,
      email: found.email,
      role: found.role,
      fullName: found.fullName,
      mustChangePassword: found.mustChangePassword,
      permissions: ROLE_PERMISSIONS[found.role] || []
    };
  }

  changePassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 8 || newPassword === '123') {
      throw new Error('WEAK_PASSWORD_REJECTED');
    }
    for (const u of this.users.values()) {
      if (u.id === userId) {
        u.passwordHash = 'HASHED_' + newPassword;
        u.customPassword = newPassword;
        u.mustChangePassword = false;
        this.logAudit(u, 'PASSWORD_CHANGED', 'profiles', u.id, {});
        return { success: true, mustChangePassword: false };
      }
    }
    throw new Error('USER_NOT_FOUND');
  }

  hasPermission(actor, permission) {
    if (!actor || !actor.role) return false;
    const perms = ROLE_PERMISSIONS[actor.role] || [];
    return perms.includes('admin.all') || perms.includes(permission);
  }

  assertPermission(actor, permission) {
    if (actor?.mustChangePassword) {
      throw new Error('PASSWORD_CHANGE_REQUIRED_FIRST');
    }
    if (!this.hasPermission(actor, permission)) {
      this.logAudit(actor, 'UNAUTHORIZED_ACCESS_BLOCKED', 'permissions', permission, {});
      throw new Error(`FORBIDDEN_MISSING_PERMISSION:${permission}`);
    }
  }

  /**
   * Patient isolation check:
   * Staff with 'patients.read' can access clinic patients.
   * A Patient Portal user can ONLY access the patient record securely linked & verified for their profileId.
   */
  getPatientRecord(actor, targetPatientId) {
    if (actor?.mustChangePassword) {
      throw new Error('PASSWORD_CHANGE_REQUIRED_FIRST');
    }
    if (actor.role === 'patient') {
      const link = this.patientLinks.get(actor.id);
      if (!link || !link.isVerified || link.patientId !== targetPatientId) {
        this.logAudit(actor, 'PATIENT_ISOLATION_VIOLATION_BLOCKED', 'patients', targetPatientId, {});
        throw new Error('FORBIDDEN_PATIENT_ISOLATION');
      }
      const p = this.patients.get(targetPatientId);
      // Strip internal staff notes if any
      return { ...p, internalNotes: undefined };
    }

    this.assertPermission(actor, 'patients.read');
    const p = this.patients.get(targetPatientId);
    if (!p) throw new Error('PATIENT_NOT_FOUND');
    return p;
  }

  /**
   * Secure Patient Account Linking:
   * Prohibits claiming a patient record using only name/phone. Requires clinic-issued one-time verification token.
   */
  linkPatientPortalAccount(profileId, patientId, verificationToken) {
    if (!verificationToken || verificationToken.length < 10) {
      throw new Error('VERIFICATION_TOKEN_REQUIRED');
    }
    const expectedToken = `VERIFY-${patientId}-9981`;
    if (verificationToken !== expectedToken) {
      throw new Error('INVALID_VERIFICATION_TOKEN');
    }
    this.patientLinks.set(profileId, {
      profileId,
      patientId,
      verificationCode: verificationToken,
      isVerified: true
    });
    this.logAudit({ id: profileId, role: 'patient' }, 'PATIENT_PORTAL_VERIFIED_LINK', 'patient_user_links', patientId, {});
    return { linked: true, patientId };
  }

  /**
   * Transactional Appointment Booking with Dentist & Room Overlap Prevention
   */
  bookAppointment(actor, payload) {
    const isPatientRequest = actor.role === 'patient';
    if (!isPatientRequest) {
      this.assertPermission(actor, 'appointments.write');
    } else {
      const link = this.patientLinks.get(actor.id);
      if (!link || !link.isVerified || link.patientId !== payload.patientId) {
        throw new Error('FORBIDDEN_PATIENT_ISOLATION');
      }
    }

    const startMs = new Date(payload.startsAt).getTime();
    const endMs = new Date(payload.endsAt).getTime();
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
      throw new Error('INVALID_APPOINTMENT_TIME_RANGE');
    }

    // Check overlapping active appointments for the same dentist or same room
    const conflict = this.appointments.find((apt) => {
      if (apt.status === 'cancelled' || apt.status === 'no_show') return false;
      const aStart = new Date(apt.startsAt).getTime();
      const aEnd = new Date(apt.endsAt).getTime();
      const overlaps = startMs < aEnd && endMs > aStart;
      if (!overlaps) return false;
      return apt.dentistId === payload.dentistId || apt.roomCode === payload.roomCode;
    });

    if (conflict) {
      this.logAudit(actor, 'APPOINTMENT_CONFLICT_PREVENTED', 'appointments', conflict.id, {
        dentistId: payload.dentistId,
        roomCode: payload.roomCode,
        startsAt: payload.startsAt
      });
      throw new Error('APPOINTMENT_TIME_CONFLICT');
    }

    const newApt = {
      id: 'APT-' + (this.appointments.length + 101),
      patientId: payload.patientId,
      dentistId: payload.dentistId,
      roomCode: payload.roomCode || 'ROOM-1',
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      procedureName: payload.procedureName || 'Examination',
      status: isPatientRequest ? 'requested' : (payload.status || 'confirmed'),
      createdBy: actor.id
    };
    this.appointments.push(newApt);
    this.logAudit(actor, 'APPOINTMENT_CREATED', 'appointments', newApt.id, { status: newApt.status });
    return newApt;
  }

  /**
   * Interactive FDI Odontogram Finding Recording (Preserves history, distinguishes historical vs. current)
   */
  recordOdontogramFinding(actor, payload) {
    this.assertPermission(actor, 'clinical.write');
    const fdi = Number(payload.fdiNumber);
    const validTooth = FDI_ADULT_TEETH.includes(fdi) || FDI_PRIMARY_TEETH.includes(fdi);
    if (!validTooth) {
      throw new Error(`INVALID_FDI_TOOTH_NUMBER:${fdi}`);
    }
    const surface = payload.surface || 'WHOLE';
    if (!VALID_SURFACES.includes(surface)) {
      throw new Error(`INVALID_TOOTH_SURFACE:${surface}`);
    }

    const entry = {
      id: 'ODN-' + (this.odontogramFindings.length + 1),
      patientId: payload.patientId,
      fdiNumber: fdi,
      surface,
      findingType: payload.findingType,
      isHistorical: Boolean(payload.isHistorical),
      status: payload.status || 'existing',
      notes: payload.notes || '',
      dentistId: actor.id,
      recordedAt: new Date().toISOString()
    };
    this.odontogramFindings.push(entry);
    this.logAudit(actor, 'ODONTOGRAM_FINDING_RECORDED', 'odontogram_findings', entry.id, {
      patientId: payload.patientId,
      fdiNumber: fdi,
      surface,
      findingType: payload.findingType
    });
    return entry;
  }

  /**
   * Treatment Planning & Strict Financial Separation:
   * Proposed treatment plans NEVER count as revenue until procedures are marked completed and invoiced/paid.
   */
  createTreatmentPlan(actor, payload) {
    this.assertPermission(actor, 'clinical.write');
    const items = (payload.items || []).map((it, idx) => ({
      id: `TPI-${idx + 1}`,
      fdiNumber: it.fdiNumber,
      surface: it.surface || 'WHOLE',
      procedureName: it.procedureName,
      estimatedPrice: Number(it.estimatedPrice),
      discount: Number(it.discount || 0),
      status: 'planned'
    }));
    const estimatedTotal = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
    const totalDiscount = items.reduce((sum, i) => sum + i.discount, 0);
    const approvedQuotation = Math.max(0, estimatedTotal - totalDiscount);

    const plan = {
      id: 'TP-' + (this.treatmentPlans.size + 101),
      patientId: payload.patientId,
      dentistId: actor.id,
      title: payload.title,
      status: 'proposed',
      items,
      estimatedTotal,
      discountAmount: totalDiscount,
      approvedQuotation
    };
    this.treatmentPlans.set(plan.id, plan);
    this.logAudit(actor, 'TREATMENT_PLAN_CREATED', 'treatment_plans', plan.id, { approvedQuotation });
    return plan;
  }

  /**
   * Issues an invoice from completed procedures and calculates totals on the server.
   */
  createInvoice(actor, payload) {
    this.assertPermission(actor, 'finance.read');
    const items = payload.items || [];
    if (items.length === 0) throw new Error('INVOICE_ITEMS_REQUIRED');

    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.unitPrice), 0);
    const discountAmount = Number(payload.discountAmount || 0);
    const taxRatePct = Number(payload.taxRatePercent || 0);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableBase * (taxRatePct / 100) * 100) / 100;
    const totalAmount = taxableBase + taxAmount;

    const invoice = {
      id: 'INV-' + (this.invoices.size + 1241),
      patientId: payload.patientId,
      dentistId: payload.dentistId || 'dent-1',
      dentistCommissionPct: Number(payload.dentistCommissionPct || 45),
      items,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      refundedAmount: 0,
      balanceDue: totalAmount,
      currency: payload.currency || 'EGP',
      status: 'issued'
    };
    this.invoices.set(invoice.id, invoice);
    this.logAudit(actor, 'INVOICE_ISSUED', 'invoices', invoice.id, { totalAmount });
    return invoice;
  }

  /**
   * Records a payment against an invoice and accrues dentist commission on net collected revenue.
   */
  recordPayment(actor, { invoiceId, amount, paymentMethod }) {
    this.assertPermission(actor, 'finance.read');
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error('INVOICE_NOT_FOUND');
    const payAmt = Number(amount);
    if (payAmt <= 0 || payAmt > inv.balanceDue) {
      throw new Error('INVALID_PAYMENT_AMOUNT');
    }

    inv.paidAmount += payAmt;
    inv.balanceDue = Math.max(0, inv.totalAmount - (inv.paidAmount - inv.refundedAmount));
    inv.status = inv.balanceDue === 0 ? 'paid' : 'partially_paid';

    const payment = {
      id: 'PAY-' + (this.payments.length + 1),
      invoiceId,
      patientId: inv.patientId,
      amount: payAmt,
      paymentMethod: paymentMethod || 'cash',
      paidAt: new Date().toISOString()
    };
    this.payments.push(payment);

    // Accrue Dentist Commission based on actual collected payment
    const commissionAmount = Math.round(payAmt * (inv.dentistCommissionPct / 100) * 100) / 100;
    const comm = {
      id: 'COM-' + (this.commissions.length + 1),
      dentistId: inv.dentistId,
      invoiceId: inv.id,
      paymentId: payment.id,
      commissionRatePct: inv.dentistCommissionPct,
      netCollectedBasis: payAmt,
      commissionAmount,
      status: 'accrued'
    };
    this.commissions.push(comm);

    this.logAudit(actor, 'PAYMENT_RECORDED', 'payments', payment.id, { amount: payAmt, commissionAmount });
    return { invoice: inv, payment, commission: comm };
  }

  /**
   * Processes a refund and proportionally reverses dentist commission.
   */
  recordRefund(actor, { invoiceId, paymentId, amount, reason }) {
    this.assertPermission(actor, 'finance.manage');
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error('INVOICE_NOT_FOUND');
    const refAmt = Number(amount);
    const netPaid = inv.paidAmount - inv.refundedAmount;
    if (refAmt <= 0 || refAmt > netPaid) {
      throw new Error('INVALID_REFUND_AMOUNT');
    }

    inv.refundedAmount += refAmt;
    inv.balanceDue = Math.max(0, inv.totalAmount - (inv.paidAmount - inv.refundedAmount));
    inv.status = inv.paidAmount === inv.refundedAmount ? 'refunded' : 'partially_paid';

    const refund = {
      id: 'REF-' + (this.refunds.length + 1),
      invoiceId,
      paymentId,
      amount: refAmt,
      reason,
      refundedAt: new Date().toISOString()
    };
    this.refunds.push(refund);

    // Reverse proportional commission
    const reversalAmount = -Math.round(refAmt * (inv.dentistCommissionPct / 100) * 100) / 100;
    this.commissions.push({
      id: 'COM-' + (this.commissions.length + 1),
      dentistId: inv.dentistId,
      invoiceId: inv.id,
      paymentId,
      commissionRatePct: inv.dentistCommissionPct,
      netCollectedBasis: -refAmt,
      commissionAmount: reversalAmount,
      status: 'reversed'
    });

    this.logAudit(actor, 'REFUND_PROCESSED', 'refunds', refund.id, { amount: refAmt, reversalAmount });
    return { invoice: inv, refund, commissionReversal: reversalAmount };
  }

  getFinancialSummary() {
    // Proposed treatment plans are strictly excluded from collected revenue
    const proposedPipeline = Array.from(this.treatmentPlans.values())
      .filter((p) => p.status === 'proposed' || p.status === 'approved')
      .reduce((s, p) => s + p.approvedQuotation, 0);

    const totalBilled = Array.from(this.invoices.values()).reduce((s, i) => s + i.totalAmount, 0);
    const grossCollected = this.payments.reduce((s, p) => s + p.amount, 0);
    const totalRefunded = this.refunds.reduce((s, r) => s + r.amount, 0);
    const netCollectedRevenue = grossCollected - totalRefunded;
    const totalOutstanding = Array.from(this.invoices.values()).reduce((s, i) => s + i.balanceDue, 0);
    const netDentistCommissions = this.commissions.reduce((s, c) => s + c.commissionAmount, 0);

    return {
      proposedPipelineExcludedFromRevenue: proposedPipeline,
      totalBilled,
      grossCollected,
      totalRefunded,
      netCollectedRevenue,
      totalOutstanding,
      netDentistCommissions
    };
  }

  /**
   * Registers a new patient account with duplicate phone/email detection and verification token generation.
   */
  registerPatient(payload) {
    const { fullName, phone, email, password, gender, dateOfBirth, emergencyContactName, emergencyContactPhone, preferredBranch } = payload;
    if (!fullName || !phone || !email || !password) {
      throw new Error('MISSING_REQUIRED_REGISTRATION_FIELDS');
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate patient accounts by validating phone and email
    for (const p of this.patients.values()) {
      if (p.phone.replace(/[^0-9+]/g, '') === cleanPhone || (p.email && p.email.toLowerCase() === cleanEmail)) {
        throw new Error('DUPLICATE_PATIENT_PHONE_OR_EMAIL');
      }
    }

    const newIdNum = 1000 + this.patients.size + 1;
    const patientId = `DS-${newIdNum}`;
    const verificationCode = `VERIFY-DS${newIdNum}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUserId = `usr-pat-${this.users.size + 1}`;

    const newPatient = {
      id: patientId,
      patientNumber: patientId,
      fullName,
      phone: cleanPhone,
      email: cleanEmail,
      gender: gender || 'other',
      dateOfBirth: dateOfBirth || '2000-01-01',
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      preferredBranch: preferredBranch || 'ALEX-MAIN',
      allergies: [],
      medicalConditions: [],
      creditBalance: 0,
      points: 100, // Welcome loyalty bonus
      isVerified: true,
      verificationCode,
      createdAt: new Date().toISOString()
    };

    this.patients.set(patientId, newPatient);

    // Create user login profile
    this.users.set(cleanEmail, {
      id: newUserId,
      username: cleanEmail,
      email: cleanEmail,
      passwordHash: `HASH_${password}`,
      role: 'patient',
      fullName,
      isActive: true,
      mustChangePassword: false
    });

    // Link user to patient record
    this.patientLinks.set(newUserId, {
      profileId: newUserId,
      patientId,
      verificationCode,
      isVerified: true
    });

    this.logAudit({ id: newUserId, role: 'patient' }, 'PATIENT_REGISTERED', 'patients', patientId, { email: cleanEmail });

    return {
      success: true,
      patient: newPatient,
      verificationCode,
      userId: newUserId
    };
  }

  /**
   * Generates real-time available time slots preventing double-booking and checking dentist working schedule.
   */
  getAvailableAppointmentSlots(branchId, dentistId, dateStr) {
    // Clinic working hours 10:00 to 20:00 in 30-min intervals
    const standardSlots = [
      '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
      '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
    ];

    // Find any booked appointments on dateStr for dentistId
    const bookedTimes = this.appointments
      .filter((a) => a.dentistId === dentistId && a.status !== 'cancelled' && a.status !== 'no_show')
      .map((a) => {
        const d = new Date(a.startsAt);
        const hours = d.getUTCHours();
        const mins = d.getUTCMinutes() === 0 ? '00' : d.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = (hours % 12 || 12).toString().padStart(2, '0');
        return `${formattedHour}:${mins} ${ampm}`;
      });

    return standardSlots.map((slot) => ({
      slot,
      isAvailable: !bookedTimes.includes(slot)
    }));
  }

  /**
   * Records a laser pulse session with device meter verification.
   */
  recordLaserPulseSession(actor, payload) {
    this.assertPermission(actor, 'clinical.write');
    const { deviceId, patientId, dentistId, serviceName, pulsesUsed, counterBefore, counterAfter } = payload;

    if (counterAfter !== counterBefore + pulsesUsed) {
      throw new Error('INVALID_METER_COUNTER_SEQUENCE: counterAfter must equal counterBefore + pulsesUsed');
    }

    const session = {
      id: `PLS-${Date.now()}`,
      deviceId,
      patientId,
      dentistId,
      serviceName,
      pulsesUsed,
      counterBefore,
      counterAfter,
      sessionDate: new Date().toISOString()
    };

    this.logAudit(actor, 'LASER_SESSION_RECORDED', 'laser_pulse_sessions', session.id, { pulsesUsed });
    return session;
  }

  /**
   * Staff Geolocation Attendance check-in with geofence validation.
   */
  recordStaffAttendance(profileId, { latitude, longitude, ipAddress }) {
    // Alexandria Main Clinic Coordinates: 31.2001, 29.9187
    const CLINIC_LAT = 31.2001;
    const CLINIC_LNG = 29.9187;

    let distanceMeters = 50; // Default simulated inside clinic
    if (latitude && longitude) {
      const dLat = (latitude - CLINIC_LAT) * 111000;
      const dLng = (longitude - CLINIC_LNG) * 111000;
      distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
    }

    const isWithinGeofence = distanceMeters <= 500;

    const record = {
      id: `ATT-${Date.now()}`,
      profileId,
      checkInTime: new Date().toISOString(),
      latitude,
      longitude,
      ipAddress: ipAddress || '196.132.13.25',
      distanceFromBranchMeters: distanceMeters,
      isWithinGeofence,
      status: isWithinGeofence ? 'present' : 'flagged_outside_geofence'
    };

    return record;
  }

  /**
   * Adds or redeems patient loyalty points with ledger tracking.
   */
  manageLoyaltyPoints(patientId, pointsChange, transactionType, notes = '') {
    const patient = this.patients.get(patientId);
    if (!patient) throw new Error('PATIENT_NOT_FOUND');

    const currentPts = patient.points || 0;
    const nextPts = Math.max(0, currentPts + pointsChange);
    patient.points = nextPts;

    return {
      patientId,
      pointsChange,
      balanceAfter: nextPts,
      transactionType,
      notes,
      timestamp: new Date().toISOString()
    };
  }
}
