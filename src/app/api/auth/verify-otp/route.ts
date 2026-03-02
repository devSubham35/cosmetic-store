import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp-store";
import { signJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(request: NextRequest) {
    try {
        const { email, otp, requireAdmin } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!(await verifyOTP(normalizedEmail, otp.trim()))) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        await connectDB();

        // Drop stale unique index on phone (leftover from old schema) that blocks user creation
        try { await User.collection.dropIndex("phone_1"); } catch { /* already dropped */ }

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            if (requireAdmin) {
                return NextResponse.json(
                    { error: "Access denied. Admin privileges required." },
                    { status: 403 }
                );
            }
            user = await User.create({ email: normalizedEmail, role: "user" });
        }

        if (requireAdmin && user.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied. Admin privileges required." },
                { status: 403 }
            );
        }

        const jwt = await signJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            message: "Login successful",
        });

        response.cookies.set("auth-token", jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }
}
