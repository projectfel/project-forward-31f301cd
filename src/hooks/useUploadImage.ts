import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  url: string;
  path: string;
}

export function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resizeImage = useCallback(
    (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Failed to resize"))),
            "image/webp",
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });
    },
    []
  );

  const upload = useCallback(
    async (file: File, folder: string): Promise<UploadResult> => {
      setUploading(true);
      setProgress(10);
      try {
        const resized = await resizeImage(file);
        setProgress(40);

        const ext = "webp";
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage.from("images").upload(fileName, resized, {
          contentType: "image/webp",
          upsert: true,
        });
        if (error) throw error;
        setProgress(80);

        const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
        setProgress(100);

        return { url: urlData.publicUrl, path: fileName };
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [resizeImage]
  );

  return { upload, uploading, progress };
}
