import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Music, Headphones, User, UserPlus } from "lucide-react-native";

const bgImg = require("../assets/images/krishna-onboarding-bg.jpg");
const medallionImg = require("../assets/images/krishna-medallion.jpg");

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function EqualizerBar({ delay, heightRatio }: { delay: number; heightRatio: number }) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.1,
          duration: 700 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 700 + Math.random() * 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (active) animate();
      });
    };

    const timer = setTimeout(animate, delay);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          height: 18 * heightRatio,
          transform: [{ scaleY: anim }],
        },
      ]}
    />
  );
}

const waveHeights = [0.35, 0.6, 0.9, 1, 0.75, 0.55, 1, 0.85, 0.45];

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Full screen background */}
      <Image source={bgImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Hero medallion */}
          <View style={styles.hero}>
            <View style={styles.medallionWrap}>
              <View style={[styles.ring, styles.ring3]} />
              <View style={[styles.ring, styles.ring2]} />
              <View style={[styles.ring, styles.ring1]} />
              <View style={styles.medallionInner}>
                <Image source={medallionImg} style={styles.medallionImg} resizeMode="cover" />
              </View>
              <View style={styles.headphoneBadge}>
                <Headphones size={15} color="#6b5a3e" strokeWidth={1.8} />
              </View>
            </View>
          </View>

          {/* Audio wave */}
          <View style={styles.waveRow}>
            {waveHeights.map((h, i) => (
              <EqualizerBar key={i} delay={i * 120} heightRatio={h} />
            ))}
          </View>

          {/* Brand section */}
          <View style={styles.brand}>
            <Text style={styles.title}>Krishna Sanjeevani</Text>
            <Text style={styles.subtitle}>Healing Through Divine Sound</Text>
            <View style={styles.dividerLine}>
              <View style={styles.dividerRule} />
              <Text style={styles.dividerLotus}>🪷</Text>
              <View style={styles.dividerRule} />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Therapeutic ragas & surāvalis, sequenced by therapists for stress relief, sleep, focus,
            and pregnancy wellbeing.
          </Text>

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.push("/register")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressed,
            ]}
          >
            <Music size={16} color="#D4A84B" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>

          {/* Secondary buttons */}
          <View style={styles.btnRow}>
            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
            >
              <User size={13} color="#6b5a3e" strokeWidth={2} />
              <Text style={styles.secondaryBtnText}>Sign in</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/register")}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
            >
              <UserPlus size={13} color="#6b5a3e" strokeWidth={2} />
              <Text style={styles.secondaryBtnText}>Create account</Text>
            </Pressable>
          </View>

          {/* Flute divider */}
          <View style={styles.fluteDivider}>
            <View style={styles.dividerRule} />
            <Text style={styles.fluteEmoji}>🪈🦚</Text>
            <View style={styles.dividerRule} />
          </View>

          {/* Social login buttons */}
          <View style={styles.socialGroup}>
            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialBtnText}>Continue with Apple</Text>
            </Pressable>
          </View>

          {/* Legal text */}
          <Text style={styles.legal}>
            By continuing you agree to our{" "}
            <Text style={styles.legalLink}>Terms</Text> and{" "}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EAD8",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
  },
  medallionWrap: {
    position: "relative",
    width: SCREEN_HEIGHT < 680 ? 110 : 135,
    height: SCREEN_HEIGHT < 680 ? 110 : 135,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
  },
  ring1: {
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.7)",
  },
  ring2: {
    top: -6, left: -6, right: -6, bottom: -6,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
  },
  ring3: {
    top: -12, left: -12, right: -12, bottom: -12,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.18)",
  },
  medallionInner: {
    position: "absolute",
    top: 4, left: 4, right: 4, bottom: 4,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#faf4e6",
  },
  medallionImg: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  headphoneBadge: {
    position: "absolute",
    top: -3,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(250, 248, 244, 0.95)",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 18,
    marginVertical: 6,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 2,
    backgroundColor: "#8B6914",
    opacity: 0.65,
    marginHorizontal: 1.2,
  },
  brand: {
    alignItems: "center",
    marginVertical: 2,
  },
  title: {
    fontSize: SCREEN_HEIGHT < 680 ? 22 : 26,
    fontWeight: "600",
    color: "#1A3323",
    letterSpacing: 0.2,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: SCREEN_HEIGHT < 680 ? 13 : 15,
    fontStyle: "italic",
    color: "#8B6914",
    marginTop: 2,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  dividerLine: {
    flexDirection: "row",
    alignItems: "center",
    width: 180,
  },
  dividerRule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.45)",
  },
  dividerLotus: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  description: {
    fontSize: SCREEN_HEIGHT < 680 ? 12 : 13,
    lineHeight: 18,
    color: "#3A2C18",
    textAlign: "center",
    maxWidth: 290,
    marginVertical: 8,
    opacity: 0.88,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    maxWidth: 340,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1A3323",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F2EDE0",
    letterSpacing: 0.2,
  },
  btnRow: {
    flexDirection: "row",
    gap: 9,
    width: "100%",
    maxWidth: 340,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(250, 248, 242, 0.75)",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.48)",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#261E0E",
  },
  fluteDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    marginVertical: 8,
  },
  fluteEmoji: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  socialGroup: {
    width: "100%",
    maxWidth: 340,
    gap: 8,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(250, 248, 242, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.42)",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1208",
  },
  googleIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
  appleIcon: {
    fontSize: 18,
    color: "#1A1208",
  },
  legal: {
    fontSize: 11,
    color: "rgba(58, 44, 24, 0.62)",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 270,
  },
  legalLink: {
    fontWeight: "500",
    color: "rgba(58, 44, 24, 0.85)",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
