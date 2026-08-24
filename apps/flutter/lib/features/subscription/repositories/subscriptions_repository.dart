import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class SubscriptionsRepository {
  final ApiClient apiClient;

  SubscriptionsRepository(this.apiClient);

  Future<ApiResponse<dynamic>> getPlans() {
    return apiClient.get('/subscriptions/plans');
  }

  Future<ApiResponse<dynamic>> getCurrent() {
    return apiClient.get('/subscriptions/me');
  }

  Future<ApiResponse<dynamic>> createOrder(String planId) {
    return apiClient.post(
      '/subscriptions/create-order',
      data: {'planId': planId},
    );
  }

  Future<ApiResponse<dynamic>> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) {
    return apiClient.post(
      '/subscriptions/verify',
      data: {
        'orderId': orderId,
        'paymentId': paymentId,
        'signature': signature,
      },
    );
  }
}
