import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(2, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').refine((val) => val !== '123', {
    message: 'Cannot reuse initial development password'
  })
});

export const PatientSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNo: z.string().optional()
});

export const OdontogramFindingSchema = z.object({
  patientId: z.string().min(1),
  fdiNumber: z.number().int(),
  surface: z.enum(['WHOLE', 'M', 'D', 'O', 'I', 'B', 'F', 'L', 'P']),
  findingType: z.enum(['healthy', 'caries', 'filling', 'crown', 'veneer', 'root_canal', 'implant', 'missing', 'bridge', 'fracture']),
  isHistorical: z.boolean().default(false),
  status: z.enum(['existing', 'planned', 'in_progress', 'completed']).default('existing'),
  notes: z.string().optional()
});

export const AppointmentSchema = z.object({
  patientId: z.string().min(1),
  dentistId: z.string().min(1),
  roomCode: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  procedureName: z.string().min(2),
  reason: z.string().optional()
});

export const PortalVerifySchema = z.object({
  patientId: z.string().min(1),
  verificationToken: z.string().min(10, 'Valid clinic verification token required')
});
