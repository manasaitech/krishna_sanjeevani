import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/network_providers.dart';
import '../../../shared/providers/category_provider.dart';
import '../../favorites/repositories/favorites_repository.dart';
import '../../programs/repositories/programs_repository.dart';
import '../../progress/repositories/progress_repository.dart';
import '../repositories/tracks_repository.dart';

final tracksRepositoryProvider = Provider<TracksRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return TracksRepository(apiClient);
});

final programsRepositoryProvider = Provider<ProgramsRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProgramsRepository(apiClient);
});

final progressRepositoryProvider = Provider<ProgressRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProgressRepository(apiClient);
});

final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return FavoritesRepository(apiClient);
});

final tracksProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(tracksRepositoryProvider);
  final activeCat = ref.watch(categoryProvider);
  final res = await repo.list(category: activeCat.name);
  if (res.success && res.data != null) {
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    } else if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
  }
  // Default curative track data fallback if API offline
  return [
    {
      'id': 'track_1',
      'title': 'Shree Krishna Govind Hare Murari',
      'category': activeCat.displayName,
      'duration': 1800,
      'frequency': '432 Hz',
      'description': 'Curative sound therapy for deep inner peace and stress reduction.',
    },
    {
      'id': 'track_2',
      'title': 'Garbha Raksha Stotram & Sound Bath',
      'category': activeCat.displayName,
      'duration': 2400,
      'frequency': '528 Hz',
      'description': 'Therapeutic acoustic frequencies designed for maternal wellbeing.',
    },
    {
      'id': 'track_3',
      'title': 'Om Namo Bhagavate Vasudevaya',
      'category': activeCat.displayName,
      'duration': 1200,
      'frequency': '432 Hz',
      'description': 'Rhythmic acoustic chant enhancing focus and anxiety relief.',
    },
  ];
});

final programsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(programsRepositoryProvider);
  final activeCat = ref.watch(categoryProvider);
  final res = await repo.list(category: activeCat.name);
  if (res.success && res.data != null) {
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    } else if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
  }
  return [
    {
      'id': 'prog_1',
      'title': '21-Day Stress & Anxiety Healing',
      'category': activeCat.displayName,
      'trackCount': 21,
      'totalDuration': 50400,
      'description': 'Daily progressive sound therapy sessions for neural calm.',
    },
    {
      'id': 'prog_2',
      'title': 'Maternal Harmony & Garbha Sanskar',
      'category': activeCat.displayName,
      'trackCount': 12,
      'totalDuration': 28800,
      'description': 'Acoustic prenatal stimulation and relaxation audio sessions.',
    },
  ];
});

final continueListeningProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final repo = ref.watch(progressRepositoryProvider);
  final res = await repo.continueListening();
  if (res.success && res.data != null && res.data is Map<String, dynamic>) {
    return res.data as Map<String, dynamic>;
  }
  return null;
});

final historyProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(progressRepositoryProvider);
  final res = await repo.history();
  if (res.success && res.data != null) {
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    } else if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
  }
  return [];
});

final favoritesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(favoritesRepositoryProvider);
  final res = await repo.list();
  if (res.success && res.data != null) {
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    } else if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
  }
  return [];
});
