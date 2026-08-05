import React from "react";
import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
  const { category, theme } = useApp();
  const router = useRouter();
  const cat = categories.find((c) => c.id === category)!;

  return (
    <AppShell bare>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.cat }]}>
          <Text style={[styles.avatarText, { color: theme.catForeground }]}>A</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>
            Ananya Rao
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            ananya@example.com
          </Text>
          <View style={[styles.premiumBadge, { backgroundColor: theme.catLight }]}>
            <Crown size={12} color={theme.cat} />
            <Text style={[styles.premiumText, { color: theme.cat }]}>Premium</Text>
          </View>
        </View>
      </View>

      {/* Your plan */}
      <Section title="Your plan">
        <View style={styles.cardGroup}>
          <Row
            icon={Crown}
            label="Subscription"
            value="Premium · monthly"
            onPress={() => router.push("/subscription")}
          />
          <View style={styles.divider} />
          <Row
            icon={Sparkles}
            label="Listening path"
            value={cat.name}
            onPress={() => router.push("/category")}
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
              value={true}
            />
          </View>
          <View style={styles.divider} />
          <Row icon={Palette} label="Theme" value="Light" />
          <View style={styles.divider} />
          <Row icon={Globe} label="Language" value="English" />
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
        onPress={() => router.replace("/welcome")}
        style={styles.logoutBtn}
      >
        <LogOut size={16} color="#C0392B" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <Text style={styles.version}>Version 1.0.0</Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
  },
  name: {
    fontSize: 19,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  email: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  premiumBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  premiumText: {
    fontSize: 11,
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
});
