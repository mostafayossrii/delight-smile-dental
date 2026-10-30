import 'package:flutter/material.dart';
import '../../core/constants.dart';

class StaffAttendanceScreen extends StatefulWidget {
  const StaffAttendanceScreen({Key? key}) : super(key: key);

  @override
  State<StaffAttendanceScreen> createState() => _StaffAttendanceScreenState();
}

class _StaffAttendanceScreenState extends State<StaffAttendanceScreen> {
  bool _isCheckedIn = true;
  String _status = 'متواجد بالعيادة (ضمن النطاق الجغرافي)';
  double _distanceMeters = 42.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('بصمة الحضور بالموقع الجغرافي (GPS Attendance)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Icon(
                      _isCheckedIn ? Icons.verified : Icons.location_off,
                      size: 54,
                      color: _isCheckedIn ? AppConstants.successEmerald : AppConstants.alertRose,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _status,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _isCheckedIn ? AppConstants.successEmerald : AppConstants.alertRose,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'المسافة من فرع سموحة: ${_distanceMeters.toStringAsFixed(1)} متر (الحد المسموح 500 م)',
                      style: const TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'إحداثيات العيادة: 31.2001° N, 29.9187° E • IP: 196.132.13.25',
                      style: TextStyle(fontSize: 10, color: Colors.white38, fontFamily: 'monospace'),
                    ),
                    const SizedBox(height: 20),

                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.login),
                            label: const Text('تسجيل حضور (Check-In)'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppConstants.successEmerald,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () {
                              setState(() {
                                _isCheckedIn = true;
                                _distanceMeters = 35.0;
                                _status = 'تم تسجيل الحضور بنجاح في فرع الإسكندرية';
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: AppConstants.successEmerald,
                                  content: Text('تم توثيق بصمة الحضور GPS بنجاح!'),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.logout),
                            label: const Text('تسجيل انصراف'),
                            onPressed: () {
                              setState(() {
                                _isCheckedIn = false;
                                _status = 'تم تسجيل الانصراف وإنهاء الوردية';
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('تم تسجيل الانصراف وحفظ ساعات العمل.')),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
