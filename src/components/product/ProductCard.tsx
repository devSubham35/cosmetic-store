"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductType } from "@/lib/types";
import { toast } from "sonner";

interface ProductCardProps {
    product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const toggleItem = useWishlistStore((s) => s.toggleItem);
    const wishlisted = useWishlistStore((s) => s.items.some((i) => i.id === product._id));

    const discountPercent = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice,
            image: product.images[0],
            slug: product.slug,
        });
        toast.success(`${product.name} added to cart!`);
    };

    const handleToggleWishlist = () => {
        toggleItem({
            id: product._id,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice,
            image: product.images[0],
            slug: product.slug,
            category: product.category,
        });
        toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden product-card-hover border border-pink-100">
            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-white">
                <Link href={`/product/${product.slug}`}>
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </Link>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <Badge className="absolute top-3 left-3 bg-pink-500 text-white rounded-full text-xs px-2.5 py-0.5 font-semibold">
                        -{discountPercent}%
                    </Badge>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${wishlisted
                            ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                            : "bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white shadow-md"
                        }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                </button>

                {/* Quick Add to Cart */}
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Button
                        onClick={handleAddToCart}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-medium shadow-lg shadow-pink-500/30"
                        size="sm"
                    >
                        <ShoppingBag className="w-4 h-4 mr-1.5" />
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
                <Link href={`/product/${product.slug}`}>
                    <p className="text-xs text-pink-400 font-medium uppercase tracking-wider mb-1">
                        {product.category.replace(/-/g, " ")}
                    </p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-1 hover:text-pink-500 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {product.ratings > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.ratings)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-200"
                                    }`}
                            />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({product.reviews.length})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-500">
                        ₹{(product.discountPrice ?? product.price).toFixed(0)}
                    </span>
                    {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{product.price.toFixed(0)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
