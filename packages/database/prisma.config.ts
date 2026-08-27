import dotenv from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ci";

try {
  new URL(databaseUrl);
} catch {
  throw new Error("DATABASE_URL must be a valid URL.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
