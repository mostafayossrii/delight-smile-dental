import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';
import '../patient/patient_home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emergNameController = TextEditingController();
  final _emergPhoneController = TextEditingController();

  String _gender = 'female';
  String _preferredBranch = 'ALEX-MAIN';
  DateTime _dob = DateTime(1996, 5, 20);
  bool _agreedToTerms = true;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);

    return Scaffold(
      appBar: AppBar(title: const Text('إنشاء حساب مريض جديد')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'تسجيل مريض جديد بعيادة Delight Smile',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppConstants.gold400),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'سجل بياناتك للوصول الفوري إلى مواعيدك والروشتات ومخطط الأسنان الرقمي',
                    style: TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                  const SizedBox(height: 20),

                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'الاسم الثلاثي أو الرباعي',
                      prefixIcon: Icon(Icons.person, color: AppConstants.gold400),
                    ),
                    validator: (v) => (v == null || v.trim().length < 3) ? 'يرجى إدخال اسم صحيح' : null,
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'رقم الموبايل',
                            prefixIcon: Icon(Icons.phone, color: AppConstants.gold400),
                          ),
                          validator: (v) => (v == null || v.trim().length < 8) ? 'رقم موبايل مطلوب' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'البريد الإلكتروني',
                            prefixIcon: Icon(Icons.email, color: AppConstants.gold400),
                          ),
                          validator: (v) => (v == null || !v.contains('@')) ? 'بريد إلكتروني صحيح مطلوب' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'كلمة المرور (8 خانات على الأقل)',
                      prefixIcon: Icon(Icons.lock, color: AppConstants.gold400),
                    ),
                    validator: (v) => (v == null || v.length < 8) ? 'كلمة المرور يجب ألا تقل عن 8 خانات' : null,
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _gender,
                          decoration: const InputDecoration(labelText: 'النوع (الجنس)'),
                          items: const [
                            DropdownMenuItem(value: 'female', child: Text('أنثى')),
                            DropdownMenuItem(value: 'male', child: Text('ذكر')),
                          ],
                          onChanged: (val) => setState(() => _gender = val!),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _preferredBranch,
                          decoration: const InputDecoration(labelText: 'الفرع المفضل'),
                          items: const [
                            DropdownMenuItem(value: 'ALEX-MAIN', child: Text('فرع الإسكندرية الرئيسي')),
                            DropdownMenuItem(value: 'CAIRO-TAGAMOA', child: Text('فرع التجمع الخامس')),
                          ],
                          onChanged: (val) => setState(() => _preferredBranch = val!),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _emergPhoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'رقم هاتف الطوارئ / قريب',
                      prefixIcon: Icon(Icons.contact_phone, color: AppConstants.gold400),
                    ),
                  ),
                  const SizedBox(height: 14),

                  CheckboxListTile(
                    value: _agreedToTerms,
                    contentPadding: EdgeInsets.zero,
                    activeColor: AppConstants.gold500,
                    title: const Text(
                      'أوافق على الشروط والأحكام الطبية وسياسة خصوصية بيانات المرضى',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                    onChanged: (v) => setState(() => _agreedToTerms = v ?? true),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: (_isLoading || !_agreedToTerms)
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                setState(() => _isLoading = true);
                                final ok = await authService.registerPatient({
                                  'fullName': _nameController.text.trim(),
                                  'phone': _phoneController.text.trim(),
                                  'email': _emailController.text.trim(),
                                  'password': _passwordController.text,
                                  'gender': _gender,
                                  'preferredBranch': _preferredBranch,
                                  'emergencyContactPhone': _emergPhoneController.text.trim(),
                                });
                                setState(() => _isLoading = false);

                                if (ok && context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: AppConstants.successEmerald,
                                      content: Text('تم إنشاء وتوثيق حساب المريض بنجاح!'),
                                    ),
                                  );
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
                          : const Text(
                              'إتمام التسجيل والدخول (Complete Registration)',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
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
