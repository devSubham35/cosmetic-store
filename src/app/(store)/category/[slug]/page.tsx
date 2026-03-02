"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { useCategories } from "@/lib/use-categories";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const categories = useCategories();
    const category = categories.find((c) => c.slug === slug);
    const categoryName = category?.name ?? slug.replace(/-/g, " ");

    const [allProducts, setAllProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setAllProducts([]);
        const url = slug === "all"
            ? "/api/products?limit=200"
            : `/api/products?category=${slug}&limit=200`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                if (data.products) {
                    setAllProducts(data.products);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    const [sortBy, setSortBy] = useState("newest");
    const [priceRange, setPriceRange] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filtered = useMemo(() => {
        let result = [...allProducts];

        if (priceRange === "under500") result = result.filter((p) => (p.discountPrice ?? p.price) < 500);
        else if (priceRange === "500to1000") result = result.filter((p) => { const price = p.discountPrice ?? p.price; return price >= 500 && price <= 1000; });
        else if (priceRange === "above1000") result = result.filter((p) => (p.discountPrice ?? p.price) > 1000);

        if (sortBy === "lowToHigh") result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        else if (sortBy === "highToLow") result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        else if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return result;
    }, [allProducts, sortBy, priceRange]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <a href="/" className="hover:text-pink-500 transition-colors">Home</a>
                <span>/</span>
                <span className="text-gray-700 capitalize">{categoryName}</span>
            </div>

            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 capitalize" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {categoryName}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {loading ? "Loading..." : `${filtered.length} products found`}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                        <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] border-pink-200 text-sm">
                                <SelectValue placeholder="Price Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Prices</SelectItem>
                                <SelectItem value="under500">Under ₹500</SelectItem>
                                <SelectItem value="500to1000">₹500 - ₹1000</SelectItem>
                                <SelectItem value="above1000">Above ₹1000</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[160px] border-pink-200 text-sm">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                            <SelectItem value="highToLow">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center border border-pink-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 ${viewMode === "grid" ? "bg-pink-500 text-white" : "text-gray-400 hover:bg-pink-50"} transition-colors`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 ${viewMode === "list" ? "bg-pink-500 text-white" : "text-gray-400 hover:bg-pink-50"} transition-colors`}
                            aria-label="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-pink-50 rounded-2xl animate-pulse h-72" />
                    ))}
                </div>
            ) : paginated.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">🔍</p>
                    <p className="text-gray-500 text-lg">No products found in this category</p>
                    <Button asChild className="mt-4 bg-pink-500 hover:bg-pink-600 rounded-full">
                        <a href="/">Browse All Products</a>
                    </Button>
                </div>
            ) : (
                <div className={viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    : "grid grid-cols-1 md:grid-cols-2 gap-4"
                }>
                    {paginated.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                                page === currentPage
                                    ? "bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                                    : "border-pink-200 text-gray-600 hover:bg-pink-50 rounded-full"
                            }
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
