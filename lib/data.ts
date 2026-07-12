import { connectDB } from "./mongodb";
import ListingModel from "./models/Listing";
import PublisherModel from "./models/Publisher";
import type { Listing, Publisher } from "./types";

// Convert Listing document to plain type with populated seller
function toListingType(doc: any): Listing {
  const sellerDoc = doc.seller;
  const isPopulated = sellerDoc && typeof sellerDoc === "object" && sellerDoc.name;

  return {
    _id: doc._id.toString(),
    book: {
      _id: doc._id.toString(),
      title: doc.book.title,
      author: doc.book.author,
      publisher: {
        _id: doc._id.toString(),
        name: doc.book.publisher.name,
        slug: doc.book.publisher.slug,
      },
      field: doc.book.field,
      grade: doc.book.grade,
      subject: doc.book.subject,
      originalPrice: doc.book.originalPrice,
      coverImage: doc.book.coverImage,
    },
    seller: isPopulated
      ? {
          _id: sellerDoc._id.toString(),
          name: sellerDoc.name,
          phone: sellerDoc.phone,
          avatar: sellerDoc.avatar,
          role: sellerDoc.role,
          isVerified: sellerDoc.isVerified,
          createdAt:
            sellerDoc.createdAt instanceof Date
              ? sellerDoc.createdAt.toISOString()
              : String(sellerDoc.createdAt),
          province: sellerDoc.province,
          city: sellerDoc.city,
          rating: sellerDoc.rating,
          totalSales: sellerDoc.totalSales,
          totalPurchases: sellerDoc.totalPurchases,
        }
      : {
          _id: String(sellerDoc),
          name: "فروشنده",
          role: "user",
          isVerified: false,
          createdAt: "",
          rating: 0,
          totalSales: 0,
          totalPurchases: 0,
        },
    price: doc.price,
    originalPrice: doc.originalPrice,
    condition: doc.condition,
    images: doc.images,
    description: doc.description,
    year: doc.year,
    edition: doc.edition,
    city: doc.city,
    province: doc.province,
    shippingAvailable: doc.shippingAvailable,
    pickupAvailable: doc.pickupAvailable,
    isBundle: doc.isBundle,
    bundleBooks: doc.bundleBooks,
    priceIndicator: doc.priceIndicator,
    views: doc.views,
    favorites: doc.favorites,
    status: doc.status,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt),
  };
}

export async function getRecentListings(count = 8): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(count)
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getRecommendedListings(count = 8): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active" })
    .sort({ views: -1 })
    .limit(count)
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getBundleListings(): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active", isBundle: true })
    .sort({ views: -1 })
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getListingsByField(
  field: string,
  count = 8
): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({
    status: "active",
    "book.field": field,
  } as any)
    .sort({ createdAt: -1 })
    .limit(count)
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getListingById(id: string): Promise<Listing | null> {
  await connectDB();
  const doc = await ListingModel.findById(id).populate("seller").lean();
  if (!doc) return null;
  return toListingType(doc);
}

export async function getAllListings(): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active" })
    .sort({ createdAt: -1 })
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getPublishers(): Promise<Publisher[]> {
  await connectDB();
  const docs = await PublisherModel.find().sort({ name: 1 }).lean();
  return docs.map((d) => ({
    _id: d._id.toString(),
    name: d.name,
    slug: d.slug,
    logo: d.logo,
  }));
}

export async function getSellerListingsFromDB(
  sellerId: string
): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}
