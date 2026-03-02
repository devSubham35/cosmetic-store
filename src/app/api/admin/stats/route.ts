import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Order } from "@/models/order.model";

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            return d.toISOString().split("T")[0];
        });

        const [totalProducts, stockAgg, orders, products7Days, orders7Days] = await Promise.all([
            Product.countDocuments(),
            Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]),
            Order.find({}, { totalAmount: 1, createdAt: 1 }).lean(),
            Product.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        stock: { $sum: "$stock" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);
        const totalStock = stockAgg[0]?.total ?? 0;

        return NextResponse.json({
            totalProducts,
            totalOrders,
            totalRevenue,
            totalStock,
            productsTrend: days.map((d) => products7Days.find((p) => p._id === d)?.count ?? 0),
            ordersTrend: days.map((d) => orders7Days.find((o) => o._id === d)?.count ?? 0),
            revenueTrend: days.map((d) => orders7Days.find((o) => o._id === d)?.revenue ?? 0),
            stockTrend: days.map((d) => products7Days.find((p) => p._id === d)?.stock ?? 0),
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
