import mongoose, { Schema, Model } from "mongoose";

interface IOtp {
    email: string;
    otp: string;
    expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<IOtp> =
    mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
