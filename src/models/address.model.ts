import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress extends Document {
    userId: mongoose.Types.ObjectId;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    createdAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

AddressSchema.index({ userId: 1 });

export const Address: Model<IAddress> =
    mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema);
