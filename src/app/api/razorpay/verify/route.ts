import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { sendOrderEmail, sendOrderConfirmationToCustomer, generateWhatsAppURL } from "@/lib/email";
import { verifyJWT } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData,
        } = await request.json();

        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // Signature valid — create order in DB
        await connectDB();

        let userId: string | undefined;
        const token = request.cookies.get("auth-token")?.value;
        if (token) {
            const payload = await verifyJWT(token);
            if (payload) userId = payload.userId;
        }

        const order = new Order({
            products: orderData.products,
            totalAmount: orderData.totalAmount,
            customerDetails: orderData.customerDetails,
            status: "Pending",
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            ...(userId && { userId }),
        });

        await order.save();

        // Send notifications (non-blocking)
        const emailProducts = orderData.products.map(
            (p: { name: string; quantity: number; price: number }) => ({
                name: p.name,
                quantity: p.quantity,
                price: p.price,
            })
        );

        sendOrderEmail(
            order._id.toString(),
            emailProducts,
            orderData.totalAmount,
            orderData.customerDetails
        ).catch((err) => console.error("Admin email failed:", err));

        sendOrderConfirmationToCustomer(
            orderData.customerDetails.email,
            order._id.toString(),
            emailProducts,
            orderData.totalAmount,
            orderData.customerDetails
        ).catch((err) => console.error("Customer email failed:", err));

        const whatsappUrl = generateWhatsAppURL(emailProducts, orderData.totalAmount, orderData.customerDetails);

        return NextResponse.json({
            order,
            whatsappUrl,
            message: "Payment verified and order placed successfully!",
        }, { status: 201 });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
    }
}
