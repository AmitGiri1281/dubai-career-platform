import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

loadEnv({
  path: path.resolve(process.cwd(), ".env"),
  override: false,
});

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});