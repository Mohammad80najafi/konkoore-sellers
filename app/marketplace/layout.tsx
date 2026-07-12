import ShellLayout from "@/components/layout/ShellLayout";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellLayout>{children}</ShellLayout>;
}
