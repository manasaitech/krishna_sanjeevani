import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { MiniPlayer } from "./MiniPlayer";

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  nav?: boolean;
  mini?: boolean;
  bare?: boolean;
  style?: ViewStyle;
};

export function AppShell({
  title,
  subtitle,
  back,
  action,
  children,
  nav = true,
  mini = true,
  bare = false,
  style,
}: Props) {
  const router = useRouter();
  const { theme } = useApp();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[{ flex: 1, backgroundColor: "#F5F1EB" }, style]}>
      {!bare && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          {back ? (
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "#E8E4DC",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="#1A1A1A" />
            </Pressable>
          ) : (
            <View style={{ width: 0, height: 44 }} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: "#1A1A1A",
                  fontFamily: "DMSans",
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                numberOfLines={1}
                style={{ fontSize: 13, color: "#7C7A85" }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {action}
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: mini ? 160 : 40,
          paddingTop: bare ? 16 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {mini && <MiniPlayer lifted={nav} />}
    </SafeAreaView>
  );
}
