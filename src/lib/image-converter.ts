/**
 * Converts any image File (JPEG, PNG, HEIC, etc.) to optimized WebP format
 * in the browser using HTML5 Canvas prior to upload.
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  // If already a webp, return as-is
  if (file.type === "image/webp") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // fallback to original if canvas unsupported
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file (converting it to WebP first) to Cloudinary via /api/upload
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = "campus_stitch",
): Promise<{ url: string; publicId: string; format: string }> {
  // 1. Convert to WebP on client side
  const webpFile = await convertToWebP(file);

  // 2. Upload to Cloudinary API route
  const formData = new FormData();
  formData.append("file", webpFile);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Failed to upload image to Cloudinary");
  }

  return await res.json();
}
