import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { paginate, parsePaginationParams } from "@/lib/pagination";
import type { FilterQuery } from "mongoose";
import type { IUser } from "@/models/user.model";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (auth instanceof NextResponse) return auth;
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, search } = parsePaginationParams(searchParams);
        const role = searchParams.get("role");

        const filter: FilterQuery<IUser> = {};

        if (role === "user" || role === "admin") {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const result = await paginate({
            model: User,
            filter,
            projection: { email: 1, name: 1, role: 1, createdAt: 1 },
            page,
            limit,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin users GET error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
