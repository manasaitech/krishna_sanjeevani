import { z } from "zod";

// Date validation regex for YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const pregnancyUserInfoSchema = z
  .object({
    edd: z
      .string()
      .regex(dateRegex, "EDD must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    currentWeek: z
      .coerce
      .number()
      .int()
      .min(1, "Pregnancy week must be at least 1")
      .max(40, "Pregnancy week cannot exceed 40")
      .optional()
      .nullable(),
  })
  .refine((data) => data.edd || data.currentWeek, {
    message: "Either edd or currentWeek must be provided",
    path: ["edd"],
  });

export const createPregnancyScheduleSchema = z.object({
  programId: z.string().uuid("Program ID must be a valid UUID"),
  pregnancyMonth: z.coerce
    .number()
    .int()
    .min(1, "Month must be between 1 and 9")
    .max(9, "Month must be between 1 and 9"),
  week: z.coerce
    .number()
    .int()
    .min(1, "Week must be between 1 and 40")
    .max(40, "Week must be between 1 and 40"),
  day: z.coerce
    .number()
    .int()
    .min(1, "Day must be between 1 and 7")
    .max(7, "Day must be between 1 and 7"),
  unlockAfterDays: z.coerce
    .number()
    .int()
    .min(0, "Unlock after days must be 0 or more")
    .default(0)
    .optional(),
  isRequired: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .default(1)
    .optional(),
});

export const updatePregnancyScheduleSchema = z.object({
  programId: z.string().uuid().optional(),
  pregnancyMonth: z.coerce
    .number()
    .int()
    .min(1)
    .max(9)
    .optional(),
  week: z.coerce
    .number()
    .int()
    .min(1)
    .max(40)
    .optional(),
  day: z.coerce
    .number()
    .int()
    .min(1)
    .max(7)
    .optional(),
  unlockAfterDays: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),
  isRequired: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional(),
});
