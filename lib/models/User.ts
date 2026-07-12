import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  isVerified: boolean;
  createdAt: Date;
  province?: string;
  city?: string;
  rating: number;
  totalSales: number;
  totalPurchases: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    rating: { type: Number, default: 5.0 },
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
