import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../services/auth_service.dart';
import '../../services/appointment_service.dart';

class BookingWizardScreen extends StatefulWidget {
  const BookingWizardScreen({Key? key}) : super(key: key);

  @override
  State<BookingWizardScreen> createState() => _BookingWizardScreenState();
}

class _BookingWizardScreenState extends State<BookingWizardScreen> {
  int _currentStep = 0;

  // Step 1: Branch
  String _selectedBranch = 'فرع الإسكندرية الرئيسي - سموحة';

  // Step 2: Service / Specialty
  String _selectedService = 'فينير وعدسات الابتسامة E-Max';
  double _servicePrice = 6500.0;
  int _durationMins = 60;

  // Step 3: Dentist
  String _selectedDentistId = 'dent-1';
  String _selectedDentistName = 'د. عمر سالم (استشاري التجميل والزراعة)';

  // Step 4: Date & Real-time Slots
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedSlot = '05:30 PM';

  // Step 5: Symptoms & Notes & Attachments
  final _symptomsController = TextEditingController(text: 'أرغب في تصميم الابتسامة وعلاج الأسنان الأمامية.');
  String? _attachedFileName = 'panoramic_xray_2026.dcm';

  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _servicesList = [
    {'name': 'كشف واستشارة وتصميم ابتسامة', 'price': 500.0, 'duration': 30},
    {'name': 'تنظيف وتلميع بالموجات فوق الصوتية', 'price': 900.0, 'duration': 30},
    {'name': 'حشو تجميلي كومبوزيت ثلاثي الطبقات', 'price': 1200.0, 'duration': 45},
    {'name': 'علاج جذور وحشو عصب بالميكروسكوب', 'price': 3200.0, 'duration': 60},
    {'name': 'طربوش زيركون متعدد الطبقات', 'price': 3800.0, 'duration': 45},
    {'name': 'فينير وعدسات الابتسامة E-Max', 'price': 6500.0, 'duration': 60},
    {'name': 'زراعة سن تيتانيوم سويسري', 'price': 14000.0, 'duration': 90},
    {'name': 'تبييض الأسنان بالليزر Diode Laser', 'price': 4500.0, 'duration': 45},
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final aptService = Provider.of<AppointmentService>(context);
    final availableSlots = aptService.getAvailableSlots(_selectedDentistId, _selectedDate);

    return Scaffold(
      appBar: AppBar(title: const Text('حجز موعد طبي إلكتروني')),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () async {
          if (_currentStep < 4) {
            setState(() => _currentStep += 1);
          } else {
            // Step 5: Submit booking
            setState(() => _isSubmitting = true);
            try {
              final startsAt = DateTime(
                _selectedDate.year,
                _selectedDate.month,
                _selectedDate.day,
                17,
                30,
              );
              final endsAt = startsAt.add(Duration(minutes: _durationMins));

              await aptService.bookAppointment(
                patientId: authService.currentPatient?.id ?? 'P-1001',
                patientName: authService.currentPatient?.fullName ?? 'نورهان محمد عبد الرحمن',
                dentistId: _selectedDentistId,
                dentistName: _selectedDentistName,
                roomCode: 'عيادة 1 (VIP تجميل وزراعة)',
                startsAt: startsAt,
                endsAt: endsAt,
                procedureName: _selectedService,
                symptomsNotes: _symptomsController.text.trim(),
                attachmentUrl: _attachedFileName,
              );

              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: AppConstants.successEmerald,
                    content: Text('تم تأكيد حجز موعدك بنجاح! تم إرسال إشعار فوري وحظر أي تضارب زمني.'),
                  ),
                );
                Navigator.pop(context);
              }
            } catch (err) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: AppConstants.alertRose,
                    content: Text('تعارض مواعيد (Conflict 409): $err'),
                  ),
                );
              }
            } finally {
              if (mounted) setState(() => _isSubmitting = false);
            }
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          } else {
            Navigator.pop(context);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : details.onStepContinue,
                    child: _isSubmitting
                        ? const CircularProgressIndicator(color: AppConstants.obsidian950)
                        : Text(_currentStep == 4 ? 'تأكيد الحجز النهائي' : 'المتابعة'),
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: details.onStepCancel,
                    child: const Text('السابق'),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          // Step 1: Branch Selection
          Step(
            title: const Text('1. اختيار الفرع'),
            subtitle: Text(_selectedBranch, style: const TextStyle(color: AppConstants.gold300, fontSize: 11)),
            isActive: _currentStep >= 0,
            content: DropdownButtonFormField<String>(
              value: _selectedBranch,
              items: const [
                DropdownMenuItem(value: 'فرع الإسكندرية الرئيسي - سموحة', child: Text('فرع الإسكندرية الرئيسي (سموحة)')),
                DropdownMenuItem(value: 'فرع القاهرة الجديدة - التجمع', child: Text('فرع القاهرة الجديدة (التجمع الخامس)')),
                DropdownMenuItem(value: 'فرع الشيخ زايد - الجيزة', child: Text('فرع الشيخ زايد')),
              ],
              onChanged: (val) => setState(() => _selectedBranch = val!),
            ),
          ),

          // Step 2: Dental Service
          Step(
            title: const Text('2. الإجراء الطبي المطلوب'),
            subtitle: Text('$_selectedService (${_servicePrice.toInt()} EGP)', style: const TextStyle(color: AppConstants.gold300, fontSize: 11)),
            isActive: _currentStep >= 1,
            content: Column(
              children: _servicesList.map((srv) {
                final isSelected = _selectedService == srv['name'];
                return Card(
                  color: isSelected ? AppConstants.gold500.withOpacity(0.15) : AppConstants.obsidian900,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(srv['name'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: Text('المدة المقدرة: ${srv['duration']} دقيقة', style: const TextStyle(fontSize: 11, color: Colors.white60)),
                    trailing: Text('${srv['price']} EGP', style: const TextStyle(fontWeight: FontWeight.bold, color: AppConstants.gold400)),
                    leading: Radio<String>(
                      value: srv['name'],
                      groupValue: _selectedService,
                      activeColor: AppConstants.gold500,
                      onChanged: (v) {
                        setState(() {
                          _selectedService = srv['name'];
                          _servicePrice = srv['price'];
                          _durationMins = srv['duration'];
                        });
                      },
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Step 3: Dentist Selection
          Step(
            title: const Text('3. الطبيب المعالج'),
            subtitle: Text(_selectedDentistName, style: const TextStyle(color: AppConstants.gold300, fontSize: 11)),
            isActive: _currentStep >= 2,
            content: Column(
              children: [
                RadioListTile<String>(
                  value: 'dent-1',
                  groupValue: _selectedDentistId,
                  activeColor: AppConstants.gold500,
                  title: const Text('د. عمر سالم (مؤسس العيادة - تجميل وزراعة الأسنان)'),
                  subtitle: const Text('الخبرة: 15 عاماً • التقييم 4.9 ★★★★★'),
                  onChanged: (v) => setState(() {
                    _selectedDentistId = v!;
                    _selectedDentistName = 'د. عمر سالم';
                  }),
                ),
                RadioListTile<String>(
                  value: 'dent-2',
                  groupValue: _selectedDentistId,
                  activeColor: AppConstants.gold500,
                  title: const Text('د. سارة عادل (أخصائية تقويم وحشو تجميلي)'),
                  subtitle: const Text('الخبرة: 9 أعوام • التقييم 4.8 ★★★★★'),
                  onChanged: (v) => setState(() {
                    _selectedDentistId = v!;
                    _selectedDentistName = 'د. سارة عادل';
                  }),
                ),
                RadioListTile<String>(
                  value: 'any',
                  groupValue: _selectedDentistId,
                  activeColor: AppConstants.gold500,
                  title: const Text('أقرب طبيب متاح (Any Available Dentist)'),
                  onChanged: (v) => setState(() {
                    _selectedDentistId = v!;
                    _selectedDentistName = 'أقرب طبيب متاح';
                  }),
                ),
              ],
            ),
          ),

          // Step 4: Available Date & Slots
          Step(
            title: const Text('4. اختيار اليوم والوقت المتاح'),
            subtitle: Text('التاريخ: ${_selectedDate.toLocal().toString().split(" ")[0]} • الوقت: $_selectedSlot', style: const TextStyle(color: AppConstants.gold300, fontSize: 11)),
            isActive: _currentStep >= 3,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OutlinedButton.icon(
                  icon: const Icon(Icons.date_range, color: AppConstants.gold400),
                  label: Text('تغيير التاريخ: ${_selectedDate.toLocal().toString().split(" ")[0]}'),
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 60)),
                    );
                    if (picked != null) setState(() => _selectedDate = picked);
                  },
                ),
                const SizedBox(height: 14),
                const Text('المواعيد المتاحة في هذا اليوم لحظياً:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: availableSlots.map((slot) {
                    final isSel = _selectedSlot == slot;
                    return ChoiceChip(
                      label: Text(slot),
                      selected: isSel,
                      selectedColor: AppConstants.gold500,
                      labelStyle: TextStyle(
                        color: isSel ? AppConstants.obsidian950 : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                      onSelected: (val) => setState(() => _selectedSlot = slot),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // Step 5: Symptoms & Review
          Step(
            title: const Text('5. الملاحظات والأشعة والمراجعة'),
            isActive: _currentStep >= 4,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _symptomsController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'صف الأعراض أو سبب الزيارة للطبيب',
                    hintText: 'مثال: ألم في الضرس الخلفي، أو رغبة في استشارة تبييض',
                  ),
                ),
                const SizedBox(height: 12),
                ListTile(
                  tileColor: AppConstants.obsidian800,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  leading: const Icon(Icons.attachment, color: AppConstants.gold400),
                  title: Text(_attachedFileName ?? 'إرفاق ملف أشعة X-Ray أو بانوراما'),
                  subtitle: const Text('صيغ مدعومة: JPG, PNG, DICOM, PDF (مخزن مشفر)', style: TextStyle(fontSize: 10)),
                  trailing: TextButton(
                    onPressed: () {
                      setState(() => _attachedFileName = 'scan_cbct_${DateTime.now().millisecond}.dcm');
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم اختيار وإرفاق ملف الأشعة بنجاح!')),
                      );
                    },
                    child: const Text('تغيير الملف'),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppConstants.obsidian800,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppConstants.gold500.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ملخص الحجز:', style: TextStyle(fontWeight: FontWeight.bold, color: AppConstants.gold300)),
                      const SizedBox(height: 4),
                      Text('• المريض: ${authService.currentPatient?.fullName ?? "نورهان محمد"}'),
                      Text('• الإجراء: $_selectedService ($_durationMins دقيقة)'),
                      Text('• السعر التقديري: ${_servicePrice.toInt()} EGP'),
                      Text('• الطبيب: $_selectedDentistName'),
                      Text('• الموعد: ${_selectedDate.toLocal().toString().split(" ")[0]} في تمام $_selectedSlot'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
