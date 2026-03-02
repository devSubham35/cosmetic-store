"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="animate-fade-in-up">
                {/* Success Icon */}
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Payment Successful!
                </h1>

                <p className="text-gray-500 text-lg mb-2">
                    Thank you for your purchase!
                </p>
                <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                    Your payment has been confirmed and order details have been sent via email and WhatsApp.
                    We&apos;ll process your order shortly.
                </p>

                {/* Order Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <div className="text-3xl mb-3">&#9989;</div>
                        <h3 className="font-semibold text-gray-800 mb-1">Payment Confirmed</h3>
                        <p className="text-sm text-gray-500">Your payment was processed securely via Razorpay</p>
                    </div>
                    <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                        <div className="text-3xl mb-3">&#128231;</div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email Notification</h3>
                        <p className="text-sm text-gray-500">Order details sent to your email</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <div className="text-3xl mb-3">&#128241;</div>
                        <h3 className="font-semibold text-gray-800 mb-1">WhatsApp Redirect</h3>
                        <p className="text-sm text-gray-500">Message sent to our store for quick confirmation</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-base">
                        <Link href="/">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="border-pink-200 text-gray-600 rounded-full px-8 py-6 text-base">
                        <Link href="/category/skin-care">
                            Explore More
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
