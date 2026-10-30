import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'services/auth_service.dart';
import 'services/appointment_service.dart';
import 'screens/auth/welcome_screen.dart';
import 'screens/patient/patient_home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DelightSmileApp());
}

class DelightSmileApp extends StatefulWidget {
  const DelightSmileApp({Key? key}) : super(key: key);

  @override
  State<DelightSmileApp> createState() => _DelightSmileAppState();
}

class _DelightSmileAppState extends State<DelightSmileApp> {
  Locale _locale = const Locale('ar');
  ThemeMode _themeMode = ThemeMode.dark;

  void toggleLocale() {
    setState(() {
      _locale = _locale.languageCode == 'ar' ? const Locale('en') : const Locale('ar');
    });
  }

  void toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => AppointmentService()),
      ],
      child: Consumer<AuthService>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'Delight Smile Dental Clinic',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: _themeMode,
            locale: _locale,
            supportedLocales: const [
              Locale('ar'),
              Locale('en'),
            ],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            home: auth.isAuthenticated ? const PatientHomeScreen() : const WelcomeScreen(),
          );
        },
      ),
    );
  }
}
