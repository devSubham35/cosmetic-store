"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, MapPin, User, Package } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [orderCount, setOrderCount] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/user/orders")
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setOrderCount(data.length); })
            .catch(() => {});
    }, []);

    const cards = [
        { href: "/dashboard/orders", icon: ShoppingBag, label: "My Orders", desc: orderCount !== null ? `${orderCount} order${orderCount !== 1 ? "s" : ""}` : "View all orders", color: "text-purple-500 bg-purple-50" },
        { href: "/dashboard/profile", icon: User, label: "Profile", desc: "Update name & email", color: "text-blue-500 bg-blue-50" },
        { href: "/dashboard/addresses", icon: MapPin, label: "Addresses", desc: "Manage delivery addresses", color: "text-green-500 bg-green-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">
                        Welcome{user?.name ? `, ${user.name}` : " back"}!
                    </h1>
                </div>
                <p className="text-pink-100 text-sm">Manage your orders, profile and addresses from here.</p>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map(({ href, icon: Icon, label, desc, color }) => (
                    <Link
                        key={href}
                        href={href}
                        className="bg-white rounded-2xl border border-pink-100 p-5 hover:shadow-md hover:shadow-pink-500/5 transition-all group"
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-gray-800 group-hover:text-pink-500 transition-colors">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
