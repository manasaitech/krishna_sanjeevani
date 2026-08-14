import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  Clock,
  UserCheck,
} from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { useApp } from "@/lib/app-state";
import { categories } from "@/lib/content";

function Row({
  icon: Icon,
  label,
  value,
  onPress,
}: {
  icon: typeof Bell;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const { theme } = useApp();

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: theme.catLight }]}>
        <Icon size={18} color={theme.cat} />
      </View>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <ChevronRight size={16} color="#7C7A85" />
    </Pressable>
  );
}

export default function Profile() {
  const { category, setCategory, theme, user, logout, updateProfile } = useApp();
  const router = useRouter();
  
  const userName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";
  const userEmail = user?.email || "guest@example.com";
  const userRole = user?.role || "user";
  const userLang = user?.profile?.language || "en";
  const avatarLetter = userName.charAt(0).toUpperCase();
  const cat = categories.find((c) => c.id === category)!;

  // Preferences
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLang, setEditLang] = useState("en");
  const [saving, setSaving] = useState(false);

  // Detect Auth Provider
  const isGoogleUser =
    user?.profile?.profileImage?.includes("google") ||
    user?.profile?.profileImage?.includes("googleusercontent.com");
  const authProvider = isGoogleUser ? "Google Account" : "Email & Password";

  // Load session reminders from SecureStore on mount
  useEffect(() => {
    SecureStore.getItemAsync("pref_session_reminders").then((val) => {
      if (val !== null) {
        setRemindersEnabled(val === "true");
      }
    });
  }, []);

  const handleToggleReminders = async (val: boolean) => {
    setRemindersEnabled(val);
    try {
      await SecureStore.setItemAsync("pref_session_reminders", val ? "true" : "false");
    } catch (err) {
      console.warn("Failed to save session reminders preference", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name field cannot be empty.");
      return;
    }

    setSaving(true);
    const res = await updateProfile(editName.trim(), editLang);
    setSaving(false);

    if (res.success) {
      setModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } else {
      Alert.alert("Error", res.message || "Failed to update profile.");
    }
  };

  return (
    <AppShell bare>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.cat }]}>
          <Text style={[styles.avatarText, { color: theme.catForeground }]}>{avatarLetter}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {userEmail}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.premiumBadge, { backgroundColor: theme.catLight }]}>
              <Crown size={12} color={theme.cat} />
              <Text style={[styles.premiumText, { color: theme.cat }]}>
                {userRole.toUpperCase()}
              </Text>
            </View>
            <View style={styles.providerBadge}>
              <UserCheck size={11} color="#7C7A85" />
              <Text style={styles.providerText}>{authProvider}</Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => {
            setEditName(userName);
            setEditLang(userLang);
            setModalVisible(true);
          }}
          style={[styles.editBtn, { borderColor: theme.catLight }]}
        >
          <Text style={[styles.editBtnText, { color: theme.cat }]}>Edit</Text>
        </Pressable>
      </View>

      {/* Your plan */}
      <Section title="Your plan">
        <View style={styles.cardGroup}>
          <Row
            icon={Crown}
            label="Subscription"
            value={userRole === "free" ? "Free Tier" : "Premium · Active"}
            onPress={() => router.push("/subscription")}
          />
          <View style={styles.divider} />
          <Row
            icon={Sparkles}
            label="Listening path"
            value={cat.name}
            onPress={() => router.push("/category")}
          />
          <View style={styles.divider} />
          <Row
            icon={Sparkles}
            label="Pregnancy Journey"
            value={category === "pregnancy" ? "Active" : "Tap to activate"}
            onPress={() => {
              if (category === "pregnancy") {
                router.push("/(tabs)/journey");
              } else {
                Alert.alert(
                  "Switch to Pregnancy Path",
                  "To access the pregnancy journey, your active path must be set to Pregnancy. Would you like to switch now?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Switch Path",
                      onPress: () => {
                        setCategory("pregnancy");
                        router.push("/(tabs)/journey");
                      },
                    },
                  ]
                );
              }
            }}
          />
          <View style={styles.divider} />
          <Row
            icon={Clock}
            label="Listening history"
            value="View all played tracks"
            onPress={() => router.push("/history")}
          />
        </View>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <View style={styles.cardGroup}>
          <View style={styles.switchRow}>
            <View style={[styles.rowIcon, { backgroundColor: theme.catLight }]}>
              <Bell size={18} color={theme.cat} />
            </View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Session reminders</Text>
            <Switch
              trackColor={{ false: "#E8E4DC", true: theme.cat }}
              thumbColor="#FFFFFF"
              value={remindersEnabled}
              onValueChange={handleToggleReminders}
            />
          </View>
          <View style={styles.divider} />
          <Row icon={Palette} label="Theme" value="Light" />
          <View style={styles.divider} />
          <Row
            icon={Globe}
            label="Language"
            value={userLang === "hi" ? "Hindi (हिन्दी)" : "English"}
            onPress={() => {
              setEditName(userName);
              setEditLang(userLang);
              setModalVisible(true);
            }}
          />
        </View>
      </Section>

      {/* Support */}
      <Section title="Support">
        <View style={styles.cardGroup}>
          <Row icon={ShieldCheck} label="Privacy policy" />
          <View style={styles.divider} />
          <Row icon={FileText} label="Terms of use" />
          <View style={styles.divider} />
          <Row icon={CircleHelp} label="Help & contact" />
          <View style={styles.divider} />
          <Row
            icon={LayoutDashboard}
            label="Admin dashboard"
            onPress={() => router.push("/admin")}
          />
        </View>
      </Section>

      {/* Log out */}
      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/welcome");
        }}
        style={styles.logoutBtn}
      >
        <LogOut size={16} color="#C0392B" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <Text style={styles.version}>Version 1.0.0</Text>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#7C7A85"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Preferred Language</Text>
              <View style={styles.langRow}>
                <Pressable
                  onPress={() => setEditLang("en")}
                  style={[
                    styles.langOption,
                    editLang === "en" && {
                      backgroundColor: theme.catLight,
                      borderColor: theme.cat,
                    },
                  ]}
                >
                  <Text style={[styles.langText, editLang === "en" && { color: theme.cat }]}>
                    English
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setEditLang("hi")}
                  style={[
                    styles.langOption,
                    editLang === "hi" && {
                      backgroundColor: theme.catLight,
                      borderColor: theme.cat,
                    },
                  ]}
                >
                  <Text style={[styles.langText, editLang === "hi" && { color: theme.cat }]}>
                    Hindi (हिन्दी)
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveProfile}
                style={[styles.modalBtn, { backgroundColor: theme.cat }]}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  email: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "700",
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#E8E4DC",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  providerText: {
    fontSize: 10,
    color: "#7C7A85",
    fontWeight: "500",
  },
  editBtn: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
  },
  rowValue: {
    fontSize: 12,
    color: "#7C7A85",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E4DC",
    marginLeft: 68,
  },
  logoutBtn: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C0392B",
  },
  version: {
    marginTop: 24,
    fontSize: 12,
    color: "#7C7A85",
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C7A85",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#FAF8F4",
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
  },
  langOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FAF8F4",
  },
  langText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C7A85",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C7A85",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
