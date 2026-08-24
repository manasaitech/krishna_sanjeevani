import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/network_providers.dart';
import '../repositories/subscriptions_repository.dart';
import '../services/razorpay_checkout_service.dart';

class SubscriptionState {
  final Map<String, dynamic>? activeSubscription;
  final List<Map<String, dynamic>> plans;
  final bool hasActiveSubscription;
  final bool isLoading;
  final String? error;

  SubscriptionState({
    this.activeSubscription,
    this.plans = const [],
    this.hasActiveSubscription = false,
    this.isLoading = false,
    this.error,
  });

  SubscriptionState copyWith({
    Map<String, dynamic>? activeSubscription,
    List<Map<String, dynamic>>? plans,
    bool? hasActiveSubscription,
    bool? isLoading,
    String? error,
  }) {
    return SubscriptionState(
      activeSubscription: activeSubscription ?? this.activeSubscription,
      plans: plans ?? this.plans,
      hasActiveSubscription: hasActiveSubscription ?? this.hasActiveSubscription,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  final SubscriptionsRepository _repository;
  final RazorpayCheckoutService _razorpayService;

  SubscriptionNotifier({
    required SubscriptionsRepository repository,
    required RazorpayCheckoutService razorpayService,
  })  : _repository = repository,
        _razorpayService = razorpayService,
        super(SubscriptionState()) {
    loadSubscriptionInfo();
  }

  Future<void> loadSubscriptionInfo() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final plansRes = await _repository.getPlans();
      final currentRes = await _repository.getCurrent();

      List<Map<String, dynamic>> loadedPlans = [];
      if (plansRes.success && plansRes.data != null && plansRes.data is List) {
        loadedPlans = List<Map<String, dynamic>>.from(plansRes.data as List);
      } else {
        loadedPlans = [
          {
            'id': 'plan_monthly',
            'name': 'Monthly Healing Pass',
            'price': 299,
            'interval': 'month',
            'popular': false,
          },
          {
            'id': 'plan_annual',
            'name': 'Annual Wellness Pass',
            'price': 1999,
            'interval': 'year',
            'savings': 'Save 45%',
            'popular': true,
          },
          {
            'id': 'plan_lifetime',
            'name': 'Lifetime Sanjeevani Access',
            'price': 4999,
            'interval': 'lifetime',
            'popular': false,
          },
        ];
      }

      bool active = false;
      Map<String, dynamic>? subData;
      if (currentRes.success && currentRes.data != null && currentRes.data is Map<String, dynamic>) {
        subData = currentRes.data as Map<String, dynamic>;
        active = subData['active'] as bool? ?? false;
      }

      state = state.copyWith(
        plans: loadedPlans,
        activeSubscription: subData,
        hasActiveSubscription: active,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> checkoutPlan({
    required String planId,
    required String userEmail,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final orderRes = await _repository.createOrder(planId);
    if (!orderRes.success || orderRes.data == null) {
      state = state.copyWith(
        isLoading: false,
        error: orderRes.message.isNotEmpty ? orderRes.message : 'Order creation failed',
      );
      return false;
    }

    final orderData = orderRes.data as Map<String, dynamic>;
    final orderId = orderData['orderId'] as String? ?? 'order_dummy';
    final keyId = orderData['keyId'] as String? ?? 'rzp_test_key';
    final amount = (orderData['amount'] as int? ?? 1999) * 100;

    final checkoutResult = await _razorpayService.openCheckout(
      orderId: orderId,
      amountInPaise: amount,
      keyId: keyId,
      name: 'Krishna Sanjeevani',
      description: 'Sanjeevni Premium Sound Therapy',
      userEmail: userEmail,
    );

    if (!checkoutResult.success || checkoutResult.paymentId == null) {
      state = state.copyWith(
        isLoading: false,
        error: checkoutResult.error ?? 'Payment cancelled',
      );
      return false;
    }

    final verifyRes = await _repository.verifyPayment(
      orderId: checkoutResult.orderId ?? orderId,
      paymentId: checkoutResult.paymentId!,
      signature: checkoutResult.signature ?? '',
    );

    if (verifyRes.success) {
      await loadSubscriptionInfo();
      return true;
    }

    state = state.copyWith(
      isLoading: false,
      error: verifyRes.message.isNotEmpty ? verifyRes.message : 'Payment verification failed',
    );
    return false;
  }
}

final razorpayCheckoutServiceProvider = Provider<RazorpayCheckoutService>((ref) {
  return RazorpayCheckoutService();
});

final subscriptionsRepositoryProvider = Provider<SubscriptionsRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SubscriptionsRepository(apiClient);
});

final subscriptionProvider = StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  final repo = ref.watch(subscriptionsRepositoryProvider);
  final rzp = ref.watch(razorpayCheckoutServiceProvider);
  return SubscriptionNotifier(
    repository: repo,
    razorpayService: rzp,
  );
});
