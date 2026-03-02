import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/models/order.model";
import { paginate, parsePaginationParams } from "@/lib/pagination";
import type { FilterQuery } from "mongoose";
import type { IOrder } from "@/models/order.model";
import { verifyAdmin } from "@/lib/admin-auth";

const VALID_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered"];

export async function GET(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, search } = parsePaginationParams(searchParams);
        const status = searchParams.get("status");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");

        const filter: FilterQuery<IOrder> = {};

        if (status && VALID_STATUSES.includes(status)) {
            filter.status = status;
        }

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        if (search) {
            filter.$or = [
                { "customerDetails.fullName": { $regex: search, $options: "i" } },
                { "customerDetails.email": { $regex: search, $options: "i" } },
                { "customerDetails.phone": { $regex: search, $options: "i" } },
            ];
        }

        const result = await paginate({
            model: Order,
            filter,
            page,
            limit,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
