import { getCurrentUser, getSessionToken } from "@/lib/auth-actions";
import {
  getConversations,
  getMessages,
  getUnreadCountsByConversation,
} from "@/lib/messages-data";
import { redirect, notFound } from "next/navigation";
import MessagesWorkspace from "@/components/messages/MessagesWorkspace";

export const metadata = {
  title: "چت",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [messages, conversations, unreadCounts, sessionToken] = await Promise.all([
    getMessages(id, user._id),
    getConversations(user._id),
    getUnreadCountsByConversation(user._id),
    getSessionToken(),
  ]);
  if (!conversations.some((conversation) => conversation._id === id)) notFound();
  if (!sessionToken) redirect("/auth/login");

  return (
      <MessagesWorkspace
        currentUserId={user._id}
        sessionToken={sessionToken}
        initialConversations={conversations}
        initialUnreadCounts={unreadCounts}
        activeConversationId={id}
        initialMessages={messages}
      />
  );
}
