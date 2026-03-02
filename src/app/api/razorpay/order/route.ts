import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert rupees to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
    }
}
