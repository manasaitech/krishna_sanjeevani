import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class MockPaymentModal extends StatefulWidget {
  final String surawaliName;
  final int price;
  final Color primaryColor;
  final Color lightColor;
  final ValueChanged<String> onSuccess;
  final VoidCallback onClose;

  const MockPaymentModal({
    super.key,
    required this.surawaliName,
    required this.price,
    required this.primaryColor,
    required this.lightColor,
    required this.onSuccess,
    required this.onClose,
  });

  @override
  State<MockPaymentModal> createState() => _MockPaymentModalState();
}

class _MockPaymentModalState extends State<MockPaymentModal> {
  String _paymentMethod = 'card'; // card, upi, netbanking
  bool _isLoading = false;
  int _loadingStep = 0;
  bool _isCompleted = false;
  String _txnId = '';

  // Card controller states
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();
  final _nameController = TextEditingController();

  // UPI controller
  final _upiController = TextEditingController();

  // Bank selection
  String _selectedBank = 'SBI';

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _nameController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  void _processPayment() {
    // Basic validation
    if (_paymentMethod == 'card') {
      if (_cardNumberController.text.length < 16 ||
          _expiryController.text.length < 4 ||
          _cvvController.text.length < 3 ||
          _nameController.text.trim().isEmpty) {
        _showError('Validation Error', 'Please fill in all card details correctly.');
        return;
      }
    } else if (_paymentMethod == 'upi') {
      final text = _upiController.text.trim();
      if (text.isEmpty || !text.contains('@')) {
        _showError('Validation Error', 'Please enter a valid UPI ID (e.g. user@bank).');
        return;
      }
    }

    setState(() {
      _isLoading = true;
      _loadingStep = 1;
    });

    Timer(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      setState(() => _loadingStep = 2);

      Timer(const Duration(milliseconds: 1000), () {
        if (!mounted) return;
        setState(() => _loadingStep = 3);

        Timer(const Duration(milliseconds: 1200), () {
          if (!mounted) return;
          final rand = Random();
          final generatedTxnId = 'TXN_KS_${100000000 + rand.nextInt(900000000)}';
          setState(() {
            _isLoading = false;
            _isCompleted = true;
            _txnId = generatedTxnId;
          });
        });
      });
    });
  }

  void _showError(String title, String body) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final bottomInset = mq.viewInsets.bottom;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: 24 + bottomInset,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Subscribe to Surāwali',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.surawaliName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF7C7A85),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Color(0xFF7C7A85)),
                onPressed: widget.onClose,
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFFE8E4DC)),

          if (_isLoading) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40.0),
              child: Column(
                children: [
                  CircularProgressIndicator(color: widget.primaryColor),
                  const SizedBox(height: 24),
                  Text(
                    _loadingStep == 1
                        ? 'Initiating secure transaction...'
                        : (_loadingStep == 2
                            ? 'Verifying mock payment gateway...'
                            : 'Finalizing subscription records...'),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please do not close this window.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF7C7A85)),
                  ),
                ],
              ),
            ),
          ] else if (_isCompleted) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 30.0),
              child: Column(
                children: [
                  const Icon(Icons.check_circle, size: 56, color: Color(0xFF2A9D8F)),
                  const SizedBox(height: 16),
                  const Text(
                    'Payment Successful',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2A9D8F)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Mock transaction completed successfully.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF7C7A85)),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF8F4),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFE8E4DC)),
                    ),
                    child: Text(
                      'ID: $_txnId',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF1A1A1A)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: widget.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => widget.onSuccess(_txnId),
                      child: const Text('Go to Library', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            // Plan summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFAF8F4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE8E4DC)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Therapeutic Plan',
                        style: TextStyle(fontSize: 11, color: Color(0xFF7C7A85), fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Monthly Subscription',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1A1A1A)),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'Total Price',
                        style: TextStyle(fontSize: 11, color: Color(0xFF7C7A85), fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '₹${widget.price}',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: widget.primaryColor),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tab selection for payment options
            Row(
              children: [
                _buildMethodTab('card', Icons.credit_card, 'Card'),
                const SizedBox(width: 8),
                _buildMethodTab('upi', Icons.send, 'UPI'),
                const SizedBox(width: 8),
                _buildMethodTab('netbanking', Icons.account_balance, 'Bank'),
              ],
            ),
            const SizedBox(height: 20),

            // Input form
            ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 180),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_paymentMethod == 'card') ...[
                    TextField(
                      controller: _cardNumberController,
                      keyboardType: TextInputType.number,
                      maxLength: 16,
                      decoration: const InputDecoration(
                        labelText: 'CARD NUMBER',
                        hintText: '1111 2222 3333 4444',
                        counterText: '',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _expiryController,
                            maxLength: 5,
                            decoration: const InputDecoration(
                              labelText: 'EXPIRY DATE',
                              hintText: 'MM/YY',
                              counterText: '',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _cvvController,
                            obscureText: true,
                            keyboardType: TextInputType.number,
                            maxLength: 3,
                            decoration: const InputDecoration(
                              labelText: 'CVV',
                              hintText: '***',
                              counterText: '',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'CARDHOLDER NAME',
                        hintText: 'John Doe',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ] else if (_paymentMethod == 'upi') ...[
                    TextField(
                      controller: _upiController,
                      autocorrect: false,
                      enableSuggestions: false,
                      decoration: const InputDecoration(
                        labelText: 'UPI ID',
                        hintText: 'username@okaxis',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'A mock payment request will be simulated for validation.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF7C7A85), fontStyle: FontStyle.italic),
                    ),
                  ] else ...[
                    const Text(
                      'SELECT BANK',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF7C7A85)),
                    ),
                    const SizedBox(height: 8),
                    _buildBankOption('SBI', 'State Bank of India (SBI)'),
                    _buildBankOption('HDFC', 'HDFC Bank'),
                    _buildBankOption('ICICI', 'ICICI Bank'),
                    _buildBankOption('Axis', 'Axis Bank'),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _processPayment,
              child: const Text('Process Payment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMethodTab(String method, IconData icon, String label) {
    final active = _paymentMethod == method;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _paymentMethod = method),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? widget.lightColor : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: active ? widget.primaryColor : const Color(0xFFE8E4DC),
              width: active ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: active ? widget.primaryColor : const Color(0xFF7C7A85)),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: active ? FontWeight.bold : FontWeight.w500,
                  color: active ? widget.primaryColor : const Color(0xFF7C7A85),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBankOption(String code, String name) {
    final active = _selectedBank == code;
    return GestureDetector(
      onTap: () => setState(() => _selectedBank = code),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: active ? widget.lightColor : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: active ? widget.primaryColor : const Color(0xFFE8E4DC),
            width: active ? 1.5 : 1,
          ),
        ),
        child: Text(
          name,
          style: TextStyle(
            fontSize: 14,
            fontWeight: active ? FontWeight.bold : FontWeight.w500,
            color: active ? widget.primaryColor : const Color(0xFF1A1A1A),
          ),
        ),
      ),
    );
  }
}
