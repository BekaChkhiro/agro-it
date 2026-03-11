import { supabase } from "@/integrations/supabase/client";
import { convertImageFileToWebP } from "@/lib/images";

const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
  process.env.VITE_SUPABASE_STORAGE_BUCKET ||
  "assets";

interface UploadImageOptions {
  convertToWebP?: boolean;
  quality?: number;
}

export async function uploadImage(
  file: File,
  folder: string,
  options: UploadImageOptions = {},
): Promise<string> {
  const { convertToWebP = true, quality } = options;

  let processedFile = file;

  if (convertToWebP && typeof window !== "undefined") {
    try {
      processedFile = await convertImageFileToWebP(file, { quality });
    } catch (error) {
      console.warn("Image conversion failed, uploading original file", error);
    }
  }

  const fileExt = processedFile.name.split(".").pop() ?? "webp";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, processedFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: processedFile.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
