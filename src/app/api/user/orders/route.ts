import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();

        // Match by userId (new orders) or by email in customerDetails (fallback for old orders)
        const orders = await Order.find({
            $or: [
                { userId: payload.userId },
                { "customerDetails.email": payload.email },
            ],
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(orders);
    } catch (error) {
        console.error("User orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
