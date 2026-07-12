import mongoose, { Schema, Document, Model } from "mongoose";
import type { FieldOfStudy, Grade, BookConditionId, PriceIndicator } from "../constants";

export interface IListing extends Document {
  book: {
    title: string;
    author: string;
    publisher: { name: string; slug: string };
    field: FieldOfStudy;
    grade: Grade;
    subject: string;
    originalPrice: number;
    coverImage?: string;
  };
  seller: mongoose.Types.ObjectId;
  price: number;
  originalPrice: number;
  condition: {
    grade: BookConditionId;
    highlighting: boolean;
    handwrittenNotes: boolean;
    tornPages: boolean;
    missingPages: boolean;
    answersCompleted: boolean;
    coverDamaged: boolean;
    hasCd: boolean;
    hasSupplement: boolean;
    notes?: string;
  };
  images: { url: string; alt: string; isPrimary: boolean }[];
  description?: string;
  year: number;
  edition: number;
  city: string;
  province: string;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  isBundle: boolean;
  bundleBooks?: {
    title: string;
    author: string;
    publisher: { name: string; slug: string };
    field: FieldOfStudy;
    grade: Grade;
    subject: string;
    originalPrice: number;
  }[];
  priceIndicator: PriceIndicator;
  views: number;
  favorites: number;
  status: "active" | "sold" | "reserved" | "expired" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    book: {
      title: { type: String, required: true },
      author: { type: String, required: true },
      publisher: {
        name: { type: String, required: true },
        slug: { type: String, required: true },
      },
      field: {
        type: String,
        enum: ["experimental", "mathematics", "humanities", "art", "languages"],
        required: true,
      },
      grade: {
        type: String,
        enum: ["10", "11", "12", "konkoor"],
        required: true,
      },
      subject: { type: String, required: true },
      originalPrice: { type: Number, required: true },
      coverImage: { type: String, default: "" },
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    condition: {
      grade: {
        type: String,
        enum: ["like-new", "excellent", "good", "acceptable", "heavily-used"],
        required: true,
      },
      highlighting: { type: Boolean, default: false },
      handwrittenNotes: { type: Boolean, default: false },
      tornPages: { type: Boolean, default: false },
      missingPages: { type: Boolean, default: false },
      answersCompleted: { type: Boolean, default: false },
      coverDamaged: { type: Boolean, default: false },
      hasCd: { type: Boolean, default: false },
      hasSupplement: { type: Boolean, default: false },
      notes: { type: String, default: "" },
    },
    images: [
      {
        url: { type: String, default: "" },
        alt: { type: String, default: "" },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    description: { type: String, default: "" },
    year: { type: Number, required: true },
    edition: { type: Number, default: 0 },
    city: { type: String, required: true },
    province: { type: String, required: true },
    shippingAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: false },
    isBundle: { type: Boolean, default: false },
    bundleBooks: [
      {
        title: String,
        author: String,
        publisher: { name: String, slug: String },
        field: String,
        grade: String,
        subject: String,
        originalPrice: Number,
      },
    ],
    priceIndicator: {
      type: String,
      enum: ["great", "fair", "high"],
      default: "fair",
    },
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "sold", "reserved", "expired", "pending"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
ListingSchema.index({ "book.field": 1, status: 1 });
ListingSchema.index({ "book.grade": 1, status: 1 });
ListingSchema.index({ price: 1, status: 1 });
ListingSchema.index({ city: 1, status: 1 });
ListingSchema.index({ createdAt: -1, status: 1 });

const Listing: Model<IListing> =
  mongoose.models.Listing ||
  mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
