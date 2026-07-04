import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email."),
  password: z.string().min(1, "Enter your password."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters.")
      .regex(/[A-Z]/, "Use at least one uppercase letter.")
      .regex(/[a-z]/, "Use at least one lowercase letter.")
      .regex(/[0-9]/, "Use at least one number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });
