"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/lib/use-categories";
import ImageUploader from "@/components/admin/ImageUploader";
import type { ProductType } from "@/lib/types";
import { useAdminTheme } from "@/context/AdminThemeContext";

// ─── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().min(10, "Description must be at least 10 characters."),
    shortDescription: z.string().min(5, "Short description is required"),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    discountPrice: z.coerce.number().min(0, "Discount price must be a positive number.").optional(),
    category: z.string().min(1, "Category is required"),
    stock: z.coerce.number().min(0, "Stock must be a positive number."),
    sku: z.string().min(1, "SKU is required"),
    isFeatured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductFormProps {
    initialData?: ProductType;
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const { isDark } = useAdminTheme();
    const router = useRouter();
    const categories = useCategories();
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState<string[]>(initialData?.images ?? []);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const slugTouched = useRef(false);
    const savedRef = useRef(false);
    const initialImagesRef = useRef(initialData?.images ?? []);
    const isEditing = !!initialData;

    const form = useForm<ProductFormValues>({
        // @ts-ignore z.coerce creates an unknown input type which conflicts with RHF
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            slug: initialData?.slug ?? "",
            description: initialData?.description ?? "",
            shortDescription: initialData?.shortDescription ?? "",
            price: initialData?.price ?? 0,
            discountPrice: initialData?.discountPrice ?? 0,
            category: initialData?.category ?? "",
            stock: initialData?.stock ?? 0,
            sku: initialData?.sku ?? "",
            isFeatured: initialData?.isFeatured ?? false,
        },
    });

    const hasUnsavedChanges = useCallback(() => {
        if (savedRef.current) return false;
        const formDirty = form.formState.isDirty;
        const imagesChanged = JSON.stringify(images) !== JSON.stringify(initialImagesRef.current);
        return formDirty || imagesChanged;
    }, [form.formState.isDirty, images]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        if (isEditing) slugTouched.current = true;
    }, [isEditing]);

    const watchName = form.watch("name");
    useEffect(() => {
        if (!slugTouched.current && watchName) {
            form.setValue("slug", slugify(watchName));
        }
    }, [watchName, form]);

    const handleBack = () => {
        if (hasUnsavedChanges()) {
            setShowDiscardDialog(true);
        } else {
            router.push("/admin/products");
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        if (images.length === 0) {
            toast.error("Please upload at least one product image");
            return;
        }
        setSaving(true);

        const payload = {
            ...data,
            images,
            discountPrice: data.discountPrice || undefined,
        };

        try {
            if (isEditing) {
                const r = await fetch(`/api/products/${initialData.slug}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!r.ok) throw new Error();
                toast.success("Product updated successfully");
            } else {
                const r = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, ratings: 0, reviews: [] }),
                });
                if (!r.ok) throw new Error();
                toast.success("Product added successfully");
            }
            savedRef.current = true;
            router.push("/admin/products");
        } catch {
            toast.error(isEditing ? "Failed to update product" : "Failed to add product");
        } finally {
            setSaving(false);
        }
    };

    const cardClass = isDark ? "border-white/5 bg-[#1a1d2e] shadow-none" : "border-pink-100 shadow-sm";
    const cardTitleClass = isDark ? "text-white" : "text-gray-800";
    const inputClass = isDark ? "border-white/10 bg-white/5 text-white placeholder:text-gray-500" : "";
    const labelClass = isDark ? "text-gray-300" : "";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className={`rounded-full ${isDark ? "hover:bg-white/5" : "hover:bg-pink-50"}`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                    </Button>
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {isEditing ? "Edit Product" : "Add New Product"}
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {isEditing ? "Make changes to your product details" : "Fill in the details to add a new product"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={form.handleSubmit((data) => onSubmit(data as ProductFormValues))}
                    disabled={saving}
                    className="text-white rounded-full px-6 bg-pink-500 hover:bg-pink-600"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? "Update Product" : "Save Product"}
                        </>
                    )}
                </Button>
            </div>

            <Form {...form}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={form.handleSubmit((data) => onSubmit(data as any))}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* ── Left Column: All Fields ── */}
                        <div className="lg:col-span-2 space-y-5">
                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-5 pb-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Rose Gold Lipstick" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Slug</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="product-slug"
                                                            className={inputClass}
                                                            {...field}
                                                            onChange={(e) => {
                                                                slugTouched.current = true;
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        control={form.control as any}
                                        name="shortDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={labelClass}>Short Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Brief one-liner about the product..." className={inputClass} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        control={form.control as any}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={labelClass}>Full Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Detailed product description..."
                                                        className={`resize-none min-h-[80px] ${inputClass}`}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Pricing & Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Price (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="discountPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Discount (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="sku"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>SKU</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="SKU-001" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={form.control as any}
                                            name="stock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Stock</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right Column: Media + Organization ── */}
                        <div className="space-y-5">
                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Media</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    <ImageUploader
                                        value={images}
                                        onChange={setImages}
                                        maxImages={10}
                                    />
                                </CardContent>
                            </Card>

                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Organization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-5 pb-5">
                                    <FormField
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        control={form.control as any}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={labelClass}>Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className={isDark ? "border-white/10 bg-white/5 text-gray-300" : ""}>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className={isDark ? "bg-[#1a1d2e] border-white/10" : ""}>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.slug} value={cat.slug} className={isDark ? "text-gray-300 focus:bg-white/5" : ""}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        control={form.control as any}
                                        name="isFeatured"
                                        render={({ field }) => (
                                            <FormItem className={`flex flex-row items-center justify-between rounded-xl border p-3 ${isDark ? "border-white/5" : "border-pink-100"}`}>
                                                <div className="space-y-0.5">
                                                    <FormLabel className={`pointer-events-none ${labelClass}`}>Featured Product</FormLabel>
                                                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                        Show in featured section
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>

            {/* Discard Changes Dialog */}
            <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                <DialogContent className={`sm:max-w-[420px] ${isDark ? "bg-[#1a1d2e] border-white/10" : ""}`} showCloseButton={false}>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <DialogTitle className={isDark ? "text-white" : ""}>Discard Changes?</DialogTitle>
                                <DialogDescription className="mt-1">
                                    You have unsaved changes. Are you sure you want to leave? All changes will be lost.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setShowDiscardDialog(false)} className={isDark ? "border-white/10 text-gray-300 hover:bg-white/5" : ""}>
                            Keep Editing
                        </Button>
                        <Button
                            onClick={() => router.push("/admin/products")}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Discard Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
