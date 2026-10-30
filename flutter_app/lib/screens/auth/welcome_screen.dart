import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';
import 'login_screen.dart';
import 'register_screen.dart';
import '../patient/patient_home_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Clinic Logo & Branding
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppConstants.gold500, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppConstants.gold500.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Image.asset('assets/logo.png', fit: BoxFit.contain),
                  ),
                  const SizedBox(height: 20),

                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [AppConstants.gold100, AppConstants.gold500, AppConstants.gold400],
                    ).createShader(bounds),
                    child: const Text(
                      'Delight Smile',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'د. عمر سالم • استشاري تجميل وزراعة الأسنان',
                    style: TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                  const SizedBox(height: 36),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.gold500,
                        foregroundColor: AppConstants.obsidian950,
                      ),
                      child: const Text(
                        'تسجيل الدخول (Sign In)',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Create Account Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppConstants.gold500, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text(
                        'إنشاء حساب مريض جديد (Register)',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppConstants.gold400),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Continue as Patient (Guest / Quick Access)
                  TextButton.icon(
                    onPressed: () async {
                      await authService.login('patient.demo@delightsmile.local', 'pass');
                      if (context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const PatientHomeScreen()),
                        );
                      }
                    },
                    icon: const Icon(Icons.arrow_back, color: AppConstants.gold300, size: 18),
                    label: const Text(
                      'المتابعة كـ مريض تجريبي (Continue as Patient)',
                      style: TextStyle(color: AppConstants.gold300, fontWeight: FontWeight.w600),
                    ),
                  ),

                  // Biometric Auth Option
                  if (authService.biometricEnabled) ...[
                    const SizedBox(height: 12),
                    IconButton(
                      icon: const Icon(Icons.fingerprint, size: 38, color: AppConstants.gold500),
                      tooltip: 'تسجيل الدخول ببصمة الإصبع أو الوجه',
                      onPressed: () async {
                        final ok = await authService.authenticateWithBiometrics();
                        if (ok && context.mounted) {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const PatientHomeScreen()),
                          );
                        }
                      },
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Official Clinic Address & Phones
                  const Text(
                    'الأسكندرية - جليم - ٤ شارع أحمد فتحي، برج جليم هايتس، الدور الأول\nهاتف: 01091313305 • واتساب: 01034366020',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: AppConstants.gold300, height: 1.5),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    '"Your Delight is on your Smile"',
                    style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppConstants.gold400),
                  ),
                  const SizedBox(height: 16),

                  // Terms & Privacy Policy
                  const Text(
                    'جميع البيانات الطبية مشفرة ومحمية وفق معايير الخصوصية الطبية الدولية.\n© 2026 Delight Smile Dental Clinic. All Rights Reserved.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: Colors.white38, height: 1.5),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
