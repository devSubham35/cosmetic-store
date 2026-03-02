"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedMeta } from "@/lib/types";

interface PaginationControlsProps {
    meta: PaginatedMeta;
    onPageChange: (page: number) => void;
}

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

export default function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
    const { page, totalPages, total, limit, hasPrevPage, hasNextPage } = meta;

    if (totalPages <= 1) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4">
            <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                    {start}&ndash;{end}
                </span>{" "}
                of <span className="font-semibold text-gray-600">{total}</span>
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrevPage}
                    className="p-2 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers(page, totalPages).map((p, i) =>
                    p === "ellipsis" ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-2 text-gray-400 text-sm"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                                p === page
                                    ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage}
                    className="p-2 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
