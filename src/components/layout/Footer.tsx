"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useCategories } from "@/lib/use-categories";

export function Footer() {
    const categories = useCategories();

    return (
        <footer className="bg-gradient-to-b from-pink-50 to-pink-100 border-t border-pink-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold italic mb-4" style={{ color: "#ff4d8d", fontFamily: "'Outfit', sans-serif" }}>
                            💄 CosmeticStore
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            Your one-stop destination for premium cosmetics and beauty products.
                            We bring you the finest collection of skincare, makeup, haircare, and more.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Facebook, href: "#" },
                                { icon: Instagram, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Youtube, href: "#" },
                            ].map(({ icon: Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Categories</h4>
                        <ul className="space-y-2">
                            {categories.slice(0, 6).map((cat) => (
                                <li key={cat.slug}>
                                    <Link
                                        href={`/category/${cat.slug}`}
                                        className="text-gray-600 hover:text-pink-500 text-sm transition-colors inline-flex items-center gap-1 hover:gap-2"
                                    >
                                        → {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Quick Links</h4>
                        <ul className="space-y-2">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Shop All", href: "/category/skin-care" },
                                { label: "Wishlist", href: "/wishlist" },
                                { label: "Checkout", href: "/checkout" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-pink-500 text-sm transition-colors inline-flex items-center gap-1 hover:gap-2"
                                    >
                                        → {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                                <span>123 Beauty Lane, Fashion District, Mumbai 400001</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-pink-500 shrink-0" />
                                <span>(025) 3686 25 16</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                                <span>hello@cosmeticstore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-pink-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © 2025 CosmeticStore. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-400">
                        Made with 💖 for beauty lovers
                    </p>
                </div>
            </div>
        </footer>
    );
}
