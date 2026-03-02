import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Category } from "@/models/category.model";

export async function GET(request: NextRequest) {
    try {
        const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

        if (q.length < 2) {
            return NextResponse.json({ products: [], categories: [] });
        }

        await connectDB();

        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        const [products, categories] = await Promise.all([
            Product.find(
                { name: { $regex: regex } },
                { name: 1, slug: 1, images: { $slice: 1 }, price: 1, discountPrice: 1, ratings: 1, category: 1 }
            )
                .limit(5)
                .lean(),
            Category.find(
                { name: { $regex: regex } },
                { name: 1, slug: 1, image: 1 }
            )
                .limit(3)
                .lean(),
        ]);

        return NextResponse.json({ products, categories });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ products: [], categories: [] }, { status: 500 });
    }
}
