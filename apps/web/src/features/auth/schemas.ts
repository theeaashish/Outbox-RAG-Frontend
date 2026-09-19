import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 1024;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Please enter your password." })
    .min(MIN_PASSWORD_LENGTH, {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    })
    .max(MAX_PASSWORD_LENGTH, {
      message: `Password must be no more than ${MAX_PASSWORD_LENGTH} characters.`,
    }),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    email: z
      .string()
      .trim()
      .min(1, { message: "Please enter your email address." })
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: `Password must be no more than ${MAX_PASSWORD_LENGTH} characters.`,
      }),
    confirmPassword: z
      .string()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message:
        "Passwords do not match. Please check your password and try again.",
      path: ["confirmPassword"],
    }
  );

export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export function parseLoginFormData(data: FormData) {
  return loginSchema.safeParse({
    email: (data.get("email") as string | null) ?? "",
    password: (data.get("password") as string | null) ?? "",
  });
}

export function parseRegisterFormData(data: FormData) {
  return registerSchema.safeParse({
    name: (data.get("name") as string | null) ?? undefined,
    email: (data.get("email") as string | null) ?? "",
    password: (data.get("password") as string | null) ?? "",
    confirmPassword:
      (data.get("confirmPassword") as string | null) ?? undefined,
  });
}
