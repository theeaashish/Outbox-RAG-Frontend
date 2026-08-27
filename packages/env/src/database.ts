import { z } from "zod";
import { sharedEnvSchema } from "./shared";

export const dbEnvSchema = sharedEnvSchema.extend({
  DATABASE_URL: z.string().url(),
});

export type DbEnv = z.infer<typeof dbEnvSchema>;

let cached: DbEnv | undefined;

export const getDbEnv = (): DbEnv => {
  if (cached) return cached;
  cached = dbEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  return cached;
};
