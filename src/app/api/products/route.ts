import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");
        const sort = searchParams.get("sort");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");

        const query: Record<string, unknown> = {};
        if (category) query.category = category;
        if (featured === "true") query.isFeatured = true;

        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
            Product.countDocuments(query),
        ]);

        return NextResponse.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const product = new Product(data);
        await product.save();
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Product POST error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
