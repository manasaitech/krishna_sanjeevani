import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/lib/app-state";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// @ts-ignore
import "../global.css";

// Suppress harmless keep-awake promise rejections in Expo Go
if (__DEV__) {
  const globalAny = global as any;
  if (globalAny.Promise && globalAny.Promise.onUnhandled) {
    const originalUnhandled = globalAny.Promise.onUnhandled;
    globalAny.Promise.onUnhandled = (id: string, rejection: any) => {
      if (rejection?.message?.includes("keep awake")) {
        return; // Suppress
      }
      if (originalUnhandled) {
        originalUnhandled(id, rejection);
      }
    };
  }
}

export default function RootLayout() {
  return (
    <AppProvider>
      <ErrorBoundary>
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
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
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
          <Stack.Screen name="programs" />
        </Stack>
      </ErrorBoundary>
    </AppProvider>
  );
}
