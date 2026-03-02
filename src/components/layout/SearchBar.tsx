"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, Star, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/lib/use-search";
import type { ProductType, CategoryType } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HighlightText({ text, query }: { text: string; query: string }) {
    if (!query || query.length < 2) return <>{text}</>;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-pink-100 text-pink-600 rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
    className?: string;
    inputClassName?: string;
    mobile?: boolean;
}

type ResultItem =
    | { type: "product"; data: ProductType }
    | { type: "category"; data: CategoryType };

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ className, inputClassName, mobile }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { products, categories, isLoading } = useSearch(query);

    // Flatten results into a single navigable list
    const items: ResultItem[] = [
        ...products.map((p) => ({ type: "product" as const, data: p })),
        ...categories.map((c) => ({ type: "category" as const, data: c })),
    ];

    const hasResults = items.length > 0;
    const showDropdown = open && query.trim().length >= 2;

    // ── Navigation ────────────────────────────────────────────────────────────

    const navigateTo = useCallback(
        (item: ResultItem) => {
            const url =
                item.type === "product"
                    ? `/product/${item.data.slug}`
                    : `/category/${item.data.slug}`;
            setOpen(false);
            setQuery("");
            router.push(url);
        },
        [router]
    );

    // ── Keyboard ──────────────────────────────────────────────────────────────

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!showDropdown || !hasResults) {
                if (e.key === "Escape") {
                    setOpen(false);
                    inputRef.current?.blur();
                }
                return;
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (activeIndex >= 0 && activeIndex < items.length) {
                        navigateTo(items[activeIndex]);
                    }
                    break;
                case "Escape":
                    setOpen(false);
                    inputRef.current?.blur();
                    break;
            }
        },
        [showDropdown, hasResults, items, activeIndex, navigateTo]
    );

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex < 0 || !listRef.current) return;
        const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    // Reset active index when results change
    useEffect(() => {
        setActiveIndex(-1);
    }, [products, categories]);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────

    let itemIndex = -1;

    return (
        <div ref={wrapperRef} className={`relative ${mobile ? "w-full" : "flex-1"} ${className ?? ""}`}>
            {/* Input */}
            <div className="relative">
                <Input
                    ref={inputRef}
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => query.trim().length >= 2 && setOpen(true)}
                    onKeyDown={onKeyDown}
                    className={`pr-10 ${inputClassName ?? ""}`}
                />
                <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-pink-500 text-white p-1.5 rounded-full hover:bg-pink-600 transition-colors"
                    tabIndex={-1}
                    aria-label="Search"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={listRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-pink-100 max-h-[420px] overflow-y-auto z-50"
                >
                    {isLoading && !hasResults ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                        </div>
                    ) : !hasResults ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            No results found for &ldquo;{query.trim()}&rdquo;
                        </div>
                    ) : (
                        <>
                            {/* Products */}
                            {products.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 sticky top-0">
                                        Products
                                    </div>
                                    {products.map((product) => {
                                        itemIndex++;
                                        const idx = itemIndex;
                                        const isActive = activeIndex === idx;
                                        return (
                                            <button
                                                key={product._id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ type: "product", data: product })}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                    isActive ? "bg-pink-50" : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                                                    {product.images?.[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Tag className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        <HighlightText text={product.name} query={query.trim()} />
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {product.discountPrice ? (
                                                            <>
                                                                <span className="text-xs font-semibold text-pink-500">
                                                                    ₹{product.discountPrice}
                                                                </span>
                                                                <span className="text-[11px] text-gray-400 line-through">
                                                                    ₹{product.price}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                ₹{product.price}
                                                            </span>
                                                        )}
                                                        {product.ratings > 0 && (
                                                            <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                {product.ratings.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Categories */}
                            {categories.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 sticky top-0 border-t border-gray-100">
                                        Categories
                                    </div>
                                    {categories.map((cat) => {
                                        itemIndex++;
                                        const idx = itemIndex;
                                        const isActive = activeIndex === idx;
                                        return (
                                            <button
                                                key={cat._id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ type: "category", data: cat })}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                    isActive ? "bg-pink-50" : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-50 shrink-0 relative">
                                                    {cat.image ? (
                                                        <Image
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="32px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Tag className="w-3.5 h-3.5 text-pink-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    <HighlightText text={cat.name} query={query.trim()} />
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
