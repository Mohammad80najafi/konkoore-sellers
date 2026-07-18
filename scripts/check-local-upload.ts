import assert from "node:assert/strict";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb";
import Session from "../lib/models/Session";

const origin = "http://localhost:3000";

async function main() {
  let uploadedFile = "";
  try {
    await connectDB();
    const session = await Session.findOne({ expiresAt: { $gt: new Date() } })
      .select("token")
      .lean();
    assert(session, "Sign in locally before running this check");

    const form = new FormData();
    form.append(
      "file",
      new Blob([await readFile("public/images/home/categories/art.webp")], {
        type: "image/webp",
      }),
      "local-upload-check.webp",
    );

    const response = await fetch(`${origin}/api/upload`, {
      method: "POST",
      headers: { Cookie: `session-token=${session.token}` },
      body: form,
    });
    const body = (await response.json()) as { url?: string; error?: string };
    assert.equal(response.status, 200, body.error);
    assert.match(body.url || "", /^\/uploads\/[a-f0-9-]+\.webp$/);

    uploadedFile = path.join(process.cwd(), "public", body.url!.slice(1));
    assert.equal((await fetch(`${origin}${body.url}`)).status, 200);
    console.log(`Local upload check passed: ${body.url}`);
  } finally {
    if (uploadedFile) await unlink(uploadedFile).catch(() => undefined);
    await mongoose.disconnect();
  }
}

void main();
