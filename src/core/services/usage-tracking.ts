// ─────────────────────────────────────────────────────────────
// Core Services — Usage Tracking Service
// Centralised service for tracking user usage across both modes.
// Avoids duplicating tracking logic inside every component.
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api";
import { getActiveMode } from "@/core/mode/config";

export interface UsageRecord {
  userId: string;
  appMode: string;
  selectedSanjeevani?: string;
  usageCount: number;
  featureUsage: Record<string, number>;
  queryCount: number;
  subscriptionId?: string;
  subscriptionStartDate?: number;
  subscriptionExpiry?: number;
  remainingEntitlement?: number;
  paymentStatus?: string;
}

/**
 * Centralised usage tracking service.
 *
 * All usage events flow through this service rather than being
 * scattered across individual components. Both Surawali and
 * Emotion Remediation modes use the same tracking infrastructure.
 */
export class UsageTrackingService {
  private userId: string;
  private appMode: string;
  private sessionFeatureUsage: Record<string, number> = {};
  private sessionQueryCount = 0;

  constructor(userId: string) {
    this.userId = userId;
    this.appMode = getActiveMode();
  }

  /** Track a feature being used (e.g. "player", "search", "discover") */
  trackFeatureUsage(feature: string): void {
    this.sessionFeatureUsage[feature] = (this.sessionFeatureUsage[feature] || 0) + 1;
  }

  /** Track a query / prediction event */
  trackQuery(): void {
    this.sessionQueryCount++;
  }

  /** Get current session usage summary */
  getSessionSummary(): {
    appMode: string;
    featureUsage: Record<string, number>;
    queryCount: number;
  } {
    return {
      appMode: this.appMode,
      featureUsage: { ...this.sessionFeatureUsage },
      queryCount: this.sessionQueryCount,
    };
  }

  /** Fetch the user's current subscription and usage from the backend */
  async getUserUsageRecord(): Promise<UsageRecord | null> {
    try {
      const [subRes, histRes] = await Promise.all([
        api.subscriptions.getCurrent().catch(() => ({ success: false, data: null })),
        api.progress.history().catch(() => ({ success: false, data: [] })),
      ]);

      const sub = subRes.success ? subRes.data : null;
      const history = histRes.success && Array.isArray(histRes.data) ? histRes.data : [];

      return {
        userId: this.userId,
        appMode: this.appMode,
        usageCount: history.length,
        featureUsage: this.sessionFeatureUsage,
        queryCount: this.sessionQueryCount,
        subscriptionId: sub?.id,
        subscriptionStartDate: sub?.currentPeriodStart,
        subscriptionExpiry: sub?.currentPeriodEnd,
        paymentStatus: sub?.status || "none",
      };
    } catch {
      return null;
    }
  }

  /** Reset session-level counters */
  resetSession(): void {
    this.sessionFeatureUsage = {};
    this.sessionQueryCount = 0;
  }
}

// ── React hook for convenience ──────────────────────────────

import { useRef, useCallback } from "react";

/**
 * React hook that provides a stable UsageTrackingService instance
 * tied to the current user.
 */
export function useUsageTracking(userId: string | undefined) {
  const serviceRef = useRef<UsageTrackingService | null>(null);

  if (userId && (!serviceRef.current || (serviceRef.current as any).userId !== userId)) {
    serviceRef.current = new UsageTrackingService(userId);
  }

  const trackFeature = useCallback((feature: string) => {
    serviceRef.current?.trackFeatureUsage(feature);
  }, []);

  const trackQuery = useCallback(() => {
    serviceRef.current?.trackQuery();
  }, []);

  const getUsage = useCallback(async () => {
    return serviceRef.current?.getUserUsageRecord() ?? null;
  }, []);

  return { trackFeature, trackQuery, getUsage, service: serviceRef.current };
}
