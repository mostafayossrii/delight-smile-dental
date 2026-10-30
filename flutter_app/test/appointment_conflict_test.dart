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

    test('Available slots follow official clinic schedule and Friday closed', () {
      final service = AppointmentService();
      // Friday is closed
      final fridayDate = DateTime(2026, 10, 30); // Friday
      expect(service.getAvailableSlots('dent-1', fridayDate).isEmpty, true);

      // Saturday (12 PM - 6 PM)
      final saturdayDate = DateTime(2026, 10, 31); // Saturday
      final satSlots = service.getAvailableSlots('dent-1', saturdayDate);
      expect(satSlots.contains('12:00 PM'), true);
      expect(satSlots.contains('05:30 PM'), true);

      // Sunday (4 PM - 10 PM)
      final sundayDate = DateTime(2026, 11, 1); // Sunday
      final sunSlots = service.getAvailableSlots('dent-1', sundayDate);
      expect(sunSlots.contains('04:00 PM'), true);
      expect(sunSlots.contains('09:30 PM'), true);
    });
  });
}
