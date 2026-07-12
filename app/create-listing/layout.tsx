import ShellLayout from "@/components/layout/ShellLayout";

export default function CreateListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellLayout>{children}</ShellLayout>;
}
