import { z } from "zod";

export const sharedEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

let cached: SharedEnv | undefined;

export const getSharedEnv = (): SharedEnv => {
  if (cached) return cached;
  cached = sharedEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
  });
  return cached;
};
