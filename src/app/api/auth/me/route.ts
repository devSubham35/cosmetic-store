import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        if (!token) return NextResponse.json({ user: null });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ user: null });

        await connectDB();
        const user = await User.findById(payload.userId).lean();
        if (!user) return NextResponse.json({ user: null });

        return NextResponse.json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch {
        return NextResponse.json({ user: null });
    }
}
