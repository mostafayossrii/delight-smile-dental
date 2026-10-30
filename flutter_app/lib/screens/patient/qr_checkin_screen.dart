import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';

class QrCheckInScreen extends StatelessWidget {
  const QrCheckInScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final patient = authService.currentPatient;
    final qrData = 'DELIGHT-SMILE-PORTAL|${patient?.id ?? "P-1001"}|VERIFY-DS1001-9981|${DateTime.now().toIso8601String()}';

    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل الوصول الذاتي (Self Check-In)')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'كود الحضور السريع بالعيادة',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppConstants.gold400),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'امسح هذا الكود عند جهاز الاستقبال لتسجيل وصولك وإشعار الطبيب فوراً دون انتظار.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                    const SizedBox(height: 24),

                    // QR Code Widget
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppConstants.gold500.withOpacity(0.25),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: QrImageView(
                        data: qrData,
                        version: QrVersions.auto,
                        size: 200.0,
                        eyeStyle: const QrEyeStyle(
                          eyeShape: QrEyeShape.square,
                          color: AppConstants.obsidian950,
                        ),
                        dataModuleStyle: const QrDataModuleStyle(
                          dataModuleShape: QrDataModuleShape.square,
                          color: AppConstants.obsidian950,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppConstants.obsidian800,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppConstants.gold500.withOpacity(0.3)),
                      ),
                      child: Text(
                        'كود التوثيق: ${patient?.verificationCode.isNotEmpty ?? false ? patient!.verificationCode : "VERIFY-DS1001-9981"}',
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: AppConstants.gold300),
                      ),
                    ),
                    const SizedBox(height: 16),

                    ElevatedButton.icon(
                      icon: const Icon(Icons.check_circle),
                      label: const Text('تسجيل حضور تجريبي الآن'),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: AppConstants.successEmerald,
                            content: Text('تم تسجيل حضورك في الاستقبال بنجاح! تم إشعار د. عمر سالم في عيادة 1.'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
