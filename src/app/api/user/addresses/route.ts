import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Address } from "@/models/address.model";

async function getAuthUser(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    return verifyJWT(token);
}

export async function GET(request: NextRequest) {
    try {
        const payload = await getAuthUser(request);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const addresses = await Address.find({ userId: payload.userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
        return NextResponse.json(addresses);
    } catch (error) {
        console.error("Addresses GET error:", error);
        return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await getAuthUser(request);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await request.json();
        await connectDB();

        // If this is marked as default, unset others
        if (data.isDefault) {
            await Address.updateMany({ userId: payload.userId }, { isDefault: false });
        }

        // If this is the first address, auto-set as default
        const count = await Address.countDocuments({ userId: payload.userId });
        const address = await Address.create({
            ...data,
            userId: payload.userId,
            isDefault: data.isDefault || count === 0,
        });

        return NextResponse.json(address, { status: 201 });
    } catch (error) {
        console.error("Addresses POST error:", error);
        return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
    }
}
