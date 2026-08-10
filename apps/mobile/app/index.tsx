import { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/lib/app-state";

const logoWithoutText = require("../assets/logo-without-text.png");

export default function Splash() {
  const router = useRouter();
  const { theme, user, authLoading } = useApp();
  const [leaving, setLeaving] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];
  const breatheAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Logo entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Breathe animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
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
  }, []);

  // Navigate after auth check completes
  useEffect(() => {
    if (authLoading) return;

    const destination = user ? "/(tabs)/home" : "/welcome";

    const a = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1400);
    const b = setTimeout(() => router.replace(destination as any), 1900);

    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [authLoading, user]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[
              styles.breatheCircle,
              {
                backgroundColor: theme.catLight,
                transform: [{ scale: breatheAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.logoCircle,
              {
                backgroundColor: "#FFFFFF",
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={logoWithoutText}
              style={{ width: "70%", height: "70%", resizeMode: "contain" }}
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>Krishna Sanjeevani</Text>
        <Text style={styles.subtitle}>THERAPEUTIC RAGA STREAMING</Text>

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: theme.cat }]}
            />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EB",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  logoWrap: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  breatheCircle: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  title: {
    marginTop: 32,
    fontSize: 28,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    letterSpacing: 2,
    color: "#7C7A85",
    textTransform: "uppercase",
  },
  dots: {
    marginTop: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
});
