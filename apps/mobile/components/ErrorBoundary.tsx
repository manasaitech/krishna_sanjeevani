import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleTryAgain} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const router = useRouter();

  const handleGoHome = () => {
    onReset();
    try {
      router.replace("/(tabs)/home");
    } catch {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>
        <Text style={styles.title}>Something went wrong.</Text>
        <Text style={styles.subtitle}>
          The application encountered an unexpected error. Don't worry, your session remains completely safe.
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} numberOfLines={8}>
              {error.toString()}
            </Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <Pressable onPress={onReset} style={[styles.btn, { backgroundColor: "#264653" }]}>
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
          
          <Pressable onPress={handleGoHome} style={[styles.btn, styles.btnOutline]}>
            <Text style={[styles.btnText, { color: "#1A1A1A" }]}>Go Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EB",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FCE8E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#7C7A85",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 280,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#FCE8E6",
    borderColor: "#F3A9A0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    maxWidth: 320,
  },
  errorText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#C05244",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  btn: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  btnOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
