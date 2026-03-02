import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, JWTPayload } from "@/lib/auth";

export async function verifyAdmin(
    request: NextRequest
): Promise<{ payload: JWTPayload } | NextResponse> {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (payload.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    return { payload };
}
