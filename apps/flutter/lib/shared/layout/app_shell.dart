import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/category_theme.dart';
import '../providers/category_provider.dart';
import '../widgets/mini_player_widget.dart';

import '../../core/localization/app_localizations.dart';

class AppShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const AppShell({
    super.key,
    required this.navigationShell,
  });

  int _getSelectedIndex(int currentBranch, AppCategory activeCat) {
    if (activeCat == AppCategory.pregnancy) {
      switch (currentBranch) {
        case 2: return 0; // Journey branch is displayed as Home tab
        case 3: return 1; // History
        case 4: return 2; // Profile
        default: return 0;
      }
    } else {
      switch (currentBranch) {
        case 0: return 0; // Home branch is displayed as Home tab
        case 3: return 1; // History
        case 4: return 2; // Profile
        default: return 0;
      }
    }
  }

  void _onTapIndex(int tabIndex, AppCategory activeCat) {
    int targetBranch = 0;
    if (activeCat == AppCategory.pregnancy) {
      switch (tabIndex) {
        case 0: targetBranch = 2; break; // Home -> Journey branch
        case 1: targetBranch = 3; break; // History -> History branch
        case 2: targetBranch = 4; break; // Profile -> Profile branch
      }
    } else {
      switch (tabIndex) {
        case 0: targetBranch = 0; break; // Home -> Home branch
        case 1: targetBranch = 3; break; // History -> History branch
        case 2: targetBranch = 4; break; // Profile -> Profile branch
      }
    }
    navigationShell.goBranch(
      targetBranch,
      initialLocation: targetBranch == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCategory = ref.watch(categoryProvider);
    final selectedIndex = _getSelectedIndex(navigationShell.currentIndex, activeCategory);
    final loc = AppLocalizations.of(context);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Persistent Floating MiniPlayer Overlay
          const MiniPlayerWidget(),

          // 3-Tab Material 3 Navigation Bar
          NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (index) => _onTapIndex(index, activeCategory),
            indicatorColor: catColors.catLight,
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.home_outlined),
                selectedIcon: const Icon(Icons.home),
                label: loc?.translate('home') ?? 'Home',
              ),
              NavigationDestination(
                icon: const Icon(Icons.history_outlined),
                selectedIcon: const Icon(Icons.history),
                label: loc?.translate('history') ?? 'History',
              ),
              NavigationDestination(
                icon: const Icon(Icons.person_outline),
                selectedIcon: const Icon(Icons.person),
                label: loc?.translate('profile') ?? 'Profile',
              ),
            ],
          ),
        ],
      ),
    );
  }
}
