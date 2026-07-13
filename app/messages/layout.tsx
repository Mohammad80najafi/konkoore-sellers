import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { getCurrentUser, getUnreadCount } from "@/lib/auth-actions";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  const unreadCount = currentUser ? await getUnreadCount(currentUser._id) : 0;

  return (
    <>
      <Header currentUser={currentUser} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <MobileNav currentUser={currentUser} unreadCount={unreadCount} />
    </>
  );
}
