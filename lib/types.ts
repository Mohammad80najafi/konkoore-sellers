// KonkoorBaz TypeScript Types

import type { BookConditionId, FieldOfStudy, Grade, PriceIndicator } from "./constants";

// ===== User =====
export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  isVerified: boolean;
  createdAt: string;
  province?: string;
  city?: string;
  rating: number;
  totalSales: number;
  totalPurchases: number;
}

// ===== Publisher =====
export interface Publisher {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

// ===== Category / Subject =====
export interface Category {
  _id: string;
  name: string;
  slug: string;
  field: FieldOfStudy;
}

// ===== Book (catalogue entry) =====
export interface Book {
  _id: string;
  title: string;
  author: string;
  publisher: Publisher;
  field: FieldOfStudy;
  grade: Grade;
  subject: string;
  isbn?: string;
  originalPrice: number;
  coverImage?: string;
}

// ===== Book Edition =====
export interface BookEdition {
  _id: string;
  bookId: string;
  year: number;
  edition: number;
  originalPrice: number;
}

// ===== Listing Image =====
export interface ListingImage {
  _id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

// ===== Condition Details =====
export interface ConditionDetails {
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
}

// ===== Listing =====
export interface Listing {
  _id: string;
  book: Book;
  seller: User;
  price: number;
  originalPrice: number;
  condition: ConditionDetails;
  images: ListingImage[];
  description?: string;
  year: number;
  edition: number;
  city: string;
  province: string;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  isBundle: boolean;
  bundleBooks?: Book[];
  priceIndicator: PriceIndicator;
  views: number;
  favorites: number;
  status: "active" | "sold" | "reserved" | "expired" | "pending";
  createdAt: string;
  updatedAt: string;
}

// ===== Cart Item =====
export interface CartItem {
  listing: Listing;
  quantity: number;
}

// ===== Order =====
export interface Order {
  _id: string;
  buyer: User;
  items: OrderItem[];
  totalPrice: number;
  shippingPrice: number;
  discountAmount: number;
  finalPrice: number;
  shippingMethod: string;
  address: Address;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "disputed";
  paymentStatus: "pending" | "paid" | "refunded";
  trackingCode?: string;
  createdAt: string;
}

// ===== Order Item =====
export interface OrderItem {
  listing: Listing;
  price: number;
  sellerPayout: number;
}

// ===== Address =====
export interface Address {
  _id: string;
  fullName: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

// ===== Message =====
export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ===== Conversation =====
export interface Conversation {
  _id: string;
  participants: User[];
  listing?: Listing;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// ===== Review =====
export interface Review {
  _id: string;
  reviewer: User;
  seller: User;
  order: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ===== Offer =====
export interface Offer {
  _id: string;
  listing: Listing;
  buyer: User;
  offeredPrice: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  message?: string;
  createdAt: string;
}

// ===== Exchange Request =====
export interface ExchangeRequest {
  _id: string;
  fromListing: Listing;
  toListing: Listing;
  fromUser: User;
  toUser: User;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

// ===== Wanted Book =====
export interface WantedBook {
  _id: string;
  user: User;
  bookTitle: string;
  publisher?: string;
  field: FieldOfStudy;
  grade: Grade;
  maxPrice?: number;
  notified: boolean;
  createdAt: string;
}

// ===== Notification =====
export interface Notification {
  _id: string;
  user: string;
  type: "price-drop" | "wanted-available" | "message" | "offer" | "order" | "system";
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ===== Report =====
export interface Report {
  _id: string;
  reporter: User;
  listing?: Listing;
  user?: User;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

// ===== Price History =====
export interface PriceHistoryEntry {
  _id: string;
  listingId: string;
  price: number;
  date: string;
}

// ===== Favorite =====
export interface Favorite {
  _id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

// ===== Smart Book Match Input =====
export interface SmartMatchInput {
  field: FieldOfStudy;
  grade: Grade;
  targetMajor: string;
  strongSubjects: string[];
  weakSubjects: string[];
  budget: number;
}

// ===== Filter State =====
export interface FilterState {
  query?: string;
  field?: FieldOfStudy;
  grade?: Grade;
  subject?: string;
  publisher?: string;
  author?: string;
  year?: number;
  edition?: number;
  condition?: BookConditionId;
  minPrice?: number;
  maxPrice?: number;
  province?: string;
  city?: string;
  shippingAvailable?: boolean;
  pickupAvailable?: boolean;
  hasAnswers?: boolean;
  noAnswers?: boolean;
  hasHandwriting?: boolean;
  noHandwriting?: boolean;
  isBundle?: boolean;
  sort?: string;
  page?: number;
}
