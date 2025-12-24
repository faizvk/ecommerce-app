import { z } from "zod";

export const authBaseSchema = {
  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
      "Password must include uppercase, lowercase, number & symbol"
    ),
};

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),

  age: z.coerce.number().min(1, "Age must be greater than 0"),

  address: z.string().min(5, "Address is required"),

  contact: z.string().min(8, "Contact number must be at least 8 digits"),

  ...authBaseSchema,
});

export const loginSchema = z.object({
  email: authBaseSchema.email,
  password: z.string().min(1, "Password is required"),
});
