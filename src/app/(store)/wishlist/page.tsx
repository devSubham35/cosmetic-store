"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductType } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function WishlistPage() {
    const items = useWishlistStore((s) => s.items);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    My Wishlist
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-pink-100 overflow-hidden animate-pulse">
                            <div className="aspect-square bg-pink-50" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-pink-50 rounded w-1/3" />
                                <div className="h-4 bg-pink-50 rounded w-2/3" />
                                <div className="h-5 bg-pink-50 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Convert wishlist items to ProductType for ProductCard
    const wishlistProducts: ProductType[] = items.map((item) => ({
        _id: item.id,
        name: item.name,
        slug: item.slug,
        description: "",
        shortDescription: "",
        price: item.price,
        discountPrice: item.discountPrice,
        images: [item.image],
        category: item.category,
        stock: 10,
        sku: "",
        ratings: 0,
        reviews: [],
        isFeatured: false,
        createdAt: "",
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-gray-700">Wishlist</span>
            </div>

            <div className="flex items-center gap-3 mb-8">
                <Heart className="w-7 h-7 text-pink-500 fill-pink-500" />
                <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    My Wishlist
                </h1>
                <span className="text-gray-400 text-sm">({items.length} items)</span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-pink-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-400 mb-6">Save your favorite products here for later!</p>
                    <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8">
                        <Link href="/">Start Shopping</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {wishlistProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
