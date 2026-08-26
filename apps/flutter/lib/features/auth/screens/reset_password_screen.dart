import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../providers/auth_provider.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String email;

  const ResetPasswordScreen({
    super.key,
    required this.email,
  });

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _loading = false;

  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasLowercase = false;
  bool _hasNumber = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.email);
    _passwordController.addListener(_validatePassword);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _validatePassword() {
    final password = _passwordController.text;
    setState(() {
      _hasMinLength = password.length >= 8;
      _hasUppercase = password.contains(RegExp(r'[A-Z]'));
      _hasLowercase = password.contains(RegExp(r'[a-z]'));
      _hasNumber = password.contains(RegExp(r'[0-9]'));
    });
  }

  bool get _isPasswordValid => _hasMinLength && _hasUppercase && _hasLowercase && _hasNumber;

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_isPasswordValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password does not meet requirements'),
          backgroundColor: Color(0xFFB00020),
        ),
      );
      return;
    }

    setState(() {
      _loading = true;
    });

    final email = _emailController.text.trim();
    final code = _codeController.text.trim();
    final newPassword = _passwordController.text;

    try {
      final res = await ref.read(authProvider.notifier).resetPassword(
            email: email,
            code: code,
            newPassword: newPassword,
          );

      if (res.success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successfully! Please sign in.'),
            backgroundColor: Color(0xFF1A3323),
          ),
        );
        context.go('/login');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
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
                        child: Form(
                          key: _formKey,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Center(
                                child: Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFFFAF8F2),
                                    border: Border.all(color: const Color(0x59C9A84C), width: 1.5),
                                  ),
                                  child: const Icon(
                                    Icons.key_rounded,
                                    color: Color(0xFF8B6914),
                                    size: 30,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),

                              const Text(
                                'New Password',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontFamily: 'serif',
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A3323),
                                ),
                              ),
                              const SizedBox(height: 8),

                              const Text(
                                'Enter the 6-digit code sent to your email and choose a strong new password.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF5C5040),
                                  height: 1.55,
                                ),
                              ),
                              const SizedBox(height: 24),

                              // Email Field (Read only if prefilled)
                              const Text(
                                'Email Address',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A3323),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _emailController,
                                readOnly: widget.email.isNotEmpty,
                                keyboardType: TextInputType.emailAddress,
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.mail_outline_rounded, color: Color(0xFF6B5A3E), size: 20),
                                  filled: true,
                                  fillColor: widget.email.isNotEmpty
                                      ? Colors.grey.shade100
                                      : Colors.white.withValues(alpha: 0.6),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0x40C9A84C), width: 1),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Code Field
                              const Text(
                                'Verification Code',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A3323),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _codeController,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 16,
                                  letterSpacing: 8,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                ),
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF6B5A3E), size: 20),
                                  counterText: '',
                                  hintText: '000000',
                                  hintStyle: TextStyle(
                                    color: Colors.grey.shade400,
                                    fontSize: 15,
                                    letterSpacing: 2,
                                  ),
                                  filled: true,
                                  fillColor: Colors.white.withValues(alpha: 0.6),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0x40C9A84C), width: 1),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                  ),
                                  errorBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFB00020), width: 1),
                                  ),
                                  focusedErrorBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFB00020), width: 1.5),
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.trim().length != 6) {
                                    return 'Code must be exactly 6 digits';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // New Password Field
                              const Text(
                                'New Password',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A3323),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF6B5A3E), size: 20),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                      color: const Color(0xFF6B5A3E),
                                      size: 20,
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscurePassword = !_obscurePassword;
                                      });
                                    },
                                  ),
                                  hintText: '••••••••',
                                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                                  filled: true,
                                  fillColor: Colors.white.withValues(alpha: 0.6),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0x40C9A84C), width: 1),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                  ),
                                  errorBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFB00020), width: 1),
                                  ),
                                  focusedErrorBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: Color(0xFFB00020), width: 1.5),
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your new password';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 8),

                              // Complexity indicators
                              if (_passwordController.text.isNotEmpty) ...[
                                _complexityRow('At least 8 characters', _hasMinLength),
                                const SizedBox(height: 4),
                                _complexityRow('Uppercase & lowercase letters', _hasUppercase && _hasLowercase),
                                const SizedBox(height: 4),
                                _complexityRow('At least one number', _hasNumber),
                                const SizedBox(height: 16),
                              ],

                              // Submit Button
                              ElevatedButton(
                                onPressed: _loading || !_isPasswordValid || _codeController.text.length != 6 ? null : _resetPassword,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1A3323),
                                  foregroundColor: const Color(0xFFF2EDE0),
                                  minimumSize: const Size.fromHeight(46),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(23),
                                  ),
                                  side: const BorderSide(color: Color(0x73C9A84C), width: 1.5),
                                  elevation: 2,
                                  shadowColor: const Color(0x4D1A3323),
                                ),
                                child: _loading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          color: Color(0xFFF2EDE0),
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'Reset Password',
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
                              const SizedBox(height: 24),

                              Center(
                                child: TextButton.icon(
                                  onPressed: () => context.go('/forgot-password'),
                                  icon: const Icon(Icons.arrow_back_rounded, size: 16),
                                  label: const Text(
                                    'Back',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: const Color(0xFF8B6914),
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ),
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
          ),
        ],
      ),
    );
  }

  Widget _complexityRow(String text, bool valid) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: valid ? const Color(0xFF1A3323) : Colors.grey.shade400,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            color: valid ? const Color(0xFF1A3323) : Colors.grey.shade500,
            fontWeight: valid ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
