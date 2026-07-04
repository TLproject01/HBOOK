export const storageBuckets = {
  vehicles: process.env.SUPABASE_STORAGE_BUCKET_VEHICLES ?? "vehicle-photos",
  drivers: process.env.SUPABASE_STORAGE_BUCKET_DRIVERS ?? "driver-photos",
  rooms: process.env.SUPABASE_STORAGE_BUCKET_ROOMS ?? "room-assets",
} as const;

export function buildStoragePath(parts: string[]) {
  return parts
    .map((part) => part.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
