import { connectDB } from "@/lib/db";
import { Otp } from "@/models/otp.model";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(email: string, otp: string): Promise<void> {
    await connectDB();
    const normalizedEmail = email.toLowerCase();
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
        email: normalizedEmail,
        otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
    await connectDB();
    const normalizedEmail = email.toLowerCase();
    const entry = await Otp.findOneAndDelete({
        email: normalizedEmail,
        otp,
        expiresAt: { $gt: new Date() },
    });
    return !!entry;
}
