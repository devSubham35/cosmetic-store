"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Search, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { usePaginatedFetch } from "@/lib/use-paginated-fetch";
import CommonTable from "@/components/admin/CommonTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { type ColumnDef } from "@tanstack/react-table";
import { useAdminTheme } from "@/context/AdminThemeContext";

export default function AdminCategoriesPage() {
    const { isDark } = useAdminTheme();
    const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const {
        data: categories,
        meta,
        loading,
        search,
        setSearch,
        setPage,
        limit,
        setLimit,
        refetch,
    } = usePaginatedFetch<CategoryType>({
        baseUrl: "/api/admin/categories",
        filters: statusFilter && statusFilter !== "all" ? { isActive: statusFilter } : {},
    });

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const r = await fetch(`/api/admin/categories/${deleteTarget._id}`, { method: "DELETE" });
            if (!r.ok) throw new Error();
            refetch();
            toast.success("Category deleted successfully");
        } catch {
            toast.error("Failed to delete category");
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }, [deleteTarget, refetch]);

    const toggleActive = useCallback(async (id: string, currentValue: boolean) => {
        setTogglingId(id);
        try {
            const r = await fetch(`/api/admin/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentValue }),
            });
            if (!r.ok) throw new Error();
            refetch();
            toast.success(`Category ${!currentValue ? "activated" : "deactivated"} successfully`);
        } catch {
            toast.error("Failed to update category status");
        } finally {
            setTogglingId(null);
        }
    }, [refetch]);

    const columns = useMemo<ColumnDef<CategoryType>[]>(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => (
                <div className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 ${isDark ? "bg-white/5" : "bg-pink-50"}`}>
                    <Image
                        src={row.original.image || "https://placehold.co/100x100/fccce0/ff4d8d?text=No"}
                        alt={row.original.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                    />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>{row.original.name}</p>
                    {row.original.description && (
                        <p className={`text-xs line-clamp-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{row.original.description}</p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({ row }) => (
                <span className={`text-sm font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}>{row.original.slug}</span>
            ),
        },
        {
            accessorKey: "productCount",
            header: "Products",
            cell: ({ row }) => (
                <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{row.original.productCount ?? 0}</span>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.original.isActive ?? true;
                const id = row.original._id;
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isActive}
                            onCheckedChange={() => toggleActive(id, isActive)}
                            disabled={togglingId === id}
                        />
                        <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                const date = row.original.createdAt;
                if (!date) return <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>—</span>;
                return (
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                        })}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/categories/${row.original._id}/edit`}
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
    ], [toggleActive, togglingId, isDark]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Categories
                    </h1>
                    <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{meta?.total ?? 0} categories in your store</p>
                </div>

                <Link href="/admin/categories/add">
                    <Button className="text-white rounded-full bg-pink-500 hover:bg-pink-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`pl-10 ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-gray-500" : "border-pink-200"}`}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={`w-[140px] ${isDark ? "border-white/10 bg-white/5 text-gray-300" : "border-pink-200"}`}>
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-[#1a1d2e] border-white/10" : ""}>
                        <SelectItem value="all" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>All Status</SelectItem>
                        <SelectItem value="active" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Active</SelectItem>
                        <SelectItem value="inactive" className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <CommonTable
                columns={columns}
                data={categories}
                meta={meta}
                loading={loading}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                emptyIcon={
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-pink-500/10" : "bg-pink-50"}`}>
                        <FolderOpen className="w-7 h-7 text-pink-300" />
                    </div>
                }
                emptyMessage="No categories found"
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete Category"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
