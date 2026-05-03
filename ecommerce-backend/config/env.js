import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Resolve a .env relative to the backend root, accepting alternate filenames
// (matches the seed script's behaviour so a single env file works for everything).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const candidates = [".env", "ecommerce-app.env", ".env.local"];
const envPath = candidates
  .map((f) => path.join(backendRoot, f))
  .find((p) => fs.existsSync(p));

dotenv.config(envPath ? { path: envPath } : {});

/**
 * Validate environment variables at startup.
 * If anything is missing or malformed, the process exits early with a clear
 * message rather than failing later with a cryptic error.
 */
const envSchema = z.object({
  NODE_ENV:            z.enum(["development", "production", "test"]).default("development"),
  PORT:                z.coerce.number().int().positive().default(3000),

  MONGOOSE_URI:        z.string().min(1, "MONGOOSE_URI is required"),
  CLIENT_URL:          z.string().url("CLIENT_URL must be a valid URL"),

  ACCESS_SECRET_KEY:   z.string().min(16, "ACCESS_SECRET_KEY must be at least 16 chars"),
  REFRESH_SECRET_KEY:  z.string().min(16, "REFRESH_SECRET_KEY must be at least 16 chars"),

  RAZORPAY_KEY_ID:     z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),

  SMTP_HOST:           z.string().optional(),
  SMTP_PORT:           z.coerce.number().int().positive().optional(),
  SMTP_USER:           z.string().optional(),
  SMTP_PASS:           z.string().optional(),
  SMTP_FROM:           z.string().optional(),

  GOOGLE_CLIENT_ID:    z.string().optional(),
  REDIS_URL:           z.string().optional(),
  LOG_LEVEL:           z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.errors
    .map((e) => `  • ${e.path.join(".")}: ${e.message}`)
    .join("\n");
  // eslint-disable-next-line no-console
  console.error(`✗ Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = result.data;

// Backward-compatible named exports (so existing imports keep working)
export const {
  NODE_ENV,
  PORT,
  MONGOOSE_URI,
  CLIENT_URL,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  GOOGLE_CLIENT_ID,
  REDIS_URL,
  LOG_LEVEL,
} = env;
