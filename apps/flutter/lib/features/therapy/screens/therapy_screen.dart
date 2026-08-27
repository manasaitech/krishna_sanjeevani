import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/category_provider.dart';
import '../../player/providers/player_provider.dart';
import '../providers/discover_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'widgets/mock_payment_modal.dart';

const Map<String, String> searchAliases = {
  "migrane": "Migraine",
  "migrain": "Migraine",
  "headache": "Migraine",
  "alziemer": "Alziemer",
  "alzheimer": "Alziemer",
  "alzheimers": "Alziemer",
  "memory": "Alziemer",
  "back apin": "Lower back apin",
  "back pain": "Lower back apin",
  "lower back": "Lower back apin",
  "sciatica": "Sciatica ",
  "bp": "Hyper tension",
  "blood pressure": "Hyper tension",
  "hypertension": "Hyper tension",
  "sleeplessness": "Insomnia",
  "sleep": "Insomnia",
  "depression": "Depression",
  "depressed": "Depression",
  "anxiety": "Anxiety ",
  "stress": "Anxiety ",
  "anger": "Anger",
  "cancer": "Cancer",
  "parkinson": "Parkinson",
  "parkinsons": "Parkinson",
};

class TherapyScreen extends ConsumerStatefulWidget {
  final String? initialSurawaliId;
  const TherapyScreen({this.initialSurawaliId, super.key});

  @override
  ConsumerState<TherapyScreen> createState() => _TherapyScreenState();
}

class _TherapyScreenState extends ConsumerState<TherapyScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  // Filters State
  String _searchQuery = "";
  final TextEditingController _searchController = TextEditingController();

  String? _selectedAilmentId;
  String? _selectedSurawaliId;
  String? _selectedTimingId;

  // Pregnancy Care state
  int _selectedMonth = 1;

  // Corporate Wellness state
  String _selectedDay = "Monday";

  bool _initialTabSelected = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    if (widget.initialSurawaliId != null) {
      _selectedSurawaliId = widget.initialSurawaliId;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  void _resetFilters() {
    setState(() {
      _searchQuery = "";
      _searchController.clear();
      _selectedAilmentId = null;
      _selectedSurawaliId = null;
      _selectedTimingId = null;
    });
  }

  void _handlePlayPreview(String surawaliName, String subtext, String categoryKey) {
    // 1. Search if track exists in user's tracks
    final allTracks = ref.read(allTracksProvider).value ?? [];
    final existingTrack = allTracks.firstWhere(
      (t) {
        final title = (t['title'] as String? ?? '').toLowerCase();
        final raga = (t['raga'] as String? ?? '').toLowerCase();
        final q = surawaliName.toLowerCase();
        return title.contains(q) || raga.contains(q);
      },
      orElse: () => <String, dynamic>{},
    );

    if (existingTrack.isNotEmpty) {
      ref.read(playerProvider.notifier).playTrack(existingTrack);
    } else {
      // 2. Play fallback track pointing to database to avoid stream ticket failures
      Map<String, dynamic> fallback = {};
      if (categoryKey == 'pregnancy') {
        fallback = allTracks.firstWhere((t) => t['category'] == 'pregnancy', orElse: () => <String, dynamic>{});
      } else if (categoryKey == 'corporate') {
        fallback = allTracks.firstWhere((t) => t['category'] == 'secular' || t['category'] == 'corporate', orElse: () => <String, dynamic>{});
      }
      if (fallback.isEmpty) {
        fallback = allTracks.firstWhere((t) => t['category'] == 'secular', orElse: () => <String, dynamic>{});
      }
      if (fallback.isEmpty && allTracks.isNotEmpty) {
        fallback = allTracks.first;
      }

      if (fallback.isNotEmpty) {
        final playedTrack = Map<String, dynamic>.from(fallback);
        playedTrack['title'] = '$surawaliName (${fallback['title']})';
        ref.read(playerProvider.notifier).playTrack(playedTrack);
      } else {
        // Hard fallback if allTracks is empty (e.g. offline fallback)
        final fallbackOffline = {
          'id': 'fallback_preview',
          'title': '$surawaliName (Acoustic Preview)',
          'frequency': '432 Hz',
          'duration': 1800,
          'category': 'Sonic Therapy',
          'description': 'Targeted therapeutic frequency session for holistic wellness.',
        };
        ref.read(playerProvider.notifier).playTrack(fallbackOffline);
      }
    }

    context.push('/player');
  }

  void _handleSubscribeClick(Map<String, dynamic> surawali) {
    final authState = ref.read(authProvider);
    if (!authState.isAuthenticated) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Sign In Required'),
          content: const Text('Please sign in to subscribe to this therapeutic Surāwali.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/login');
              },
              child: const Text('Sign In'),
            ),
          ],
        ),
      );
      return;
    }

    // Open Mock Payment Modal
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final catColors = ref.read(categoryColorsProvider);
        return MockPaymentModal(
          surawaliName: surawali['name'] ?? 'Acoustic Surāwali',
          price: 299,
          primaryColor: catColors.cat,
          lightColor: catColors.catLight,
          onClose: () => Navigator.of(ctx).pop(),
          onSuccess: (txnId) async {
            Navigator.of(ctx).pop();
            final success = await ref.read(discoverNotifierProvider.notifier).subscribe(
                  surawaliId: surawali['id'] ?? '',
                  plan: 'monthly',
                  paymentId: txnId,
                );
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    success
                        ? 'Successfully subscribed to ${surawali['name']}!'
                        : 'Failed to complete subscription.',
                  ),
                  backgroundColor: success ? Colors.green : Colors.red,
                ),
              );
            }
          },
        );
      },
    );
  }

  void _showFilterPicker({
    required String title,
    required List<Map<String, dynamic>> items,
    required String? selectedId,
    required ValueChanged<String?> onSelected,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final catColors = ref.read(categoryColorsProvider);
        String searchVal = "";
        return StatefulBuilder(
          builder: (context, setModalState) {
            final filteredItems = items.where((item) {
              final name = (item['name'] as String? ?? '').toLowerCase();
              return name.contains(searchVal.toLowerCase());
            }).toList();

            return Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.8,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A)),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF7C7A85)),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search box in picker
                  TextField(
                    onChanged: (val) => setModalState(() => searchVal = val),
                    decoration: InputDecoration(
                      hintText: 'Search...',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: const Color(0xFFFAF8F4),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E4DC)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Scrollable List
                  Expanded(
                    child: ListView(
                      children: [
                        // "All" Option
                        ListTile(
                          selected: selectedId == null,
                          selectedColor: catColors.cat,
                          selectedTileColor: catColors.catLight,
                          title: const Text('All / Any', style: TextStyle(fontWeight: FontWeight.w600)),
                          onTap: () {
                            onSelected(null);
                            Navigator.of(context).pop();
                          },
                        ),
                        const Divider(height: 1, color: Color(0xFFE8E4DC)),
                        ...filteredItems.map((item) {
                          final id = item['id'] as String;
                          final name = item['name'] as String;
                          final isSelected = selectedId == id;
                          return ListTile(
                            selected: isSelected,
                            selectedColor: catColors.cat,
                            selectedTileColor: catColors.catLight,
                            title: Text(name),
                            onTap: () {
                              onSelected(id);
                              Navigator.of(context).pop();
                            },
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPickerButton({
    required String label,
    required String valueText,
    required VoidCallback onTap,
    required Color primaryColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Color(0xFF8A7963),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE8E4DC)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    valueText,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF1A1A1A)),
                  ),
                ),
                const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF7C7A85)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final catalogAsync = ref.watch(discoverCatalogProvider);
    final subscriptionsAsync = ref.watch(userSubscriptionsProvider);
    
    // Trigger loading all tracks in background for fallback lookup
    ref.watch(allTracksProvider);

    final activeSubscriptions = subscriptionsAsync.value ?? [];
    final activeSubIds = activeSubscriptions.map((s) => s['surawaliId'] as String).toSet();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sonic Therapy Catalog'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: catColors.cat,
          labelColor: catColors.cat,
          unselectedLabelColor: const Color(0xFF7A6B58),
          tabs: const [
            Tab(text: 'Ailments'),
            Tab(text: 'Garbh Sanjeevani'),
            Tab(text: 'Arogya Sanjeevani'),
          ],
        ),
      ),
      body: catalogAsync.when(
        data: (catalog) {
          final ailments = catalog.ailments;
          final surawalis = catalog.surawalis;
          final timings = catalog.timings;
          final mappings = catalog.ailmentSurawalis;
          final pregnancy = catalog.pregnancyMappings;
          final corporate = catalog.corporateRagas;

          // Auto-select correct category tab and filters if initialSurawaliId is specified
          if (!_initialTabSelected && widget.initialSurawaliId != null) {
            _initialTabSelected = true;
            final targetId = widget.initialSurawaliId!;
            
            final isPregnancy = pregnancy.any((p) => p['surawaliId'] == targetId);
            final isCorporate = corporate.any((c) => c['surawaliId'] == targetId);
            
            int targetTab = 0;
            if (isPregnancy) {
              targetTab = 1;
              final match = pregnancy.firstWhere((p) => p['surawaliId'] == targetId, orElse: () => {});
              if (match.isNotEmpty) {
                final month = (match['pregnancyMonth'] as num? ?? 1).toInt();
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _selectedMonth = month);
                });
              }
            } else if (isCorporate) {
              targetTab = 2;
              final match = corporate.firstWhere((c) => c['surawaliId'] == targetId, orElse: () => {});
              if (match.isNotEmpty) {
                final day = match['day'] as String? ?? 'Monday';
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _selectedDay = day);
                });
              }
            }
            
            if (targetTab > 0) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  _tabController.animateTo(targetTab);
                }
              });
            }
          }

          // Helper lookups
          String getAilmentName(String id) =>
              ailments.firstWhere((a) => a['id'] == id, orElse: () => {})['name'] ?? '';
          String getSurawaliName(String id) =>
              surawalis.firstWhere((s) => s['id'] == id, orElse: () => {})['name'] ?? '';
          String getTimingName(String id) =>
              timings.firstWhere((t) => t['id'] == id, orElse: () => {})['name'] ?? '';

          // Filter Ailment Mappings based on user selections
          final filteredMappings = mappings.where((m) {
            final ailmentId = m['ailmentId'] as String? ?? '';
            final surawaliId = m['surawaliId'] as String? ?? '';
            final timingId = m['timingId'] as String? ?? '';

            if (_selectedAilmentId != null && ailmentId != _selectedAilmentId) return false;
            if (_selectedSurawaliId != null && surawaliId != _selectedSurawaliId) return false;
            if (_selectedTimingId != null && timingId != _selectedTimingId) return false;

            if (_searchQuery.trim().isNotEmpty) {
              final query = _searchQuery.trim().toLowerCase();
              final mappedAlias = searchAliases[query] ?? query;

              final aName = getAilmentName(ailmentId).toLowerCase();
              final sName = getSurawaliName(surawaliId).toLowerCase();
              final tName = getTimingName(timingId).toLowerCase();

              final match = aName.contains(query) ||
                  aName.contains(mappedAlias) ||
                  sName.contains(query) ||
                  tName.contains(query);
              if (!match) return false;
            }

            return true;
          }).toList();

          return TabBarView(
            controller: _tabController,
            children: [
              // ── Subtab 1: Therapeutic Ailments ──
              SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stacked filters container matching React Native's filtersCard
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE8E4DC)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D000000),
                            blurRadius: 14,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Search text input
                          TextField(
                            controller: _searchController,
                            onChanged: (val) => setState(() => _searchQuery = val),
                            decoration: InputDecoration(
                              hintText: 'Type ailment (e.g. Migraine, Insomnia...)',
                              hintStyle: const TextStyle(color: Color(0x807C7A85)),
                              prefixIcon: const Icon(Icons.search, color: Color(0xFF7C7A85)),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear, color: Color(0xFF7C7A85)),
                                      onPressed: () {
                                        _searchController.clear();
                                        setState(() => _searchQuery = "");
                                      },
                                    )
                                  : null,
                              filled: true,
                              fillColor: const Color(0xFFFAF8F4),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFFE8E4DC)),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // 1. Disorder / Ailment Picker
                          _buildPickerButton(
                            label: 'Disorder / Ailment',
                            valueText: _selectedAilmentId != null
                                ? getAilmentName(_selectedAilmentId!)
                                : 'Select Ailment (e.g., Asthma)',
                            primaryColor: catColors.cat,
                            onTap: () => _showFilterPicker(
                              title: 'Select Ailment / Disorder',
                              items: ailments,
                              selectedId: _selectedAilmentId,
                              onSelected: (val) => setState(() => _selectedAilmentId = val),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // 2. Surāwali Raga Picker
                          _buildPickerButton(
                            label: 'Surāwali Raga',
                            valueText: _selectedSurawaliId != null
                                ? getSurawaliName(_selectedSurawaliId!)
                                : 'Select Surāwali',
                            primaryColor: catColors.cat,
                            onTap: () => _showFilterPicker(
                              title: 'Select Surāwali Raga',
                              items: surawalis,
                              selectedId: _selectedSurawaliId,
                              onSelected: (val) => setState(() => _selectedSurawaliId = val),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // 3. Optimal Timing Picker
                          _buildPickerButton(
                            label: 'Optimal Timing',
                            valueText: _selectedTimingId != null
                                ? getTimingName(_selectedTimingId!)
                                : 'Select Timing',
                            primaryColor: catColors.cat,
                            onTap: () => _showFilterPicker(
                              title: 'Select Optimal Timing',
                              items: timings,
                              selectedId: _selectedTimingId,
                              onSelected: (val) => setState(() => _selectedTimingId = val),
                            ),
                          ),

                          if (_selectedAilmentId != null ||
                              _selectedSurawaliId != null ||
                              _selectedTimingId != null ||
                              _searchQuery.isNotEmpty) ...[
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  side: const BorderSide(color: Color(0xFFE8E4DC)),
                                  backgroundColor: const Color(0xFFFAF8F4),
                                ),
                                onPressed: _resetFilters,
                                child: const Text(
                                  'Reset All Filters',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4D0F1B)),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Results Header
                    Text(
                      'Matched Prescriptions',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),

                    if (filteredMappings.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: const Column(
                          children: [
                            Icon(Icons.warning_amber_rounded, size: 36, color: Color(0xFFC9A84C)),
                            SizedBox(height: 12),
                            Text(
                              'No recommendations found',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF4D0F1B)),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Try adjusting filters or searching a different disorder.',
                              style: TextStyle(fontSize: 12, color: Color(0xFF7C7A85)),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredMappings.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = filteredMappings[index];
                          final surawaliId = item['surawaliId'] as String;
                          final ailmentName = getAilmentName(item['ailmentId']);
                          final surawaliName = getSurawaliName(surawaliId);
                          final timingName = getTimingName(item['timingId']);
                          final isSubscribed = activeSubIds.contains(surawaliId);

                          final surawaliObj = surawalis.firstWhere(
                            (s) => s['id'] == surawaliId,
                            orElse: () => {'id': surawaliId, 'name': surawaliName},
                          );

                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFE8E4DC)),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x0D000000),
                                  blurRadius: 14,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0x144D0F1B),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        ailmentName.toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF4D0F1B),
                                          letterSpacing: 1.1,
                                        ),
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time, size: 12, color: Color(0xFF7C7A85)),
                                        const SizedBox(width: 4),
                                        Text(
                                          timingName,
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF7C7A85)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  surawaliName,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1A1A1A),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Vedic music frequency session customized for ${ailmentName.toLowerCase()}.',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: Color(0xFF5C5040),
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 10),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          side: const BorderSide(color: Color(0xFF4D0F1B)),
                                          foregroundColor: const Color(0xFF4D0F1B),
                                        ),
                                        icon: const Icon(Icons.play_arrow, size: 14),
                                        label: const Text('Play Preview', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                        onPressed: () => _handlePlayPreview(surawaliName, 'Disorder: $ailmentName', 'ailments'),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: isSubscribed
                                          ? ElevatedButton.icon(
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: const Color(0xFFC9A84C),
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(vertical: 10),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                              ),
                                              icon: const Icon(Icons.play_arrow, size: 14),
                                              label: const Text('Play Session', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                              onPressed: () => _handlePlayPreview(surawaliName, 'Full Therapy Session', 'ailments'),
                                            )
                                          : ElevatedButton.icon(
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: const Color(0xFF4D0F1B),
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(vertical: 10),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                              ),
                                              icon: const Icon(Icons.lock, size: 14),
                                              label: const Text('Subscribe', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                              onPressed: () => _handleSubscribeClick(surawaliObj),
                                            ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),

              // ── Subtab 2: Pregnancy Care ──
              SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE8E4DC)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D000000),
                            blurRadius: 14,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Choose Pregnancy Month',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4D0F1B),
                            ),
                          ),
                          const SizedBox(height: 10),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: List.generate(9, (idx) {
                                final month = idx + 1;
                                final selected = month == _selectedMonth;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: ChoiceChip(
                                    label: Text('Month $month'),
                                    selected: selected,
                                    selectedColor: const Color(0x1FC9A84C),
                                    labelStyle: TextStyle(
                                      color: selected ? const Color(0xFF4D0F1B) : const Color(0xFF7C7A85),
                                      fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                                    ),
                                    onSelected: (_) => setState(() => _selectedMonth = month),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      'Month $_selectedMonth Care Raga',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Builder(
                      builder: (context) {
                        final pregList = pregnancy.where((p) {
                          final m = p['pregnancyMonth'] as num? ?? 1;
                          return m == _selectedMonth;
                        }).toList();

                        if (pregList.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                'No pregnancy data configured',
                                style: TextStyle(color: Color(0xFF7C7A85)),
                              ),
                            ),
                          );
                        }

                        return ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: pregList.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final p = pregList[index];
                            final surawaliName = getSurawaliName(p['surawaliId']);
                            final timingName = getTimingName(p['timingId']);
                            final surawaliId = p['surawaliId'] as String;
                            final isSubscribed = activeSubIds.contains(surawaliId);

                            final surawaliObj = surawalis.firstWhere(
                              (s) => s['id'] == surawaliId,
                              orElse: () => {'id': surawaliId, 'name': surawaliName},
                            );

                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE8E4DC)),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x0D000000),
                                    blurRadius: 14,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0x144D0F1B),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          'PREGNANCY MONTH $_selectedMonth',
                                          style: const TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF4D0F1B),
                                            letterSpacing: 1.1,
                                          ),
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          const Icon(Icons.access_time, size: 12, color: Color(0xFF7C7A85)),
                                          const SizedBox(width: 4),
                                          Text(
                                            timingName,
                                            style: const TextStyle(fontSize: 11, color: Color(0xFF7C7A85)),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    surawaliName,
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1A1A1A),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Healthy womb stimulation and hormonal balance acoustic frequency.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF5C5040),
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(vertical: 10),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                            side: const BorderSide(color: Color(0xFF4D0F1B)),
                                            foregroundColor: const Color(0xFF4D0F1B),
                                          ),
                                          icon: const Icon(Icons.play_arrow, size: 14),
                                          label: const Text('Play Preview', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                          onPressed: () => _handlePlayPreview(surawaliName, 'Pregnancy Month $_selectedMonth', 'pregnancy'),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: isSubscribed
                                            ? ElevatedButton.icon(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: const Color(0xFFC9A84C),
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                ),
                                                icon: const Icon(Icons.play_arrow, size: 14),
                                                label: const Text('Play Session', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                onPressed: () => _handlePlayPreview(surawaliName, 'Full Pregnancy Session', 'pregnancy'),
                                              )
                                            : ElevatedButton.icon(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: const Color(0xFF4D0F1B),
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                ),
                                                icon: const Icon(Icons.lock, size: 14),
                                                label: const Text('Subscribe', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                onPressed: () => _handleSubscribeClick(surawaliObj),
                                              ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),

              // ── Subtab 3: Corporate Wellness ──
              SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE8E4DC)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D000000),
                            blurRadius: 14,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Choose Office Weekday',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4D0F1B),
                            ),
                          ),
                          const SizedBox(height: 10),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Daily"].map((day) {
                                final selected = day == _selectedDay;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: ChoiceChip(
                                    label: Text(day),
                                    selected: selected,
                                    selectedColor: const Color(0x1FC9A84C),
                                    labelStyle: TextStyle(
                                      color: selected ? const Color(0xFF4D0F1B) : const Color(0xFF7C7A85),
                                      fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                                    ),
                                    onSelected: (_) => setState(() => _selectedDay = day),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      '$_selectedDay Stress Buster',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Builder(
                      builder: (context) {
                        final corpList = corporate.where((c) {
                          final day = c['weekDay'] as String? ?? '';
                          return day.toLowerCase() == _selectedDay.toLowerCase() ||
                              day.toLowerCase() == 'daily';
                        }).toList();

                        if (corpList.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                'No corporate wellness config found',
                                style: TextStyle(color: Color(0xFF7C7A85)),
                              ),
                            ),
                          );
                        }

                        return ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: corpList.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final c = corpList[index];
                            final ragaName = c['ragaName'] as String? ?? 'Acoustic Raga';
                            final timingName = getTimingName(c['timingId']);

                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE8E4DC)),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x0D000000),
                                    blurRadius: 14,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0x144D0F1B),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: const Text(
                                          'CORPORATE WELLNESS',
                                          style: TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF4D0F1B),
                                            letterSpacing: 1.1,
                                          ),
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          const Icon(Icons.access_time, size: 12, color: Color(0xFF7C7A85)),
                                          const SizedBox(width: 4),
                                          Text(
                                            timingName,
                                            style: const TextStyle(fontSize: 11, color: Color(0xFF7C7A85)),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    ragaName,
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1A1A1A),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Relieve office workload stress, digital fatigue, and improve focus.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF5C5040),
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFFC9A84C),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 10),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          icon: const Icon(Icons.play_arrow, size: 14),
                                          label: const Text('Play Session', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                          onPressed: () => _handlePlayPreview(ragaName, 'Corporate $_selectedDay', 'corporate'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading catalogue: $err')),
      ),
    );
  }
}
