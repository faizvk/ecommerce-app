import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary";

export async function uploadImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "ecommerce");

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Cloudinary Error Response:", errorText);
    throw new Error(`Upload failed with status: ${res.status}`);
  }

  const data = await res.json();

  if (!data.secure_url) throw new Error("Image upload failed: No URL returned");

  return data.secure_url;
}
