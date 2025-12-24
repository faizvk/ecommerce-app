import {
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinary";

export async function uploadImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.secure_url) throw new Error("Image upload failed");

  return data.secure_url;
}
