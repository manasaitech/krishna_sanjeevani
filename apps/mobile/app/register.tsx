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
import { Lock, Mail, User, UserPlus, Eye, EyeOff } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { categories, type CategoryId } from "@/lib/content";
import { signInWithGoogle } from "@/lib/google-auth";

const bgImg = require("../assets/images/krishna-onboarding-bg.webp");
const medallionImg = require("../assets/images/krishna-medallion.webp");
const prabhupadaImg = require("../assets/images/prabhupada.webp");

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RegisterScreen() {
  const { register, loginWithGoogle, setCategory } = useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("devotional");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  useEffect(() => {
    if (showDedication) {
      const timer = setTimeout(() => {
        router.replace("/category");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDedication]);

  const handleGoogleRegister = async () => {
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
        Alert.alert("Google Login Failed", res.message || "Backend authentication failed. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Google authentication failed. Please check your internet connection and try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Required Fields", "Please fill in all fields to create your account.");
      return;
    }

    if (!passwordValid) {
      Alert.alert("Password Requirements", "Please make sure your password satisfies all security criteria.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        category: "unset",
      });

      if (res.success) {
        setShowDedication(true);
      } else {
        Alert.alert("Registration Failed", res.message);
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.medallionWrap}>
                  <Image source={medallionImg} style={styles.medallionImg} resizeMode="cover" />
                </View>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.brandTitle}>Krishna Sanjeevni</Text>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Begin your sacred healing path</Text>
                </View>
              </View>

              <View style={styles.dividerLine}>
                <View style={styles.dividerRule} />
                <Text style={styles.dividerLotus}>🪷</Text>
                <View style={styles.dividerRule} />
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Full Name */}
                <View style={styles.field}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputWrap}>
                    <User size={16} color="#8A7455" strokeWidth={2} style={styles.inputIcon} />
                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Ananya Rao"
                      placeholderTextColor="rgba(90, 74, 48, 0.45)"
                      style={styles.input}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrap}>
                    <Mail size={16} color="#8A7455" strokeWidth={2} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="ananya@example.com"
                      placeholderTextColor="rgba(90, 74, 48, 0.45)"
                      keyboardType="email-address"
                      autoCapitalize="none"
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
                      placeholder="••••••••"
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
                  {/* Password chips */}
                  <View style={styles.rulesRow}>
                    {[
                      [hasMinLength, "8+ chars"],
                      [hasUppercase, "Uppercase"],
                      [hasLowercase, "Lowercase"],
                      [hasNumber, "Number"],
                    ].map(([ok, text]) => (
                      <View key={text as string} style={styles.chip}>
                        <View style={[styles.chipDot, ok && styles.chipDotOk]} />
                        <Text style={[styles.chipText, ok && styles.chipTextOk]}>{text as string}</Text>
                      </View>
                    ))}
                  </View>
                </View>



                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
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
                      <UserPlus size={18} color="#D4A84B" strokeWidth={2} />
                      <Text style={styles.submitText}>Create Account</Text>
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

              {/* Social */}
              <View style={styles.socialGroup}>
                <Pressable
                  onPress={handleGoogleRegister}
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

              {/* Sign in link */}
              <View style={styles.footerWrap}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.footerLink}>Sign In</Text>
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
    backgroundColor: "rgba(255, 253, 247, 0.95)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.5)",
    paddingHorizontal: 22,
    paddingVertical: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 2,
  },
  medallionWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 10,
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
    fontSize: 12,
    fontStyle: "italic",
    color: "#6B5A3E",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  dividerLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerRule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.45)",
  },
  dividerLotus: {
    fontSize: 11,
    marginHorizontal: 6,
  },
  form: {
    width: "100%",
    gap: 10,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
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
    height: 44,
    paddingLeft: 38,
    paddingRight: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
    backgroundColor: "#FAF8F4",
    fontSize: 13,
    color: "#1A1208",
  },
  rulesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(90, 74, 48, 0.3)",
  },
  chipDotOk: {
    backgroundColor: "#2D7A3A",
  },
  chipText: {
    fontSize: 10,
    color: "rgba(58, 44, 24, 0.55)",
  },
  chipTextOk: {
    color: "#2D7A3A",
  },
  catsRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
  },
  catBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.4)",
    backgroundColor: "rgba(250, 248, 242, 0.8)",
  },
  catBtnActive: {
    backgroundColor: "#1A3323",
    borderColor: "rgba(201, 168, 76, 0.7)",
  },
  catText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#3A2C18",
    textTransform: "capitalize",
  },
  catTextActive: {
    color: "#F2EDE0",
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1A3323",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.5)",
    marginTop: 4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F2EDE0",
    letterSpacing: 0.3,
  },
  fluteDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  fluteEmoji: {
    fontSize: 13,
    marginHorizontal: 6,
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
    height: 46,
    borderRadius: 23,
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
    marginTop: 14,
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
