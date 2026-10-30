class AppointmentModel {
  final String id;
  final String patientId;
  final String patientName;
  final String dentistId;
  final String dentistName;
  final String roomCode;
  final DateTime startsAt;
  final DateTime endsAt;
  final String procedureName;
  final String status;
  final String? symptomsNotes;
  final String? attachmentUrl;

  AppointmentModel({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.dentistId,
    required this.dentistName,
    required this.roomCode,
    required this.startsAt,
    required this.endsAt,
    required this.procedureName,
    this.status = 'confirmed',
    this.symptomsNotes,
    this.attachmentUrl,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? '',
      patientId: json['patient_id'] ?? '',
      patientName: json['patient_name'] ?? '',
      dentistId: json['dentist_id'] ?? '',
      dentistName: json['dentist_name'] ?? json['doctor'] ?? 'د. عمر سالم',
      roomCode: json['room_code'] ?? json['room'] ?? 'ROOM-1',
      startsAt: DateTime.parse(json['starts_at'] ?? DateTime.now().toIso8601String()),
      endsAt: DateTime.parse(json['ends_at'] ?? DateTime.now().add(const Duration(minutes: 30)).toIso8601String()),
      procedureName: json['procedure_name'] ?? json['type'] ?? 'كشف واستشارة',
      status: json['status'] ?? 'confirmed',
      symptomsNotes: json['symptoms_notes'] ?? json['reason'],
      attachmentUrl: json['attachment_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient_id': patientId,
      'patient_name': patientName,
      'dentist_id': dentistId,
      'dentist_name': dentistName,
      'room_code': roomCode,
      'starts_at': startsAt.toIso8601String(),
      'ends_at': endsAt.toIso8601String(),
      'procedure_name': procedureName,
      'status': status,
      'symptoms_notes': symptomsNotes,
      'attachment_url': attachmentUrl,
    };
  }
}
