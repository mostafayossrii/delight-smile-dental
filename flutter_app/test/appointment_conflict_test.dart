import 'package:flutter_test/flutter_test.dart';
import 'package:delight_smile_clinic/services/appointment_service.dart';

void main() {
  group('Appointment Conflict Engine in Flutter App', () {
    test('Overlapping appointments for same dentist throws conflict exception', () async {
      final service = AppointmentService();
      final now = DateTime.now();
      final start = DateTime(now.year, now.month, now.day, 14, 0);
      final end = DateTime(now.year, now.month, now.day, 15, 0);

      // Book first appointment
      await service.bookAppointment(
        patientId: 'P-1001',
        patientName: 'نورهان محمد',
        dentistId: 'dent-1',
        dentistName: 'د. عمر سالم',
        roomCode: 'ROOM-1',
        startsAt: start,
        endsAt: end,
        procedureName: 'Veneer',
      );

      // Overlap with same dentist (14:30 to 15:30) MUST throw conflict
      expect(
        () => service.bookAppointment(
          patientId: 'P-1002',
          patientName: 'أحمد إبراهيم',
          dentistId: 'dent-1',
          dentistName: 'د. عمر سالم',
          roomCode: 'ROOM-2',
          startsAt: DateTime(now.year, now.month, now.day, 14, 30),
          endsAt: DateTime(now.year, now.month, now.day, 15, 30),
          procedureName: 'Laser Whitening',
        ),
        throwsA(isA<Exception>()),
      );
    });

    test('Available slots exclude already booked periods', () {
      final service = AppointmentService();
      final slots = service.getAvailableSlots('dent-1', DateTime.now());
      expect(slots.contains('12:00 PM'), false);
      expect(slots.contains('10:00 AM'), true);
    });
  });
}
