import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/asset_constants.dart';
import '../../auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with TickerProviderStateMixin {
  int _currentSlide = 0; // 0: Kulashekara, 1: Prabhupada, 2: Gopal Krishna Goswami
  late final AnimationController _breatheController;
  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;
  Timer? _timerSlide2;
  Timer? _timerSlide3;
  Timer? _timerFinish;

  @override
  void initState() {
    super.initState();

    _breatheController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat(reverse: true);

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _fadeAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(_fadeController);

    // Slide transitions
    _timerSlide2 = Timer(const Duration(seconds: 2), () {
      if (mounted) setState(() => _currentSlide = 1);
    });

    _timerSlide3 = Timer(const Duration(seconds: 4), () {
      if (mounted) setState(() => _currentSlide = 2);
    });

    _timerFinish = Timer(const Duration(seconds: 6), () {
      _navigateToDestination();
    });
  }

  @override
  void dispose() {
    _breatheController.dispose();
    _fadeController.dispose();
    _timerSlide2?.cancel();
    _timerSlide3?.cancel();
    _timerFinish?.cancel();
    super.dispose();
  }

  void _navigateToDestination() {
    if (!mounted) return;
    final authState = ref.read(authProvider);

    _fadeController.forward().then((_) {
      if (!mounted) return;
      if (authState.isAuthenticated) {
        context.go('/home');
      } else {
        context.go('/login');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    final slideData = [
      {
        'title': 'King Kulasekhara Alvar',
        'role': 'Inspiration of Mukundamālā Stotra',
        'isCircular': false,
        'image': AssetConstants.kulashekaraCutout,
      },
      {
        'title': 'Srila Prabhupada',
        'role': 'Founder-Acharya of ISKCON',
        'isCircular': false,
        'image': AssetConstants.prabhupada,
      },
      {
        'title': 'HH Gopal Krishna Goswami Maharaj',
        'role': 'Beloved Disciple of Srila Prabhupada & Visionary Leader',
        'isCircular': true,
        'image': AssetConstants.goswami,
      },
    ];

    final currentData = slideData[_currentSlide];

    return Scaffold(
      backgroundColor: const Color(0xFFFAF5EC),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Stack(
          children: [
            // Fullscreen Background
            Positioned.fill(
              child: Image.asset(
                AssetConstants.flashBg,
                fit: BoxFit.cover,
              ),
            ),

            SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Brand Header
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Column(
                      children: [
                        Image.asset(
                          AssetConstants.logoWithoutText,
                          height: 42,
                          width: 42,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(width: 35, height: 1, color: const Color(0x66C9A84C)),
                            const SizedBox(width: 8),
                            const Text(
                              'KRISHNA SANJEEVANI',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 3.0,
                                color: Color(0xFF4D0F1B),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(width: 35, height: 1, color: const Color(0x66C9A84C)),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Central Character & Aura Ring Area
                  AnimatedBuilder(
                    animation: _breatheController,
                    builder: (context, child) {
                      final scale = 1.0 + (_breatheController.value * 0.05);
                      return Transform.scale(
                        scale: scale,
                        child: child,
                      );
                    },
                    child: SizedBox(
                      height: screenSize.height * 0.48,
                      width: screenSize.width,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Glow Aura Ring
                          Container(
                            width: screenSize.height * 0.35,
                            height: screenSize.height * 0.35,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0x1FC9A84C),
                            ),
                          ),

                          // Slide Character Image
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 500),
                            child: (currentData['isCircular'] as bool)
                                ? Container(
                                    key: ValueKey(_currentSlide),
                                    width: screenSize.height * 0.26,
                                    height: screenSize.height * 0.26,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(color: const Color(0xFFC9A84C), width: 3),
                                      boxShadow: const [
                                        BoxShadow(
                                          color: Color(0x26000000),
                                          blurRadius: 15,
                                          offset: Offset(0, 6),
                                        ),
                                      ],
                                    ),
                                    child: ClipOval(
                                      child: Image.asset(
                                        currentData['image'] as String,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  )
                                : Container(
                                    key: ValueKey(_currentSlide),
                                    height: screenSize.height * 0.44,
                                    width: screenSize.width * 0.85,
                                    alignment: Alignment.center,
                                    child: Image.asset(
                                      currentData['image'] as String,
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Dedication Label
                  Padding(
                    padding: const EdgeInsets.only(bottom: 24.0),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 500),
                      child: Column(
                        key: ValueKey(_currentSlide),
                        children: [
                          const Text(
                            'DEDICATED TO',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.5,
                              color: Color(0xFFC9A84C),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            currentData['title'] as String,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4D0F1B),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            width: 60,
                            height: 1,
                            color: const Color(0x66C9A84C),
                          ),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24.0),
                            child: Text(
                              currentData['role'] as String,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontStyle: FontStyle.italic,
                                color: Color(0xFF8A7963),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
