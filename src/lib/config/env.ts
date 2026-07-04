import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(10),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET_VEHICLES: z.string().default("vehicle-photos"),
  SUPABASE_STORAGE_BUCKET_DRIVERS: z.string().default("driver-photos"),
  SUPABASE_STORAGE_BUCKET_ROOMS: z.string().default("room-assets"),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
