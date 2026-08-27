import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { signInWithGoogle } from "@/lib/google-auth";

const bgImg = require("../assets/images/krishna-onboarding-bg.webp");
const medallionImg = require("../assets/images/krishna-medallion.webp");
const prabhupadaImg = require("../assets/images/prabhupada.webp");

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const { login, loginWithGoogle } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  useEffect(() => {
    if (showDedication) {
      const timer = setTimeout(() => {
        if (!user || !user.profile?.category || user.profile.category === "unset") {
          router.replace("/category");
        } else {
          router.replace(user.profile.category === "pregnancy" ? "/(tabs)/journey" : "/(tabs)/home");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDedication, user]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required Fields", "Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        setShowDedication(true);
      } else {
        Alert.alert("Login Failed", res.message || "Invalid credentials. Please try again.");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading || loading) return;
    setGoogleLoading(true);
    try {
      const authRes = await signInWithGoogle();

      if (!authRes.success) {
        if (authRes.cancelled) {
          setGoogleLoading(false);
          return;
        }
        if (authRes.error) {
          Alert.alert("Google Sign-In Error", authRes.error);
        }
        setGoogleLoading(false);
        return;
      }

      const res = await loginWithGoogle(authRes.idToken);
      if (res.success) {
        setShowDedication(true);
      } else {
        Alert.alert("Login Failed", res.message || "Backend authentication failed.");
      }
    } catch {
      Alert.alert("Error", "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (showDedication) {
    return (
      <View style={styles.dedicationContainer}>
        <View style={styles.dedicationContent}>
          <View style={styles.glowOuter}>
            <View style={styles.imageBorderFrame}>
              <Image source={prabhupadaImg} style={styles.prabhupadaImg} />
            </View>
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.dedicationLabel}>DEDICATED TO</Text>
            <Text style={styles.divineGrace}>His Divine Grace</Text>
            <Text style={styles.prabhupadaName}>A.C. Bhaktivedanta Swami Prabhupada</Text>
            <Text style={styles.founderText}>
              Founder-Acharya of the International Society for Krishna Consciousness
            </Text>
            <View style={styles.goldLineDivider} />
            <Text style={styles.researchLabel}>KRISHNA SANJEEVANI MUSIC HEALING RESEARCH</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={bgImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Opaque Warm Card Container */}
            <View style={styles.card}>

              {/* Top Header */}
              <View style={styles.header}>
                <View style={styles.medallionWrap}>
                  <Image source={medallionImg} style={styles.medallionImg} resizeMode="cover" />
                </View>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.brandTitle}>Krishna Sanjeevni</Text>
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>Sign in to your listening path</Text>
                </View>
              </View>

              <View style={styles.dividerLine}>
                <View style={styles.dividerRule} />
                <Text style={styles.dividerLotus}>🪷</Text>
                <View style={styles.dividerRule} />
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                {/* Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrap}>
                    <Mail size={16} color="#8A7455" strokeWidth={2} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your.email@example.com"
                      placeholderTextColor="rgba(90, 74, 48, 0.45)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.field}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.inputWrap}>
                    <Lock size={16} color="#8A7455" strokeWidth={2} style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(90, 74, 48, 0.45)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIconWrap}
                      hitSlop={10}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#8A7455" strokeWidth={2} />
                      ) : (
                        <Eye size={18} color="#8A7455" strokeWidth={2} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleEmailLogin}
                  disabled={loading || googleLoading}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    (pressed || loading) && styles.pressed,
                    loading && styles.btnDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#F2EDE0" size="small" />
                  ) : (
                    <>
                      <LogIn size={18} color="#D4A84B" strokeWidth={2} />
                      <Text style={styles.submitText}>Sign In</Text>
                    </>
                  )}
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
                  onPress={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  style={({ pressed }) => [
                    styles.socialBtn,
                    (pressed || googleLoading) && styles.pressed,
                    googleLoading && styles.btnDisabled,
                  ]}
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" color="#4285F4" />
                  ) : (
                    <View style={styles.googleIconCircle}>
                      <Text style={styles.googleG}>G</Text>
                    </View>
                  )}
                  <Text style={styles.socialBtnText}>
                    {googleLoading ? "Signing in…" : "Continue with Google"}
                  </Text>
                </Pressable>
              </View>

              {/* Toggle to Register */}
              <View style={styles.footerWrap}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push("/register")}>
                  <Text style={styles.footerLink}>Create Account</Text>
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "rgba(255, 253, 247, 0.92)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.55)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  medallionWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(201, 168, 76, 0.7)",
    overflow: "hidden",
    backgroundColor: "#FAF4E6",
  },
  medallionImg: {
    width: "100%",
    height: "100%",
  },
  headerTextWrap: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#8B6914",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A3323",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginTop: 1,
  },
  subtitle: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#6B5A3E",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  dividerLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerRule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.45)",
  },
  dividerLotus: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  form: {
    width: "100%",
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#5A4A30",
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  eyeIconWrap: {
    position: "absolute",
    right: 12,
    zIndex: 1,
    padding: 6,
  },
  input: {
    width: "100%",
    height: 48,
    paddingLeft: 40,
    paddingRight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
    backgroundColor: "#FAF8F4",
    fontSize: 14,
    color: "#1A1208",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A3323",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.5)",
    marginTop: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F2EDE0",
    letterSpacing: 0.3,
  },
  fluteDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  fluteEmoji: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  socialGroup: {
    width: "100%",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1208",
  },
  googleIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  footerWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: "#5A4A30",
  },
  footerLink: {
    fontSize: 13,
    color: "#1A3323",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.65,
  },
  dedicationContainer: {
    flex: 1,
    backgroundColor: "#FAF5EC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dedicationContent: {
    alignItems: "center",
  },
  glowOuter: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
  },
  imageBorderFrame: {
    width: 180,
    height: 240,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(201, 168, 76, 0.3)",
    overflow: "hidden",
  },
  prabhupadaImg: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
    marginTop: 20,
  },
  dedicationLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: "#C9A84C",
  },
  divineGrace: {
    fontSize: 22,
    fontWeight: "600",
    color: "#3A3125",
    marginTop: 4,
  },
  prabhupadaName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#261E14",
    marginTop: 2,
    textAlign: "center",
  },
  founderText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#5C5040",
    marginTop: 6,
    textAlign: "center",
    maxWidth: 260,
  },
  goldLineDivider: {
    height: 1,
    width: 90,
    backgroundColor: "rgba(201, 168, 76, 0.4)",
    marginVertical: 14,
  },
  researchLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#8A7963",
  },
});
