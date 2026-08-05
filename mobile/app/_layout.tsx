import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/lib/app-state";
// @ts-ignore
import "../global.css";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F5F1EB" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="category" />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen
          name="player"
          options={{ animation: "slide_from_bottom", gestureDirection: "vertical" }}
        />
        <Stack.Screen name="session-complete" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="program/[programId]" />
        <Stack.Screen name="admin" />
      </Stack>
    </AppProvider>
  );
}
