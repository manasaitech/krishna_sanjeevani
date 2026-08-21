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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Mail, User, UserPlus } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { categories, type CategoryId } from "@/lib/content";
import { signInWithGoogle } from "@/lib/google-auth";

const bgImg = require("../assets/images/krishna-onboarding-bg.jpg");
const medallionImg = require("../assets/images/krishna-medallion.jpg");
const prabhupadaImg = require("../assets/images/prabhupada.png");

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RegisterScreen() {
  const { register, loginWithGoogle, setCategory } = useApp();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("devotional");
  const [loading, setLoading] = useState(false);
  const [showDedication, setShowDedication] = useState(false);

  useEffect(() => {
    if (showDedication) {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDedication]);

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const authRes = await signInWithGoogle();
      if (!authRes.success || !authRes.idToken) {
        if (authRes.error && authRes.error !== "Sign-in cancelled by user") {
          Alert.alert("Google Login Error", authRes.error);
        }
        setLoading(false);
        return;
      }

      setCategory(selectedCategory);
      const res = await loginWithGoogle(authRes.idToken);
      if (res.success) {
        setShowDedication(true);
      } else {
        Alert.alert("Google Login Failed", res.message);
      }
    } catch {
      Alert.alert("Error", "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!passwordValid) {
      Alert.alert("Error", "Password does not meet the requirements");
      return;
    }

    setLoading(true);
    try {
      setCategory(selectedCategory);
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        category: selectedCategory,
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
        <View style={styles.content}>

          {/* Header with mini medallion */}
          <View style={styles.header}>
            <View style={styles.medallionSm}>
              <Image source={medallionImg} style={styles.medallionImg} resizeMode="cover" />
            </View>
            <View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Begin your healing journey</Text>
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
                <User size={13} color="#8a7455" strokeWidth={2} style={styles.inputIcon} />
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
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Mail size={13} color="#8a7455" strokeWidth={2} style={styles.inputIcon} />
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
                <Lock size={13} color="#8a7455" strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(90, 74, 48, 0.45)"
                  secureTextEntry
                  style={styles.input}
                />
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

            {/* Category Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>CHOOSE YOUR PATH</Text>
              <View style={styles.catsRow}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.catBtn,
                      selectedCategory === cat.id && styles.catBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === cat.id && styles.catTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#F2EDE0" size="small" />
              ) : (
                <>
                  <UserPlus size={15} color="#D4A84B" strokeWidth={2} />
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
          <Pressable
            onPress={handleGoogleRegister}
            disabled={loading}
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

          {/* Sign in link */}
          <Text style={styles.legal}>
            Already have an account?{" "}
            <Text style={styles.legalLink} onPress={() => router.push("/login")}>
              Sign in
            </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 4,
  },
  medallionSm: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "rgba(201, 168, 76, 0.6)",
    overflow: "hidden",
  },
  medallionImg: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1A3323",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#8B6914",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  dividerLine: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 6,
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
    gap: 8,
  },
  field: {
    gap: 2,
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
    left: 10,
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: 38,
    paddingLeft: 30,
    paddingRight: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
    backgroundColor: "rgba(252, 250, 244, 0.78)",
    fontSize: 13,
    color: "#261E0E",
  },
  rulesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 3,
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
    gap: 6,
    marginTop: 2,
  },
  catBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.4)",
    backgroundColor: "rgba(250, 248, 242, 0.65)",
  },
  catBtnActive: {
    backgroundColor: "rgba(26, 51, 35, 0.88)",
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
    gap: 6,
    width: "100%",
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A3323",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.45)",
    marginTop: 4,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F2EDE0",
  },
  fluteDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 6,
  },
  fluteEmoji: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(250, 248, 242, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.42)",
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1208",
  },
  googleIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
  },
  legal: {
    fontSize: 11,
    color: "rgba(58, 44, 24, 0.65)",
    textAlign: "center",
    marginTop: 8,
  },
  legalLink: {
    color: "#1A3323",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
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
