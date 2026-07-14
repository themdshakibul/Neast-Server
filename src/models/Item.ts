import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  date: string;
  category: string;
  imageUrl: string;
  rating: number;
  userId: string;
  status: string;
}

const ItemSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    price: { type: Number, required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number, default: 0 },
    userId: { type: String, required: true, default: "demo-user-123" },
    status: { type: String, default: "pending", enum: ["pending", "approved"] },
  },
  { timestamps: true }
);

export default mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);
