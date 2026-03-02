import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-store";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const otp = generateOTP();
        await storeOTP(normalizedEmail, otp);

        const sent = await sendOTPEmail(normalizedEmail, otp);
        if (!sent) {
            return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
    }
}
