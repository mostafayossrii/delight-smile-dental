import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';
import '../patient/patient_home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController(text: '123');
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);

    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل الدخول')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'تسجيل الدخول إلى حسابك',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppConstants.gold400),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور',
                    style: TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                  const SizedBox(height: 24),

                  TextFormField(
                    controller: _identifierController,
                    decoration: const InputDecoration(
                      labelText: 'اسم المستخدم أو البريد الإلكتروني',
                      prefixIcon: Icon(Icons.person, color: AppConstants.gold400),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'هذا الحقل مطلوب' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'كلمة المرور',
                      prefixIcon: const Icon(Icons.lock, color: AppConstants.gold400),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off, color: Colors.white54),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) => (v == null || v.isEmpty) ? 'كلمة المرور مطلوبة' : null,
                  ),
                  const SizedBox(height: 12),

                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('تم إرسال رابط استعادة كلمة المرور إلى بريدك المسجل.')),
                        );
                      },
                      child: const Text('هل نسيت كلمة المرور؟', style: TextStyle(color: AppConstants.gold300, fontSize: 12)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                setState(() => _isLoading = true);
                                final ok = await authService.login(
                                  _identifierController.text.trim(),
                                  _passwordController.text,
                                );
                                setState(() => _isLoading = false);
                                if (ok && context.mounted) {
                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(builder: (_) => const PatientHomeScreen()),
                                    (route) => false,
                                  );
                                }
                              }
                            },
                      child: _isLoading
                          ? const CircularProgressIndicator(color: AppConstants.obsidian950)
                          : const Text('دخول (Sign In)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ),
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
