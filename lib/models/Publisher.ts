import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPublisher extends Document {
  name: string;
  slug: string;
  logo?: string;
}

const PublisherSchema = new Schema<IPublisher>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: "" },
  },
  { timestamps: true }
);

const Publisher: Model<IPublisher> =
  mongoose.models.Publisher ||
  mongoose.model<IPublisher>("Publisher", PublisherSchema);

export default Publisher;
