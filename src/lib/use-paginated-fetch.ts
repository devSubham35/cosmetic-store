"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PaginatedMeta, PaginatedResponse } from "@/lib/types";

interface UsePaginatedFetchOptions {
    baseUrl: string;
    defaultLimit?: number;
    filters?: Record<string, string>;
    debounceMs?: number;
}

interface UsePaginatedFetchResult<T> {
    data: T[];
    meta: PaginatedMeta | null;
    loading: boolean;
    page: number;
    limit: number;
    search: string;
    setPage: (p: number) => void;
    setLimit: (l: number) => void;
    setSearch: (s: string) => void;
    refetch: () => void;
}

const DEFAULT_META: PaginatedMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
};

export function usePaginatedFetch<T>(
    options: UsePaginatedFetchOptions
): UsePaginatedFetchResult<T> {
    const { baseUrl, defaultLimit = 10, filters = {}, debounceMs = 400 } = options;

    const [data, setData] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginatedMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const fetchIdRef = useRef(0);
    const filtersKey = JSON.stringify(filters);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [search, debounceMs]);

    // Reset to page 1 when limit or filters change
    useEffect(() => {
        setPage(1);
    }, [limit, filtersKey]);

    const fetchData = useCallback(() => {
        const id = ++fetchIdRef.current;
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (debouncedSearch) params.set("search", debouncedSearch);

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        fetch(`${baseUrl}?${params.toString()}`)
            .then((r) => r.json())
            .then((result: PaginatedResponse<T>) => {
                if (id !== fetchIdRef.current) return;
                setData(result.data ?? []);
                setMeta(result.meta ?? DEFAULT_META);
            })
            .catch(() => {
                if (id !== fetchIdRef.current) return;
                setData([]);
                setMeta(DEFAULT_META);
            })
            .finally(() => {
                if (id !== fetchIdRef.current) return;
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl, page, limit, debouncedSearch, filtersKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        meta,
        loading,
        page,
        limit,
        search,
        setPage,
        setLimit,
        setSearch,
        refetch: fetchData,
    };
}
