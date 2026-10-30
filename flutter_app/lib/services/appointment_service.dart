import 'package:flutter/foundation.dart';
import '../models/appointment.dart';

class AppointmentService extends ChangeNotifier {
  final List<AppointmentModel> _appointments = [];

  List<AppointmentModel> get appointments => List.unmodifiable(_appointments);

  List<String> getAvailableSlots(String dentistId, DateTime date) {
    // Friday is completely closed
    if (date.weekday == DateTime.friday) {
      return [];
    }

    // Saturday, Monday, Wednesday: 12:00 PM - 06:00 PM
    if (date.weekday == DateTime.saturday ||
        date.weekday == DateTime.monday ||
        date.weekday == DateTime.wednesday) {
      return [
        '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
      ];
    }

    // Sunday, Tuesday, Thursday: 04:00 PM - 10:00 PM
    if (date.weekday == DateTime.sunday ||
        date.weekday == DateTime.tuesday ||
        date.weekday == DateTime.thursday) {
      return [
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
        '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
        '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'
      ];
    }

    return [];
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
