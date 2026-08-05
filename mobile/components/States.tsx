import React from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { CircleAlert, Inbox, RefreshCw } from "lucide-react-native";
import { useApp } from "@/lib/app-state";

export function Skeleton({ width, height, radius = 12 }: { width: number | string; height: number; radius?: number }) {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius: radius,
        backgroundColor: "#F0ECE4",
        opacity: 0.7,
      }}
    />
  );
}

export function CardsLoading({ count = 3 }: { count?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 16, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: 176, gap: 12 }}>
          <Skeleton width={176} height={176} radius={20} />
          <Skeleton width={140} height={14} />
          <Skeleton width={70} height={12} />
        </View>
      ))}
    </View>
  );
}

export function ListLoading({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#E8E4DC",
            backgroundColor: "#FFFFFF",
            padding: 12,
          }}
        >
          <Skeleton width={56} height={56} radius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="50%" height={14} />
            <Skeleton width="25%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const { theme } = useApp();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.catLight }]}>
        {icon ?? <Inbox size={24} color={theme.cat} />}
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && <View style={{ marginTop: 24 }}>{action}</View>}
    </View>
  );
}

export function ErrorState({
  title = "We couldn't load this",
  body = "Your session is safe. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: "rgba(192,57,43,0.1)" }]}>
        <CircleAlert size={24} color="#C0392B" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <RefreshCw size={16} color="#FAF8F4" />
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#7C7A85",
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "#264653",
    paddingHorizontal: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAF8F4",
  },
});
