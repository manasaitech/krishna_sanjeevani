import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishna_sanjeevani/core/providers/network_providers.dart';
import 'package:krishna_sanjeevani/features/auth/providers/auth_provider.dart';
import 'package:krishna_sanjeevani/main.dart';
import 'core/network/auth_interceptor_test.dart';
import 'features/auth/auth_provider_test.dart';

void main() {
  testWidgets('App smoke test renders Login screen when unauthenticated', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final storage = MemoryStorage();
    final repo = MockAuthRepository(storage);
    final googleAuth = MockGoogleAuthService();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          authRepositoryProvider.overrideWithValue(repo),
          googleAuthServiceProvider.overrideWithValue(googleAuth),
        ],
        child: const KrishnaSanjeevaniApp(),
      ),
    );

    await tester.pump(); // Initial build
    await tester.pump(const Duration(seconds: 6)); // Elapse splash timer
    await tester.pump(const Duration(milliseconds: 600)); // Finish fade transition animation
    await tester.pump(); // Route to /login
    await tester.pump(const Duration(milliseconds: 100)); // Render login screen frame

    expect(find.text('KRISHNA SANJEEVANI'), findsWidgets);
  });
}
