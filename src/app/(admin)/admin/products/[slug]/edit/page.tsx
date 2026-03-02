"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/ProductForm";
import type { ProductType } from "@/lib/types";

export default function EditProductPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${slug}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setProduct(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-600 font-medium">Product not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/products")}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>
            </div>
        );
    }

    return <ProductForm initialData={product} />;
}
