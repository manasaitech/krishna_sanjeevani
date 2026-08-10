import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock, Mail, User, Check, X } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { categories, type CategoryId } from "@/lib/content";
import { categoryThemes } from "@/lib/app-state";
import { Flower, Briefcase, Baby } from "lucide-react-native";

const icons: Record<CategoryId, typeof Flower> = {
  devotional: Flower,
  secular: Briefcase,
  pregnancy: Baby,
};

export default function RegisterScreen() {
  const { register, theme, setCategory } = useApp();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("devotional");
  const [loading, setLoading] = useState(false);

  // Password rules
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
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Registration Failed", res.message);
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function PasswordRule({ met, text }: { met: boolean; text: string }) {
    return (
      <View style={styles.rule}>
        {met ? (
          <Check size={12} color="#10B981" />
        ) : (
          <X size={12} color="#D1D5DB" />
        )}
        <Text style={[styles.ruleText, met && { color: "#10B981" }]}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Create account</Text>
            <Text style={styles.subtitle}>
              Begin your therapeutic raga listening journey.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrap}>
                <User size={16} color="#7C7A85" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#7C7A8580"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrap}>
                <Mail size={16} color="#7C7A85" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#7C7A8580"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <Lock size={16} color="#7C7A85" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#7C7A8580"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
              </View>
              {password.length > 0 && (
                <View style={styles.rules}>
                  <PasswordRule met={hasMinLength} text="At least 8 characters" />
                  <PasswordRule met={hasUppercase} text="One uppercase letter" />
                  <PasswordRule met={hasLowercase} text="One lowercase letter" />
                  <PasswordRule met={hasNumber} text="One number" />
                </View>
              )}
            </View>

            {/* Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>YOUR PATH</Text>
              <View style={styles.categoryCards}>
                {categories.map((c) => {
                  const Icon = icons[c.id];
                  const active = selectedCategory === c.id;
                  const cardTheme = categoryThemes[c.id];

                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCategory(c.id)}
                      style={[
                        styles.categoryCard,
                        active && {
                          borderColor: cardTheme.cat,
                          borderWidth: 2,
                          backgroundColor: cardTheme.catLight,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor: active
                              ? cardTheme.cat
                              : cardTheme.catLight,
                          },
                        ]}
                      >
                        <Icon
                          size={18}
                          color={
                            active ? cardTheme.catForeground : cardTheme.cat
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          active && { color: cardTheme.cat, fontWeight: "700" },
                        ]}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitBtn,
                { backgroundColor: "#264653" },
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FAF8F4" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={[styles.footerLink, { color: theme.cat }]}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
  },
  backBtn: {
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E4DC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginTop: 32,
  },
  heading: {
    fontSize: 30,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#7C7A85",
    lineHeight: 20,
  },
  form: {
    marginTop: 32,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7C7A85",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  rules: {
    marginTop: 4,
    gap: 4,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  categoryCards: {
    flexDirection: "row",
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1A1A1A",
    textAlign: "center",
  },
  submitBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FAF8F4",
  },
  footer: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#7C7A85",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
