import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildStoragePath, storageBuckets } from "@/lib/supabase/storage";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ImageUploadTarget = keyof typeof storageBuckets;

export async function uploadImageToStorage(
  target: ImageUploadTarget,
  file: File,
  folder: string,
) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์รูป JPEG, PNG และ WebP");
  }

  const maxSizeMb = Number(process.env.UPLOAD_MAX_SIZE_MB ?? "10");
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`รูปภาพต้องมีขนาดไม่เกิน ${maxSizeMb} MB`);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = buildStoragePath([folder, `${randomUUID()}.${extension}`]);
  const supabase = createSupabaseAdminClient();
  const bucket = storageBuckets[target];

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    bucket,
    path,
  };
}
