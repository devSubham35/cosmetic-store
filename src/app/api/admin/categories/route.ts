import { NextRequest, NextResponse } from "next/server";
import { Category } from "@/models/category.model";
import { Product } from "@/models/product.model";
import { paginate, parsePaginationParams } from "@/lib/pagination";
import type { FilterQuery } from "mongoose";
import type { ICategory } from "@/models/category.model";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, search } = parsePaginationParams(searchParams);
        const isActive = searchParams.get("isActive");

        const filter: FilterQuery<ICategory> = {};

        if (isActive === "active") {
            filter.isActive = { $ne: false };
        } else if (isActive === "inactive") {
            filter.isActive = false;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
            ];
        }

        const result = await paginate({
            model: Category,
            filter,
            page,
            limit,
        });

        // Get product counts per category slug
        const slugs = result.data.map((c: Record<string, unknown>) => c.slug as string);
        const counts = await Product.aggregate([
            { $match: { category: { $in: slugs } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c: { _id: string; count: number }) => [c._id, c.count]));

        const data = result.data.map((cat: Record<string, unknown>) => {
            // Derive createdAt from ObjectId for old categories that lack it
            const id = cat._id as import("mongoose").Types.ObjectId;
            return {
                ...cat,
                description: (cat.description as string) ?? "",
                isActive: cat.isActive ?? true,
                createdAt: cat.createdAt ?? id.getTimestamp(),
                productCount: countMap.get(cat.slug as string) ?? 0,
            };
        });

        return NextResponse.json({ meta: result.meta, data });
    } catch (error) {
        console.error("Admin categories GET error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        const { connectDB } = await import("@/lib/db");
        await connectDB();
        const body = await request.json();
        const category = new Category(body);
        await category.save();
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Admin categories POST error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
