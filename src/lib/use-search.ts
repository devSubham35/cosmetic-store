"use client";

import { useState, useEffect, useRef } from "react";
import type { ProductType, CategoryType } from "@/lib/types";

interface SearchResults {
    products: ProductType[];
    categories: CategoryType[];
    isLoading: boolean;
}

export function useSearch(query: string, delay = 300): SearchResults {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (query.trim().length < 2) {
            setProducts([]);
            setCategories([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const timer = setTimeout(async () => {
            // Abort previous request
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(query.trim())}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error("Search failed");
                const data = await res.json();
                setProducts(data.products);
                setCategories(data.categories);
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setProducts([]);
                    setCategories([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [query, delay]);

    return { products, categories, isLoading };
}
