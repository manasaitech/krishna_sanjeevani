import 'dart:async';
import 'package:razorpay_flutter/razorpay_flutter.dart';

class RazorpayCheckoutResult {
  final bool success;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? error;

  RazorpayCheckoutResult({
    required this.success,
    this.paymentId,
    this.orderId,
    this.signature,
    this.error,
  });
}

class RazorpayCheckoutService {
  late final Razorpay _razorpay;
  Completer<RazorpayCheckoutResult>? _completer;

  RazorpayCheckoutService() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  Future<RazorpayCheckoutResult> openCheckout({
    required String orderId,
    required int amountInPaise,
    required String keyId,
    required String name,
    required String description,
    required String userEmail,
  }) async {
    _completer = Completer<RazorpayCheckoutResult>();

    final options = {
      'key': keyId,
      'amount': amountInPaise,
      'name': name,
      'description': description,
      'order_id': orderId,
      'prefill': {
        'email': userEmail,
      },
      'external': {
        'wallets': ['paytm']
      }
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      _completer?.complete(
        RazorpayCheckoutResult(
          success: false,
          error: 'Could not launch Razorpay checkout sheet: $e',
        ),
      );
    }

    return _completer!.future;
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    _completer?.complete(
      RazorpayCheckoutResult(
        success: true,
        paymentId: response.paymentId,
        orderId: response.orderId,
        signature: response.signature,
      ),
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _completer?.complete(
      RazorpayCheckoutResult(
        success: false,
        error: response.message ?? 'Payment cancelled or failed',
      ),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    _completer?.complete(
      RazorpayCheckoutResult(
        success: false,
        error: 'External wallet selected: ${response.walletName}',
      ),
    );
  }

  void dispose() {
    _razorpay.clear();
  }
}
