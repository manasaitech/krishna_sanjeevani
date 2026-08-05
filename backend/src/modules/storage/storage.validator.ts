import { z } from "zod";

export const deleteFileSchema = z.object({
  key: z.string().min(1, "Storage key is required"),
});
