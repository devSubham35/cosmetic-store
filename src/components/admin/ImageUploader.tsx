"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { uploadToCloudinary, formatFileSize } from "@/lib/cloudinary";
import {
    CloudUpload, X, RotateCcw, Star, GripVertical,
    CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    multiple?: boolean;
    maxImages?: number;
}

interface UploadItem {
    id: string;
    file: File;
    preview: string;
    url?: string;
    progress: number;
    status: "uploading" | "done" | "error";
    abortController: AbortController;
    error?: string;
}

let uploadIdCounter = 0;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImageUploader({
    value,
    onChange,
    multiple = true,
    maxImages = 10,
}: ImageUploaderProps) {
    const { isDark } = useAdminTheme();
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const remaining = maxImages - value.length - uploads.filter((u) => u.status === "uploading").length;

    // ── Upload logic ─────────────────────────────────────────────────────────

    const startUpload = useCallback((file: File) => {
        const id = `upload-${++uploadIdCounter}`;
        const preview = URL.createObjectURL(file);
        const abortController = new AbortController();

        const item: UploadItem = {
            id, file, preview, progress: 0, status: "uploading", abortController,
        };

        setUploads((prev) => [...prev, item]);

        uploadToCloudinary(
            file,
            (progress) => {
                setUploads((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, progress } : u))
                );
            },
            abortController.signal
        )
            .then((result) => {
                setUploads((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, status: "done" as const, url: result.url, progress: 100 } : u))
                );
            })
            .catch((err) => {
                if (abortController.signal.aborted) {
                    setUploads((prev) => prev.filter((u) => u.id !== id));
                } else {
                    setUploads((prev) =>
                        prev.map((u) => (u.id === id ? { ...u, status: "error" as const, error: err.message } : u))
                    );
                }
            });
    }, []);

    // Move completed uploads to value
    useEffect(() => {
        const done = uploads.filter((u) => u.status === "done" && u.url);
        if (done.length > 0) {
            const newUrls = done.map((u) => u.url!);
            onChange([...value, ...newUrls]);
            setUploads((prev) => {
                const cleaned = prev.filter((u) => u.status !== "done");
                done.forEach((u) => URL.revokeObjectURL(u.preview));
                return cleaned;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploads]);

    const handleFiles = useCallback((files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const imageFiles = fileArr.filter((f) => f.type.startsWith("image/"));
        const toUpload = imageFiles.slice(0, Math.max(0, remaining));

        toUpload.forEach((file) => startUpload(file));
    }, [remaining, startUpload]);

    // ── Event handlers ───────────────────────────────────────────────────────

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback(() => setDragOver(false), []);

    const cancelUpload = (id: string) => {
        const item = uploads.find((u) => u.id === id);
        if (item) {
            item.abortController.abort();
            URL.revokeObjectURL(item.preview);
        }
    };

    const retryUpload = (id: string) => {
        const item = uploads.find((u) => u.id === id);
        if (item) {
            URL.revokeObjectURL(item.preview);
            setUploads((prev) => prev.filter((u) => u.id !== id));
            startUpload(item.file);
        }
    };

    const removeImage = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const setCover = (index: number) => {
        if (index === 0) return;
        const updated = [...value];
        const [moved] = updated.splice(index, 1);
        updated.unshift(moved);
        onChange(updated);
    };

    // ── Drag reorder ─────────────────────────────────────────────────────────

    const onReorderDragStart = (index: number) => setDragIndex(index);
    const onReorderDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };
    const onReorderDrop = (targetIndex: number) => {
        if (dragIndex === null || dragIndex === targetIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        const updated = [...value];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(targetIndex, 0, moved);
        onChange(updated);
        setDragIndex(null);
        setDragOverIndex(null);
    };
    const onReorderDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    const hasImages = value.length > 0;
    const hasUploads = uploads.length > 0;

    return (
        <div className="space-y-4">
            <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Product Images</label>

            {/* Drop Zone */}
            {remaining > 0 && (
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        dragOver
                            ? isDark ? "border-pink-400 bg-pink-500/10" : "border-pink-400 bg-pink-50/60"
                            : isDark ? "border-white/10 hover:border-pink-400/40 hover:bg-white/[0.02]" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/30"
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) handleFiles(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-pink-500/10" : "bg-pink-100"}`}>
                            <CloudUpload className="w-6 h-6 text-pink-500" />
                        </div>
                        <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Drag & drop images here or <span className="text-pink-500">click to browse</span>
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            PNG, JPG, WEBP up to 10MB &middot; {remaining} image{remaining !== 1 ? "s" : ""} remaining
                        </p>
                    </div>
                </div>
            )}

            {/* Upload Queue */}
            {hasUploads && (
                <div className="space-y-2">
                    {uploads.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-xl p-3 border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                        >
                            <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 relative ${isDark ? "bg-white/5" : "bg-pink-50"}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.preview}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className={`text-xs font-medium truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item.file.name}</p>
                                    <span className={`text-xs shrink-0 ml-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        {formatFileSize(item.file.size)}
                                    </span>
                                </div>
                                {item.status === "uploading" && (
                                    <div className={`w-full rounded-full h-1.5 ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
                                        <div
                                            className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}
                                {item.status === "error" && (
                                    <p className="text-xs text-red-500 truncate">{item.error || "Upload failed"}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {item.status === "uploading" && (
                                    <>
                                        <span className="text-xs font-medium text-pink-500 w-8 text-right">
                                            {item.progress}%
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); cancelUpload(item.id); }}
                                            className={`p-1 rounded transition-colors ${isDark ? "text-gray-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
                                            aria-label="Cancel upload"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {item.status === "done" && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                                {item.status === "error" && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); retryUpload(item.id); }}
                                        className={`p-1 rounded transition-colors ${isDark ? "text-gray-400 hover:text-pink-400" : "text-gray-400 hover:text-pink-500"}`}
                                        aria-label="Retry upload"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Grid */}
            {hasImages && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {value.map((url, index) => {
                        const isCover = index === 0;
                        const isBeingDraggedOver = dragOverIndex === index;
                        return (
                            <div
                                key={`${url}-${index}`}
                                draggable
                                onDragStart={() => onReorderDragStart(index)}
                                onDragOver={(e) => onReorderDragOver(e, index)}
                                onDrop={() => onReorderDrop(index)}
                                onDragEnd={onReorderDragEnd}
                                className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                                    isCover
                                        ? "col-span-2 row-span-2 border-pink-300"
                                        : isDark ? "aspect-square border-white/10" : "aspect-square border-gray-100"
                                } ${isBeingDraggedOver ? "border-pink-400 scale-[1.02]" : ""} ${
                                    dragIndex === index ? "opacity-50" : ""
                                }`}
                            >
                                <div className={`relative w-full ${isCover ? "aspect-[4/3]" : "aspect-square"}`}>
                                    <Image
                                        src={url}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes={isCover ? "400px" : "200px"}
                                    />
                                </div>

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                                {isCover && (
                                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        COVER
                                    </span>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isCover && (
                                        <button
                                            onClick={() => setCover(index)}
                                            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                                            aria-label="Set as cover"
                                            title="Set as cover image"
                                        >
                                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                                        aria-label="Remove image"
                                    >
                                        <X className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>

                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-1 bg-white/90 rounded-lg shadow-sm cursor-grab">
                                        <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Status Summary */}
            {hasUploads && uploads.some((u) => u.status === "uploading") && (
                <div className={`flex items-center gap-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading {uploads.filter((u) => u.status === "uploading").length} image(s)...
                </div>
            )}
            {hasUploads && uploads.some((u) => u.status === "error") && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {uploads.filter((u) => u.status === "error").length} upload(s) failed
                </div>
            )}
        </div>
    );
}
