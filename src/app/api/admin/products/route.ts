import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/product.model";
import { paginate, parsePaginationParams } from "@/lib/pagination";
import type { FilterQuery } from "mongoose";
import type { IProduct } from "@/models/product.model";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, search } = parsePaginationParams(searchParams);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");
        const stockStatus = searchParams.get("stockStatus");

        const filter: FilterQuery<IProduct> = {};

        if (category) filter.category = category;
        if (featured === "true") filter.isFeatured = true;
        if (featured === "false") filter.isFeatured = false;

        if (stockStatus === "out_of_stock") filter.stock = 0;
        else if (stockStatus === "low_stock") filter.stock = { $gt: 0, $lte: 10 };
        else if (stockStatus === "in_stock") filter.stock = { $gt: 10 };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
            ];
        }

        const result = await paginate({
            model: Product,
            filter,
            page,
            limit,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
