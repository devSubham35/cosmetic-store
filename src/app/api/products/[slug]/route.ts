import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;
        const product = await Product.findOne({ slug }).lean();
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error("Product GET error:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;
        const data = await request.json();
        const product = await Product.findOneAndUpdate({ slug }, data, { new: true }).lean();
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error("Product PUT error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;
        const product = await Product.findOneAndDelete({ slug });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        console.error("Product DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
