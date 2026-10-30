import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';
import '../../services/appointment_service.dart';
import 'booking_wizard_screen.dart';
import 'odontogram_screen.dart';
import 'qr_checkin_screen.dart';
import '../auth/welcome_screen.dart';

class PatientHomeScreen extends StatefulWidget {
  const PatientHomeScreen({Key? key}) : super(key: key);

  @override
  State<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends State<PatientHomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final patient = authService.currentPatient;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppConstants.gold500),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(7),
                child: Image.asset('assets/logo.png', fit: BoxFit.contain),
              ),
            ),
            const SizedBox(width: 10),
            const Text('Delight Smile Portal', style: TextStyle(fontSize: 16)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: AppConstants.gold400),
            tooltip: 'تسجيل الوصول الذاتي QR Check-in',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QrCheckInScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            tooltip: 'تسجيل الخروج الآمن',
            onPressed: () async {
              await authService.logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeDashboard(context, patient),
          const OdontogramScreen(),
          const QrCheckInScreen(),
          _buildInvoicesTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        selectedItemColor: AppConstants.gold400,
        unselectedItemColor: Colors.white54,
        backgroundColor: AppConstants.obsidian900,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'الرئيسية'),
          BottomNavigationBarItem(icon: Icon(Icons.health_and_safety), label: 'مخطط الأسنان'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code), label: 'كود الدخول'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'فواتيري'),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppConstants.gold500,
        foregroundColor: AppConstants.obsidian950,
        icon: const Icon(Icons.calendar_month),
        label: const Text('حجز موعد', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const BookingWizardScreen()),
          );
        },
      ),
    );
  }

  Widget _buildHomeDashboard(BuildContext context, dynamic patient) {
    final aptService = Provider.of<AppointmentService>(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Welcome Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppConstants.obsidian900,
                  AppConstants.obsidian800,
                  AppConstants.obsidian900,
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppConstants.gold500.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppConstants.gold500,
                  child: Text(
                    (patient?.fullName.isNotEmpty ?? false) ? patient!.fullName.substring(0, 1) : 'م',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppConstants.obsidian950),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'مرحباً بك، ${patient?.fullName ?? "نورهان محمد"}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'كود المريض: ${patient?.id ?? "P-1001"} • رصيد الولاء: ${patient?.loyaltyPoints ?? 3300} نقطة VIP',
                        style: const TextStyle(fontSize: 12, color: AppConstants.gold300),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Quick Action Cards
          Row(
            children: [
              Expanded(
                child: _buildActionTile(
                  icon: Icons.calendar_month,
                  title: 'حجز كشف جديد',
                  subtitle: 'اختر الموعد والطبيب',
                  color: AppConstants.gold500,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const BookingWizardScreen()),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionTile(
                  icon: Icons.health_and_safety,
                  title: 'مخطط الأسنان FDI',
                  subtitle: 'سجل الأسنان الرقمي',
                  color: AppConstants.successEmerald,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Upcoming Appointments
          const Text(
            'مواعيدك القادمة بالعيادة',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.gold400),
          ),
          const SizedBox(height: 10),

          if (aptService.appointments.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppConstants.obsidian900,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Text('لا توجد مواعيد قادمة. اضغط حجز موعد لتحديد زيارة جديدة.'),
              ),
            )
          else
            ...aptService.appointments.map((apt) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            apt.procedureName,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: apt.status == 'cancelled'
                                  ? AppConstants.alertRose.withOpacity(0.2)
                                  : AppConstants.successEmerald.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              apt.status == 'cancelled' ? 'ملغي' : 'مؤكد بالعيادة',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: apt.status == 'cancelled' ? AppConstants.alertRose : AppConstants.successEmerald,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'الطبيب: ${apt.dentistName} • ${apt.roomCode}',
                        style: const TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                      Text(
                        'التوقيت: ${apt.startsAt.year}-${apt.startsAt.month.toString().padLeft(2, '0')}-${apt.startsAt.day.toString().padLeft(2, '0')} الساعة ${apt.startsAt.hour}:${apt.startsAt.minute.toString().padLeft(2, '0')}',
                        style: const TextStyle(fontSize: 12, color: AppConstants.gold300, fontFamily: 'monospace'),
                      ),
                      if (apt.status != 'cancelled') ...[
                        const Divider(height: 20),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: TextButton.icon(
                            icon: const Icon(Icons.cancel, size: 16, color: AppConstants.alertRose),
                            label: const Text('إلغاء الموعد', style: TextStyle(color: AppConstants.alertRose, fontSize: 12)),
                            onPressed: () {
                              aptService.cancelAppointment(apt.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('تم إلغاء الموعد بنجاح وفق لوائح العيادة.')),
                              );
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }).toList(),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppConstants.obsidian900,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.white54)),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoicesTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'سجل الفواتير والمدفوعات المعتمدة',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.gold400),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('فاتورة INV-1240 • تركيب 2 فينير E-Max + زراعة سن', style: TextStyle(fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text('إجمالي الفاتورة: 19,500 ج.م • المدفوع: 15,500 ج.م', style: TextStyle(color: AppConstants.successEmerald, fontWeight: FontWeight.bold)),
                Text('المتبقي: 1,500 ج.م • تحمل التأمين AXA: 2,000 ج.م', style: TextStyle(color: AppConstants.alertRose)),
                Text('الحالة الضريبية: متوافقة مع منظومة الفاتورة الإلكترونية المصرية', style: TextStyle(fontSize: 11, color: Colors.white54)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
