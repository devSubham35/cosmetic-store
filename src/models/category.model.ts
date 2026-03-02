import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// Delete cached model to ensure schema changes (like status → isActive) take effect in dev HMR
if (mongoose.models.Category) {
    delete mongoose.models.Category;
}
export const Category: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);
