import { getCurrentUser, getSessionToken } from "@/lib/auth-actions";
import {
  getConversations,
  getUnreadCountsByConversation,
} from "@/lib/messages-data";
import { redirect } from "next/navigation";
import MessagesWorkspace from "@/components/messages/MessagesWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پیام‌ها",
  description: "لیست مکالمات شما",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [conversations, unreadCounts, sessionToken] = await Promise.all([
    getConversations(user._id),
    getUnreadCountsByConversation(user._id),
    getSessionToken(),
  ]);
  if (!sessionToken) redirect("/auth/login");

  return (
    <MessagesWorkspace
        currentUserId={user._id}
        sessionToken={sessionToken}
        initialConversations={conversations}
        initialUnreadCounts={unreadCounts}
    />
  );
}
