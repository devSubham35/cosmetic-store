"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Phone, Menu, X, ChevronDown, User, LogOut, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/layout/SearchBar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useCategories } from "@/lib/use-categories";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const categories = useCategories();
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const openCart = useCartStore((s) => s.openCart);
    const cartItemCount = useCartStore((s) => s.getItemCount());
    const wishlistCount = useWishlistStore((s) => s.getItemCount());
    const { user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => { setMounted(true); }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        logout();
        toast.success("Logged out");
        router.push("/");
    };

    const userInitial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Main Header Row */}
                <div className="flex items-center justify-between h-16 md:h-20 gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-lg sm:text-2xl md:text-3xl font-bold italic" style={{ color: "#ff4d8d", fontFamily: "'Outfit', sans-serif" }}>
                                <span className="hidden xs:inline">💄 </span>Cosmetic<span className="text-pink-600">Store</span>
                            </span>
                            <span className="text-[10px] text-gray-400 -mt-1 hidden md:block">Since 1998</span>
                        </div>
                    </Link>

                    {/* Categories Dropdown + Search */}
                    <div className="hidden md:flex items-center flex-1 max-w-xl relative">
                        <div className="relative">
                            <button
                                onClick={() => setCategoriesOpen(!categoriesOpen)}
                                className="flex items-center gap-1 bg-pink-500 text-white px-4 py-2.5 rounded-l-full text-sm font-medium hover:bg-pink-600 transition-colors"
                            >
                                All Categories
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {categoriesOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setCategoriesOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-pink-100 py-2 min-w-[200px] z-50">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={`/category/${cat.slug}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                                                onClick={() => setCategoriesOpen(false)}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <SearchBar inputClassName="rounded-none rounded-r-full border-l-0 border-pink-200 focus:border-pink-400 h-[42px]" />
                    </div>

                    {/* Hotline */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        <Phone className="w-5 h-5 text-pink-500" />
                        <div className="text-sm">
                            <span className="text-gray-400 text-xs">Hotline 24/7</span>
                            <p className="font-bold text-gray-800">(025) 3686 25 16</p>
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3">
                        <Link
                            href="/wishlist"
                            className="relative p-2 rounded-full hover:bg-pink-50 transition-colors"
                            aria-label="Wishlist"
                        >
                            <Heart className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                            {mounted && wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full hover:bg-pink-50"
                            onClick={openCart}
                            aria-label="Open cart"
                        >
                            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                            {mounted && cartItemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>

                        {/* Auth: Avatar dropdown or Login */}
                        {mounted && (
                            isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-pink-300 hover:ring-offset-1 transition-all shrink-0"
                                            aria-label="Account menu"
                                        >
                                            {userInitial}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-pink-100 shadow-lg shadow-pink-100/30 p-1">
                                        <div className="px-3 py-2 mb-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "My Account"}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <DropdownMenuSeparator className="bg-pink-100" />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/orders" className="flex items-center gap-2 rounded-lg cursor-pointer">
                                                <Package className="w-4 h-4 text-pink-500" />
                                                My Orders
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-lg cursor-pointer">
                                                <User className="w-4 h-4 text-pink-500" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/addresses" className="flex items-center gap-2 rounded-lg cursor-pointer">
                                                <MapPin className="w-4 h-4 text-pink-500" />
                                                Manage Addresses
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-pink-100" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors p-2 sm:px-3 sm:py-1.5 rounded-full hover:bg-pink-50"
                                    aria-label="Login"
                                >
                                    <User className="w-5 h-5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Login</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-3">
                    <SearchBar mobile inputClassName="rounded-full border-pink-200 h-10" />
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden md:block border-t border-pink-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <ul className="flex items-center gap-8 h-12 text-sm font-medium">
                        <li>
                            <Link href="/" className="text-pink-500 hover:text-pink-600 transition-colors font-semibold">
                                Home
                            </Link>
                        </li>
                        <li className="relative group">
                            <Link href="/category/skin-care" className="text-gray-700 hover:text-pink-500 transition-colors flex items-center gap-1">
                                Shop <ChevronDown className="w-3 h-3" />
                            </Link>
                            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl rounded-lg border border-pink-100 py-2 min-w-[180px] z-50">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.slug}
                                        href={`/category/${cat.slug}`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </li>
                        {["Skin Care", "Lipstick", "Hair Care"].map((item) => (
                            <li key={item}>
                                <Link
                                    href={`/category/${item.toLowerCase().replace(/ /g, "-")}`}
                                    className="text-gray-700 hover:text-pink-500 transition-colors"
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/wishlist" className="text-gray-700 hover:text-pink-500 transition-colors">
                                Wishlist
                            </Link>
                        </li>
                        {mounted && isAuthenticated && (
                            <li>
                                <Link href="/dashboard" className="text-gray-700 hover:text-pink-500 transition-colors">
                                    My Account
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-pink-100 bg-white shadow-lg">
                    <nav className="px-4 py-3 space-y-1">
                        <Link href="/" className="block py-2 text-pink-500 font-semibold" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className="block py-2 text-gray-700 hover:text-pink-500 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link href="/wishlist" className="block py-2 text-gray-700 hover:text-pink-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                        {mounted && isAuthenticated ? (
                            <>
                                <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-pink-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                                <button onClick={handleLogout} className="block py-2 text-red-500 w-full text-left">Logout</button>
                            </>
                        ) : (
                            <Link href="/login" className="block py-2 text-pink-500 font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
