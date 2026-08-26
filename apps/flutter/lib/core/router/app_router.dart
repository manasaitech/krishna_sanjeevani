import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/verify_email_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/reset_password_screen.dart';
import '../../features/history/screens/history_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/player/screens/player_screen.dart';
import '../../features/pregnancy/screens/journey_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/programs/screens/program_detail_screen.dart';
import '../../features/splash/screens/splash_screen.dart';
import '../../features/subscription/screens/subscription_screen.dart';
import '../../features/therapy/screens/therapy_screen.dart';
import '../../features/sanjeevani/selection/choose_sanjeevani_screen.dart';
import '../../features/sanjeevani/selection/change_sanjeevani_screen.dart';
import '../../shared/layout/app_shell.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(
      authProvider,
      (_, __) => notifyListeners(),
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);

      if (authState.authLoading) {
        return null;
      }

      final isAuthenticated = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/splash' ||
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/forgot-password' ||
          state.matchedLocation == '/reset-password';

      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      if (isAuthenticated) {
        // Enforce OTP verification gating
        final emailVerified = authState.user?['emailVerified'] ?? 1;
        final isUnverified = emailVerified == 0;

        if (isUnverified) {
          if (state.matchedLocation != '/verify-email') {
            return '/verify-email';
          }
          return null;
        }

        if (state.matchedLocation == '/verify-email') {
          final profile = authState.user?['profile'];
          final categoryStr = (profile is Map<String, dynamic>) ? profile['category'] as String? : null;
          if (categoryStr == null || categoryStr == 'unset') {
            return '/choose-sanjeevani';
          }
          return categoryStr == 'pregnancy' ? '/journey' : '/home';
        }

        final profile = authState.user?['profile'];
        final categoryStr = (profile is Map<String, dynamic>) ? profile['category'] as String? : null;
        
        final isCategoryUnset = categoryStr == null || categoryStr == 'unset';

        if (isCategoryUnset) {
          if (state.matchedLocation != '/choose-sanjeevani') {
            return '/choose-sanjeevani';
          }
          return null;
        }

        // If category is set, redirect away from /choose-sanjeevani or auth screens (excluding splash)
        if (state.matchedLocation == '/choose-sanjeevani' || (isAuthRoute && state.matchedLocation != '/splash')) {
          return categoryStr == 'pregnancy' ? '/journey' : '/home';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(
          onNavigateToRegister: () => context.go('/register'),
        ),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => RegisterScreen(
          onNavigateToLogin: () => context.go('/login'),
        ),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return ResetPasswordScreen(email: email);
        },
      ),
      GoRoute(
        path: '/choose-sanjeevani',
        builder: (context, state) => const ChooseSanjeevaniScreen(),
      ),
      GoRoute(
        path: '/change-sanjeevani',
        builder: (context, state) => const ChangeSanjeevaniScreen(),
      ),
      GoRoute(
        path: '/player',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PlayerScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/subscription',
        builder: (context, state) => const SubscriptionScreen(),
      ),
      GoRoute(
        path: '/program/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? 'prog_1';
          return ProgramDetailScreen(programId: id);
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/therapy',
                builder: (context, state) => const TherapyScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/journey',
                builder: (context, state) => const JourneyScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/history',
                builder: (context, state) => const HistoryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
