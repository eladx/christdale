import { supabase } from "./client";

async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Requires a public "products" bucket in Supabase Storage.
export async function uploadProductImage(file: File): Promise<string> {
  return uploadToBucket("products", file);
}

// Requires a public "avatars" bucket in Supabase Storage.
export async function uploadAvatar(file: File): Promise<string> {
  return uploadToBucket("avatars", file);
}
