import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  final VoidCallback? onNavigateToLogin;

  const RegisterScreen({
    super.key,
    this.onNavigateToLogin,
  });

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  late final AnimationController _equalizerController;

  @override
  void initState() {
    super.initState();
    _equalizerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _equalizerController.dispose();
    super.dispose();
  }

  void _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authProvider.notifier).register(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          fullName: _fullNameController.text.trim(),
          category: 'unset',
        );

    if (success && mounted) {
      context.go('/home');
    } else if (!success && mounted) {
      final errorMsg = ref.read(authProvider).error ?? 'Registration failed';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMsg),
          backgroundColor: const Color(0xFFB00020),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Fullscreen background artwork
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
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 10),

                        // Hero Medallion with Concentric Rings
                        Center(
                          child: SizedBox(
                            width: 100,
                            height: 100,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Container(
                                  width: 96,
                                  height: 96,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0x2EC9A84C), width: 1),
                                  ),
                                ),
                                Container(
                                  width: 86,
                                  height: 86,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0x59C9A84C), width: 1),
                                  ),
                                ),
                                Container(
                                  width: 76,
                                  height: 76,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0xB3C9A84C), width: 1.5),
                                  ),
                                ),
                                ClipOval(
                                  child: Image.asset(
                                    AssetConstants.logoWithoutText,
                                    width: 68,
                                    height: 68,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 8),

                        // Animated Equalizer Wave
                        AnimatedBuilder(
                          animation: _equalizerController,
                          builder: (context, child) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(9, (index) {
                                final heights = [8.0, 14.0, 20.0, 22.0, 16.0, 12.0, 22.0, 18.0, 10.0];
                                final factor = (index % 2 == 0)
                                    ? _equalizerController.value
                                    : (1.0 - _equalizerController.value);
                                return Container(
                                  width: 2.5,
                                  height: heights[index] * (0.5 + factor * 0.5),
                                  margin: const EdgeInsets.symmetric(horizontal: 1.2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF8B6914).withValues(alpha: 0.65),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                );
                              }),
                            );
                          },
                        ),

                        const SizedBox(height: 10),

                        // Title
                        const Text(
                          'KRISHNA SANJEEVANI',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: 'serif',
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1A3323),
                            letterSpacing: 0.5,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Glassmorphic Card
                        ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                            child: Container(
                              padding: const EdgeInsets.all(20.0),
                              decoration: BoxDecoration(
                                color: const Color(0xE6FAF8F2),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0x73C9A84C), width: 1.5),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  const Text(
                                    'Create Account',
                                    style: TextStyle(
                                      fontFamily: 'serif',
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1A3323),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Begin your personalized sound healing journey today.',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF6B5A3E),
                                    ),
                                  ),
                                  const SizedBox(height: 16),

                                  // Full Name
                                  const Text(
                                    'Full Name',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF1A3323),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _fullNameController,
                                    style: const TextStyle(fontSize: 14),
                                    decoration: InputDecoration(
                                      hintText: 'Your Full Name',
                                      hintStyle: TextStyle(color: Colors.grey.shade400),
                                      prefixIcon: const Icon(Icons.person_outline, size: 18, color: Color(0xFF6B5A3E)),
                                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                                      filled: true,
                                      fillColor: Colors.white.withValues(alpha: 0.6),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Please enter your full name';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 12),

                                  // Email Address
                                  const Text(
                                    'Email Address',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF1A3323),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    style: const TextStyle(fontSize: 14),
                                    decoration: InputDecoration(
                                      hintText: 'user@example.com',
                                      hintStyle: TextStyle(color: Colors.grey.shade400),
                                      prefixIcon: const Icon(Icons.mail_outline, size: 18, color: Color(0xFF6B5A3E)),
                                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                                      filled: true,
                                      fillColor: Colors.white.withValues(alpha: 0.6),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Please enter your email';
                                      }
                                      if (!value.contains('@')) {
                                        return 'Enter a valid email address';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 12),

                                  // Password
                                  const Text(
                                    'Password',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF1A3323),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    style: const TextStyle(fontSize: 14),
                                    decoration: InputDecoration(
                                      hintText: '••••••••',
                                      hintStyle: TextStyle(color: Colors.grey.shade400),
                                      prefixIcon: const Icon(Icons.lock_outline, size: 18, color: Color(0xFF6B5A3E)),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                          size: 18,
                                          color: const Color(0xFF6B5A3E),
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _obscurePassword = !_obscurePassword;
                                          });
                                        },
                                      ),
                                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                                      filled: true,
                                      fillColor: Colors.white.withValues(alpha: 0.6),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0x33C9A84C)),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0xFFC9A84C), width: 1.5),
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.length < 6) {
                                        return 'Password must be at least 6 characters';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 12),



                                  // Register Button
                                  SizedBox(
                                    height: 46,
                                    child: ElevatedButton(
                                      onPressed: authState.authLoading ? null : _submitRegister,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF1A3323),
                                        foregroundColor: const Color(0xFFF2EDE0),
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(23),
                                          side: const BorderSide(color: Color(0x73C9A84C), width: 1.5),
                                        ),
                                      ),
                                      child: authState.authLoading
                                          ? const SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                              ),
                                            )
                                          : const Text(
                                              'Create Account',
                                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 14),

                        // Toggle Navigation Button
                        SizedBox(
                          height: 42,
                          child: OutlinedButton(
                            onPressed: widget.onNavigateToLogin,
                            style: OutlinedButton.styleFrom(
                              backgroundColor: const Color(0xC0FAF8F2),
                              side: const BorderSide(color: Color(0x7BC9A84C), width: 1.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(21),
                              ),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.person_outline, size: 14, color: Color(0xFF6B5A3E)),
                                SizedBox(width: 4),
                                Text(
                                  'Sign in',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF261E0E),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 14),

                        // Legal Footer
                        Wrap(
                          alignment: WrapAlignment.center,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            const Text(
                              'By continuing you agree to our ',
                              style: TextStyle(fontSize: 11, color: Color(0x993A2C18)),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/terms'),
                              child: const Text(
                                'Terms',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF7A1E2C),
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                            const Text(
                              ' and ',
                              style: TextStyle(fontSize: 11, color: Color(0x993A2C18)),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/privacy'),
                              child: const Text(
                                'Privacy Policy',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF7A1E2C),
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                            const Text(
                              '.',
                              style: TextStyle(fontSize: 11, color: Color(0x993A2C18)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                      ],
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
