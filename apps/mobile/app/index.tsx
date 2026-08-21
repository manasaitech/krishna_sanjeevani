import { useEffect, useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useApp } from "@/lib/app-state";

const bgImg = require("../assets/images/flash-bg.png");
const kulashekaraHeroImg = require("../assets/images/kulashekara-cutout.png");
const prabhupadaImg = require("../assets/images/prabhupada.png");
const goswamiImg = require("../assets/images/goswami.jpg");
const logoWithoutText = require("../assets/logo-without-text.png");

const { height, width } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const { theme, user, authLoading } = useApp();
  const [slideshowFinished, setSlideshowFinished] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current; // Whole screen fade out
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-15)).current;
  
  const fadeSlide1 = useRef(new Animated.Value(1)).current;
  const fadeSlide2 = useRef(new Animated.Value(0)).current;
  const fadeSlide3 = useRef(new Animated.Value(0)).current;
  const scaleSlide1 = useRef(new Animated.Value(0.95)).current;
  const scaleSlide2 = useRef(new Animated.Value(0.95)).current;
  const scaleSlide3 = useRef(new Animated.Value(0.95)).current;
  
  // Hide the native Expo splash screen immediately so our custom
  // Kulashekara slideshow is the very first screen the user sees
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide 1 Entrance scale animation
    Animated.spring(scaleSlide1, {
      toValue: 1.02,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Breathe animation loop (for character backdrop and subtle scaling)
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide 2 transition at 2 seconds
    const slideTimer2 = setTimeout(() => {
      // Scale slide 2 in as it fades in
      Animated.parallel([
        Animated.timing(fadeSlide1, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeSlide2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleSlide2, {
          toValue: 1.02,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    // Slide 3 transition at 4 seconds
    const slideTimer3 = setTimeout(() => {
      // Scale slide 3 in as it fades in
      Animated.parallel([
        Animated.timing(fadeSlide2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeSlide3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleSlide3, {
          toValue: 1.02,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 4000);

    // End slideshow at 6 seconds
    const finishedTimer = setTimeout(() => {
      setSlideshowFinished(true);
    }, 6000);

    return () => {
      clearTimeout(slideTimer2);
      clearTimeout(slideTimer3);
      clearTimeout(finishedTimer);
    };
  }, []);

  // Navigate when auth check completes and slideshow is finished
  useEffect(() => {
    if (authLoading) return;
    if (!slideshowFinished) return;

    const destination = user ? "/(tabs)/home" : "/welcome";

    // Fade out whole screen
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.replace(destination as any);
    });
  }, [authLoading, slideshowFinished, user]);

  return (
    <View style={styles.container}>
      {/* 1. Full Screen Background */}
      <Image source={bgImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* 2. Entire screen content wrapped in fade anim */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* Top Header */}
          <Animated.View style={[styles.header, { opacity: logoFade, transform: [{ translateY: logoTranslateY }] }]}>
            <Image source={logoWithoutText} style={styles.logoImg} resizeMode="contain" />
            
            <View style={styles.titleWrap}>
              <View style={styles.goldLine} />
              <Text style={styles.headerTitle}>KRISHNA SANJEEVANI</Text>
              <View style={styles.goldLine} />
            </View>
          </Animated.View>

          {/* Central Character & Slideshow Area */}
          <View style={styles.centerArea}>
            {/* Animated Glow Aura in background */}
            <Animated.View
              style={[
                styles.auraRing,
                {
                  transform: [{ scale: breatheAnim }],
                },
              ]}
            />

            {/* Slide 1: King Kulasekhara Alvar */}
            <Animated.View style={[styles.slide, { opacity: fadeSlide1, transform: [{ scale: scaleSlide1 }] }]}>
              <Image source={kulashekaraHeroImg} style={styles.characterImg} resizeMode="contain" />
            </Animated.View>

            {/* Slide 2: Srila Prabhupada */}
            <Animated.View style={[styles.slide, styles.absoluteSlide, { opacity: fadeSlide2, transform: [{ scale: scaleSlide2 }] }]}>
              <Image source={prabhupadaImg} style={styles.characterImg} resizeMode="contain" />
            </Animated.View>

            {/* Slide 3: HH Gopal Krishna Goswami Maharaj */}
            <Animated.View style={[styles.slide, styles.absoluteSlide, { opacity: fadeSlide3, transform: [{ scale: scaleSlide3 }] }]}>
              <View style={styles.circularFrame}>
                <Image source={goswamiImg} style={styles.guruCircularImg} resizeMode="cover" />
              </View>
            </Animated.View>
          </View>

          {/* Bottom Dedication Area */}
          <View style={styles.bottomArea}>
            {/* Slide 1 Dedication Text */}
            <Animated.View style={[styles.dedicationContainer, { opacity: fadeSlide1 }]}>
              <Text style={styles.dedicationLabel}>DEDICATED TO</Text>
              <Text style={styles.divineGraceName}>King Kulasekhara Alvar</Text>
              <View style={styles.lineDivider} />
              <Text style={styles.dedicationRole}>Inspiration of Mukundamālā Stotra</Text>
            </Animated.View>

            {/* Slide 2 Dedication Text */}
            <Animated.View style={[styles.dedicationContainer, styles.absoluteDedication, { opacity: fadeSlide2 }]}>
              <Text style={styles.dedicationLabel}>DEDICATED TO</Text>
              <Text style={styles.divineGraceName}>Srila Prabhupada</Text>
              <View style={styles.lineDivider} />
              <Text style={styles.dedicationRole}>Founder-Acharya of ISKCON</Text>
            </Animated.View>

            {/* Slide 3 Dedication Text */}
            <Animated.View style={[styles.dedicationContainer, styles.absoluteDedication, { opacity: fadeSlide3 }]}>
              <Text style={styles.dedicationLabel}>DEDICATED TO</Text>
              <Text style={styles.divineGraceName}>HH Gopal Krishna Goswami Maharaj</Text>
              <View style={styles.lineDivider} />
              <Text style={styles.dedicationRole}>Beloved Disciple of Srila Prabhupada & Visionary Leader</Text>
            </Animated.View>
          </View>

        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5EC",
  },
  contentContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  header: {
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  logoImg: {
    height: 38,
    width: 38,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  goldLine: {
    height: 1,
    width: 35,
    backgroundColor: "rgba(201, 168, 76, 0.4)",
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#4D0F1B",
    fontFamily: "DMSans",
  },
  centerArea: {
    height: height * 0.48,
    width: width,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  auraRing: {
    position: "absolute",
    height: height * 0.35,
    width: height * 0.35,
    borderRadius: (height * 0.35) / 2,
    backgroundColor: "rgba(201, 168, 76, 0.12)",
  },
  slide: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteSlide: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  characterImg: {
    height: "95%",
    width: "85%",
  },
  bottomArea: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  dedicationContainer: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteDedication: {
    position: "absolute",
  },
  dedicationLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: "#C9A84C",
    fontFamily: "DMSans",
  },
  divineGraceName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4D0F1B",
    fontFamily: "DMSans",
    marginTop: 6,
    textAlign: "center",
  },
  lineDivider: {
    height: 1,
    width: 60,
    backgroundColor: "rgba(201, 168, 76, 0.4)",
    marginVertical: 8,
  },
  dedicationRole: {
    fontSize: 11,
    color: "#8A7963",
    fontFamily: "DMSans",
    fontStyle: "italic",
    textAlign: "center",
  },
  circularFrame: {
    width: height * 0.26,
    height: height * 0.26,
    borderRadius: (height * 0.26) / 2,
    borderWidth: 3,
    borderColor: "#C9A84C",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  guruCircularImg: {
    width: "100%",
    height: "100%",
  },
});
