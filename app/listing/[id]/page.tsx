import { notFound } from "next/navigation";
import { getListingById } from "@/lib/data";
import ListingDetailClient from "@/components/listing/ListingDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "آگهی یافت نشد" };
  return {
    title: listing.book.title,
    description: `${listing.book.title} - ${listing.book.publisher.name} - ${listing.condition.grade}`,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return <ListingDetailClient listing={listing} />;
}
