import { z } from "zod";

export const subscriptionFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  planId: z.string().optional(),
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

export const paymentFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
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
