import 'package:flutter_test/flutter_test.dart';
import 'package:delight_smile_clinic/main.dart';

void main() {
  testWidgets('Delight Smile Welcome Screen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DelightSmileApp());
    await tester.pumpAndSettle();

    expect(find.text('Delight Smile'), findsOneWidget);
    expect(find.text('تسجيل الدخول (Sign In)'), findsOneWidget);
    expect(find.text('إنشاء حساب مريض جديد (Register)'), findsOneWidget);
  });
}
