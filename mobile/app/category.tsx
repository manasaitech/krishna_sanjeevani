import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Baby, Briefcase, Flower, Music2, Disc3 } from "lucide-react-native";
import { useApp, categoryThemes } from "@/lib/app-state";
import { categories, type CategoryId } from "@/lib/content";

const icons: Record<CategoryId, typeof Flower> = {
  devotional: Flower,
  secular: Briefcase,
  pregnancy: Baby,
};

export default function CategoryScreen() {
  const { category, setCategory, theme } = useApp();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.discIcon, { backgroundColor: theme.cat }]}>
            <Disc3 size={24} color={theme.catForeground} strokeWidth={1.6} />
          </View>
          <Text style={[styles.label, { color: theme.cat }]}>PICK YOUR VIBE</Text>
          <Text style={styles.heading}>
            What's Your <Text style={{ color: theme.cat }}>Sound?</Text>
          </Text>
          <Text style={styles.description}>
            Your choice shapes the colours, recommendations, and programs. Switch any time from
            your profile.
          </Text>
        </View>

        {/* Category Cards */}
        <View style={styles.cards}>
          {categories.map((c) => {
            const Icon = icons[c.id];
            const active = category === c.id;
            const cardTheme = categoryThemes[c.id];

            return (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[
                  styles.card,
                  active && {
                    borderColor: cardTheme.cat,
                    borderWidth: 2,
                    shadowColor: cardTheme.cat,
                    shadowOpacity: 0.15,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: active ? cardTheme.cat : cardTheme.catLight,
                        borderColor: active ? cardTheme.cat : `${cardTheme.cat}30`,
                      },
                    ]}
                  >
                    <Icon
                      size={24}
                      color={active ? cardTheme.catForeground : cardTheme.cat}
                      strokeWidth={1.7}
                    />
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.cardTitle}>{c.name}</Text>
                      {/* Mini equalizer */}
                      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 20 }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <View
                            key={i}
                            style={{
                              width: 3,
                              height: active ? 8 + Math.random() * 12 : 4,
                              borderRadius: 1.5,
                              backgroundColor: active ? cardTheme.catForeground : `${cardTheme.cat}50`,
                            }}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.cardTagline}>{c.tagline}</Text>
                    <Text style={styles.cardDescription}>{c.description}</Text>

                    {/* Active indicator */}
                    <View
                      style={[
                        styles.indicator,
                        {
                          width: active ? "100%" : "0%",
                          backgroundColor: active ? cardTheme.cat : "transparent",
                        },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue button */}
        <Pressable
          onPress={() =>
            router.replace(category === "pregnancy" ? "/(tabs)/journey" : "/(tabs)/home")
          }
          style={[styles.continueBtn, { backgroundColor: "#264653" }]}
        >
          <Music2 size={16} color="#FAF8F4" />
          <Text style={styles.continueBtnText}>
            Tune into {categories.find((c) => c.id === category)?.name}
          </Text>
          <ArrowRight size={16} color="#FAF8F4" />
        </Pressable>
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
    paddingBottom: 64,
  },
  header: {
    marginTop: 32,
    alignItems: "center",
  },
  discIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heading: {
    marginTop: 12,
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#7C7A85",
    maxWidth: 340,
  },
  cards: {
    marginTop: 32,
    gap: 16,
  },
  card: {
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
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  cardTagline: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7C7A85",
  },
  cardDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: "#7C7A85",
  },
  indicator: {
    marginTop: 16,
    height: 4,
    borderRadius: 2,
  },
  continueBtn: {
    marginTop: 40,
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
  continueBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FAF8F4",
  },
});
