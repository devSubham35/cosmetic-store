"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, ArrowLeft, Menu, X, Sun, Moon, UserCircle, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { useAuthStore } from "@/store/authStore";

const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderOpen },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

function AdminAuthGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoading || isLoginPage) return;
        if (!isAuthenticated || user?.role !== "admin") {
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, user, isLoginPage, pathname, router]);

    if (isLoginPage) return <>{children}</>;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "admin") return null;

    return <>{children}</>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark, toggleTheme } = useAdminTheme();
    const { user, logout: storeLogout } = useAuthStore();

    const isLoginPage = pathname === "/admin/login";

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch { /* ignore */ }
        storeLogout();
        router.replace("/admin/login");
    };

    if (isLoginPage) return <>{children}</>;

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "A";

    return (
        <div className={`min-h-screen ${isDark ? "bg-[#0f1117]" : "bg-gray-50"}`}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className={`fixed inset-0 z-40 lg:hidden ${isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/30"}`} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isDark ? "bg-[#161822] border-r border-white/5" : "bg-white border-r border-pink-100"}`}>
                <div className={`p-6 ${isDark ? "border-b border-white/5" : "border-b border-pink-100"}`}>
                    <h2 className="text-xl font-bold italic" style={{ fontFamily: "'Outfit', sans-serif", color: "#ff4d8d" }}>
                        Admin Panel
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.startsWith(href)
                                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                                    : isDark
                                        ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                        : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className={`p-4 ${isDark ? "border-t border-white/5" : "border-t border-pink-100"}`}>
                    {/* Admin user info */}
                    <div className={`flex items-center gap-3 px-4 py-3 mb-3 rounded-xl ${isDark ? "bg-white/5" : "bg-pink-50/50"}`}>
                        <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                                {user?.name || "Admin"}
                            </p>
                            <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-2 w-full text-sm font-medium px-4 py-2.5 rounded-xl transition-all mb-2 ${isDark
                                ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                            }`}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDark ? "Light Mode" : "Dark Mode"}
                    </button>

                    {/* Back to Store */}
                    <Link
                        href="/"
                        className={`flex items-center gap-2 text-sm px-4 py-2 transition-colors mb-1 ${isDark ? "text-gray-500 hover:text-pink-400" : "text-gray-500 hover:text-pink-500"}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Store
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-sm px-4 py-2 text-red-500 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50/50"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className={`lg:hidden p-4 flex items-center justify-between ${isDark ? "bg-[#161822] border-b border-white/5" : "bg-white border-b border-pink-100"}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className={`p-2 ${isDark ? "text-gray-400" : "text-gray-600"}`} aria-label="Open menu">
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <h2 className="text-lg font-bold italic" style={{ color: "#ff4d8d" }}>Admin Panel</h2>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-pink-50"}`}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminThemeProvider>
            <AuthProvider>
                <AdminAuthGate>
                    <AdminShell>{children}</AdminShell>
                </AdminAuthGate>
            </AuthProvider>
        </AdminThemeProvider>
    );
}
