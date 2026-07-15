import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/messages-data";
import { getCurrentUser } from "@/lib/auth-actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await getMessages(conversationId, user._id);
  return NextResponse.json({ messages });
}
