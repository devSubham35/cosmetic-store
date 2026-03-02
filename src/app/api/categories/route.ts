import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({ isActive: { $ne: false } }).lean();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Categories GET error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const category = new Category(data);
        await category.save();
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Category POST error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
