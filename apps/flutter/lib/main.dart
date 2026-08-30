import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/localization/app_localizations.dart';
import 'core/localization/locale_provider.dart';
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
    final themeMode = ref.watch(themeNotifierProvider);
    final locale = ref.watch(localeNotifierProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Krishna Sanjeevani',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.buildTheme(activeCategory, isDark: false),
      darkTheme: AppTheme.buildDarkTheme(activeCategory),
      themeMode: themeMode,
      locale: locale,
      supportedLocales: const [
        Locale('en'),
        Locale('hi'),
        Locale('sa'),
      ],
      localizationsDelegates: const [
        AppLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
