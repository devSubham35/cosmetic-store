import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview {
    user: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    stock: number;
    sku: string;
    ratings: number;
    reviews: IReview[];
    isFeatured: boolean;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String }],
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    ratings: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ name: "text" });

export const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
