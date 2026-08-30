import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/category_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/localization/locale_provider.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../shared/providers/category_provider.dart';
import '../../auth/providers/auth_provider.dart';

import '../../player/providers/player_provider.dart';
import '../../therapy/providers/discover_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _switching = false;
  bool _showContact = false;
  bool _sessionReminders = true;

  Future<void> _handleSwitchCategory(AppCategory target) async {
    final current = ref.read(categoryProvider);
    if (current == target) return;

    setState(() => _switching = true);
    try {
      final repo = ref.read(authRepositoryProvider);
      final res = await repo.updateProfile(category: target.name);
      if (res.success) {
        ref.read(categoryProvider.notifier).setCategory(target);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Switched to ${target.displayName}'),
            backgroundColor: const Color(0xFF047857),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to switch pathway.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _switching = false);
    }
  }

  Future<void> _handleCancelSub(String subId, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Subscription?'),
        content: Text('Are you sure you want to cancel your subscription to $name?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Keep'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Cancel Sub', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(discoverNotifierProvider.notifier).cancelSubscription(subId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Subscription to $name cancelled.'),
            backgroundColor: const Color(0xFF047857),
          ),
        );
      }
    }
  }

  void _handlePlaySub(String surawaliName) {
    final allTracks = ref.read(allTracksProvider).value ?? [];
    final track = allTracks.isNotEmpty
        ? Map<String, dynamic>.from(allTracks.first)
        : <String, dynamic>{'id': 'mock_$surawaliName', 'title': surawaliName, 'duration': 558};
    track['title'] = surawaliName;
    ref.read(playerProvider.notifier).playTrack(track);
  }

  Future<void> _handleDeleteAccount() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 24),
            SizedBox(width: 8),
            Text('Delete Account?', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'This action is permanent and cannot be undone.',
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
            ),
            SizedBox(height: 12),
            Text(
              'Your profile data, listening history, favorites, saved progress, and active sessions will be permanently erased.',
              style: TextStyle(fontSize: 13, color: Colors.black87),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel', style: TextStyle(color: Colors.black87)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await ref.read(authProvider.notifier).deleteAccount();
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Your account and associated data have been permanently deleted.'),
              backgroundColor: Colors.red,
            ),
          );
        } else {
          final err = ref.read(authProvider).error ?? 'Failed to delete account';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(err),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _showThemeModal() {

    final currentMode = ref.read(themeNotifierProvider);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDarkTheme = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDarkTheme ? const Color(0xFF26232D) : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Theme Mode',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Choose your visual appearance preference',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 16),
              ...[
                {'mode': ThemeMode.light, 'label': 'Light Mode', 'sub': 'Clean warm aesthetic'},
                {'mode': ThemeMode.dark, 'label': 'Dark Mode', 'sub': 'Soothing dark sanctuary'},
                {'mode': ThemeMode.system, 'label': 'System Default', 'sub': 'Follow system settings'},
              ].map((opt) {
                final mode = opt['mode'] as ThemeMode;
                final isSelected = currentMode == mode;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(14),
                      side: BorderSide(color: isSelected ? const Color(0xFF7A1E2C) : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      ref.read(themeNotifierProvider.notifier).setThemeMode(mode);
                      Navigator.pop(ctx);
                    },
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            opt['label'] as String,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? const Color(0xFF7A1E2C) : null,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            opt['sub'] as String,
                            style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3A3125),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLanguageModal() {
    final currentLocale = ref.read(localeNotifierProvider);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDarkTheme = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDarkTheme ? const Color(0xFF26232D) : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Language',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Select your preferred audio & interface language',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 16),
              ...[
                {'locale': const Locale('en'), 'code': 'en', 'label': 'English (US)', 'sub': 'English audio & text'},
                {'locale': const Locale('hi'), 'code': 'hi', 'label': 'हिन्दी (Hindi)', 'sub': 'हिन्दी ऑडियो और पाठ'},
                {'locale': const Locale('sa'), 'code': 'sa', 'label': 'संस्कृतम् (Sanskrit)', 'sub': 'संस्कृतम् मन्त्राः'},
              ].map((opt) {
                final loc = opt['locale'] as Locale;
                final code = opt['code'] as String;
                final isSelected = currentLocale.languageCode == loc.languageCode;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(14),
                      side: BorderSide(color: isSelected ? const Color(0xFF7A1E2C) : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      ref.read(localeNotifierProvider.notifier).setLocale(loc);
                      try {
                        await ref.read(authRepositoryProvider).updateProfile(language: code);
                      } catch (_) {}
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            opt['label'] as String,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? const Color(0xFF7A1E2C) : null,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            opt['sub'] as String,
                            style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3A3125),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileRow({
    required IconData icon,
    required String label,
    String? value,
    VoidCallback? onTap,
    Color? catColor,
    Color? catLight,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: catLight ?? const Color(0xFFF2E0E3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 18, color: catColor ?? const Color(0xFF7A1E2C)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1E293B)),
              ),
            ),
            if (value != null)
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text(
                  value,
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ),
            Icon(Icons.chevron_right, size: 18, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCategory = ref.watch(categoryProvider);
    final authState = ref.watch(authProvider);
    final subscriptionsAsync = ref.watch(userSubscriptionsProvider);

    final user = authState.user;
    final name = user?['profile']?['fullName'] ??
        (user?['email'] != null ? (user!['email'] as String).split('@')[0] : 'Guest User');
    final email = user?['email'] as String? ?? 'guest@example.com';
    final role = user?['role'] as String? ?? 'guest';
    final initial = name.toString().isNotEmpty ? name.toString()[0].toUpperCase() : 'G';

    return Scaffold(
      backgroundColor: const Color(0xFFFCFCFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Profile',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── User Card ──
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey[200]!),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: catColors.cat,
                    child: Text(
                      initial,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          email,
                          style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: catColors.catLight,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.star_border, size: 12, color: catColors.cat),
                              const SizedBox(width: 4),
                              Text(
                                role.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: catColors.cat,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Your Plan ──
            _sectionTitle('Your Plan'),
            const SizedBox(height: 8),
            Container(
              decoration: _cardDecoration(),
              child: _buildProfileRow(
                icon: Icons.star_border,
                label: 'Subscription',
                value: '$role · monthly',
                catColor: catColors.cat,
                catLight: catColors.catLight,
                onTap: () => context.push('/subscription'),
              ),
            ),

            const SizedBox(height: 24),

            // ── Switch Healing Pathway ──
            _sectionTitle('Switch Healing Pathway'),
            const SizedBox(height: 8),
            ...AppCategory.values.map((cat) {
              final isSelected = cat == activeCategory;
              final colors = CategoryColors.ofCategory(cat);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GestureDetector(
                  onTap: _switching ? null : () => _handleSwitchCategory(cat),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected ? colors.cat.withValues(alpha: 0.05) : Colors.white,
                      border: Border.all(
                        color: isSelected ? colors.cat : Colors.grey[200]!,
                        width: isSelected ? 1.5 : 1,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    cat.displayName.split(' ')[0].toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1,
                                      color: colors.cat,
                                    ),
                                  ),
                                  if (isSelected) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: colors.cat,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                cat.displayName,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                cat.tagline,
                                style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        if (isSelected)
                          Icon(Icons.check_circle, color: colors.cat, size: 22),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // ── Active Surawali Subscriptions ──
            _sectionTitle('Active Subscriptions'),
            const SizedBox(height: 8),
            subscriptionsAsync.when(
              data: (subscriptions) {
                if (subscriptions.isEmpty) {
                  return Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.grey[200]!, style: BorderStyle.solid),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          'No active Surawali subscriptions.',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700]),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'You don\'t have any listening passes yet. Head to the Home screen to explore and subscribe.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.grey[500], height: 1.4),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: catColors.cat,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () => context.go('/home'),
                          child: const Text('Go to Discovery', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: subscriptions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final sub = subscriptions[index];
                    final subId = sub['id'] as String;
                    final surawaliName = sub['surawaliName'] as String? ?? 'Surawali';
                    final endDateMs = (sub['endDate'] as num? ?? 0).toInt();
                    final endDate = DateTime.fromMillisecondsSinceEpoch(endDateMs);
                    final isActive = sub['status'] == 'active' && endDate.isAfter(DateTime.now());
                    final endDateStr = '${endDate.day}/${endDate.month}/${endDate.year}';

                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: _cardDecoration(),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        surawaliName,
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isActive ? const Color(0x1A22C55E) : const Color(0x1AF59E0B),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        isActive ? 'Active' : 'Cancelled',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: isActive ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  isActive ? 'Valid until: $endDateStr' : 'Access ended: $endDateStr',
                                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            height: 32,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.grey[100],
                                foregroundColor: Colors.grey[800],
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () => _handlePlaySub(surawaliName),
                              icon: const Icon(Icons.play_arrow, size: 14),
                              label: const Text('Play', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          if (isActive) ...[
                            const SizedBox(width: 6),
                            SizedBox(
                              height: 32,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0x1AEF4444),
                                  foregroundColor: Colors.red,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () => _handleCancelSub(subId, surawaliName),
                                icon: const Icon(Icons.delete_outline, size: 14),
                                label: const Text('Cancel', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
              error: (err, _) => Text('Error loading subscriptions: $err'),
            ),

            const SizedBox(height: 24),

            // ── Preferences ──
            _sectionTitle('Preferences'),
            const SizedBox(height: 8),
            Container(
              decoration: _cardDecoration(),
              child: Column(
                children: [
                  // Session Reminders Toggle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: catColors.catLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.notifications_outlined, size: 18, color: catColors.cat),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Session Reminders',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1E293B)),
                          ),
                        ),
                        Switch(
                          value: _sessionReminders,
                          activeTrackColor: catColors.cat.withValues(alpha: 0.5),
                          onChanged: (val) => setState(() => _sessionReminders = val),
                        ),
                      ],
                    ),
                  ),
                  Divider(height: 1, color: Colors.grey[200]),

                  // Theme
                  _buildProfileRow(
                    icon: Icons.palette_outlined,
                    label: 'Theme',
                    value: ref.watch(themeNotifierProvider) == ThemeMode.light
                        ? 'Light Mode'
                        : ref.watch(themeNotifierProvider) == ThemeMode.dark
                            ? 'Dark Mode'
                            : 'System Default',
                    catColor: catColors.cat,
                    catLight: catColors.catLight,
                    onTap: _showThemeModal,
                  ),
                  Divider(height: 1, color: Colors.grey[200]),

                  // Language
                  _buildProfileRow(
                    icon: Icons.language,
                    label: 'Language',
                    value: ref.watch(localeNotifierProvider).languageCode == 'hi'
                        ? 'हिन्दी (Hindi)'
                        : ref.watch(localeNotifierProvider).languageCode == 'sa'
                            ? 'संस्कृतम् (Sanskrit)'
                            : 'English (US)',
                    catColor: catColors.cat,
                    catLight: catColors.catLight,
                    onTap: _showLanguageModal,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Support ──
            _sectionTitle('Support'),
            const SizedBox(height: 8),
            Container(
              decoration: _cardDecoration(),
              child: Column(
                children: [
                  _buildProfileRow(
                    icon: Icons.shield_outlined,
                    label: 'Privacy Policy',
                    catColor: catColors.cat,
                    catLight: catColors.catLight,
                    onTap: () => context.push('/privacy'),
                  ),
                  Divider(height: 1, color: Colors.grey[200]),
                  _buildProfileRow(
                    icon: Icons.description_outlined,
                    label: 'Terms of Use',
                    catColor: catColors.cat,
                    catLight: catColors.catLight,
                    onTap: () => context.push('/terms'),
                  ),
                  Divider(height: 1, color: Colors.grey[200]),
                  _buildProfileRow(
                    icon: Icons.help_outline,
                    label: 'Help & Contact',
                    catColor: catColors.cat,
                    catLight: catColors.catLight,
                    onTap: () => setState(() => _showContact = !_showContact),
                  ),
                  if (_showContact)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        border: Border(top: BorderSide(color: Colors.grey[200]!)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'For support and inquiries, reach out to us at:',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(const ClipboardData(text: 'contact@krishnasanjeevani.com'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Email copied to clipboard')),
                              );
                            },
                            child: Text(
                              'contact@krishnasanjeevani.com',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: catColors.cat,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // ── Logout Button ──
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF3A3125),
                  side: BorderSide(color: Colors.grey[300]!),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                },
                icon: const Icon(Icons.logout, size: 18),
                label: const Text('Sign Out', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ),
            ),

            const SizedBox(height: 12),

            // ── Delete Account Button ──
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red[700],
                  backgroundColor: Colors.red.withValues(alpha: 0.05),
                  side: BorderSide(color: Colors.red.withValues(alpha: 0.3)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _handleDeleteAccount,
                icon: const Icon(Icons.delete_forever, size: 20),
                label: const Text('Delete Account & Data', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ),
            ),

            const SizedBox(height: 16),


            // ── Version ──
            const Center(
              child: Text(
                'Version 1.0.0',
                style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Color(0xFF1E293B),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      border: Border.all(color: Colors.grey[200]!),
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 3)),
      ],
    );
  }
}
