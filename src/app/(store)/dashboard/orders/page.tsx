"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, ChevronDown, ChevronUp, Search, CheckCircle2, Truck, Clock, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrderProduct {
    name: string;
    quantity: number;
    price: number;
    image: string;
}

interface Order {
    _id: string;
    products: OrderProduct[];
    totalAmount: number;
    status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
    customerDetails: { fullName: string; address: string; city: string; state: string; pincode: string };
    createdAt: string;
}

const STATUS_STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    Pending:   { label: "Pending",   color: "text-yellow-600", bg: "bg-yellow-50",  icon: <Clock className="w-3.5 h-3.5" /> },
    Confirmed: { label: "Confirmed", color: "text-blue-600",   bg: "bg-blue-50",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    Shipped:   { label: "Shipped",   color: "text-purple-600", bg: "bg-purple-50",  icon: <Truck className="w-3.5 h-3.5" /> },
    Delivered: { label: "Delivered", color: "text-green-600",  bg: "bg-green-50",   icon: <PackageCheck className="w-3.5 h-3.5" /> },
};

function StatusTracker({ status }: { status: Order["status"] }) {
    const currentIndex = STATUS_STEPS.indexOf(status);
    return (
        <div className="flex items-center gap-0 w-full">
            {STATUS_STEPS.map((step, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all
                                    ${done
                                        ? active
                                            ? "border-pink-500 bg-pink-500 text-white scale-110"
                                            : "border-pink-400 bg-pink-100 text-pink-500"
                                        : "border-gray-200 bg-white text-gray-300"}`}
                            >
                                {done ? (i < currentIndex ? "✓" : statusConfig[step].icon) : i + 1}
                            </div>
                            <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-pink-500" : "text-gray-300"}`}>
                                {step}
                            </span>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${i < currentIndex ? "bg-pink-400" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/user/orders")
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setOrders(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return orders;
        return orders.filter((o) => o._id.toLowerCase().includes(q) || o._id.slice(-8).toLowerCase().includes(q));
    }, [orders, search]);

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-pink-50 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 rounded-xl border-pink-200 focus:border-pink-400 h-9 text-sm"
                    />
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-pink-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No orders yet</h3>
                    <p className="text-gray-400 text-sm">Your orders will appear here after you shop.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
                    <p className="text-gray-400 text-sm">No orders matching <span className="text-pink-500 font-medium">{search}</span></p>
                </div>
            ) : (
                filtered.map((order) => {
                    const cfg = statusConfig[order.status];
                    return (
                        <div key={order._id} className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
                            {/* Summary row */}
                            <button
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-pink-50/40 transition-colors"
                                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">
                                            {order.products.length} item{order.products.length !== 1 ? "s" : ""} · ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                                        {cfg.icon}
                                        {order.status}
                                    </span>
                                    {expanded === order._id
                                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </button>

                            {/* Expanded detail */}
                            {expanded === order._id && (
                                <div className="border-t border-pink-100 px-5 py-5 space-y-5 bg-pink-50/20">
                                    {/* Status tracker */}
                                    <StatusTracker status={order.status} />

                                    {/* Products */}
                                    <div className="space-y-2">
                                        {order.products.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{p.name} <span className="text-gray-400">× {p.quantity}</span></span>
                                                <span className="font-medium text-gray-800">₹{(p.price * p.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Delivery address */}
                                    <div className="border-t border-pink-100 pt-4 text-sm text-gray-500">
                                        <p className="font-medium text-gray-700 mb-0.5">Delivery to:</p>
                                        <p>{order.customerDetails.fullName}</p>
                                        <p>{order.customerDetails.address}, {order.customerDetails.city}, {order.customerDetails.state} – {order.customerDetails.pincode}</p>
                                    </div>

                                    {/* Full order ID */}
                                    <p className="text-[11px] text-gray-300 font-mono pt-1">Order ID: {order._id}</p>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
