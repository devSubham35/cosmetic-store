import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { sendStatusUpdateEmail } from "@/lib/email";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id).lean();
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json(order);
    } catch (error) {
        console.error("Order GET error:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Notify customer by email (non-blocking)
        const customerEmail = order.customerDetails.email;
        const customerName = order.customerDetails.fullName;
        if (customerEmail) {
            sendStatusUpdateEmail(customerEmail, order._id.toString(), status, customerName)
                .catch((err) => console.error("Status email failed:", err));
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order PATCH error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
