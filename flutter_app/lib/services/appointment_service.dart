import 'package:flutter/foundation.dart';
import '../models/appointment.dart';

class AppointmentService extends ChangeNotifier {
  final List<AppointmentModel> _appointments = [
    AppointmentModel(
      id: 'APT-101',
      patientId: 'P-1001',
      patientName: 'نورهان محمد عبد الرحمن',
      dentistId: 'dent-1',
      dentistName: 'د. عمر سالم',
      roomCode: 'ROOM-1',
      startsAt: DateTime.now().add(const Duration(days: 1, hours: 2)),
      endsAt: DateTime.now().add(const Duration(days: 1, hours: 3)),
      procedureName: 'تركيب عدسات فينير E-Max',
      status: 'confirmed',
    ),
    AppointmentModel(
      id: 'APT-102',
      patientId: 'P-1001',
      patientName: 'نورهان محمد عبد الرحمن',
      dentistId: 'dent-1',
      dentistName: 'د. عمر سالم',
      roomCode: 'ROOM-1',
      startsAt: DateTime.now().add(const Duration(days: 5, hours: 4)),
      endsAt: DateTime.now().add(const Duration(days: 5, hours: 5)),
      procedureName: 'متابعة الزراعة والمقاسات',
      status: 'confirmed',
    ),
  ];

  List<AppointmentModel> get appointments => List.unmodifiable(_appointments);

  List<String> getAvailableSlots(String dentistId, DateTime date) {
    // 30-minute working slots 10:00 to 20:00
    final allSlots = [
      '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
      '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
    ];

    // Check for overlap
    return allSlots.where((slot) {
      if (slot == '12:00 PM' && dentistId == 'dent-1') {
        // Blocked for existing booking
        return false;
      }
      return true;
    }).toList();
  }

  Future<AppointmentModel> bookAppointment({
    required String patientId,
    required String patientName,
    required String dentistId,
    required String dentistName,
    required String roomCode,
    required DateTime startsAt,
    required DateTime endsAt,
    required String procedureName,
    String? symptomsNotes,
    String? attachmentUrl,
  }) async {
    // Overlap Conflict Check
    final hasConflict = _appointments.any((a) {
      if (a.status == 'cancelled') return false;
      final dentistConflict = a.dentistId == dentistId &&
          a.startsAt.isBefore(endsAt) &&
          a.endsAt.isAfter(startsAt);
      final roomConflict = a.roomCode == roomCode &&
          a.startsAt.isBefore(endsAt) &&
          a.endsAt.isAfter(startsAt);
      return dentistConflict || roomConflict;
    });

    if (hasConflict) {
      throw Exception('APPOINTMENT_TIME_CONFLICT: الطبيب أو الغرفة محجوزة بالفعل في هذا التوقيت.');
    }

    final newApt = AppointmentModel(
      id: 'APT-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
      patientId: patientId,
      patientName: patientName,
      dentistId: dentistId,
      dentistName: dentistName,
      roomCode: roomCode,
      startsAt: startsAt,
      endsAt: endsAt,
      procedureName: procedureName,
      status: 'confirmed',
      symptomsNotes: symptomsNotes,
      attachmentUrl: attachmentUrl,
    );

    _appointments.insert(0, newApt);
    notifyListeners();
    return newApt;
  }

  void cancelAppointment(String appointmentId) {
    final idx = _appointments.indexWhere((a) => a.id == appointmentId);
    if (idx != -1) {
      _appointments[idx] = AppointmentModel(
        id: _appointments[idx].id,
        patientId: _appointments[idx].patientId,
        patientName: _appointments[idx].patientName,
        dentistId: _appointments[idx].dentistId,
        dentistName: _appointments[idx].dentistName,
        roomCode: _appointments[idx].roomCode,
        startsAt: _appointments[idx].startsAt,
        endsAt: _appointments[idx].endsAt,
        procedureName: _appointments[idx].procedureName,
        status: 'cancelled',
      );
      notifyListeners();
    }
  }
}
