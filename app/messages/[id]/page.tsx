import { getCurrentUser, getMessages, getConversations, getSessionToken } from "@/lib/auth-actions";
import { redirect, notFound } from "next/navigation";
import ChatView from "@/components/messages/ChatView";

export const metadata = {
  title: "چت",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const messages = await getMessages(id, user._id);
  if (messages.length === 0) {
    const conversations = await getConversations(user._id);
    const exists = conversations.some((c) => c._id === id);
    if (!exists) notFound();
  }

  const conversations = await getConversations(user._id);
  const conversation = conversations.find((c) => c._id === id);
  const sessionToken = await getSessionToken();

  return (
    <div className="max-w-3xl mx-auto h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)] flex flex-col">
      <ChatView
        conversationId={id}
        currentUserId={user._id}
        sessionToken={sessionToken}
        initialMessages={messages}
        otherUser={conversation?.otherUser}
        listing={conversation?.listing}
      />
    </div>
  );
}
