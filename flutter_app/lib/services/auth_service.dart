import 'package:flutter/foundation.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/patient.dart';

class AuthService extends ChangeNotifier {
  final LocalAuthentication _localAuth = LocalAuthentication();
  PatientModel? _currentPatient;
  String _userRole = 'patient';
  bool _isAuthenticated = false;
  bool _biometricEnabled = false;

  PatientModel? get currentPatient => _currentPatient;
  String get userRole => _userRole;
  bool get isAuthenticated => _isAuthenticated;
  bool get biometricEnabled => _biometricEnabled;

  AuthService() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _biometricEnabled = prefs.getBool('biometric_enabled') ?? false;
    final savedUserId = prefs.getString('saved_user_id');
    if (savedUserId != null) {
      _currentPatient = PatientModel(
        id: savedUserId,
        fullName: prefs.getString('saved_user_name') ?? '',
        phone: prefs.getString('saved_user_phone') ?? '',
        email: prefs.getString('saved_user_email') ?? '',
        gender: prefs.getString('saved_user_gender') ?? 'other',
        dateOfBirth: prefs.getString('saved_user_dob') ?? '',
        loyaltyPoints: prefs.getInt('saved_loyalty_points') ?? 0,
        creditBalance: prefs.getDouble('saved_credit_balance') ?? 0.0,
      );
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<bool> authenticateWithBiometrics() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      if (!canCheck) return false;

      final didAuth = await _localAuth.authenticate(
        localizedReason: 'الرجاء التحقق من هويتك لتسجيل الدخول إلى عيادة Delight Smile',
        options: const AuthenticationOptions(biometricOnly: true, stickyAuth: true),
      );
      if (didAuth) {
        _isAuthenticated = true;
        notifyListeners();
      }
      return didAuth;
    } catch (e) {
      debugPrint('Biometric auth error: $e');
      return false;
    }
  }

  Future<bool> login(String identifier, String password) async {
    final cleanId = identifier.trim();
    if (cleanId.isEmpty || password.isEmpty) return false;

    // Doctor & Staff Credentials Verification
    if ((cleanId == 'dr.omar' || cleanId == 'dromarsalem@delightsmile.com' || cleanId == '01034366020') &&
        password == 'DelightSmile2026!DoctorAlex') {
      _userRole = 'admin';
      _currentPatient = null;
      _isAuthenticated = true;
      notifyListeners();
      return true;
    }

    if ((cleanId == 'reception' || cleanId == 'reception@delightsmile.com' || cleanId == '01091313305') &&
        password == 'DelightSmile2026!Reception') {
      _userRole = 'receptionist';
      _currentPatient = null;
      _isAuthenticated = true;
      notifyListeners();
      return true;
    }

    // Patient login
    final prefs = await SharedPreferences.getInstance();
    final savedPhone = prefs.getString('saved_user_phone');
    final savedEmail = prefs.getString('saved_user_email');
    if ((cleanId == savedPhone || cleanId == savedEmail) && password.length >= 6) {
      _userRole = 'patient';
      _isAuthenticated = true;
      notifyListeners();
      return true;
    }

    return false;
  }

  Future<bool> registerPatient(Map<String, dynamic> data) async {
    _currentPatient = PatientModel(
      id: 'DS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      fullName: data['fullName'] ?? '',
      phone: data['phone'] ?? '',
      email: data['email'] ?? '',
      gender: data['gender'] ?? 'other',
      dateOfBirth: data['dateOfBirth'] ?? '2000-01-01',
      emergencyContactName: data['emergencyContactName'] ?? '',
      emergencyContactPhone: data['emergencyContactPhone'] ?? '',
      preferredBranch: data['preferredBranch'] ?? 'ALEX-MAIN',
      loyaltyPoints: 100,
      verificationCode: 'VERIFY-DS-${DateTime.now().millisecond}',
    );
    _userRole = 'patient';
    _isAuthenticated = true;
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _currentPatient = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('saved_user_id');
    notifyListeners();
  }
}
