import { supabase } from "./client";

// Requires a public "products" bucket in Supabase Storage — see the
// setup instructions delivered alongside this file. Uploads under a
// random filename to avoid collisions, returns the public URL.
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}
