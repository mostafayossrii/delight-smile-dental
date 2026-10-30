class PatientModel {
  final String id;
  final String fullName;
  final String phone;
  final String email;
  final String gender;
  final String dateOfBirth;
  final String emergencyContactName;
  final String emergencyContactPhone;
  final String preferredBranch;
  final int loyaltyPoints;
  final double creditBalance;
  final String verificationCode;
  final bool isVerified;

  PatientModel({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.gender,
    required this.dateOfBirth,
    this.emergencyContactName = '',
    this.emergencyContactPhone = '',
    this.preferredBranch = 'ALEX-MAIN',
    this.loyaltyPoints = 0,
    this.creditBalance = 0.0,
    this.verificationCode = '',
    this.isVerified = true,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['id'] ?? '',
      fullName: json['full_name'] ?? json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      gender: json['gender'] ?? 'other',
      dateOfBirth: json['date_of_birth'] ?? '2000-01-01',
      emergencyContactName: json['emergency_contact_name'] ?? '',
      emergencyContactPhone: json['emergency_contact_phone'] ?? '',
      preferredBranch: json['preferred_branch'] ?? 'ALEX-MAIN',
      loyaltyPoints: json['points'] ?? 0,
      creditBalance: (json['credit_balance'] ?? 0.0).toDouble(),
      verificationCode: json['verification_code'] ?? '',
      isVerified: json['is_verified'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'phone': phone,
      'email': email,
      'gender': gender,
      'date_of_birth': dateOfBirth,
      'emergency_contact_name': emergencyContactName,
      'emergency_contact_phone': emergencyContactPhone,
      'preferred_branch': preferredBranch,
      'points': loyaltyPoints,
      'credit_balance': creditBalance,
      'verification_code': verificationCode,
      'is_verified': isVerified,
    };
  }
}
