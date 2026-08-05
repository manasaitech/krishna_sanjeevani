import { z } from "zod";
import { AUTH_CONSTANTS } from "./auth.constants";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Full name is required"),
  category: z.string().min(1, "Category is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
