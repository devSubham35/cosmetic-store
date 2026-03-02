"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const OPTIONS = [2, 5, 10, 15, 25, 50] as const;

interface RowsPerPageProps {
    value: number;
    onChange: (limit: number) => void;
}

export default function RowsPerPage({ value, onChange }: RowsPerPageProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="whitespace-nowrap">Rows per page:</span>
            <Select
                value={String(value)}
                onValueChange={(v) => onChange(Number(v))}
            >
                <SelectTrigger className="w-[70px] h-8 border-pink-200 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={String(opt)}>
                            {opt}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
