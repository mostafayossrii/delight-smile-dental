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
        fullName: prefs.getString('saved_user_name') ?? 'نورهان محمد عبد الرحمن',
        phone: prefs.getString('saved_user_phone') ?? '+201036554750',
        email: prefs.getString('saved_user_email') ?? 'patient@delightsmile.local',
        gender: 'female',
        dateOfBirth: '1997-04-12',
        loyaltyPoints: prefs.getInt('saved_loyalty_points') ?? 3300,
        creditBalance: 450.0,
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
    // Normalizes dev admin / patient login with persistent session
    if (identifier.toLowerCase() == 'admin' && password == '123') {
      _userRole = 'admin';
      _isAuthenticated = true;
      notifyListeners();
      return true;
    }

    // Patient demo login or registered email
    _userRole = 'patient';
    _currentPatient = PatientModel(
      id: 'P-1001',
      fullName: 'نورهان محمد عبد الرحمن',
      phone: '+201036554750',
      email: identifier.contains('@') ? identifier : 'nourhan@delightsmile.local',
      gender: 'female',
      dateOfBirth: '1997-04-12',
      loyaltyPoints: 3300,
      creditBalance: 450.0,
      verificationCode: 'VERIFY-DS1001-9981',
    );
    _isAuthenticated = true;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_user_id', _currentPatient!.id);
    await prefs.setString('saved_user_name', _currentPatient!.fullName);
    await prefs.setString('saved_user_phone', _currentPatient!.phone);
    await prefs.setString('saved_user_email', _currentPatient!.email);
    await prefs.setInt('saved_loyalty_points', _currentPatient!.loyaltyPoints);

    notifyListeners();
    return true;
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
