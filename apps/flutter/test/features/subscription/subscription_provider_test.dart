import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishna_sanjeevani/core/network/api_client.dart';
import 'package:krishna_sanjeevani/core/network/api_response.dart';
import 'package:krishna_sanjeevani/features/subscription/providers/subscription_provider.dart';
import 'package:krishna_sanjeevani/features/subscription/repositories/subscriptions_repository.dart';
import 'package:krishna_sanjeevani/features/subscription/services/razorpay_checkout_service.dart';
import '../../core/network/auth_interceptor_test.dart';

class MockSubscriptionsRepository extends SubscriptionsRepository {
  MockSubscriptionsRepository() : super(ApiClient(secureStorage: MemoryStorage()));

  @override
  Future<ApiResponse<dynamic>> getPlans() async {
    return ApiResponse(
      success: true,
      message: 'Plans',
      data: [
        {
          'id': 'plan_annual',
          'name': 'Annual Pass',
          'price': 1999,
          'interval': 'year',
          'popular': true,
        }
      ],
    );
  }

  @override
  Future<ApiResponse<dynamic>> getCurrent() async {
    return ApiResponse(
      success: true,
      message: 'Current',
      data: {
        'active': true,
        'planId': 'plan_annual',
        'expiresAt': '2027-08-22T00:00:00Z',
      },
    );
  }

  @override
  Future<ApiResponse<dynamic>> createOrder(String planId) async {
    return ApiResponse(
      success: true,
      message: 'Order created',
      data: {'orderId': 'order_999', 'keyId': 'rzp_test_key', 'amount': 1999},
    );
  }

  @override
  Future<ApiResponse<dynamic>> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    return ApiResponse(success: true, message: 'Verified');
  }
}

class MockRazorpayCheckoutService extends RazorpayCheckoutService {
  @override
  Future<RazorpayCheckoutResult> openCheckout({
    required String orderId,
    required int amountInPaise,
    required String keyId,
    required String name,
    required String description,
    required String userEmail,
  }) async {
    return RazorpayCheckoutResult(
      success: true,
      paymentId: 'pay_999',
      orderId: orderId,
      signature: 'sig_999',
    );
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('razorpay_flutter'),
      (MethodCall methodCall) async => null,
    );
  });

  group('Subscription State & Checkout Tests', () {


    test('loadSubscriptionInfo populates plans and sets active subscription state', () async {
      final repo = MockSubscriptionsRepository();
      final rzp = MockRazorpayCheckoutService();
      final container = ProviderContainer(
        overrides: [
          subscriptionsRepositoryProvider.overrideWithValue(repo),
          razorpayCheckoutServiceProvider.overrideWithValue(rzp),
        ],
      );
      addTearDown(container.dispose);

      await container.read(subscriptionProvider.notifier).loadSubscriptionInfo();

      final state = container.read(subscriptionProvider);
      expect(state.hasActiveSubscription, isTrue);
      expect(state.plans.length, equals(1));
      expect(state.plans.first['id'], equals('plan_annual'));
    });

    test('checkoutPlan triggers createOrder, Razorpay checkout modal, and payment verification', () async {
      final repo = MockSubscriptionsRepository();
      final rzp = MockRazorpayCheckoutService();
      final container = ProviderContainer(
        overrides: [
          subscriptionsRepositoryProvider.overrideWithValue(repo),
          razorpayCheckoutServiceProvider.overrideWithValue(rzp),
        ],
      );
      addTearDown(container.dispose);

      final success = await container.read(subscriptionProvider.notifier).checkoutPlan(
            planId: 'plan_annual',
            userEmail: 'user@example.com',
          );

      expect(success, isTrue);
    });
  });
}
