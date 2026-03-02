import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        await connectDB();
        const { id } = await params;
        const category = await Category.findById(id).lean();
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        // Normalize missing fields for old categories
        return NextResponse.json({
            ...category,
            description: category.description ?? "",
            isActive: category.isActive ?? true,
            createdAt: category.createdAt ?? (category._id as import("mongoose").Types.ObjectId).getTimestamp(),
        });
    } catch (error) {
        console.error("Admin category GET error:", error);
        return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        await connectDB();
        const { id } = await params;
        const data = await request.json();
        const category = await Category.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).lean();
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        return NextResponse.json(category);
    } catch (error) {
        console.error("Admin category PATCH error:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        await connectDB();
        const { id } = await params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        console.error("Admin category DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
