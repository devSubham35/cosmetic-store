"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { usePaginatedFetch } from "@/lib/use-paginated-fetch";
import CommonTable from "@/components/admin/CommonTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { type ColumnDef } from "@tanstack/react-table";
import { useAdminTheme } from "@/context/AdminThemeContext";

export default function AdminProductsPage() {
    const { isDark } = useAdminTheme();
    const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);
    const [deleting, setDeleting] = useState(false);

    const {
        data: products,
        meta,
        loading,
        search,
        setSearch,
        setPage,
        limit,
        setLimit,
        refetch,
    } = usePaginatedFetch<ProductType>({
        baseUrl: "/api/admin/products",
    });

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const r = await fetch(`/api/products/${deleteTarget.slug}`, { method: "DELETE" });
            if (!r.ok) throw new Error();
            refetch();
            toast.success("Product deleted successfully");
        } catch {
            toast.error("Failed to delete product");
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }, [deleteTarget, refetch]);

    const columns = useMemo<ColumnDef<ProductType>[]>(() => [
        {
            accessorKey: "name",
            header: "Product",
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 ${isDark ? "bg-white/5" : "bg-pink-50"}`}>
                            <Image
                                src={p.images[0] || "https://placehold.co/600x600/fccce0/ff4d8d?text=No+Image"}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
                        <div>
                            <p className={`font-medium line-clamp-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.name}</p>
                            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>SKU: {p.sku}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <Badge variant="outline" className={`capitalize ${isDark ? "border-white/10 text-gray-300" : "border-pink-200 text-pink-600"}`}>
                    {row.original.category.replace(/-/g, " ")}
                </Badge>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <div>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                            ₹{(p.discountPrice ?? p.price).toFixed(0)}
                        </span>
                        {p.discountPrice && (
                            <span className={`text-xs line-through ml-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>₹{p.price}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }) => {
                const stock = row.original.stock;
                return (
                    <span className={`font-medium ${stock > 10 ? "text-green-500" : stock > 0 ? "text-yellow-500" : "text-red-500"}`}>
                        {stock}
                    </span>
                );
            },
        },
        {
            accessorKey: "isFeatured",
            header: "Status",
            cell: ({ row }) => (
                <Badge className={row.original.isFeatured ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"}>
                    {row.original.isFeatured ? "Featured" : "Standard"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/products/${row.original.slug}/edit`}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-blue-400 hover:bg-white/5" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}
                        aria-label="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => setDeleteTarget(row.original)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-red-400 hover:bg-white/5" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                        aria-label="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], [isDark]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Products
                    </h1>
                    <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{meta?.total ?? 0} products in your store</p>
                </div>

                <Link href="/admin/products/add">
                    <Button className="text-white rounded-full bg-pink-500 hover:bg-pink-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`pl-10 ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-gray-500" : "border-pink-200"}`}
                    />
                </div>
            </div>

            <CommonTable
                columns={columns}
                data={products}
                meta={meta}
                loading={loading}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                emptyIcon={
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-pink-500/10" : "bg-pink-50"}`}>
                        <Package className="w-7 h-7 text-pink-300" />
                    </div>
                }
                emptyMessage="No products found"
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
