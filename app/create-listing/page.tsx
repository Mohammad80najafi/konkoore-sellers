import { getCurrentUser } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import CreateListingForm from "@/components/create-listing/CreateListingForm";

export const metadata = {
  title: "ثبت آگهی فروش",
  description: "کتاب کنکور خود را برای فروش آگهی کنید",
};

export default async function CreateListingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800">
          ثبت آگهی فروش
        </h1>
        <p className="text-sm text-surface-500 mt-2">
          اطلاعات کتاب خود را وارد کنید تا خریداران بتوانند آن را پیدا کنند
        </p>
      </div>
      <CreateListingForm />
    </div>
  );
}
