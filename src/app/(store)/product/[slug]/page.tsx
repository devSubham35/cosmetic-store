"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<ProductType | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const addItem = useCartStore((s) => s.addItem);
    const toggleItem = useWishlistStore((s) => s.toggleItem);
    const wishlistItems = useWishlistStore((s) => s.items);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        setProduct(null);
        setRelatedProducts([]);
        setSelectedImage(0);
        setQuantity(1);

        fetch(`/api/products/${slug}`)
            .then((r) => {
                if (r.status === 404) { setNotFound(true); return null; }
                return r.json();
            })
            .then((data: ProductType | null) => {
                if (!data) return;
                setProduct(data);
                fetch(`/api/products?category=${data.category}&limit=5`)
                    .then((r) => r.json())
                    .then((rel) => {
                        if (rel.products) {
                            setRelatedProducts(rel.products.filter((p: ProductType) => p.slug !== slug).slice(0, 4));
                        }
                    })
                    .catch(() => {});
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="aspect-square rounded-2xl bg-pink-50 animate-pulse" />
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-8 bg-pink-50 rounded-lg animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <p className="text-6xl mb-4">😔</p>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
                <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
                <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    const wishlisted = wishlistItems.some((i) => i.id === product._id);
    const discountPercent = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                image: product.images[0],
                slug: product.slug,
            });
        }
        toast.success(`${product.name} (x${quantity}) added to cart!`);
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
                <span>/</span>
                <Link href={`/category/${product.category}`} className="hover:text-pink-500 transition-colors capitalize">
                    {product.category.replace(/-/g, " ")}
                </Link>
                <span>/</span>
                <span className="text-gray-700">{product.name}</span>
            </div>

            {/* Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-white border border-pink-100">
                        <Image
                            src={product.images[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        {discountPercent > 0 && (
                            <Badge className="absolute top-4 left-4 bg-pink-500 text-white rounded-full text-sm px-3 py-1 font-semibold">
                                -{discountPercent}% OFF
                            </Badge>
                        )}
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-pink-500 shadow-lg shadow-pink-500/20" : "border-pink-100 hover:border-pink-300"
                                        }`}
                                >
                                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <p className="text-pink-500 text-sm font-medium uppercase tracking-wider mb-1">
                            {product.category.replace(/-/g, " ")}
                        </p>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {product.name}
                        </h1>
                        <p className="text-gray-500 text-sm">{product.shortDescription}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.floor(product.ratings)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-200"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">
                            ({product.ratings}) · {product.reviews.length} reviews
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-pink-500">
                            ₹{(product.discountPrice ?? product.price).toFixed(0)}
                        </span>
                        {product.discountPrice && (
                            <>
                                <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                                <Badge className="bg-green-100 text-green-700 rounded-full">Save ₹{(product.price - product.discountPrice).toFixed(0)}</Badge>
                            </>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                        <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                        </span>
                    </div>

                    {/* SKU */}
                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>

                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center border border-pink-200 rounded-full overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 hover:bg-pink-50 transition-colors"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                className="p-3 hover:bg-pink-50 transition-colors"
                                aria-label="Increase quantity"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full py-6 text-base font-semibold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Add to Cart
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleToggleWishlist}
                            className={`rounded-full p-3 border-2 ${wishlisted
                                    ? "border-pink-500 bg-pink-50 text-pink-500"
                                    : "border-pink-200 text-gray-400 hover:text-pink-500 hover:border-pink-500"
                                } transition-all`}
                            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
                        </Button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-pink-100">
                        {[
                            { icon: Truck, label: "Free Shipping", desc: "On orders over ₹999" },
                            { icon: Shield, label: "100% Authentic", desc: "Genuine products" },
                            { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" },
                            { icon: Package, label: "Secure Packaging", desc: "Safe delivery" },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-start gap-2 p-3 bg-pink-50/50 rounded-xl">
                                <Icon className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-gray-800">{label}</p>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Tabs */}
            <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="bg-pink-50 border border-pink-100 p-1 rounded-full w-fit">
                        <TabsTrigger value="description" className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white px-6">
                            Description
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white px-6">
                            Reviews ({product.reviews.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-6">
                        <div className="bg-white rounded-2xl border border-pink-100 p-6 md:p-8">
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                        <div className="bg-white rounded-2xl border border-pink-100 p-6 md:p-8 space-y-6">
                            {product.reviews.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                            ) : (
                                product.reviews.map((review, i) => (
                                    <div key={i} className="border-b border-pink-50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-sm">
                                                    {review.user[0]}
                                                </div>
                                                <span className="font-medium text-sm text-gray-800">{review.user}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <Star key={j} className={`w-3 h-3 ${j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Related Products
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
