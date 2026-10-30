class OdontogramFindingModel {
  final String id;
  final String patientId;
  final int fdiNumber;
  final String surface; // WHOLE, M, D, O, I, B, F, L, P
  final String findingType; // healthy, caries, filling, crown, veneer, root_canal, implant, missing
  final bool isHistorical;
  final String status; // existing, planned, in_progress, completed
  final String? notes;
  final DateTime recordedAt;

  OdontogramFindingModel({
    required this.id,
    required this.patientId,
    required this.fdiNumber,
    required this.surface,
    required this.findingType,
    this.isHistorical = false,
    this.status = 'existing',
    this.notes,
    required this.recordedAt,
  });

  factory OdontogramFindingModel.fromJson(Map<String, dynamic> json) {
    return OdontogramFindingModel(
      id: json['id'] ?? '',
      patientId: json['patient_id'] ?? '',
      fdiNumber: json['fdi_number'] ?? 11,
      surface: json['surface'] ?? 'WHOLE',
      findingType: json['finding_type'] ?? 'healthy',
      isHistorical: json['is_historical'] ?? false,
      status: json['status'] ?? 'existing',
      notes: json['notes'],
      recordedAt: DateTime.parse(json['recorded_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient_id': patientId,
      'fdi_number': fdiNumber,
      'surface': surface,
      'finding_type': findingType,
      'is_historical': isHistorical,
      'status': status,
      'notes': notes,
      'recorded_at': recordedAt.toIso8601String(),
    };
  }
}
