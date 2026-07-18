import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth-actions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_PATH = /^uploads\/[^/\\]{1,200}$/;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveLocalUpload(request: Request) {
  if (!(await getCurrentUser())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || !ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const filename = `${randomUUID()}.${EXTENSIONS[file.type]}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${filename}` });
}

export async function POST(request: Request) {
  try {
    if (
      process.env.NODE_ENV !== "production" &&
      request.headers.get("content-type")?.startsWith("multipart/form-data")
    ) {
      return await saveLocalUpload(request);
    }

    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getCurrentUser())) throw new Error("Unauthorized");
        if (!UPLOAD_PATH.test(pathname)) throw new Error("Invalid upload path");

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: true,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 400 });
  }
}
