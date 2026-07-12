import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { getCurrentUser } from "@/lib/auth-actions";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <Header currentUser={currentUser} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav currentUser={currentUser} />
    </>
  );
}
