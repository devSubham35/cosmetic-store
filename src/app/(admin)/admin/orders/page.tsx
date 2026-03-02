"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { OrderType } from "@/lib/types";
import {
    Package, ShoppingCart, DollarSign, Clock, Search,
    CheckCircle2, Truck, PackageCheck, ChevronDown, Eye,
} from "lucide-react";
import DateRangePicker, { type DateRange } from "@/components/ui/DateRangePicker";
import { usePaginatedFetch } from "@/lib/use-paginated-fetch";
import CommonTable from "@/components/admin/CommonTable";
import { type ColumnDef } from "@tanstack/react-table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useAdminTheme } from "@/context/AdminThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIs {
    totalOrders: number;
    totalRevenue: number;
    Pending: number;
    Confirmed: number;
    Shipped: number;
    Delivered: number;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
    label, value, sub, icon: Icon, accent, isDark,
}: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; accent: string; isDark: boolean;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${isDark ? "bg-[#1a1d2e] border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-purple-500/5" : "bg-white border-pink-100 hover:shadow-lg hover:shadow-pink-100/40"}`}>
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${accent}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{value}</p>
                    {sub && <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${accent}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// ─── Status Filter Dropdown ───────────────────────────────────────────────────

const STATUS_LIST = ["All", "Pending", "Confirmed", "Shipped", "Delivered"] as const;

function StatusDropdown({ value, onChange, isDark }: { value: string; onChange: (v: string) => void; isDark: boolean }) {
    const [open, setOpen] = useState(false);

    const dotColor: Record<string, string> = {
        All: "bg-gray-400",
        Pending: "bg-yellow-400",
        Confirmed: "bg-blue-500",
        Shipped: "bg-purple-500",
        Delivered: "bg-emerald-500",
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${isDark ? "text-gray-400 bg-white/5 hover:bg-white/10 border-white/5" : "text-gray-600 bg-gray-50 hover:bg-gray-100 border-pink-100"}`}
            >
                <span className={`w-2 h-2 rounded-full ${dotColor[value] ?? "bg-gray-400"}`} />
                {value === "All" ? "All Status" : value}
                <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className={`absolute left-0 top-full mt-1 rounded-lg shadow-lg border z-20 overflow-hidden min-w-[150px] ${isDark ? "bg-[#1a1d2e] border-white/10" : "bg-white border-gray-100"}`}>
                        {STATUS_LIST.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors ${
                                    opt === value
                                        ? "bg-pink-500/10 text-pink-400 font-medium"
                                        : isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${dotColor[opt] ?? "bg-gray-400"}`} />
                                {opt === "All" ? "All Status" : opt}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Status Colors ────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
    Pending:   "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped:   "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
};

// ─── Order Detail Modal ──────────────────────────────────────────────────────

function OrderDetailModal({ order, open, onOpenChange, isDark }: {
    order: OrderType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isDark: boolean;
}) {
    if (!order) return null;
    const c = order.customerDetails;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-[600px] max-h-[90vh] overflow-y-auto ${isDark ? "bg-[#1a1d2e] border-white/10 text-white" : ""}`}>
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${isDark ? "text-white" : ""}`}>
                        Order #{order._id.slice(-8).toUpperCase()}
                        <Badge className={`${statusColors[order.status] ?? "bg-gray-100 text-gray-700"} border-0 ml-2`}>
                            {order.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Customer Details</h3>
                        <div className={`rounded-xl p-4 space-y-1.5 text-sm ${isDark ? "bg-white/5" : "bg-pink-50/50"}`}>
                            <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Name:</span> <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>{c.fullName}</span></p>
                            <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Phone:</span> <span className={isDark ? "text-gray-300" : "text-gray-700"}>{c.phone}</span></p>
                            <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Email:</span> <span className={isDark ? "text-gray-300" : "text-gray-700"}>{c.email}</span></p>
                            <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Address:</span> <span className={isDark ? "text-gray-300" : "text-gray-700"}>{c.address}</span></p>
                            <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>City:</span> <span className={isDark ? "text-gray-300" : "text-gray-700"}>{c.city}, {c.state} — {c.pincode}</span></p>
                            {c.notes && <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Notes:</span> <span className={isDark ? "text-gray-300" : "text-gray-700"}>{c.notes}</span></p>}
                        </div>
                    </div>

                    <div>
                        <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Products ({order.products.length})</h3>
                        <div className="space-y-2">
                            {order.products.map((p, i) => (
                                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-pink-500/10" : "bg-pink-100"}`}>
                                        <Package className="w-4 h-4 text-pink-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>{p.name}</p>
                                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Qty: {p.quantity} &middot; ₹{p.price.toFixed(2)}</p>
                                    </div>
                                    <p className={`text-sm font-semibold shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>₹{(p.price * p.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-white/5" : "border-pink-100"}`}>
                        <span className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Amount</span>
                        <span className="text-lg font-bold text-pink-500">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
    const { isDark } = useAdminTheme();
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

    const filters: Record<string, string> = {};
    if (statusFilter !== "All") filters.status = statusFilter;
    if (dateRange?.from) filters.dateFrom = dateRange.from.toISOString();
    if (dateRange?.to) filters.dateTo = dateRange.to.toISOString();

    const {
        data: orders,
        meta,
        loading,
        search,
        setSearch,
        setPage,
        limit,
        setLimit,
        refetch,
    } = usePaginatedFetch<OrderType>({
        baseUrl: "/api/admin/orders",
        filters,
    });

    useEffect(() => {
        fetch("/api/admin/orders-stats")
            .then((r) => r.json())
            .then((data) => { if (data.kpis) setKpis(data.kpis); })
            .catch(() => {})
            .finally(() => setKpiLoading(false));
    }, []);

    const updateStatus = useCallback(async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                if (kpis) {
                    const old = orders.find((o) => o._id === orderId)?.status;
                    if (old && old !== newStatus) {
                        setKpis((k) => k ? {
                            ...k,
                            [old]: Math.max(0, k[old as keyof KPIs] as number - 1),
                            [newStatus]: (k[newStatus as keyof KPIs] as number) + 1,
                        } : k);
                    }
                }
                refetch();
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch {
            toast.error("Failed to update order status");
        }
    }, [kpis, orders, refetch]);

    const columns = useMemo<ColumnDef<OrderType>[]>(() => [
        {
            accessorKey: "_id",
            header: "Order ID",
            cell: ({ row }) => (
                <span className={`text-sm font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    #{row.original._id.slice(-8).toUpperCase()}
                </span>
            ),
        },
        {
            id: "customer",
            header: "Customer",
            cell: ({ row }) => (
                <div>
                    <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-800"}`}>{row.original.customerDetails.fullName}</p>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{row.original.customerDetails.phone}</p>
                </div>
            ),
        },
        {
            accessorKey: "products",
            header: "Items",
            cell: ({ row }) => (
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{row.original.products.length}</span>
            ),
        },
        {
            accessorKey: "totalAmount",
            header: "Total",
            cell: ({ row }) => (
                <span className="font-semibold text-pink-500 text-sm">
                    ₹{row.original.totalAmount.toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[row.original.status] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>
                        {row.original.status}
                    </Badge>
                    <Select value={row.original.status} onValueChange={(v) => updateStatus(row.original._id, v)}>
                        <SelectTrigger className={`w-[120px] h-8 text-xs ${isDark ? "border-white/10 bg-white/5 text-gray-300" : "border-pink-200"}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? "bg-[#1a1d2e] border-white/10" : ""}>
                            <SelectItem value="Pending" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Pending</SelectItem>
                            <SelectItem value="Confirmed" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Confirmed</SelectItem>
                            <SelectItem value="Shipped" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Shipped</SelectItem>
                            <SelectItem value="Delivered" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(row.original.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <button
                    onClick={() => setSelectedOrder(row.original)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-pink-400 hover:bg-white/5" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
                    aria-label="View order details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [updateStatus, isDark]);

    const primaryKpis = kpis ? [
        { label: "Total Orders",  value: kpis.totalOrders.toLocaleString(), icon: ShoppingCart,  accent: "bg-pink-500" },
        { label: "Revenue",       value: `₹${kpis.totalRevenue.toLocaleString()}`, sub: "All time", icon: DollarSign, accent: "bg-green-500" },
    ] : [];

    const statusKpis = kpis ? [
        { label: "Pending",       value: kpis.Pending.toString(),   icon: Clock,         accent: "bg-yellow-400" },
        { label: "Confirmed",     value: kpis.Confirmed.toString(), icon: CheckCircle2,  accent: "bg-blue-500" },
        { label: "Shipped",       value: kpis.Shipped.toString(),   icon: Truck,         accent: "bg-purple-500" },
        { label: "Delivered",     value: kpis.Delivered.toString(), icon: PackageCheck,  accent: "bg-emerald-500" },
    ] : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>Orders</h1>
                <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{meta?.total ?? 0} orders total</p>
            </div>

            {kpiLoading ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-pink-50"}`} />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-pink-50"}`} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {primaryKpis.map((c) => (
                            <KPICard key={c.label} label={c.label} value={c.value} sub={c.sub} icon={c.icon} accent={c.accent} isDark={isDark} />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {statusKpis.map((c) => (
                            <KPICard key={c.label} label={c.label} value={c.value} icon={c.icon} accent={c.accent} isDark={isDark} />
                        ))}
                    </div>
                </div>
            )}

            <div className={`rounded-2xl border p-4 ${isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-pink-100"}`}>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`pl-9 rounded-xl ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-gray-500" : "border-pink-200 focus:border-pink-400"}`}
                        />
                    </div>
                    <StatusDropdown value={statusFilter} onChange={setStatusFilter} isDark={isDark} />
                    <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="All time"
                    />
                </div>
            </div>

            <CommonTable
                columns={columns}
                data={orders}
                meta={meta}
                loading={loading}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                emptyIcon={
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-pink-500/10" : "bg-pink-50"}`}>
                        <Package className="w-7 h-7 text-pink-300" />
                    </div>
                }
                emptyMessage="No orders found. Try adjusting your filters."
            />

            <OrderDetailModal
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}
                isDark={isDark}
            />
        </div>
    );
}
