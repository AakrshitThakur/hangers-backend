import { z } from "zod";

const adminSignupSchema = z.object({
  username: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]{3,255}$/,
      "Username must have letters, numbers, underscores; 3-16 characters"
    ),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      "Password must have atleast 8 characters, one uppercase, one lowercase, one number, one special characte - { @, $, !, %, *, ?, & ,# }"
    ),
});

const adminSigninSchema = z.object({
  username: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]{3,255}$/,
      "Username must have letters, numbers, underscores; 3-16 characters"
    ),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      "Password must have atleast 8 characters, one uppercase, one lowercase, one number, one special characte - { @, $, !, %, *, ?, & ,# }"
    ),
});

export { adminSignupSchema, adminSigninSchema };
