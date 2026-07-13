import { getCurrentUser, getConversations } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";
import NewConversation from "@/components/messages/NewConversation";

export const metadata = {
  title: "پیام‌ها",
  description: "لیست مکالمات شما",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const conversations = await getConversations(user._id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-navy-800">پیام‌ها</h1>
        <NewConversation currentUserId={user._id} />
      </div>
      <ConversationList conversations={conversations} currentUserId={user._id} />
    </div>
  );
}
