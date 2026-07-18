import { upload } from "@vercel/blob/client";

export async function storeImage(file: File) {
  if (process.env.NODE_ENV === "production") {
    return (
      await upload(`uploads/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
    ).url;
  }

  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const body = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !body.url) throw new Error(body.error || "Upload failed");
  return body.url;
}
