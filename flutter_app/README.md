# Delight Smile Dental Clinic — Cross-Platform Flutter Application (iOS, Android, Windows)

Production-grade cross-platform patient & staff mobile and desktop application for **Delight Smile Dental Clinic (Dr. Omar Salem)**.

---

## 1. Features
- **Cross-Platform**: Single Dart/Flutter codebase running natively on **iOS (iPhone/iPad)**, **Android (Phones/Tablets)**, and **Windows Desktop**.
- **Auth Flow**: Welcome screen, Login, Patient Registration, Biometric Login (FaceID / Fingerprint), Password Reset.
- **Patient Portal**: Upcoming appointments, dynamic QR self-check-in, FDI odontogram, invoices, prescriptions, and VIP loyalty points.
- **Appointment Booking Engine**: 5-step wizard with real-time available time slot generation, procedure pricing, and conflict detection.
- **Security & RLS**: Server-side Row Level Security enforcement, zero IDOR vulnerability, private storage signed URLs.
- **Localization & Themes**: Full Arabic (RTL) & English (LTR) language support with Obsidian/Royal Gold dark theme & Warm Ivory/Bronze Gold light theme.

---

## 2. Prerequisites
- Flutter SDK `>=3.0.0`
- Dart SDK `>=3.0.0`
- Android Studio / Xcode (for mobile builds) / Visual Studio 2022 with C++ desktop workload (for Windows builds).

---

## 3. Build & Run Instructions

### 1. Install Dependencies
```bash
cd flutter_app
flutter pub get
```

### 2. Run in Development Mode
```bash
# Run on connected phone or emulator
flutter run

# Run on Windows Desktop
flutter run -d windows
```

### 3. Run Automated Tests
```bash
flutter test
```

### 4. Build Android Release APK (for Testing & Sideloading)
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### 5. Build Android App Bundle (for Google Play Console)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### 6. Build iOS Application (for Apple App Store / TestFlight)
```bash
flutter build ipa --release
# Output: build/ios/archive/Runner.xcarchive
```
*Note: Requires macOS and an active Apple Developer Program account ($99/year).*

### 7. Build Windows Desktop Executable
```bash
flutter build windows --release
# Output: build/windows/x64/runner/Release/
```

---

## 4. Developer Accounts Notice
Publishing to the **Apple App Store** requires a paid Apple Developer Account ($99/year) and publishing to **Google Play** requires a one-time Google Play Console registration fee ($25), even though all backend infrastructure (Supabase & Vercel) remains 100% Free.
