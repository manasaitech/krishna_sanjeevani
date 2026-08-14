import React from "react";
import { View, Text, ScrollView, Pressable, type ViewStyle } from "react-native";
import { useApp } from "@/lib/app-state";

export function Section({
  title,
  hint,
  onPressHint,
  children,
  style,
}: {
  title: string;
  hint?: string;
  onPressHint?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useApp();
  return (
    <View style={[{ marginTop: 40 }, style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A", fontFamily: "DMSans" }}>
          {title}
        </Text>
        {hint && (
          <Pressable onPress={onPressHint} disabled={!onPressHint}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: onPressHint ? theme.cat : "#7C7A85" }}>
              {hint}
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

export function Rail({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingRight: 4 }}
    >
      {children}
    </ScrollView>
  );
}

export function Chip({
  active,
  children,
  onPress,
}: {
  active?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const { theme } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: active ? theme.cat : "#E8E4DC",
        backgroundColor: active ? theme.cat : "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: active ? theme.catForeground : "#7C7A85",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
