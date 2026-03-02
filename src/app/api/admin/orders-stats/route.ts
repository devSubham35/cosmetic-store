import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            return d.toISOString().split("T")[0];
        });

        const [allOrders, ordersByStatus, orders30Days, users30Days] = await Promise.all([
            Order.find({}, { totalAmount: 1, status: 1 }).lean(),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
        const statusCounts: Record<string, number> = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0 };
        ordersByStatus.forEach(({ _id, count }) => { if (_id in statusCounts) statusCounts[_id] = count; });

        return NextResponse.json({
            kpis: {
                totalOrders: allOrders.length,
                totalRevenue,
                ...statusCounts,
            },
            chart: {
                days,
                orders: days.map((d) => orders30Days.find((o) => o._id === d)?.count ?? 0),
                revenue: days.map((d) => orders30Days.find((o) => o._id === d)?.revenue ?? 0),
                users: days.map((d) => users30Days.find((u) => u._id === d)?.count ?? 0),
            },
        });
    } catch (error) {
        console.error("Orders stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
