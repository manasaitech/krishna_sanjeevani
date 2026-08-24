import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/network_providers.dart';
import '../../tracks/providers/tracks_provider.dart';

final allTracksProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.watch(tracksRepositoryProvider);
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

class DiscoverCatalog {
  final List<Map<String, dynamic>> ailments;
  final List<Map<String, dynamic>> surawalis;
  final List<Map<String, dynamic>> timings;
  final List<Map<String, dynamic>> ailmentSurawalis;
  final List<Map<String, dynamic>> pregnancyMappings;
  final List<Map<String, dynamic>> corporateRagas;

  DiscoverCatalog({
    required this.ailments,
    required this.surawalis,
    required this.timings,
    required this.ailmentSurawalis,
    required this.pregnancyMappings,
    required this.corporateRagas,
  });

  factory DiscoverCatalog.fromJson(Map<String, dynamic> json) {
    List<Map<String, dynamic>> castList(dynamic list) {
      if (list is List) {
        return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
      return [];
    }

    return DiscoverCatalog(
      ailments: castList(json['ailments']),
      surawalis: castList(json['surawalis']),
      timings: castList(json['timings']),
      ailmentSurawalis: castList(json['ailmentSurawalis']),
      pregnancyMappings: castList(json['pregnancyMappings']),
      corporateRagas: castList(json['corporateRagas']),
    );
  }
}

final discoverCatalogProvider = FutureProvider<DiscoverCatalog>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get('/discover');

  if (res.success && res.data != null) {
    final dataMap = Map<String, dynamic>.from(res.data as Map);
    return DiscoverCatalog.fromJson(dataMap);
  } else {
    throw Exception(res.message);
  }
});

final userSubscriptionsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get('/discover/subscriptions');

  if (res.success && res.data != null) {
    final data = res.data;
    List list = [];
    if (data is List) {
      list = data;
    } else if (data is Map && data['data'] is List) {
      list = data['data'] as List;
    }
    final now = DateTime.now().millisecondsSinceEpoch;
    return list
        .map((e) => Map<String, dynamic>.from(e as Map))
        .where((s) => s['status'] == 'active' && ((s['endDate'] as num? ?? 0) > now))
        .toList();
  }
  return [];
});

class DiscoverNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  DiscoverNotifier(this._ref) : super(const AsyncData(null));

  Future<bool> subscribe({
    required String surawaliId,
    required String plan,
    String paymentId = 'pay_mock_12345',
  }) async {
    state = const AsyncLoading();
    try {
      final client = _ref.read(apiClientProvider);
      final res = await client.post(
        '/discover/subscribe',
        data: {
          'surawaliId': surawaliId,
          'plan': plan,
          'paymentId': paymentId,
        },
      );

      if (res.success) {
        _ref.invalidate(userSubscriptionsProvider);
        state = const AsyncData(null);
        return true;
      } else {
        state = AsyncError(res.message, StackTrace.current);
        return false;
      }
    } catch (err, st) {
      state = AsyncError(err, st);
      return false;
    }
  }

  Future<bool> cancelSubscription(String subscriptionId) async {
    state = const AsyncLoading();
    try {
      final client = _ref.read(apiClientProvider);
      final res = await client.post('/discover/subscriptions/$subscriptionId/cancel');

      if (res.success) {
        _ref.invalidate(userSubscriptionsProvider);
        state = const AsyncData(null);
        return true;
      } else {
        state = AsyncError(res.message, StackTrace.current);
        return false;
      }
    } catch (err, st) {
      state = AsyncError(err, st);
      return false;
    }
  }
}

final discoverNotifierProvider = StateNotifierProvider<DiscoverNotifier, AsyncValue<void>>((ref) {
  return DiscoverNotifier(ref);
});
