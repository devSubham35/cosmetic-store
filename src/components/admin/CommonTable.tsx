"use client";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from "@tanstack/react-table";
import type { PaginatedMeta } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAdminTheme } from "@/context/AdminThemeContext";

const ROWS_OPTIONS = [2, 5, 10, 15, 25, 50] as const;

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= page - delta && i <= page + delta)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "ellipsis") {
            pages.push("ellipsis");
        }
    }
    return pages;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CommonTableProps<T = any> {
    columns: ColumnDef<T, any>[];
    data: T[];
    meta: PaginatedMeta | null;
    loading?: boolean;
    onPageChange: (page: number) => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    emptyIcon?: React.ReactNode;
    emptyMessage?: string;
    skeletonRows?: number;
}

export default function CommonTable<T>({
    columns,
    data,
    meta,
    loading = false,
    onPageChange,
    limit,
    onLimitChange,
    emptyIcon,
    emptyMessage = "No data found",
    skeletonRows = 5,
}: CommonTableProps<T>) {
    const { isDark } = useAdminTheme();
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const hasMeta = meta && meta.total > 0;
    const start = meta ? (meta.page - 1) * meta.limit + 1 : 0;
    const end = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

    return (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-pink-100"}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className={`text-left ${isDark ? "bg-white/5" : "bg-pink-50"}`}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`px-6 py-4 font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}
                                        style={header.column.getSize() !== 150 ? { width: header.column.getSize() } : undefined}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-pink-50"}`}>
                        {loading ? (
                            Array.from({ length: skeletonRows }).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className={`h-5 rounded-lg animate-pulse ${isDark ? "bg-white/5" : "bg-pink-50"}`} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
                                        <p className={isDark ? "text-gray-500" : "text-gray-400"}>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-pink-50/30"}`}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: Showing X–Y of Z | Rows per page | Pagination */}
            {hasMeta && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t ${isDark ? "border-white/5" : "border-pink-100"}`}>
                    {/* Left: Showing count + rows per page */}
                    <div className="flex items-center gap-4">
                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Showing{" "}
                            <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                {start}&ndash;{end}
                            </span>{" "}
                            of <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>{meta.total}</span>
                        </p>
                        <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <span className="whitespace-nowrap">Rows:</span>
                            <Select
                                value={String(limit)}
                                onValueChange={(v) => onLimitChange(Number(v))}
                            >
                                <SelectTrigger className={`w-[65px] h-7 text-xs ${isDark ? "border-white/10 bg-white/5 text-gray-300" : "border-pink-200"}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={isDark ? "bg-[#1a1d2e] border-white/10" : ""}>
                                    {ROWS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={String(opt)} className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Right: Page buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(meta.page - 1)}
                            disabled={!meta.hasPrevPage}
                            className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? "text-gray-400 hover:text-pink-400 hover:bg-white/5" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {getPageNumbers(meta.page, meta.totalPages).map((p, i) =>
                            p === "ellipsis" ? (
                                <span key={`ellipsis-${i}`} className={`px-2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                                        p === meta.page
                                            ? isDark
                                                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                                                : "bg-pink-500 text-white shadow-md shadow-pink-200"
                                            : isDark
                                                ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                                : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                                    }`}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => onPageChange(meta.page + 1)}
                            disabled={!meta.hasNextPage}
                            className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? "text-gray-400 hover:text-pink-400 hover:bg-white/5" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
