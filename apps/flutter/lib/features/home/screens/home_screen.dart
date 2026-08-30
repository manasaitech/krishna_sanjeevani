import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/screens/notifications_screen.dart';
import '../../player/providers/player_provider.dart';
import '../../tracks/providers/tracks_provider.dart';
import '../../therapy/providers/discover_provider.dart';

String _getGreeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _exploreKey = GlobalKey();

  String _searchQuery = '';
  String _selectedParam = ''; // Ailment ID, Pregnancy Month, or Corporate Day
  String _selectedTimingId = '';
  String _activeChip = 'All';
  int _currentPage = 1;
  final int _itemsPerPage = 4;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      if (mounted) {
        setState(() {
          _searchQuery = _searchController.text;
          _currentPage = 1;
        });
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _searchQuery = '';
      _selectedParam = '';
      _selectedTimingId = '';
      _activeChip = 'All';
      _currentPage = 1;
    });
  }

  void _scrollToExplore() {
    if (_exploreKey.currentContext != null) {
      Scrollable.ensureVisible(
        _exploreKey.currentContext!,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  void _handlePlaySurawali(BuildContext context, WidgetRef ref, String surawaliName, {required bool isPreview}) {
    final allTracks = ref.read(allTracksProvider).value ?? [];
    
    // Find track matching the Surawali name in title or raga name
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
      final playedTrack = Map<String, dynamic>.from(existingTrack);
      if (isPreview) {
        playedTrack['title'] = '$surawaliName (Preview)';
        playedTrack['duration'] = 90; // Limit preview duration in player
      } else {
        playedTrack['title'] = surawaliName;
      }
      ref.read(playerProvider.notifier).playTrack(playedTrack);
      context.push('/player');
    } else {
      // Try to find any track in similar categories, or play the first track as a fallback
      final fallback = allTracks.isNotEmpty ? allTracks.first : <String, dynamic>{};
      if (fallback.isNotEmpty) {
        final playedTrack = Map<String, dynamic>.from(fallback);
        if (isPreview) {
          playedTrack['title'] = '$surawaliName (Preview)';
          playedTrack['duration'] = 90;
        } else {
          playedTrack['title'] = surawaliName;
        }
        ref.read(playerProvider.notifier).playTrack(playedTrack);
        context.push('/player');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Audio session not available for this Surāwali yet.'),
          ),
        );
      }
    }
  }

  Future<void> _handleSubscribe(String surawaliId, String name) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final success = await ref.read(discoverNotifierProvider.notifier).subscribe(
          surawaliId: surawaliId,
          plan: 'monthly',
        );

    if (mounted) Navigator.pop(context);

    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Successfully subscribed to $name!'),
            backgroundColor: const Color(0xFF047857),
          ),
        );
      }
    } else {
      final error = ref.read(discoverNotifierProvider).error?.toString() ?? 'Failed to subscribe';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Colors.red[700],
          ),
        );
      }
    }
  }

  void _showSubscriptionModal(Map<String, dynamic> surawali) {
    final catColors = ref.read(categoryColorsProvider);
    final activeCat = ref.read(categoryProvider);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: catColors.cat,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.star_border, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Confirm Subscription',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        Text(
                          'Premium Raga Chikitsa Sequence',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  border: Border.all(color: Colors.grey[200]!),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildModalRow('Sequence:', surawali['title'] as String? ?? 'Surawali'),
                    const SizedBox(height: 10),
                    _buildModalRow('Pathway:', activeCat.displayName),
                    const SizedBox(height: 10),
                    _buildModalRow('Price Tier:', '₹299 / month', isPrice: true),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: catColors.cat,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () async {
                        Navigator.pop(context);
                        await _handleSubscribe(surawali['surawaliId'] as String, surawali['title'] as String);
                      },
                      child: const Text('Mock Success Payment'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildModalRow(String label, String value, {bool isPrice = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isPrice ? const Color(0xFF047857) : const Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChips(AppCategory activeCat, CategoryColors catColors) {
    final chips = activeCat.filters;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: chips.map((chipName) {
          final isSelected = _activeChip == chipName;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(chipName),
              selected: isSelected,
              selectedColor: catColors.cat.withValues(alpha: 0.15),
              labelStyle: TextStyle(
                color: isSelected ? catColors.cat : Colors.grey[700],
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? catColors.cat : Colors.grey[300]!,
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              onSelected: (_) {
                setState(() {
                  _activeChip = chipName;
                  _currentPage = 1;
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFiltersToolbar(AppCategory activeCat, CategoryColors catColors, DiscoverCatalog? catalog) {
    List<DropdownMenuItem<String>> paramItems = [
      const DropdownMenuItem(value: '', child: Text('-- All Options --')),
    ];

    if (catalog != null) {
      if (activeCat == AppCategory.devotional) {
        for (final a in catalog.ailments) {
          paramItems.add(DropdownMenuItem(
            value: a['id'] as String,
            child: Text(a['name'] as String),
          ));
        }
      } else if (activeCat == AppCategory.pregnancy) {
        for (int i = 1; i <= 9; i++) {
          paramItems.add(DropdownMenuItem(
            value: i.toString(),
            child: Text('Month $i'),
          ));
        }
      } else {
        final days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (final d in days) {
          paramItems.add(DropdownMenuItem(
            value: d,
            child: Text(d),
          ));
        }
      }
    }

    List<DropdownMenuItem<String>> timingItems = [
      const DropdownMenuItem(value: '', child: Text('-- Any Time --')),
    ];
    if (catalog != null) {
      for (final t in catalog.timings) {
        timingItems.add(DropdownMenuItem(
          value: t['id'] as String,
          child: Text(t['name'] as String),
        ));
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Search',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: activeCat.placeholderSearch,
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () => _searchController.clear(),
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[200]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: catColors.cat),
              ),
            ),
          ),
          const SizedBox(height: 16),

          Text(
            activeCat == AppCategory.devotional
                ? 'Disorder / Ailment'
                : activeCat == AppCategory.pregnancy
                    ? 'Pregnancy Month'
                    : 'Corporate Day',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _selectedParam,
            items: paramItems,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[200]!),
              ),
            ),
            onChanged: (val) {
              setState(() {
                _selectedParam = val ?? '';
                _currentPage = 1;
              });
            },
          ),
          const SizedBox(height: 16),

          const Text(
            'Best Listening Time',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _selectedTimingId,
            items: timingItems,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[200]!),
              ),
            ),
            onChanged: (val) {
              setState(() {
                _selectedTimingId = val ?? '';
                _currentPage = 1;
              });
            },
          ),
          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                side: BorderSide(color: Colors.grey[300]!),
              ),
              onPressed: _resetFilters,
              icon: const Icon(Icons.tune, size: 16, color: Colors.grey),
              label: const Text(
                'Reset Filters',
                style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExploreResultCard(
      Map<String, dynamic> item,
      bool isSubscribed,
      CategoryColors catColors,
      BuildContext context,
      WidgetRef ref,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: catColors.cat,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text(
                  item['title'].toString().substring(0, 2).toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item['title'] as String? ?? '',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      child: Text(
                        item['purpose'] as String? ?? '',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item['description'] as String? ?? '',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.access_time, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 4),
              Text(
                'Timing: ${item['timing']}',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
              const SizedBox(width: 12),
              Icon(Icons.hourglass_empty, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 4),
              Text(
                'Duration: ${item['duration']}',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[100],
                    foregroundColor: Colors.grey[800],
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  onPressed: () {
                    _handlePlaySurawali(context, ref, item['title'] as String, isPreview: true);
                  },
                  icon: const Icon(Icons.play_arrow, size: 16),
                  label: const Text('Preview', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: isSubscribed
                    ? ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: catColors.cat,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () {
                          _handlePlaySurawali(context, ref, item['title'] as String, isPreview: false);
                        },
                        icon: const Icon(Icons.waves, size: 16),
                        label: const Text('Listen Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      )
                    : ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E293B),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () => _showSubscriptionModal(item),
                        icon: const Icon(Icons.lock, size: 16),
                        label: const Text('Subscribe', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPagination(int totalPages, CategoryColors catColors) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          onPressed: _currentPage > 1
              ? () => setState(() => _currentPage--)
              : null,
          icon: const Icon(Icons.chevron_left),
        ),
        ...List.generate(totalPages, (index) {
          final pageNum = index + 1;
          final isSelected = _currentPage == pageNum;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: SizedBox(
              width: 36,
              height: 36,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isSelected ? catColors.cat : Colors.white,
                  foregroundColor: isSelected ? Colors.white : Colors.grey[800],
                  padding: EdgeInsets.zero,
                  elevation: 0,
                  side: BorderSide(
                    color: isSelected ? catColors.cat : Colors.grey[300]!,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () => setState(() => _currentPage = pageNum),
                child: Text(
                  '$pageNum',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          );
        }),
        IconButton(
          onPressed: _currentPage < totalPages
              ? () => setState(() => _currentPage++)
              : null,
          icon: const Icon(Icons.chevron_right),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCat = ref.watch(categoryProvider);
    final continueListeningAsync = ref.watch(continueListeningProvider);
    final notificationsAsync = ref.watch(notificationsListProvider);
    final authState = ref.watch(authProvider);
    
    final catalogAsync = ref.watch(discoverCatalogProvider);
    final subscriptionsAsync = ref.watch(userSubscriptionsProvider);

    final user = authState.user;
    final userName = user?['profile']?['fullName'] ??
        (user?['email'] != null ? (user!['email'] as String).split('@')[0] : 'Bhakta');

    final unreadCount = notificationsAsync.value?.where((n) => n['read'] == false).length ?? 0;

    final catalog = catalogAsync.value;
    final subscriptions = subscriptionsAsync.value ?? [];

    final filteredSubscriptions = subscriptions.where((sub) {
      final sId = sub['surawaliId'] as String? ?? '';
      final sName = sub['surawaliName'] as String? ?? '';

      if (activeCat == AppCategory.pregnancy && (sName == 'Greeshma' || sId == 'sur_b719ad07-c4a5-51db-aaa5-48027611b68d')) {
        return false;
      }
      if (catalog == null) return false;

      if (activeCat == AppCategory.devotional) {
        return catalog.ailmentSurawalis.any((m) => m['surawaliId'] == sId);
      } else if (activeCat == AppCategory.pregnancy) {
        return catalog.pregnancyMappings.any((m) => m['surawaliId'] == sId);
      } else {
        return false;
      }
    }).toList();

    List<Map<String, dynamic>> exploreResults = [];
    if (catalog != null) {
      final ailments = catalog.ailments;
      final surawalis = catalog.surawalis;
      final timings = catalog.timings;
      final ailmentSurawalis = catalog.ailmentSurawalis;
      final pregnancyMappings = catalog.pregnancyMappings;
      final corporateRagas = catalog.corporateRagas;

      String getSurawaliName(String id) {
        final match = surawalis.firstWhere((s) => s['id'] == id, orElse: () => <String, dynamic>{});
        return match['name'] as String? ?? 'Unknown Surawali';
      }

      String getTimingName(String id) {
        final match = timings.firstWhere((t) => t['id'] == id, orElse: () => <String, dynamic>{});
        return match['name'] as String? ?? 'Any Time';
      }

      String getAilmentName(String id) {
        final match = ailments.firstWhere((a) => a['id'] == id, orElse: () => <String, dynamic>{});
        return match['name'] as String? ?? 'Therapeutic';
      }

      if (activeCat == AppCategory.devotional) {
        exploreResults = ailmentSurawalis.where((m) {
          final sName = getSurawaliName(m['surawaliId'] as String? ?? '');
          final aName = getAilmentName(m['ailmentId'] as String? ?? '');

          bool matchesChip = _activeChip == 'All';
          if (!matchesChip) {
            if (_activeChip == 'Disorder Relief') {
              matchesChip = const ['Anxiety', 'Migraine', 'Hypertension', 'Insomnia'].any((d) => aName.toLowerCase().contains(d.toLowerCase()));
            } else if (_activeChip == 'Stress Relief') {
              matchesChip = const ['Stress', 'Anxiety'].any((d) => aName.toLowerCase().contains(d.toLowerCase()));
            } else if (_activeChip == 'Focus') {
              matchesChip = const ['Focus', 'Concentration'].any((d) => aName.toLowerCase().contains(d.toLowerCase()));
            } else if (_activeChip == 'Sleep') {
              matchesChip = const ['Sleep', 'Insomnia'].any((d) => aName.toLowerCase().contains(d.toLowerCase()));
            } else {
              matchesChip = aName.toLowerCase().contains(_activeChip.toLowerCase());
            }
          }

          final matchesSearch = _searchQuery.trim().isEmpty ||
              sName.toLowerCase().contains(_searchQuery.trim().toLowerCase()) ||
              aName.toLowerCase().contains(_searchQuery.trim().toLowerCase());

          final matchesParam = _selectedParam.isEmpty || m['ailmentId'] == _selectedParam;
          final matchesTiming = _selectedTimingId.isEmpty || m['timingId'] == _selectedTimingId;

          return matchesChip && matchesSearch && matchesParam && matchesTiming;
        }).map((m) {
          final sName = getSurawaliName(m['surawaliId'] as String? ?? '');
          final aName = getAilmentName(m['ailmentId'] as String? ?? '');
          return {
            'id': m['id'],
            'surawaliId': m['surawaliId'],
            'title': sName,
            'purpose': aName,
            'timing': getTimingName(m['timingId'] as String? ?? ''),
            'duration': '30 min',
            'description': 'Curated harmonic resonance session optimized for restorative bio-acoustic alignment.',
            'type': 'ailment',
          };
        }).toList();
      } else if (activeCat == AppCategory.pregnancy) {
        exploreResults = pregnancyMappings.where((m) {
          final sName = getSurawaliName(m['surawaliId'] as String? ?? '');

          if (sName == 'Greeshma' || m['surawaliId'] == 'sur_b719ad07-c4a5-51db-aaa5-48027611b68d') {
            return false;
          }

          final month = m['pregnancyMonth'] as int? ?? 1;

          bool matchesChip = _activeChip == 'All';
          if (!matchesChip) {
            if (_activeChip == 'Month 1-3') {
              matchesChip = const [1, 2, 3].contains(month);
            } else if (_activeChip == 'Month 4-6') {
              matchesChip = const [4, 5, 6].contains(month);
            } else if (_activeChip == 'Month 7-9') {
              matchesChip = const [7, 8, 9].contains(month);
            } else {
              matchesChip = sName.toLowerCase().contains(_activeChip.toLowerCase());
            }
          }

          final matchesSearch = _searchQuery.trim().isEmpty ||
              sName.toLowerCase().contains(_searchQuery.trim().toLowerCase());

          final matchesParam = _selectedParam.isEmpty || month.toString() == _selectedParam;
          final matchesTiming = _selectedTimingId.isEmpty || m['timingId'] == _selectedTimingId;

          return matchesChip && matchesSearch && matchesParam && matchesTiming;
        }).map((m) {
          final sName = getSurawaliName(m['surawaliId'] as String? ?? '');
          final month = m['pregnancyMonth'] as int? ?? 1;
          return {
            'id': m['id'],
            'surawaliId': m['surawaliId'],
            'title': sName,
            'purpose': 'Pregnancy Care (Month $month)',
            'timing': getTimingName(m['timingId'] as String? ?? ''),
            'duration': '28 min',
            'description': 'Delicate and calming sound therapy to support maternal comfort and healthy fetal development.',
            'type': 'pregnancy',
          };
        }).toList();
      } else {
        exploreResults = corporateRagas.where((m) {
          final ragaName = m['ragaName'] as String? ?? '';
          final weekDay = m['weekDay'] as String? ?? '';

          bool matchesChip = _activeChip == 'All';
          if (!matchesChip) {
            if (_activeChip == 'Workplace Stress') {
              matchesChip = const ['Monday', 'Wednesday', 'Friday'].contains(weekDay);
            } else if (_activeChip == 'Focus Boost') {
              matchesChip = const ['Tuesday', 'Thursday'].contains(weekDay);
            } else {
              matchesChip = ragaName.toLowerCase().contains(_activeChip.toLowerCase());
            }
          }

          final matchesSearch = _searchQuery.trim().isEmpty ||
              ragaName.toLowerCase().contains(_searchQuery.trim().toLowerCase());

          final matchesParam = _selectedParam.isEmpty || weekDay == _selectedParam;
          final matchesTiming = _selectedTimingId.isEmpty || m['timingId'] == _selectedTimingId;

          return matchesChip && matchesSearch && matchesParam && matchesTiming;
        }).map((m) {
          final ragaName = m['ragaName'] as String? ?? '';
          final weekDay = m['weekDay'] as String? ?? '';
          return {
            'id': m['id'],
            'surawaliId': m['id'],
            'title': ragaName,
            'purpose': 'Workspace Wellness ($weekDay)',
            'timing': getTimingName(m['timingId'] as String? ?? ''),
            'duration': '32 min',
            'description': 'Professional auditory composition calibrated to suppress cognitive fatigue and elevate office focus.',
            'type': 'corporate',
          };
        }).toList();
      }
    }

    final totalPages = (exploreResults.length / _itemsPerPage).ceil();
    if (_currentPage > totalPages && totalPages > 0) {
      _currentPage = totalPages;
    }

    final startIndex = (_currentPage - 1) * _itemsPerPage;
    final endIndex = startIndex + _itemsPerPage;
    final paginatedResults = exploreResults.isNotEmpty
        ? exploreResults.sublist(
            startIndex,
            endIndex > exploreResults.length ? exploreResults.length : endIndex,
          )
        : [];

    return Scaffold(
      backgroundColor: const Color(0xFFFCFCFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${_getGreeting()},',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal, color: Color(0xFF7A6B58)),
            ),
            Text(
              userName,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: catColors.cat),
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Color(0xFF4A5568)),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                  );
                },
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: catColors.cat,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(discoverCatalogProvider);
          ref.invalidate(userSubscriptionsProvider);
          ref.invalidate(continueListeningProvider);
        },
        child: SingleChildScrollView(
          controller: _scrollController,
          padding: const EdgeInsets.all(20.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: AppCategory.values.map((cat) {
                    final selected = cat == activeCat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(cat.displayName),
                        selected: selected,
                        selectedColor: catColors.cat.withValues(alpha: 0.15),
                        labelStyle: TextStyle(
                          color: selected ? catColors.cat : Colors.grey[700],
                          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (_) {
                          ref.read(categoryProvider.notifier).setCategory(cat);
                          _resetFilters();
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 20),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      catColors.cat.withValues(alpha: 0.05),
                      catColors.cat.withValues(alpha: 0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: catColors.cat.withValues(alpha: 0.15)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ACTIVE SANJEEVANI PATHWAY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      activeCat.displayName,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: catColors.cat,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      activeCat.description,
                      style: TextStyle(fontSize: 13, color: Colors.grey[700], height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: catColors.cat.withValues(alpha: 0.15)),
                      ),
                      child: Text(
                        activeCat.greetingText,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              subscriptionsAsync.when(
                data: (_) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Your Subscribed Surawalis',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            '${filteredSubscriptions.length} active',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      filteredSubscriptions.isNotEmpty
                          ? SizedBox(
                              height: 140,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: filteredSubscriptions.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 12),
                                itemBuilder: (context, index) {
                                  final sub = filteredSubscriptions[index];
                                  final surawaliName = sub['surawaliName'] as String? ?? 'Surawali';

                                  return Container(
                                    width: 260,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      border: Border.all(color: Colors.grey[200]!),
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.02),
                                          blurRadius: 6,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              width: 44,
                                              height: 44,
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: [catColors.cat, const Color(0xFF2D3748)],
                                                  begin: Alignment.topLeft,
                                                  end: Alignment.bottomRight,
                                                ),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              alignment: Alignment.center,
                                              child: Text(
                                                surawaliName.substring(0, 2).toUpperCase(),
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    surawaliName,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                      fontSize: 14,
                                                      fontWeight: FontWeight.bold,
                                                      color: Color(0xFF1E293B),
                                                    ),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    activeCat == AppCategory.devotional ? 'RAGA CHIKITSA' : 'GARBHA SANSKAR',
                                                    style: TextStyle(
                                                      fontSize: 9,
                                                      color: Colors.grey[500],
                                                      fontWeight: FontWeight.w600,
                                                      letterSpacing: 0.5,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Icon(Icons.access_time, size: 14, color: Colors.grey[500]),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '30 min',
                                                  style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                                                ),
                                              ],
                                            ),
                                            GestureDetector(
                                              onTap: () {
                                                _handlePlaySurawali(context, ref, surawaliName, isPreview: false);
                                              },
                                              child: Container(
                                                width: 32,
                                                height: 32,
                                                decoration: BoxDecoration(
                                                  color: catColors.cat,
                                                  shape: BoxShape.circle,
                                                ),
                                                child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            )
                          : Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.grey[200]!, style: BorderStyle.solid),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              padding: const EdgeInsets.all(20),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  Text(
                                    'Your Surawali journey starts here. Explore and subscribe to curated Surawalis for your pathway.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(fontSize: 12, color: Colors.grey[600], height: 1.4),
                                  ),
                                  const SizedBox(height: 12),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: catColors.cat,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    onPressed: _scrollToExplore,
                                    child: const Text('Explore Surawalis', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ),
                      const SizedBox(height: 28),
                    ],
                  );
                },
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: catColors.cat.withValues(alpha: 0.05),
                  border: Border.all(color: catColors.cat.withValues(alpha: 0.1)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.auto_graph_rounded, color: catColors.cat, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        activeCat.bannerText,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: catColors.cat,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              continueListeningAsync.when(
                data: (item) {
                  if (item == null) return const SizedBox.shrink();
                  final title = item['title'] as String? ?? 'Previous Session';
                  final progressPercent = (item['progressPercent'] as num? ?? 0.3).toDouble();

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Continue Listening',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SanjeevaniCard(
                        onTap: () {
                          ref.read(playerProvider.notifier).playTrack(item);
                          context.push('/player');
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: catColors.cat.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(Icons.play_arrow, color: catColors.cat, size: 24),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        title,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1E293B),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      const Text(
                                        'Curative Audio Session • 432 Hz',
                                        style: TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            LinearProgressIndicator(
                              value: progressPercent,
                              backgroundColor: catColors.cat.withValues(alpha: 0.1),
                              valueColor: AlwaysStoppedAnimation<Color>(catColors.cat),
                              minHeight: 4,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),
                    ],
                  );
                },
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),

              Container(
                key: _exploreKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Explore Surawalis',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Discover other auditory medicine sequences sequenced for your condition',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 16),

                    _buildFilterChips(activeCat, catColors),
                    const SizedBox(height: 16),

                    _buildFiltersToolbar(activeCat, catColors, catalog),
                    const SizedBox(height: 20),

                    catalogAsync.when(
                      data: (_) {
                        if (exploreResults.isEmpty) {
                          return Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: Colors.grey[200]!),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.all(24),
                            alignment: Alignment.center,
                            child: Column(
                              children: [
                                Icon(Icons.waves, size: 36, color: Colors.grey[400]),
                                const SizedBox(height: 12),
                                const Text(
                                  'No Surāwalis matched your criteria',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Try resetting the filters or tweaking your keywords.',
                                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                                ),
                              ],
                            ),
                          );
                        }

                        return Column(
                          children: [
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: paginatedResults.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                final item = paginatedResults[index];
                                final isSub = activeCat == AppCategory.secular ||
                                    subscriptions.any((s) => s['surawaliId'] == item['surawaliId']);

                                return _buildExploreResultCard(
                                  item,
                                  isSub,
                                  catColors,
                                  context,
                                  ref,
                                );
                              },
                            ),
                            if (totalPages > 1) ...[
                              const SizedBox(height: 20),
                              _buildPagination(totalPages, catColors),
                            ],
                          ],
                        );
                      },
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.all(40.0),
                          child: Column(
                            children: [
                              const Icon(Icons.error_outline, color: Colors.red, size: 36),
                              const SizedBox(height: 12),
                              Text('Error loading catalog: $err'),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.amber[700], size: 20),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Professional Auditory Wellness Statement',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF92400E),
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'All therapeutic frequencies are sequenced based on Vedic Raga Chikitsa standards and physical acoustic measures. Auditory therapy is a safe, natural support mechanism and is not a replacement for professional clinical advice, diagnoses, or prescriptions.',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFFB45309),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
