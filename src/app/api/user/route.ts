import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";

export async function PATCH(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, email } = await request.json();

        await connectDB();
        const user = await User.findByIdAndUpdate(
            payload.userId,
            { ...(name !== undefined && { name }), ...(email !== undefined && { email }) },
            { new: true }
        ).lean();

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
            user: { _id: user._id, phone: user.phone, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("User PATCH error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
