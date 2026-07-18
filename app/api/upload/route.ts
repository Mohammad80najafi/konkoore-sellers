import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth-actions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_PATH = /^uploads\/[^/\\]{1,200}$/;

export async function POST(request: Request) {
  try {
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
