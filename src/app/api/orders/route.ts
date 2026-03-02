import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { sendOrderEmail, sendOrderConfirmationToCustomer, generateWhatsAppURL } from "@/lib/email";
import { verifyJWT } from "@/lib/auth";

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();

        // Attach userId if the user is logged in
        let userId: string | undefined;
        const token = request.cookies.get("auth-token")?.value;
        if (token) {
            const payload = await verifyJWT(token);
            if (payload) userId = payload.userId;
        }

        const order = new Order({
            products: data.products,
            totalAmount: data.totalAmount,
            customerDetails: data.customerDetails,
            status: "Pending",
            ...(userId && { userId }),
        });

        await order.save();

        const emailProducts = data.products.map((p: { name: string; quantity: number; price: number }) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
        }));

        // Email to admin (non-blocking)
        sendOrderEmail(order._id.toString(), emailProducts, data.totalAmount, data.customerDetails)
            .catch((err) => console.error("Admin email failed:", err));

        // Email to customer (non-blocking)
        sendOrderConfirmationToCustomer(
            data.customerDetails.email,
            order._id.toString(),
            emailProducts,
            data.totalAmount,
            data.customerDetails
        ).catch((err) => console.error("Customer email failed:", err));

        const whatsappUrl = generateWhatsAppURL(emailProducts, data.totalAmount, data.customerDetails);

        return NextResponse.json({
            order,
            whatsappUrl,
            message: "Order placed successfully!",
        }, { status: 201 });
    } catch (error) {
        console.error("Order POST error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
