export interface AnalyticsQuery {
  period: "7d" | "30d" | "90d" | "this_year" | "custom";
  startDate?: number;
  endDate?: number;
}
