"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        logout();
        toast.success("Logged out successfully");
        router.push("/");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <aside className="md:col-span-1">
                    <div className="bg-white rounded-2xl border border-pink-100 p-5 sticky top-24">
                        {/* Avatar */}
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-pink-100">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                {user?.name?.[0]?.toUpperCase() ?? user?.phone?.[0] ?? "U"}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{user?.name || "My Account"}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.phone}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map(({ href, label, icon: Icon, exact }) => {
                                const isActive = exact ? pathname === href : pathname.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-pink-50 text-pink-600"
                                                : "text-gray-600 hover:bg-pink-50/60 hover:text-pink-500"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {label}
                                    </Link>
                                );
                            })}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2"
                            >
                                <LogOut className="w-4 h-4 shrink-0" />
                                Logout
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="md:col-span-3">{children}</main>
            </div>
        </div>
    );
}
