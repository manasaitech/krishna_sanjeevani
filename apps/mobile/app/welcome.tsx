import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Apple, Globe, Music, Headphones } from "lucide-react-native";
import { useApp } from "@/lib/app-state";

function EqualizerBar({
  baseHeight,
  maxHeight,
  color,
  width = 4,
  gap = 4,
}: {
  baseHeight: number;
  maxHeight: number;
  color: string;
  width?: number;
  gap?: number;
}) {
  const anim = useRef(new Animated.Value(baseHeight)).current;

  useEffect(() => {
    let active = true;
    const run = () => {
      if (!active) return;
      const target = baseHeight + Math.random() * (maxHeight - baseHeight);
      Animated.timing(anim, {
        toValue: target,
        duration: 150 + Math.random() * 150,
        useNativeDriver: false,
      }).start(() => {
        if (active) run();
      });
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Animated.View
      style={{
        width,
        height: anim,
        borderRadius: width / 2,
        backgroundColor: color,
        marginHorizontal: gap / 2,
      }}
    />
  );
}

function Equalizer({ count = 5 }: { count?: number }) {
  const { theme } = useApp();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 40 }}>
      {Array.from({ length: count }).map((_, i) => (
        <EqualizerBar
          key={i}
          baseHeight={10 + Math.random() * 8}
          maxHeight={28 + Math.random() * 8}
          color={theme.cat}
          width={4}
          gap={4}
        />
      ))}
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { theme } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Vinyl + Equalizer */}
        <View style={styles.hero}>
          {/* Vinyl record */}
          <View style={styles.vinylWrap}>
            <View style={[styles.vinyl, { borderColor: theme.catLight }]}>
              <View style={[styles.vinylCenter, { backgroundColor: theme.cat }]}>
                <Music size={24} color={theme.catForeground} strokeWidth={1.8} />
              </View>
              {/* Vinyl grooves */}
              <View style={[styles.groove, styles.groove1, { borderColor: `${theme.cat}20` }]} />
              <View style={[styles.groove, styles.groove2, { borderColor: `${theme.cat}20` }]} />
              <View style={[styles.groove, styles.groove3, { borderColor: `${theme.cat}20` }]} />
            </View>

            {/* Headphones icon */}
            <View style={[styles.headphonesBubble, { backgroundColor: theme.catLight }]}>
              <Headphones size={20} color={theme.cat} strokeWidth={1.8} />
            </View>
          </View>

          <Equalizer count={9} />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.heading}>
            Feel the <Text style={{ color: theme.cat }}>Healing Beat</Text>
          </Text>
          <Text style={styles.description}>
            Therapeutic ragas & surāvalis, sequenced by therapists for stress relief, sleep, focus,
            and pregnancy wellbeing.
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.buttons}>
          <Pressable
            onPress={() => router.push("/register")}
            style={[styles.primaryBtn, { backgroundColor: "#264653" }]}
          >
            <Music size={16} color="#FAF8F4" />
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>

          <View style={styles.row}>
            <Pressable
              onPress={() => router.push("/login")}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/register")}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Create account</Text>
            </Pressable>
          </View>

          {/* Divider with mini equalizer */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Equalizer count={3} />
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            style={styles.socialBtn}
          >
            <Globe size={16} color="#1A1A1A" />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.socialBtn}
          >
            <Apple size={16} color="#1A1A1A" />
            <Text style={styles.socialBtnText}>Continue with Apple</Text>
          </Pressable>

          <Text style={styles.legal}>
            By continuing you agree to our{" "}
            <Text style={styles.legalLink}>Terms</Text> and{" "}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EB",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    marginTop: 32,
    alignItems: "center",
  },
  vinylWrap: {
    position: "relative",
    marginBottom: 8,
  },
  vinyl: {
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  vinylCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  groove: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  groove1: { top: 16, left: 16, right: 16, bottom: 16 },
  groove2: { top: 32, left: 32, right: 32, bottom: 32 },
  groove3: { top: 48, left: 48, right: 48, bottom: 48 },
  headphonesBubble: {
    position: "absolute",
    right: -16,
    top: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  textBlock: {
    marginTop: 32,
    alignItems: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#7C7A85",
    maxWidth: 300,
  },
  buttons: {
    marginTop: 40,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FAF8F4",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E4DC",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  legal: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    color: "#7C7A85",
  },
  legalLink: {
    fontWeight: "500",
    color: "#1A1A1A",
    textDecorationLine: "underline",
  },
});
