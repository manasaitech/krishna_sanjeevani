import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../providers/auth_provider.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  int _resendTimer = 60;
  Timer? _timer;
  bool _isResending = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      final authProviderStr = user?['authProvider'] as String?;
      final isGoogleUser = authProviderStr == 'google';
      final emailVerified = user?['emailVerified'] ?? 1;

      if (isGoogleUser || emailVerified == 1) {
        if (mounted) {
          final profile = user?['profile'];
          final categoryStr = (profile is Map<String, dynamic>) ? profile['category'] as String? : null;
          if (categoryStr == null || categoryStr == 'unset') {
            context.go('/choose-sanjeevani');
          } else {
            context.go(categoryStr == 'pregnancy' ? '/journey' : '/home');
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() {
      _resendTimer = 60;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendTimer > 0) {
        setState(() {
          _resendTimer--;
        });
      } else {
        _timer?.cancel();
      }
    });
  }

  String get _otpCode {
    return _controllers.map((c) => c.text).join();
  }

  Future<void> _verifyOtp() async {
    final code = _otpCode;
    if (code.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter all 6 digits'),
          backgroundColor: Color(0xFFB00020),
        ),
      );
      return;
    }

    setState(() {
      _loading = true;
    });

    final user = ref.read(authProvider).user;
    final email = user?['email'] ?? '';

    try {
      final res = await ref.read(authProvider.notifier).verifyOtp(
            email: email,
            code: code,
            purpose: 'verification',
          );

      if (res.success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Email verified successfully!'),
            backgroundColor: Color(0xFF1A3323),
          ),
        );
        // Reload user session to update emailVerified flag
        await ref.read(authProvider.notifier).bootstrapSession();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res.message),
            backgroundColor: const Color(0xFFB00020),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('An error occurred. Please try again.'),
            backgroundColor: Color(0xFFB00020),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _resendCode() async {
    if (_resendTimer > 0 || _isResending) return;

    setState(() {
      _isResending = true;
    });

    final user = ref.read(authProvider).user;
    final email = user?['email'] ?? '';

    try {
      final res = await ref.read(authProvider.notifier).resendOtp(
            email: email,
            purpose: 'verification',
          );

      if (res.success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Verification code resent successfully!'),
            backgroundColor: Color(0xFF1A3323),
          ),
        );
        _startTimer();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res.message),
            backgroundColor: const Color(0xFFB00020),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('An error occurred. Please try again.'),
            backgroundColor: Color(0xFFB00020),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isResending = false;
        });
      }
    }
  }

  Future<void> _signOut() async {
    await ref.read(authProvider.notifier).logout();
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final email = user?['email'] ?? '';

    return Scaffold(
      body: Stack(
        children: [
          // Background artwork
          Positioned.fill(
            child: Image.asset(
              AssetConstants.onboardingBg,
              fit: BoxFit.cover,
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 380),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(28),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        padding: const EdgeInsets.all(24.0),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: const Color(0x73C9A84C), width: 1.5),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Mail Icon medallion
                            Center(
                              child: Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: const Color(0xFFFCEFF2),
                                  border: Border.all(color: const Color(0x597A1E2C), width: 1.5),
                                ),
                                child: const Icon(
                                  Icons.mail_outline_rounded,
                                  color: Color(0xFF7A1E2C),
                                  size: 28,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            const Text(
                              'Verify Your Email',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: 'serif',
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF4A0E17),
                              ),
                            ),
                            const SizedBox(height: 8),

                            Text(
                              'We have sent a 6-digit verification code to:\n$email\n\nPlease enter it below to verify your account.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF5C5040),
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // OTP Boxes Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: List.generate(6, (index) {
                                return SizedBox(
                                  width: 44,
                                  height: 48,
                                  child: KeyboardListener(
                                    focusNode: FocusNode(skipTraversal: true),
                                    onKeyEvent: (event) {
                                      if (event is KeyDownEvent && 
                                          event.logicalKey == LogicalKeyboardKey.backspace &&
                                          _controllers[index].text.isEmpty &&
                                          index > 0) {
                                        _focusNodes[index - 1].requestFocus();
                                      }
                                    },
                                    child: TextField(
                                      controller: _controllers[index],
                                      focusNode: _focusNodes[index],
                                      keyboardType: TextInputType.number,
                                      textAlign: TextAlign.center,
                                      maxLength: 1,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF7A1E2C),
                                      ),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                      ],
                                      decoration: InputDecoration(
                                        counterText: '',
                                        contentPadding: EdgeInsets.zero,
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          borderSide: BorderSide(
                                            color: _controllers[index].text.isNotEmpty
                                                ? const Color(0xFF8B6914)
                                                : Colors.grey.shade300,
                                            width: 1.5,
                                          ),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          borderSide: const BorderSide(
                                            color: Color(0xFF7A1E2C),
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                      onChanged: (value) {
                                        if (value.isNotEmpty && index < 5) {
                                          _focusNodes[index + 1].requestFocus();
                                        }
                                        setState(() {});
                                      },
                                    ),
                                  ),
                                );
                              }),
                            ),
                            const SizedBox(height: 28),

                            // Submit Button
                            ElevatedButton(
                              onPressed: _loading || _otpCode.length != 6 ? null : _verifyOtp,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF7A1E2C),
                                foregroundColor: Colors.white,
                                minimumSize: const Size.fromHeight(46),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(23),
                                ),
                                elevation: 2,
                                shadowColor: const Color(0x4D7A1E2C),
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Verify Code',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14.5,
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Icon(Icons.arrow_forward_rounded, size: 16),
                                      ],
                                    ),
                            ),
                            const SizedBox(height: 20),

                            // Actions Row (Resend & Log Out)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _resendTimer > 0
                                    ? Text(
                                        'Resend in ${_resendTimer}s',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey.shade600,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      )
                                    : TextButton(
                                        onPressed: _isResending ? null : _resendCode,
                                        style: TextButton.styleFrom(
                                          foregroundColor: const Color(0xFF8B6914),
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          minimumSize: Size.zero,
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: Text(
                                          _isResending ? 'Resending...' : 'Resend Code',
                                          style: const TextStyle(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                TextButton.icon(
                                  onPressed: _signOut,
                                  icon: const Icon(Icons.logout_rounded, size: 14),
                                  label: const Text(
                                    'Sign Out',
                                    style: TextStyle(fontSize: 12.5),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: const Color(0xFFA32A3B),
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
