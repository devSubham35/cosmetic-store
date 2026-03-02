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
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import ImageUploader from "@/components/admin/ImageUploader";
import type { CategoryType } from "@/lib/types";
import { useAdminTheme } from "@/context/AdminThemeContext";

// ─── Schema ───────────────────────────────────────────────────────────────────

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().optional(),
    isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

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

interface CategoryFormProps {
    initialData?: CategoryType;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
    const { isDark } = useAdminTheme();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState<string[]>(initialData?.image ? [initialData.image] : []);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const slugTouched = useRef(false);
    const savedRef = useRef(false);
    const initialImagesRef = useRef(initialData?.image ? [initialData.image] : []);
    const isEditing = !!initialData;

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name ?? "",
            slug: initialData?.slug ?? "",
            description: initialData?.description ?? "",
            isActive: initialData?.isActive ?? true,
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
            router.push("/admin/categories");
        }
    };

    const onSubmit = async (data: CategoryFormValues) => {
        if (images.length === 0) {
            toast.error("Please upload a category image");
            return;
        }
        setSaving(true);

        const payload = {
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            image: images[0],
            isActive: data.isActive,
        };

        try {
            if (isEditing) {
                const r = await fetch(`/api/admin/categories/${initialData._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!r.ok) throw new Error();
                toast.success("Category updated successfully");
            } else {
                const r = await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!r.ok) throw new Error();
                toast.success("Category added successfully");
            }
            savedRef.current = true;
            router.push("/admin/categories");
        } catch {
            toast.error(isEditing ? "Failed to update category" : "Failed to add category");
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
                            {isEditing ? "Edit Category" : "Add New Category"}
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {isEditing ? "Make changes to your category details" : "Fill in the details to add a new category"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
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
                            {isEditing ? "Update Category" : "Save Category"}
                        </>
                    )}
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* ── Left Column ── */}
                        <div className="lg:col-span-2 space-y-5">
                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-5 pb-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Category Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Skin Care" className={inputClass} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={labelClass}>Slug</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="skin-care"
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
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={labelClass}>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description of this category..."
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
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className={`flex flex-row items-center justify-between rounded-xl border p-3 ${isDark ? "border-white/5" : "border-pink-100"}`}>
                                                <div className="space-y-0.5">
                                                    <FormLabel className={`pointer-events-none ${labelClass}`}>Active Status</FormLabel>
                                                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                        {field.value ? "Category is visible on the store" : "Category is hidden from the store"}
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

                        {/* ── Right Column ── */}
                        <div>
                            <Card className={cardClass}>
                                <CardHeader className="pb-3 pt-4 px-5">
                                    <CardTitle className={`text-base ${cardTitleClass}`}>Category Image</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    <ImageUploader
                                        value={images}
                                        onChange={setImages}
                                        multiple={false}
                                        maxImages={1}
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
                            onClick={() => router.push("/admin/categories")}
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
