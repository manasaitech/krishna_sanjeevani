import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/category_provider.dart';

void main() {
  runZonedGuarded(() {
    WidgetsFlutterBinding.ensureInitialized();
    FlutterError.onError = (details) {
      FlutterError.presentError(details);
    };

    runApp(
      const ProviderScope(
        child: KrishnaSanjeevaniApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('Uncaught app error: $error\n$stack');
  });
}

class KrishnaSanjeevaniApp extends ConsumerWidget {
  const KrishnaSanjeevaniApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeCategory = ref.watch(categoryProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Krishna Sanjeevani',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.buildTheme(activeCategory),
      routerConfig: router,
    );
  }
}
