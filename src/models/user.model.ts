import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    email: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role: "user" | "admin";
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
