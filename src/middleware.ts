import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

const AUTH_PROTECTED = ["/billing", "/dashboard"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Admin route protection ──
    const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

    if (isAdminRoute) {
        const token = request.cookies.get("auth-token")?.value;
        if (token) {
            const payload = await verifyJWT(token);
            if (payload && payload.role === "admin") {
                return NextResponse.next();
            }
        }
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Store route protection (existing) ──
    const isProtected = AUTH_PROTECTED.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (!isProtected) return NextResponse.next();

    const token = request.cookies.get("auth-token")?.value;

    if (token) {
        const payload = await verifyJWT(token);
        if (payload) return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ["/billing", "/dashboard/:path*", "/admin/:path*"],
};
