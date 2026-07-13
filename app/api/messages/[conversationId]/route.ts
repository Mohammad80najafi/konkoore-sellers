import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/auth-actions";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Session from "@/lib/models/Session";

async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;
  if (!sessionToken) return null;
  await connectDB();
  const session = await Session.findOne({ token: sessionToken });
  if (!session || session.expiresAt < new Date()) return null;
  return session.userId.toString();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await getMessages(conversationId, userId);
  return NextResponse.json({ messages });
}
