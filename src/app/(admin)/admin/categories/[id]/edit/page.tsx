"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/admin/CategoryForm";
import type { CategoryType } from "@/lib/types";

export default function EditCategoryPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [category, setCategory] = useState<CategoryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchCategory() {
            try {
                const res = await fetch(`/api/admin/categories/${id}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setCategory(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchCategory();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-600 font-medium">Category not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/categories")}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Categories
                </Button>
            </div>
        );
    }

    return <CategoryForm initialData={category} />;
}
