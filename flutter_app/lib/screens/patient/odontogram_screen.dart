import 'package:flutter/material.dart';
import '../../core/constants.dart';

class OdontogramScreen extends StatefulWidget {
  const OdontogramScreen({Key? key}) : super(key: key);

  @override
  State<OdontogramScreen> createState() => _OdontogramScreenState();
}

class _OdontogramScreenState extends State<OdontogramScreen> {
  bool _isPrimary = false;
  int _selectedTooth = 11;
  String _selectedSurface = 'WHOLE';
  bool _isHistorical = false;

  final Map<int, Map<String, dynamic>> _teethData = {
    11: {'status': 'veneer', 'label': 'فينير E-Max', 'doctor': 'د. عمر سالم', 'price': 6500, 'surface': 'F'},
    21: {'status': 'veneer', 'label': 'فينير E-Max', 'doctor': 'د. عمر سالم', 'price': 6500, 'surface': 'F'},
    16: {'status': 'root_canal', 'label': 'علاج جذور زيركون', 'doctor': 'د. عمر سالم', 'price': 4200, 'surface': 'O'},
    26: {'status': 'filling', 'label': 'حشو كومبوزيت', 'doctor': 'د. سارة عادل', 'price': 1200, 'surface': 'M'},
    36: {'status': 'implant', 'label': 'زراعة سن سويسري', 'doctor': 'د. عمر سالم', 'price': 14000, 'surface': 'WHOLE'},
    46: {'status': 'caries', 'label': 'تسوس يحتاج علاج', 'doctor': 'د. عمر سالم', 'price': 1100, 'surface': 'O'},
  };

  Color _getToothColor(int toothNum) {
    final t = _teethData[toothNum];
    if (t == null) return AppConstants.obsidian800;
    switch (t['status']) {
      case 'veneer':
        return AppConstants.gold500;
      case 'implant':
        return AppConstants.successEmerald;
      case 'root_canal':
        return Colors.purple;
      case 'crown':
        return Colors.blue;
      case 'filling':
        return AppConstants.warningAmber;
      case 'caries':
        return AppConstants.alertRose;
      default:
        return AppConstants.gold400;
    }
  }

  @override
  Widget build(BuildContext context) {
    final upperTeeth = _isPrimary
        ? [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
        : [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

    final lowerTeeth = _isPrimary
        ? [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
        : [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

    final currentInfo = _teethData[_selectedTooth];

    return Scaffold(
      appBar: AppBar(title: const Text('مخطط الأسنان التفاعلي (FDI Odontogram)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Dentition Switch & Historical Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(value: false, label: Text('دائمة (11-48)')),
                    ButtonSegment(value: true, label: Text('لبنية (51-85)')),
                  ],
                  selected: {_isPrimary},
                  onSelectionChanged: (set) => setState(() => _isPrimary = set.first),
                ),
                Row(
                  children: [
                    const Text('حالة سابقة', style: TextStyle(fontSize: 11, color: AppConstants.warningAmber)),
                    Switch(
                      value: _isHistorical,
                      activeColor: AppConstants.warningAmber,
                      onChanged: (v) => setState(() => _isHistorical = v),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Upper Arch Grid
            Text(
              _isPrimary ? 'الفك العلوي - أسنان لبنية (55-65)' : 'الفك العلوي - أسنان دائمة (18-28)',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppConstants.gold400),
            ),
            const SizedBox(height: 8),
            _buildTeethRow(upperTeeth),

            const SizedBox(height: 20),

            // Lower Arch Grid
            _buildTeethRow(lowerTeeth),
            const SizedBox(height: 6),
            const Text(
              'الفك السفلي (Lower Arch)',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppConstants.gold400),
            ),
            const SizedBox(height: 20),

            // Surface Selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('تحديد سطح السن (Tooth Surface):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      children: [
                        'WHOLE', 'M (أنسي)', 'D (وحشي)', 'O/I (طاحن)', 'B/F (وجهي)', 'L/P (لساني)'
                      ].map((sf) {
                        final code = sf.split(' ')[0];
                        final isSel = _selectedSurface == code;
                        return ChoiceChip(
                          label: Text(sf),
                          selected: isSel,
                          selectedColor: AppConstants.gold500,
                          onSelected: (val) => setState(() => _selectedSurface = code),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Selected Tooth Clinical Finding Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          'تفاصيل السن المختار: #$_selectedTooth',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.gold300),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getToothColor(_selectedTooth).withOpacity(0.25),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            currentInfo != null ? currentInfo['label'] : 'سليم وطبيعي',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _getToothColor(_selectedTooth),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (currentInfo != null) ...[
                      Text('• الطبيب المعالج: ${currentInfo['doctor']}'),
                      Text('• السطح المسجل: ${currentInfo['surface']}'),
                      Text('• القيمة التقديرية: ${currentInfo['price']} EGP'),
                    ] else ...[
                      const Text('لا توجد إصابات أو إجراءات مسجلة على هذا السن حالياً.'),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Color Legend
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: const [
                _LegendItem(color: AppConstants.gold500, label: 'فينير تجميلي'),
                _LegendItem(color: AppConstants.successEmerald, label: 'زراعة سن'),
                _LegendItem(color: Colors.purple, label: 'علاج جذور'),
                _LegendItem(color: Colors.blue, label: 'طربوش زيركون'),
                _LegendItem(color: AppConstants.warningAmber, label: 'حشو تجميلي'),
                _LegendItem(color: AppConstants.alertRose, label: 'تسوس'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTeethRow(List<int> teeth) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: teeth.map((t) {
          final isSelected = _selectedTooth == t;
          final color = _getToothColor(t);
          return GestureDetector(
            onTap: () => setState(() => _selectedTooth = t),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: 38,
              height: 52,
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected ? AppConstants.gold400 : color,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '#$t',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                  ),
                  const SizedBox(height: 2),
                  Icon(Icons.health_and_safety, size: 16, color: color),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({Key? key, required this.color, required this.label}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.white70)),
      ],
    );
  }
}
