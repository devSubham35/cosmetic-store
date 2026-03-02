"use client";

import { useState, useEffect } from "react";
import { sampleCategories } from "@/lib/data";
import { CategoryType } from "@/lib/types";

// Use sampleCategories as the initial/fallback value so the UI renders instantly
// with hardcoded data and then updates once the DB response arrives.
const fallback: CategoryType[] = sampleCategories.map((c) => ({ ...c, _id: c.slug }));

export function useCategories(): CategoryType[] {
    const [categories, setCategories] = useState<CategoryType[]>(fallback);

    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setCategories(data);
            })
            .catch(() => {}); // keep fallback on network error
    }, []);

    return categories;
}
