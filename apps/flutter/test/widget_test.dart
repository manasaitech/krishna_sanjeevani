import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishna_sanjeevani/core/providers/network_providers.dart';
import 'package:krishna_sanjeevani/features/auth/providers/auth_provider.dart';
import 'package:krishna_sanjeevani/main.dart';
import 'core/network/auth_interceptor_test.dart';
import 'features/auth/auth_provider_test.dart';

void main() {
  testWidgets('App smoke test renders Login screen when unauthenticated', (WidgetTester tester) async {
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

    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Sign In'), findsWidgets);
  });
}
