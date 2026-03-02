"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "danger" | "default";
    loading?: boolean;
    onConfirm: () => void;
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Delete",
    variant = "danger",
    loading = false,
    onConfirm,
}: ConfirmDialogProps) {
    const isDanger = variant === "danger";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {isDanger && (
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                        )}
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className={
                            isDanger
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-pink-500 hover:bg-pink-600 text-white"
                        }
                    >
                        {loading ? "Deleting..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
