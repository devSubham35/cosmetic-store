import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Address } from "@/models/address.model";

async function getAuthUser(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    return verifyJWT(token);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await getAuthUser(request);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const data = await request.json();
        await connectDB();

        // If setting as default, unset all others first
        if (data.isDefault) {
            await Address.updateMany({ userId: payload.userId }, { isDefault: false });
        }

        const address = await Address.findOneAndUpdate(
            { _id: id, userId: payload.userId },
            data,
            { new: true }
        );
        if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

        return NextResponse.json(address);
    } catch (error) {
        console.error("Address PATCH error:", error);
        return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await getAuthUser(request);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const address = await Address.findOneAndDelete({ _id: id, userId: payload.userId });
        if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

        // If the deleted address was default, set the next one as default
        if (address.isDefault) {
            const next = await Address.findOne({ userId: payload.userId }).sort({ createdAt: -1 });
            if (next) await Address.findByIdAndUpdate(next._id, { isDefault: true });
        }

        return NextResponse.json({ message: "Address deleted" });
    } catch (error) {
        console.error("Address DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
    }
}
