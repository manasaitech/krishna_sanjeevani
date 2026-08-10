import { z } from "zod";

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  tier: z.string().optional(),
  page: z.coerce
    .number()
    .int()
    .positive("Page number must be a positive integer")
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive("Limit must be a positive integer")
    .default(10),
});
export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "this_year", "custom"]).default("7d"),
  startDate: z.coerce.number().optional(),
  endDate: z.coerce.number().optional(),
});
