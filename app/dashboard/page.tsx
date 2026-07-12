import { getCurrentUser, getSellerListings } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "پنل کاربری",
  description: "داشبورد مدیریت آگهی‌ها و اطلاعات کاربری شما در کنکورباز",
};

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const listings = await getSellerListings(currentUser._id);

  return (
    <DashboardClient currentUser={currentUser} initialListings={listings} />
  );
}
