import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { getCurrentUser, getSessionToken } from "@/lib/auth-actions";
import { getUnreadCount } from "@/lib/messages-data";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const unreadCount = currentUser ? await getUnreadCount(currentUser._id) : 0;
  const sessionToken = await getSessionToken();

  return (
    <>
      <Header
        currentUser={currentUser}
        unreadCount={unreadCount}
        sessionToken={sessionToken}
      />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav currentUser={currentUser} unreadCount={unreadCount} sessionToken={sessionToken} />
    </>
  );
}
