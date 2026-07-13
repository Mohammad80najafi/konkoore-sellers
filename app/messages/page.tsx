import { getCurrentUser, getConversations } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";

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
      <h1 className="text-xl font-bold text-navy-800 mb-4">پیام‌ها</h1>
      <ConversationList conversations={conversations} currentUserId={user._id} />
    </div>
  );
}
