import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers/network_providers.dart';
import '../../../core/theme/category_theme.dart';
import '../../../shared/providers/category_provider.dart';
import '../../../shared/widgets/sanjeevani_card.dart';
import '../../../shared/widgets/therapeutic_button.dart';
import '../../player/providers/player_provider.dart';
import '../repositories/pregnancy_repository.dart';

final pregnancyRepositoryProvider = Provider<PregnancyRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PregnancyRepository(apiClient);
});

final pregnancyTodayProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final repo = ref.watch(pregnancyRepositoryProvider);
  final res = await repo.getToday();
  if (res.success && res.data != null) {
    if (res.data is Map) {
      return Map<String, dynamic>.from(res.data as Map);
    }
  }
  return null;
});

final pregnancyWeekTracksProvider =
    FutureProvider.family<List<Map<String, dynamic>>, int>((ref, week) async {
  final repo = ref.watch(pregnancyRepositoryProvider);
  final res = await repo.getByWeek(week);

  if (res.success && res.data != null) {
    if (res.data is List && (res.data as List).isNotEmpty) {
      return List<Map<String, dynamic>>.from(res.data as List);
    }
  }

  // Curated acoustic sessions for week fallback
  return [
    {
      'id': 'preg_track_w${week}_1',
      'title': 'Week $week: Garbha Sanjeevani Baby Resonance',
      'duration': 1800,
      'frequency': '432 Hz',
      'category': 'Garbha Sanjeevani',
      'description': 'Prenatal acoustic frequency tailored for maternal wellbeing and baby bonding.',
    },
    {
      'id': 'preg_track_w${week}_2',
      'title': 'Garbha Raksha Stotram Sound Bath',
      'duration': 2400,
      'frequency': '528 Hz',
      'category': 'Garbha Sanjeevani',
      'description': 'Soothing protective mantras combined with therapeutic sound bath.',
    },
  ];
});

const List<String> pregnancyTips = [
  'Focus on slow, abdominal breathing during the 432 Hz sessions.',
  'Play the auditory tracks at a low, gentle room volume (below 60 dB).',
  'Morning is the ideal time for developmental resonance audio.',
  'Keep hydrated and sit in a comfortable, supported posture.',
];

class JourneyScreen extends ConsumerStatefulWidget {
  const JourneyScreen({super.key});

  @override
  ConsumerState<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends ConsumerState<JourneyScreen> {
  // Onboarding form state
  String _onboardingMode = 'lmp'; // 'lmp', 'edd', 'week'
  DateTime? _selectedDate;
  int _selectedWeek = 12;
  bool _saving = false;
  String? _errorMsg;
  bool _editMode = false;

  // Client Note state
  final TextEditingController _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final initialDate = _onboardingMode == 'lmp' 
        ? now.subtract(const Duration(days: 100)) 
        : now.add(const Duration(days: 100));

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: now.subtract(const Duration(days: 280)),
      lastDate: now.add(const Duration(days: 280)),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _errorMsg = null;
      });
    }
  }

  Future<void> _handleSaveOnboarding() async {
    setState(() {
      _saving = true;
      _errorMsg = null;
    });

    try {
      String? submitEdd;
      int? submitWeek;

      if (_onboardingMode == 'edd') {
        if (_selectedDate == null) {
          setState(() {
            _errorMsg = 'Please select your due date (EDD)';
            _saving = false;
          });
          return;
        }
        submitEdd = _selectedDate!.toIso8601String().split('T')[0];
      } else if (_onboardingMode == 'lmp') {
        if (_selectedDate == null) {
          setState(() {
            _errorMsg = 'Please select your Last Period Date';
            _saving = false;
          });
          return;
        }
        // LMP + 280 days = EDD
        final eddCalc = _selectedDate!.add(const Duration(days: 280));
        submitEdd = eddCalc.toIso8601String().split('T')[0];
      } else {
        submitWeek = _selectedWeek;
      }

      final repo = ref.read(pregnancyRepositoryProvider);
      final res = await repo.saveUserInfo(
        edd: submitEdd,
        currentWeek: submitWeek,
      );

      if (res.success) {
        setState(() {
          _editMode = false;
        });
        ref.invalidate(pregnancyTodayProvider);
      } else {
        setState(() {
          _errorMsg = res.message;
        });
      }
    } catch (err) {
      setState(() {
        _errorMsg = 'Network error. Please try again.';
      });
    } finally {
      setState(() {
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final catColors = ref.watch(categoryColorsProvider);
    final activeCategory = ref.watch(categoryProvider);

    if (activeCategory != AppCategory.pregnancy) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Garbha Sanjeevani'),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.child_care_outlined,
                  size: 72,
                  color: catColors.catAccent,
                ),
                const SizedBox(height: 20),
                Text(
                  'Garbha Sanjeevani Journey',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'This prenatal tracking dashboard is calibrated specifically for the Garbha Sanjeevani (Pregnancy) pathway.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: Color(0xFF7A6B58), height: 1.4),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    context.push('/change-sanjeevani');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: catColors.cat,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: const Text(
                    'Switch to Pregnancy Path',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final todayAsync = ref.watch(pregnancyTodayProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Garbha Sanjeevani Journey'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () {
              ref.invalidate(pregnancyTodayProvider);
            },
          ),
        ],
      ),
      body: todayAsync.when(
        data: (pregnancyData) {
          final isSet = pregnancyData != null && pregnancyData['setNeeded'] != true && !_editMode;

          if (!isSet) {
            return _buildOnboardingForm(catColors);
          }

          final gestationalDetails = pregnancyData['gestationalDetails'] as Map?;
          final currentWeek = (gestationalDetails?['week'] as num? ?? 24).toInt();
          final currentMonth = (gestationalDetails?['month'] as num? ?? 5).toInt();
          
          final trimester = currentWeek <= 12
              ? 'Trimester 1 (Weeks 1-12)'
              : (currentWeek <= 27 ? 'Trimester 2 (Weeks 13-27)' : 'Trimester 3 (Weeks 28-40)');

          final program = pregnancyData['program'] as Map?;
          final tracks = program?['tracks'] as List? ?? [];
          final progress = program?['progress'] as Map?;
          final completedTracks = progress?['completedTracks'] as List? ?? [];
          final progressPct = (progress?['progressPercentage'] as num? ?? 0.0).toDouble();

          final todayTrack = tracks.isNotEmpty ? Map<String, dynamic>.from(tracks.first as Map) : null;
          final isTodayCompleted = todayTrack != null && completedTracks.contains(todayTrack['id']);
          final upcomingTracks = tracks.isNotEmpty ? tracks.skip(1).toList() : [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // EDD Header Banner
                SanjeevaniCard(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: catColors.catLight,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.child_care, color: catColors.cat, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Week $currentWeek • Month $currentMonth',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: catColors.cat,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              trimester,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          // Allow re-onboarding/edit
                          setState(() {
                            _selectedDate = null;
                            _errorMsg = null;
                            _editMode = true;
                          });
                        },
                        child: const Text('Edit'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Month-wise timeline
                Text(
                  'Your Gestational Timeline',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 64,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: 9,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final monthNum = index + 1;
                      final isActive = monthNum == currentMonth;
                      final isCompleted = monthNum < currentMonth;

                      return Container(
                        width: 90,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive
                              ? catColors.cat
                              : (isCompleted ? catColors.catLight : Colors.white),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isActive ? catColors.cat : const Color(0xFFE8E4DC),
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'MONTH',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isActive ? Colors.white70 : const Color(0xFF7A6B58),
                              ),
                            ),
                            Text(
                              '$monthNum',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isActive ? Colors.white : catColors.cat,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 24),

                // Progress Indicator Ring
                SanjeevaniCard(
                  child: Row(
                    children: [
                      SizedBox(
                        width: 60,
                        height: 60,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CircularProgressIndicator(
                              value: progressPct / 100,
                              strokeWidth: 6,
                              backgroundColor: catColors.catLight,
                              valueColor: AlwaysStoppedAnimation<Color>(catColors.cat),
                            ),
                            Center(
                              child: Text(
                                '${progressPct.round()}%',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: catColors.cat,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${completedTracks.length} of ${tracks.length} Completed',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: catColors.cat,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Active prenatal sound journey',
                              style: TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Today's Recommendation
                Text(
                  "Today's Recommendation",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 12),
                if (todayTrack != null)
                  SanjeevaniCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          color: isTodayCompleted ? const Color(0xFFE6F4EA) : catColors.catLight,
                          child: Row(
                            children: [
                              Icon(
                                isTodayCompleted ? Icons.check_circle : Icons.baby_changing_station,
                                size: 16,
                                color: isTodayCompleted ? Colors.green : catColors.cat,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isTodayCompleted ? 'COMPLETED' : 'TODAY\'S SESSION',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isTodayCompleted ? Colors.green[800] : catColors.cat,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      todayTrack['title'] as String? ?? 'Sound Session',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: catColors.cat,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${((todayTrack['duration'] as num? ?? 1800) / 60).round()} mins • ${todayTrack['frequency'] ?? '432 Hz'}',
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.play_circle_fill, color: catColors.cat, size: 36),
                                onPressed: () {
                                  ref.read(playerProvider.notifier).playTrack(todayTrack);
                                  context.push('/player');
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  const Text('No sessions active for today.'),

                const SizedBox(height: 24),

                // Upcoming sessions
                if (upcomingTracks.isNotEmpty) ...[
                  Text(
                    'Upcoming Sessions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: catColors.cat,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...upcomingTracks.map((item) {
                    final mapItem = Map<String, dynamic>.from(item as Map);
                    final isDone = completedTracks.contains(mapItem['id']);
                    final durationMins = (((mapItem['duration'] as num?) ?? 1800) / 60).round();
                    final freq = mapItem['frequency'] as String? ?? '432 Hz';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: SanjeevaniCard(
                        onTap: () {
                          ref.read(playerProvider.notifier).playTrack(mapItem);
                          context.push('/player');
                        },
                        child: Row(
                          children: [
                            Icon(
                              isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                              color: isDone ? Colors.green : catColors.catAccent,
                              size: 20,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    mapItem['title'] as String? ?? 'Pregnancy Session',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: catColors.cat,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '$durationMins mins • $freq',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF7A6B58)),
                                  ),
                                ],
                              ),
                            ),
                            Icon(Icons.play_arrow, color: catColors.cat, size: 24),
                          ],
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 24),
                ],

                // Wellness tips
                Text(
                  'Baby Wellness Tips',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 12),
                ...pregnancyTips.map((tip) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10.0),
                    child: SanjeevaniCard(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.healing_outlined, color: catColors.cat, size: 18),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              tip,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF3A2C18),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),

                const SizedBox(height: 24),

                // Doctor note
                Text(
                  'Doctor Note',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: catColors.cat,
                  ),
                ),
                const SizedBox(height: 12),
                SanjeevaniCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: Color(0x147A1E2C),
                            child: Icon(Icons.medical_services_outlined, color: Color(0xFF7A1E2C), size: 20),
                          ),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Dr. Meera Iyer',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF4A0E17)),
                              ),
                              Text(
                                'Obstetrics • Reviewed 3 days ago',
                                style: TextStyle(fontSize: 11, color: Color(0xFF8A7963)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        '"Continue the evening sequences at low volume. Add the Month 6 set only after your next scan. Stop any session that causes discomfort."',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontStyle: FontStyle.italic,
                          color: Color(0xFF5C5040),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFFE8E4DC)),
                      const SizedBox(height: 10),
                      Text(
                        'Your Visit Notes',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: catColors.cat),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _noteController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'How did this week\'s sessions feel?',
                          hintStyle: const TextStyle(color: Color(0x807C7A85), fontSize: 12.5),
                          filled: true,
                          fillColor: const Color(0xFFFAF8F5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE8E4DC)),
                          ),
                          contentPadding: const EdgeInsets.all(12),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton(
                          onPressed: () {
                            _noteController.clear();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Note saved for your next doctor visit!')),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: catColors.cat,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text('Save Note', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading pregnancy details: $err')),
      ),
    );
  }

  Widget _buildOnboardingForm(CategoryColors catColors) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          Center(
            child: CircleAvatar(
              radius: 36,
              backgroundColor: catColors.catLight,
              child: Icon(Icons.child_care, color: catColors.cat, size: 36),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Pregnancy Onboarding',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFF4A0E17),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Configure your gestational details so we can customize your daily prenatal listening path.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Color(0xFF5C5040)),
          ),
          const SizedBox(height: 28),

          // Onboarding Option Selector
          Row(
            children: [
              _buildSelectorBtn('lmp', 'Last Period (LMP)'),
              const SizedBox(width: 8),
              _buildSelectorBtn('edd', 'Due Date (EDD)'),
              const SizedBox(width: 8),
              _buildSelectorBtn('week', 'Current Week'),
            ],
          ),
          const SizedBox(height: 24),

          if (_onboardingMode == 'lmp' || _onboardingMode == 'edd') ...[
            Text(
              _onboardingMode == 'lmp' 
                  ? 'Last Period Date / Pregnancy Start Date' 
                  : 'Estimated Due Date (EDD)',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF3A2C18)),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8E4DC)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _selectedDate == null 
                          ? 'Select Date' 
                          : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                      style: TextStyle(
                        fontSize: 14,
                        color: _selectedDate == null ? const Color(0x807C7A85) : Colors.black,
                      ),
                    ),
                    Icon(Icons.calendar_today, color: catColors.cat, size: 18),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _onboardingMode == 'lmp'
                  ? 'Enter the date you became pregnant. We will calculate the EDD (LMP + 280 days) dynamically.'
                  : 'Enter your target due date to calculate gestational age.',
              style: const TextStyle(fontSize: 11, color: Color(0xFF8A7963)),
            ),
          ] else ...[
            const Text(
              'Current Gestational Week (1 to 40)',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF3A2C18)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE8E4DC)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<int>(
                  value: _selectedWeek,
                  isExpanded: true,
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedWeek = val);
                  },
                  items: List.generate(40, (i) => i + 1).map((w) {
                    return DropdownMenuItem<int>(
                      value: w,
                      child: Text('Week $w'),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],

          if (_errorMsg != null) ...[
            const SizedBox(height: 16),
            Text(
              _errorMsg!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],

          const SizedBox(height: 32),

          TherapeuticButton(
            label: 'Save and Start Journey',
            isLoading: _saving,
            onPressed: _handleSaveOnboarding,
          ),
        ],
      ),
    );
  }

  Widget _buildSelectorBtn(String mode, String label) {
    final active = _onboardingMode == mode;
    return Expanded(
      child: SizedBox(
        height: 40,
        child: OutlinedButton(
          onPressed: () {
            setState(() {
              _onboardingMode = mode;
              _selectedDate = null;
              _errorMsg = null;
            });
          },
          style: OutlinedButton.styleFrom(
            backgroundColor: active ? const Color(0xFF7A1E2C) : Colors.white,
            foregroundColor: active ? Colors.white : Colors.black87,
            side: BorderSide(
              color: active ? const Color(0xFF7A1E2C) : const Color(0xFFE8E4DC),
            ),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: EdgeInsets.zero,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
