"use client";

import { Truck } from "lucide-react";

export function AnnouncementBar() {
    return (
        <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 text-white py-2 px-4 text-center text-sm font-medium">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                <span>
                    Enjoy Free Shipping For Orders Over ₹999!{" "}
                    <a href="/category/skin-care" className="underline font-bold hover:text-pink-100 transition-colors">
                        Shop Now
                    </a>
                </span>
            </div>
        </div>
    );
}
